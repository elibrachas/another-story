import { randomUUID } from "crypto"
import { NextResponse } from "next/server"
import { ZodError } from "zod"
import { verifyServiceToken } from "@/lib/services/auth/service-token"
import { runInvoiceExtractionPipeline } from "@/lib/services/invoices/pipeline"
import { invoiceExtractRequestSchema } from "@/lib/services/invoices/schema"

export const runtime = "nodejs"

function getRequestId(request: Request): string {
  const headerValue = request.headers.get("x-request-id")
  if (!headerValue || !headerValue.trim()) {
    return randomUUID()
  }
  return headerValue.trim()
}

function errorResponse(
  status: number,
  code: string,
  message: string,
  requestId: string,
  durationMs: number,
) {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
      },
      meta: {
        request_id: requestId,
        duration_ms: durationMs,
      },
    },
    { status },
  )
}

export async function POST(request: Request) {
  const startedAt = Date.now()
  const requestId = getRequestId(request)

  try {
    const isAuthorized = verifyServiceToken(request.headers.get("authorization"))
    if (!isAuthorized) {
      return errorResponse(401, "unauthorized", "Invalid service token", requestId, Date.now() - startedAt)
    }

    const body = await request.json()
    const payload = invoiceExtractRequestSchema.parse(body)

    const pipelineResult = await runInvoiceExtractionPipeline(payload)
    const durationMs = Date.now() - startedAt

    console.log("invoice_extract_completed", {
      request_id: requestId,
      document_id: payload.document_id,
      client_id: payload.client_id,
      supplier: payload.supplier,
      duration_ms: durationMs,
      needs_review: pipelineResult.quality.needs_review,
      fallback_attempted: pipelineResult.meta.fallback_attempted,
      fallback_succeeded: pipelineResult.meta.fallback_succeeded,
    })

    return NextResponse.json({
      success: true,
      extraction: pipelineResult.extraction,
      quality: pipelineResult.quality,
      meta: {
        request_id: requestId,
        duration_ms: durationMs,
      },
    })
  } catch (error) {
    const durationMs = Date.now() - startedAt

    if (error instanceof ZodError) {
      return errorResponse(400, "invalid_request", error.issues[0]?.message ?? "Invalid request body", requestId, durationMs)
    }
    if (error instanceof SyntaxError) {
      return errorResponse(400, "invalid_request", "Request body must be valid JSON", requestId, durationMs)
    }

    const errorMessage = error instanceof Error ? error.message : "Unexpected service error"
    const isConfigError = errorMessage.includes("Missing required environment variable")
    const status = isConfigError ? 500 : 502
    const code = isConfigError ? "service_misconfigured" : "extraction_failed"

    console.error("invoice_extract_failed", {
      request_id: requestId,
      duration_ms: durationMs,
      error: errorMessage,
    })

    return errorResponse(status, code, errorMessage, requestId, durationMs)
  }
}
