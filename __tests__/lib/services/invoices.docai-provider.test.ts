import { getGoogleServiceAccessToken } from "@/lib/services/google/service-account"
import { extractInvoiceWithDocAI } from "@/lib/services/invoices/providers/docai"

jest.mock("@/lib/services/google/service-account", () => ({
  getGoogleServiceAccessToken: jest.fn(),
}))

const tokenMock = getGoogleServiceAccessToken as jest.MockedFunction<typeof getGoogleServiceAccessToken>

function mockJsonResponse(payload: unknown) {
  return {
    ok: true,
    headers: {
      get: () => "application/json",
    },
    json: async () => payload,
    text: async () => JSON.stringify(payload),
  } as Response
}

describe("DocAI provider", () => {
  const originalFetch = global.fetch
  const originalEndpoint = process.env.DOCAI_INVOICE_ENDPOINT
  const originalApiKey = process.env.DOCAI_API_KEY

  beforeEach(() => {
    tokenMock.mockReset()
  })

  afterEach(() => {
    global.fetch = originalFetch
    process.env.DOCAI_INVOICE_ENDPOINT = originalEndpoint
    process.env.DOCAI_API_KEY = originalApiKey
  })

  it("uses custom endpoint with PDF binary body", async () => {
    process.env.DOCAI_INVOICE_ENDPOINT = "https://docai-wrapper.internal/extract"
    process.env.DOCAI_API_KEY = "docai-token"
    const fetchMock = jest.fn().mockResolvedValue(mockJsonResponse({ invoice_number: "A-1" }))
    global.fetch = fetchMock as typeof fetch

    const pdfBuffer = Buffer.from("pdf-content")
    const result = await extractInvoiceWithDocAI(pdfBuffer)

    expect((result as Record<string, unknown>).invoice_number).toBe("A-1")
    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe("https://docai-wrapper.internal/extract")
    expect((init as RequestInit).body).toBe(pdfBuffer)
    expect((init as RequestInit).headers).toEqual({
      "Content-Type": "application/pdf",
      Authorization: "Bearer docai-token",
    })
  })

  it("uses official Google Document AI endpoint with OAuth + JSON base64 payload", async () => {
    process.env.DOCAI_INVOICE_ENDPOINT =
      "https://us-documentai.googleapis.com/v1/projects/p/locations/us/processors/123:process"
    tokenMock.mockResolvedValue("google-oauth-token")

    const fetchMock = jest.fn().mockResolvedValue(
      mockJsonResponse({
        document: {
          entities: [
            { type: "invoice_id", mentionText: "INV-100", confidence: 0.9 },
            { type: "invoice_date", normalizedValue: { dateValue: { year: 2026, month: 2, day: 1 } } },
            { type: "currency", mentionText: "ARS" },
            { type: "total_amount", normalizedValue: { moneyValue: { units: "121", nanos: 0, currencyCode: "ARS" } } },
          ],
        },
      }),
    )
    global.fetch = fetchMock as typeof fetch

    const pdfBuffer = Buffer.from("pdf-content")
    const result = (await extractInvoiceWithDocAI(pdfBuffer)) as Record<string, unknown>

    expect(tokenMock).toHaveBeenCalled()
    expect(result.invoice_number).toBe("INV-100")
    expect(result.invoice_date).toBe("2026-02-01")
    expect(result.grand_total).toBe("121.00")

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe(process.env.DOCAI_INVOICE_ENDPOINT)
    expect((init as RequestInit).headers).toEqual({
      Authorization: "Bearer google-oauth-token",
      "Content-Type": "application/json",
    })

    const body = JSON.parse((init as RequestInit).body as string)
    expect(body.rawDocument.mimeType).toBe("application/pdf")
    expect(typeof body.rawDocument.content).toBe("string")
    expect(body.rawDocument.content.length).toBeGreaterThan(0)
  })
})
