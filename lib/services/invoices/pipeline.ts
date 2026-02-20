import { normalizeDocAIExtraction, normalizeOpenAIExtraction } from "@/lib/services/invoices/normalize"
import { extractInvoiceWithDocAI } from "@/lib/services/invoices/providers/docai"
import { downloadPdfFromGoogleDrive } from "@/lib/services/invoices/providers/drive"
import { downloadPdfFromSupabaseStorage } from "@/lib/services/invoices/providers/supabase-storage"
import { extractInvoiceWithOpenAIFallback } from "@/lib/services/invoices/providers/openai-fallback"
import { addQualityReason, evaluateExtractionQuality } from "@/lib/services/invoices/quality"
import type {
  CanonicalInvoiceExtraction,
  InvoiceExtractRequest,
  InvoiceQuality,
} from "@/lib/services/invoices/schema"

export type InvoiceExtractionPipelineResult = {
  extraction: CanonicalInvoiceExtraction
  quality: InvoiceQuality
  meta: {
    fallback_attempted: boolean
    fallback_succeeded: boolean
  }
}

export async function runInvoiceExtractionPipeline(
  request: InvoiceExtractRequest,
): Promise<InvoiceExtractionPipelineResult> {
  const hasStorageSource =
    typeof request.storage_bucket === "string" &&
    request.storage_bucket.trim().length > 0 &&
    typeof request.storage_path === "string" &&
    request.storage_path.trim().length > 0

  const downloadedFile = hasStorageSource
    ? await downloadPdfFromSupabaseStorage(request.storage_bucket!, request.storage_path!)
    : await downloadPdfFromGoogleDrive(request.drive_file_id!)

  const docAIResponse = await extractInvoiceWithDocAI(downloadedFile.buffer)
  const docAIExtraction = normalizeDocAIExtraction(request, docAIResponse)
  const primaryQuality = evaluateExtractionQuality(docAIExtraction)

  if (!primaryQuality.needs_review) {
    return {
      extraction: docAIExtraction,
      quality: primaryQuality,
      meta: {
        fallback_attempted: false,
        fallback_succeeded: false,
      },
    }
  }

  let fallbackExtraction: CanonicalInvoiceExtraction | null = null
  let fallbackQuality: InvoiceQuality | null = null
  let fallbackError: string | null = null

  try {
    const fallbackResponse = await extractInvoiceWithOpenAIFallback(downloadedFile.buffer, request.supplier)
    fallbackExtraction = normalizeOpenAIExtraction(request, fallbackResponse.parsedPayload, fallbackResponse.rawResponse)
    fallbackQuality = evaluateExtractionQuality(fallbackExtraction)
  } catch (error) {
    fallbackError = error instanceof Error ? error.message : "Unknown fallback error"
  }

  if (!fallbackExtraction || !fallbackQuality) {
    return {
      extraction: docAIExtraction,
      quality: addQualityReason(primaryQuality, `fallback_failed:${fallbackError ?? "unknown"}`),
      meta: {
        fallback_attempted: true,
        fallback_succeeded: false,
      },
    }
  }

  const shouldUseFallback =
    fallbackQuality.score > primaryQuality.score ||
    (!fallbackQuality.needs_review && primaryQuality.needs_review) ||
    (fallbackQuality.score === primaryQuality.score && fallbackExtraction.lines.length > docAIExtraction.lines.length)

  if (shouldUseFallback) {
    return {
      extraction: fallbackExtraction,
      quality: fallbackQuality,
      meta: {
        fallback_attempted: true,
        fallback_succeeded: true,
      },
    }
  }

  return {
    extraction: docAIExtraction,
    quality: addQualityReason(primaryQuality, "fallback_not_selected"),
    meta: {
      fallback_attempted: true,
      fallback_succeeded: true,
    },
  }
}
