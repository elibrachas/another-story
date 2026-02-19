import {
  normalizeDocAIExtraction,
  normalizeOpenAIExtraction,
  parseOpenAIInvoiceJsonFromResponse,
} from "@/lib/services/invoices/normalize"
import type { InvoiceExtractRequest } from "@/lib/services/invoices/schema"

const baseRequest: InvoiceExtractRequest = {
  document_id: "f22835d8-1498-4c19-9e8f-968bb1f4f4aa",
  client_id: "client-1",
  supplier: "bosch",
  drive_file_id: "drive-file-1",
  doc_internal_ref: "internal-ref-99",
}

describe("invoice normalization", () => {
  it("normalizes a full DocAI payload", () => {
    const raw = {
      invoice_number: "A-0001",
      invoice_internal: "INT-10",
      invoice_date: "2026-02-01",
      due_date: "2026-02-28",
      currency: "ARS",
      subtotal: "100",
      iva_total: "21",
      perceptions_total: "0",
      grand_total: "121",
      confidence: 0.91,
      line_items: [
        {
          line_no: 1,
          code: "SKU-1",
          description: "Item 1",
          qty: "1",
          unit_price: "100",
          line_total: "100",
        },
      ],
    }

    const normalized = normalizeDocAIExtraction(baseRequest, raw)
    expect(normalized.document_id).toBe(baseRequest.document_id)
    expect(normalized.client_id).toBe("client-1")
    expect(normalized.invoice_number).toBe("A-0001")
    expect(normalized.lines).toHaveLength(1)
    expect(normalized.extractor_fallback_used).toBe(false)
    expect(normalized.extract_confidence).toBe(0.91)
  })

  it("normalizes missing DocAI fields to safe defaults", () => {
    const normalized = normalizeDocAIExtraction(baseRequest, {})
    expect(normalized.invoice_number).toBe("")
    expect(normalized.currency).toBe("ARS")
    expect(normalized.lines).toHaveLength(0)
    expect(normalized.doc_internal_ref).toBe("internal-ref-99")
  })

  it("parses OpenAI fallback JSON from output_text", () => {
    const rawResponse = {
      output_text:
        "{\"invoice_number\":\"A-5\",\"invoice_internal\":\"INT\",\"remesa\":\"\",\"remito\":\"\",\"invoice_date\":\"2026-02-01\",\"due_date\":\"2026-02-28\",\"currency\":\"ARS\",\"subtotal\":\"100\",\"iva_total\":\"21\",\"perceptions_total\":\"0\",\"grand_total\":\"121\",\"lines\":[{\"description\":\"Item\",\"qty\":\"1\",\"unit_price\":\"100\",\"line_total\":\"100\"}]}",
    }

    const parsed = parseOpenAIInvoiceJsonFromResponse(rawResponse)
    expect(parsed.invoice_number).toBe("A-5")
  })

  it("normalizes parsed OpenAI fallback payload", () => {
    const parsedPayload = {
      invoice_number: "A-7",
      invoice_internal: "INT-7",
      remesa: "",
      remito: "",
      invoice_date: "2026-02-02",
      due_date: "2026-02-20",
      currency: "ARS",
      subtotal: "200",
      iva_total: "42",
      perceptions_total: "0",
      grand_total: "242",
      lines: [{ description: "Item X", qty: "2", unit_price: "100", line_total: "200" }],
    }

    const normalized = normalizeOpenAIExtraction(baseRequest, parsedPayload, { raw: true })
    expect(normalized.extractor_fallback_used).toBe(true)
    expect(normalized.invoice_number).toBe("A-7")
    expect(normalized.lines).toHaveLength(1)
  })
})
