import { POST } from "@/app/api/services/v1/invoices/extract/route"
import { runInvoiceExtractionPipeline } from "@/lib/services/invoices/pipeline"

jest.mock("@/lib/services/invoices/pipeline", () => ({
  runInvoiceExtractionPipeline: jest.fn(),
}))

const pipelineMock = runInvoiceExtractionPipeline as jest.MockedFunction<typeof runInvoiceExtractionPipeline>

const validPayload = {
  document_id: "f22835d8-1498-4c19-9e8f-968bb1f4f4aa",
  client_id: "client-1",
  supplier: "bosch",
  drive_file_id: "drive-file-1",
  doc_internal_ref: "",
}

const validStoragePayload = {
  document_id: "f22835d8-1498-4c19-9e8f-968bb1f4f4aa",
  client_id: "client-1",
  supplier: "bosch",
  storage_bucket: "nucleo-facturas",
  storage_path: "Entrega 171728965.PDF",
  doc_internal_ref: "",
}

describe("POST /api/services/v1/invoices/extract", () => {
  const originalToken = process.env.SERVICE_API_TOKEN

  beforeEach(() => {
    process.env.SERVICE_API_TOKEN = "service-token"
    pipelineMock.mockReset()
  })

  afterAll(() => {
    process.env.SERVICE_API_TOKEN = originalToken
  })

  it("returns 401 when auth token is missing", async () => {
    const request = new Request("http://localhost/api/services/v1/invoices/extract", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(validPayload),
    })

    const response = await POST(request)
    const body = await response.json()

    expect(response.status).toBe(401)
    expect(body.success).toBe(false)
  })

  it("returns 400 when request body is invalid", async () => {
    const request = new Request("http://localhost/api/services/v1/invoices/extract", {
      method: "POST",
      headers: {
        Authorization: "Bearer service-token",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...validPayload, document_id: "not-a-uuid" }),
    })

    const response = await POST(request)
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.success).toBe(false)
    expect(body.error.code).toBe("invalid_request")
  })

  it("returns 400 when file source is missing", async () => {
    const request = new Request("http://localhost/api/services/v1/invoices/extract", {
      method: "POST",
      headers: {
        Authorization: "Bearer service-token",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        document_id: validPayload.document_id,
        client_id: validPayload.client_id,
        supplier: validPayload.supplier,
      }),
    })

    const response = await POST(request)
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.success).toBe(false)
    expect(body.error.code).toBe("invalid_request")
  })

  it("returns 200 with needs_review false", async () => {
    pipelineMock.mockResolvedValue({
      extraction: {
        supplier: "bosch",
        client_id: "client-1",
        document_id: validPayload.document_id,
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
        extract_confidence: 0.9,
        raw_extraction: {},
        lines: [{ line_no: 1, description: "Item", qty: "1", unit_price: "100", line_total: "100", code_raw: "" }],
      },
      quality: {
        score: 1,
        needs_review: false,
        reasons: [],
        checks: {
          required_fields_ok: true,
          totals_consistency_ok: true,
          lines_consistency_ok: true,
        },
      },
      meta: {
        fallback_attempted: false,
        fallback_succeeded: false,
      },
    })

    const request = new Request("http://localhost/api/services/v1/invoices/extract", {
      method: "POST",
      headers: {
        Authorization: "Bearer service-token",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(validPayload),
    })

    const response = await POST(request)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.quality.needs_review).toBe(false)
  })

  it("returns 200 with needs_review true", async () => {
    pipelineMock.mockResolvedValue({
      extraction: {
        supplier: "bosch",
        client_id: "client-1",
        document_id: validPayload.document_id,
        invoice_number: "",
        invoice_internal: "",
        doc_internal_ref: "",
        remesa: "",
        remito: "",
        invoice_date: "",
        due_date: "",
        currency: "ARS",
        subtotal: "",
        iva_total: "",
        perceptions_total: 0,
        grand_total: "",
        extractor_primary: "docai",
        extractor_fallback_used: true,
        extract_confidence: 0.65,
        raw_extraction: {},
        lines: [],
      },
      quality: {
        score: 0.2,
        needs_review: true,
        reasons: ["required_fields_failed"],
        checks: {
          required_fields_ok: false,
          totals_consistency_ok: false,
          lines_consistency_ok: false,
        },
      },
      meta: {
        fallback_attempted: true,
        fallback_succeeded: true,
      },
    })

    const request = new Request("http://localhost/api/services/v1/invoices/extract", {
      method: "POST",
      headers: {
        Authorization: "Bearer service-token",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(validPayload),
    })

    const response = await POST(request)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.quality.needs_review).toBe(true)
  })

  it("returns 200 with supabase storage source", async () => {
    pipelineMock.mockResolvedValue({
      extraction: {
        supplier: "bosch",
        client_id: "client-1",
        document_id: validStoragePayload.document_id,
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
        extract_confidence: 0.9,
        raw_extraction: {},
        lines: [{ line_no: 1, description: "Item", qty: "1", unit_price: "100", line_total: "100", code_raw: "" }],
      },
      quality: {
        score: 1,
        needs_review: false,
        reasons: [],
        checks: {
          required_fields_ok: true,
          totals_consistency_ok: true,
          lines_consistency_ok: true,
        },
      },
      meta: {
        fallback_attempted: false,
        fallback_succeeded: false,
      },
    })

    const request = new Request("http://localhost/api/services/v1/invoices/extract", {
      method: "POST",
      headers: {
        Authorization: "Bearer service-token",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(validStoragePayload),
    })

    const response = await POST(request)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.quality.needs_review).toBe(false)
  })

  it("returns controlled error when pipeline throws", async () => {
    pipelineMock.mockRejectedValue(new Error("DocAI extraction failed (503): unavailable"))

    const request = new Request("http://localhost/api/services/v1/invoices/extract", {
      method: "POST",
      headers: {
        Authorization: "Bearer service-token",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(validPayload),
    })

    const response = await POST(request)
    const body = await response.json()

    expect(response.status).toBe(502)
    expect(body.success).toBe(false)
    expect(body.error.code).toBe("extraction_failed")
  })
})
