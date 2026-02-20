import { persistInvoiceExtraction } from "@/lib/services/invoices/persistence"
import { createAdminClient } from "@/lib/supabase-admin"

jest.mock("@/lib/supabase-admin", () => ({
  createAdminClient: jest.fn(),
}))

const createAdminClientMock = createAdminClient as jest.MockedFunction<typeof createAdminClient>

const extractionPayload = {
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
  extractor_primary: "docai" as const,
  extractor_fallback_used: false,
  extract_confidence: 0.9,
  raw_extraction: {},
  lines: [{ line_no: 1, description: "Item", qty: "1", unit_price: "100", line_total: "100", code_raw: "" }],
}

describe("invoice persistence", () => {
  it("persists extraction via execute_sql rpc", async () => {
    const rpcMock = jest.fn().mockResolvedValue({
      data: [{ result: { ok: true } }],
      error: null,
    })
    createAdminClientMock.mockReturnValue({ rpc: rpcMock } as unknown as ReturnType<typeof createAdminClient>)

    const result = await persistInvoiceExtraction(extractionPayload)

    expect(createAdminClientMock).toHaveBeenCalledTimes(1)
    expect(rpcMock).toHaveBeenCalledTimes(1)
    expect(rpcMock.mock.calls[0]?.[0]).toBe("execute_sql")
    expect((rpcMock.mock.calls[0]?.[1] as { sql_query: string }).sql_query).toContain(
      "nucleo_ops.fn_ingest_invoice_payload",
    )
    expect(result.result).toEqual({ ok: true })
  })

  it("throws when execute_sql rpc fails", async () => {
    const rpcMock = jest.fn().mockResolvedValue({
      data: null,
      error: { message: "function execute_sql does not exist" },
    })
    createAdminClientMock.mockReturnValue({ rpc: rpcMock } as unknown as ReturnType<typeof createAdminClient>)

    await expect(persistInvoiceExtraction(extractionPayload)).rejects.toThrow(
      "Persistence failed while calling execute_sql",
    )
  })
})
