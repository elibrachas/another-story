import { evaluateExtractionQuality } from "@/lib/services/invoices/quality"
import type { CanonicalInvoiceExtraction } from "@/lib/services/invoices/schema"

function buildExtraction(overrides?: Partial<CanonicalInvoiceExtraction>): CanonicalInvoiceExtraction {
  return {
    supplier: "bosch",
    client_id: "client-1",
    document_id: "f22835d8-1498-4c19-9e8f-968bb1f4f4aa",
    invoice_number: "A-1",
    invoice_internal: "INT-1",
    doc_internal_ref: "",
    remesa: "",
    remito: "",
    invoice_date: "2026-02-01",
    due_date: "2026-02-28",
    currency: "ARS",
    subtotal: "100",
    iva_total: "21",
    perceptions_total: "0",
    grand_total: "121",
    extractor_primary: "docai",
    extractor_fallback_used: false,
    extract_confidence: 0.8,
    raw_extraction: {},
    lines: [{ line_no: 1, description: "Item", qty: "1", unit_price: "100", line_total: "100", code_raw: "" }],
    ...overrides,
  }
}

describe("evaluateExtractionQuality", () => {
  it("passes strict quality checks for valid extraction", () => {
    const quality = evaluateExtractionQuality(buildExtraction())
    expect(quality.needs_review).toBe(false)
    expect(quality.score).toBe(1)
    expect(quality.reasons).toEqual([])
  })

  it("fails when required fields are missing", () => {
    const quality = evaluateExtractionQuality(
      buildExtraction({
        invoice_number: "",
      }),
    )

    expect(quality.needs_review).toBe(true)
    expect(quality.checks.required_fields_ok).toBe(false)
    expect(quality.reasons).toContain("required_fields_failed")
  })

  it("fails when totals are inconsistent", () => {
    const quality = evaluateExtractionQuality(
      buildExtraction({
        grand_total: "140",
      }),
    )

    expect(quality.needs_review).toBe(true)
    expect(quality.checks.totals_consistency_ok).toBe(false)
    expect(quality.reasons).toContain("totals_consistency_failed")
  })
})
