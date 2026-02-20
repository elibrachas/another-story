import { z } from "zod"

export const invoiceExtractRequestSchema = z.object({
  document_id: z.string().uuid(),
  client_id: z.string().min(1),
  supplier: z.string().min(1),
  drive_file_id: z.string().min(1).optional(),
  storage_bucket: z.string().min(1).optional(),
  storage_path: z.string().min(1).optional(),
  doc_internal_ref: z.string().optional().default(""),
}).superRefine((value, ctx) => {
  const hasDriveFileId = typeof value.drive_file_id === "string" && value.drive_file_id.trim().length > 0
  const hasStorageBucket = typeof value.storage_bucket === "string" && value.storage_bucket.trim().length > 0
  const hasStoragePath = typeof value.storage_path === "string" && value.storage_path.trim().length > 0

  if (hasStorageBucket && !hasStoragePath) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["storage_path"],
      message: "storage_path is required when storage_bucket is provided",
    })
  }

  if (hasStoragePath && !hasStorageBucket) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["storage_bucket"],
      message: "storage_bucket is required when storage_path is provided",
    })
  }

  if (!hasDriveFileId && !(hasStorageBucket && hasStoragePath)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Either drive_file_id or storage_bucket + storage_path is required",
    })
  }
})

export const invoiceLineSchema = z.object({
  line_no: z.union([z.number(), z.string()]).optional(),
  code_raw: z.string().optional().default(""),
  description: z.string().optional().default(""),
  qty: z.union([z.number(), z.string()]).optional(),
  unit_price: z.union([z.number(), z.string()]).optional(),
  line_total: z.union([z.number(), z.string()]).optional(),
})

export const canonicalInvoiceExtractionSchema = z.object({
  supplier: z.string(),
  client_id: z.string(),
  document_id: z.string().uuid(),
  invoice_number: z.string(),
  invoice_internal: z.string(),
  doc_internal_ref: z.string(),
  remesa: z.string(),
  remito: z.string(),
  invoice_date: z.string(),
  due_date: z.string(),
  currency: z.string(),
  subtotal: z.union([z.number(), z.string()]),
  iva_total: z.union([z.number(), z.string()]),
  perceptions_total: z.union([z.number(), z.string()]),
  grand_total: z.union([z.number(), z.string()]),
  extractor_primary: z.literal("docai"),
  extractor_fallback_used: z.boolean(),
  extract_confidence: z.number(),
  raw_extraction: z.unknown(),
  lines: z.array(invoiceLineSchema),
})

export const qualityChecksSchema = z.object({
  required_fields_ok: z.boolean(),
  totals_consistency_ok: z.boolean(),
  lines_consistency_ok: z.boolean(),
})

export const invoiceQualitySchema = z.object({
  score: z.number(),
  needs_review: z.boolean(),
  reasons: z.array(z.string()),
  checks: qualityChecksSchema,
})

export type InvoiceExtractRequest = z.infer<typeof invoiceExtractRequestSchema>
export type CanonicalInvoiceExtraction = z.infer<typeof canonicalInvoiceExtractionSchema>
export type InvoiceQuality = z.infer<typeof invoiceQualitySchema>
