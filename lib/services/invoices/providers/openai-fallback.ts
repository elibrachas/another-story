import { parseOpenAIInvoiceJsonFromResponse } from "@/lib/services/invoices/normalize"

const OPENAI_RESPONSE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    invoice_number: { type: "string" },
    invoice_internal: { type: "string" },
    remesa: { type: "string" },
    remito: { type: "string" },
    invoice_date: { type: "string" },
    due_date: { type: "string" },
    currency: { type: "string" },
    subtotal: { type: ["string", "number"] },
    iva_total: { type: ["string", "number"] },
    perceptions_total: { type: ["string", "number"] },
    grand_total: { type: ["string", "number"] },
    lines: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          line_no: { type: ["string", "number"] },
          code_raw: { type: "string" },
          description: { type: "string" },
          qty: { type: ["string", "number"] },
          unit_price: { type: ["string", "number"] },
          line_total: { type: ["string", "number"] },
        },
        required: ["description", "qty", "unit_price", "line_total"],
      },
    },
  },
  required: [
    "invoice_number",
    "invoice_internal",
    "remesa",
    "remito",
    "invoice_date",
    "due_date",
    "currency",
    "subtotal",
    "iva_total",
    "perceptions_total",
    "grand_total",
    "lines",
  ],
} as const

type OpenAIFallbackResult = {
  rawResponse: Record<string, unknown>
  parsedPayload: Record<string, unknown>
}

function getOpenAIModel(): string {
  return process.env.OPENAI_INVOICE_MODEL || "gpt-4.1"
}

export async function extractInvoiceWithOpenAIFallback(
  pdfBuffer: Buffer,
  supplier: string,
): Promise<OpenAIFallbackResult> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error("Missing required environment variable: OPENAI_API_KEY")
  }

  const dataUrl = `data:application/pdf;base64,${pdfBuffer.toString("base64")}`
  const prompt = [
    `Extract this ${supplier} invoice into strict JSON.`,
    "Return only data that is present in the PDF.",
    "Do not infer missing values.",
    "Use empty string for missing text fields and 0 for missing numeric totals when needed.",
  ].join(" ")

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: getOpenAIModel(),
      input: [
        {
          role: "user",
          content: [
            { type: "input_text", text: prompt },
            { type: "input_file", filename: "invoice.pdf", file_data: dataUrl },
          ],
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "invoice_extraction",
          strict: true,
          schema: OPENAI_RESPONSE_SCHEMA,
        },
      },
    }),
    cache: "no-store",
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`OpenAI fallback failed (${response.status}): ${errorText}`)
  }

  const rawResponse = (await response.json()) as Record<string, unknown>
  const parsedPayload = parseOpenAIInvoiceJsonFromResponse(rawResponse)

  return {
    rawResponse,
    parsedPayload,
  }
}
