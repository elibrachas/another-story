import type { CanonicalInvoiceExtraction, InvoiceQuality } from "@/lib/services/invoices/schema"

function hasValue(value: unknown): boolean {
  if (value === null || value === undefined) {
    return false
  }
  if (typeof value === "string") {
    return value.trim().length > 0
  }
  return true
}

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value
  }

  if (typeof value !== "string") {
    return null
  }

  const cleaned = value.replace(/[^\d,.-]/g, "").trim()
  if (!cleaned) {
    return null
  }

  const hasComma = cleaned.includes(",")
  const hasDot = cleaned.includes(".")
  let normalized = cleaned

  if (hasComma && hasDot) {
    if (cleaned.lastIndexOf(",") > cleaned.lastIndexOf(".")) {
      normalized = cleaned.replace(/\./g, "").replace(",", ".")
    } else {
      normalized = cleaned.replace(/,/g, "")
    }
  } else if (hasComma) {
    normalized = cleaned.replace(",", ".")
  }

  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : null
}

function getTolerance(total: number): number {
  return Math.max(0.01 * Math.abs(total), 2)
}

function validateRequiredFields(extraction: CanonicalInvoiceExtraction): boolean {
  const requiredRootFields =
    hasValue(extraction.invoice_number) &&
    hasValue(extraction.invoice_date) &&
    hasValue(extraction.currency) &&
    hasValue(extraction.grand_total) &&
    extraction.lines.length > 0

  if (!requiredRootFields) {
    return false
  }

  return extraction.lines.every(
    (line) => hasValue(line.description) && hasValue(line.qty) && hasValue(line.unit_price) && hasValue(line.line_total),
  )
}

function validateTotalsConsistency(extraction: CanonicalInvoiceExtraction): boolean {
  const subtotal = toNumber(extraction.subtotal)
  const ivaTotal = toNumber(extraction.iva_total)
  const perceptions = toNumber(extraction.perceptions_total)
  const grandTotal = toNumber(extraction.grand_total)

  if (subtotal === null || ivaTotal === null || perceptions === null || grandTotal === null) {
    return false
  }

  const computed = subtotal + ivaTotal + perceptions
  return Math.abs(computed - grandTotal) <= getTolerance(grandTotal)
}

function validateLinesConsistency(extraction: CanonicalInvoiceExtraction): boolean {
  const subtotal = toNumber(extraction.subtotal)
  if (subtotal === null || extraction.lines.length === 0) {
    return false
  }

  let linesTotal = 0
  for (const line of extraction.lines) {
    const lineTotal = toNumber(line.line_total)
    if (lineTotal === null) {
      return false
    }
    linesTotal += lineTotal
  }

  return Math.abs(linesTotal - subtotal) <= getTolerance(subtotal)
}

export function evaluateExtractionQuality(extraction: CanonicalInvoiceExtraction): InvoiceQuality {
  const requiredFieldsOk = validateRequiredFields(extraction)
  const totalsConsistencyOk = validateTotalsConsistency(extraction)
  const linesConsistencyOk = validateLinesConsistency(extraction)

  const reasons: string[] = []
  if (!requiredFieldsOk) {
    reasons.push("required_fields_failed")
  }
  if (!totalsConsistencyOk) {
    reasons.push("totals_consistency_failed")
  }
  if (!linesConsistencyOk) {
    reasons.push("lines_consistency_failed")
  }

  const score =
    (requiredFieldsOk ? 0.5 : 0) + (totalsConsistencyOk ? 0.3 : 0) + (linesConsistencyOk ? 0.2 : 0)

  return {
    score: Number(score.toFixed(4)),
    needs_review: !requiredFieldsOk || !totalsConsistencyOk || !linesConsistencyOk,
    reasons,
    checks: {
      required_fields_ok: requiredFieldsOk,
      totals_consistency_ok: totalsConsistencyOk,
      lines_consistency_ok: linesConsistencyOk,
    },
  }
}

export function addQualityReason(quality: InvoiceQuality, reason: string): InvoiceQuality {
  if (!reason) {
    return quality
  }

  const reasonSet = new Set(quality.reasons)
  reasonSet.add(reason)

  return {
    ...quality,
    reasons: Array.from(reasonSet),
    needs_review: true,
  }
}
