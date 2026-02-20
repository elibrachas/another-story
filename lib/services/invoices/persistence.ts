import { createAdminClient } from "@/lib/supabase-admin"
import type { CanonicalInvoiceExtraction } from "@/lib/services/invoices/schema"

type ExecuteSqlResult = {
  result?: unknown
}

function buildIngestInvoiceSql(extraction: CanonicalInvoiceExtraction): string {
  const payloadBase64 = Buffer.from(JSON.stringify(extraction), "utf8").toString("base64")
  return (
    "select nucleo_ops.fn_ingest_invoice_payload(" +
    `convert_from(decode('${payloadBase64}', 'base64'), 'utf8')::jsonb` +
    ") as result;"
  )
}

function extractErrorMessage(error: unknown): string {
  if (!error) {
    return "Unknown persistence error"
  }

  if (typeof error === "string") {
    return error
  }

  if (typeof error === "object" && "message" in error && typeof error.message === "string") {
    return error.message
  }

  return "Unknown persistence error"
}

export async function persistInvoiceExtraction(extraction: CanonicalInvoiceExtraction): Promise<ExecuteSqlResult> {
  const supabaseAdmin = createAdminClient()
  const sql = buildIngestInvoiceSql(extraction)
  const { data, error } = await supabaseAdmin.rpc("execute_sql", {
    sql_query: sql,
  })

  if (error) {
    throw new Error(`Persistence failed while calling execute_sql: ${extractErrorMessage(error)}`)
  }

  const rows = Array.isArray(data) ? data : []
  const firstRow = rows.length > 0 ? (rows[0] as ExecuteSqlResult) : null
  return {
    result: firstRow?.result,
  }
}
