import type { CanonicalInvoiceExtraction, InvoiceExtractRequest } from "@/lib/services/invoices/schema"

function isPresent(value: unknown): boolean {
  return value !== undefined && value !== null && value !== ""
}

function pick(...values: unknown[]): unknown {
  return values.find(isPresent)
}

function asString(value: unknown, fallback = ""): string {
  if (typeof value === "string") {
    return value.trim()
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value)
  }
  return fallback
}

function asConfidence(value: unknown, fallback = 0.7): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value
  }
  if (typeof value === "string") {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) {
      return parsed
    }
  }
  return fallback
}

function asNumberish(value: unknown, fallback: string | number = ""): string | number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value
  }
  if (typeof value === "string") {
    const trimmed = value.trim()
    return trimmed.length > 0 ? trimmed : fallback
  }
  return fallback
}

function asLineNo(value: unknown, fallback: number): string | number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value
  }
  if (typeof value === "string" && value.trim().length > 0) {
    return value.trim()
  }
  return fallback
}

function getRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>
  }
  return {}
}

function toLineItems(value: unknown): Array<Record<string, unknown>> {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .map((line) => getRecord(line))
    .filter((line) => Object.keys(line).length > 0)
}

function extractLineItems(source: Record<string, unknown>): Array<Record<string, unknown>> {
  const invoice = getRecord(source.invoice)
  const candidate = pick(source.lines, source.line_items, source.items, invoice.lines)
  return toLineItems(candidate)
}

export function normalizeDocAIExtraction(
  request: InvoiceExtractRequest,
  docAIResponse: unknown,
): CanonicalInvoiceExtraction {
  const source = getRecord(docAIResponse)
  const invoice = getRecord(source.invoice)
  const lines = extractLineItems(source)

  return {
    supplier: request.supplier,
    client_id: request.client_id,
    document_id: request.document_id,
    invoice_number: asString(pick(source.invoice_number, source.invoiceNumber, invoice.number)),
    invoice_internal: asString(pick(source.invoice_internal, source.invoiceInternal, source.internal_number)),
    doc_internal_ref: request.doc_internal_ref ?? "",
    remesa: asString(pick(source.remesa, source.delivery_number)),
    remito: asString(source.remito),
    invoice_date: asString(pick(source.invoice_date, source.invoiceDate, invoice.date)),
    due_date: asString(pick(source.due_date, source.dueDate)),
    currency: asString(pick(source.currency, "ARS"), "ARS"),
    subtotal: asNumberish(pick(source.subtotal, source.net_total), ""),
    iva_total: asNumberish(pick(source.iva_total, source.tax_total), ""),
    perceptions_total: asNumberish(pick(source.perceptions_total, source.perception_total), 0),
    grand_total: asNumberish(pick(source.grand_total, source.total), ""),
    extractor_primary: "docai",
    extractor_fallback_used: false,
    extract_confidence: asConfidence(pick(source.confidence, invoice.confidence), 0.7),
    raw_extraction: source,
    lines: lines.map((line, index) => ({
      line_no: asLineNo(pick(line.line_no, line.lineNumber), index + 1),
      code_raw: asString(pick(line.code, line.sku, line.item_code, line.itemCode)),
      description: asString(pick(line.description, line.name, line.item_description)),
      qty: asNumberish(pick(line.qty, line.quantity), ""),
      unit_price: asNumberish(pick(line.unit_price, line.unitPrice, line.price), ""),
      line_total: asNumberish(pick(line.line_total, line.total, line.amount, line.net_amount), ""),
    })),
  }
}

function parseJsonObject(input: string): Record<string, unknown> {
  const trimmed = input.trim()
  const start = trimmed.indexOf("{")
  const end = trimmed.lastIndexOf("}")
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("OpenAI fallback did not return JSON")
  }

  const parsed = JSON.parse(trimmed.slice(start, end + 1))
  return getRecord(parsed)
}

export function parseOpenAIInvoiceJsonFromResponse(response: unknown): Record<string, unknown> {
  const source = getRecord(response)

  if (source.output_parsed && typeof source.output_parsed === "object") {
    return getRecord(source.output_parsed)
  }

  if (typeof source.output_text === "string") {
    return parseJsonObject(source.output_text)
  }

  if (Array.isArray(source.output_text) && source.output_text.length > 0) {
    return parseJsonObject(source.output_text.join("\n"))
  }

  if (Array.isArray(source.output)) {
    for (const outputEntry of source.output) {
      const entry = getRecord(outputEntry)
      const content = Array.isArray(entry.content) ? entry.content : []
      for (const contentEntry of content) {
        const contentRecord = getRecord(contentEntry)
        if (typeof contentRecord.text === "string" && contentRecord.text.trim()) {
          try {
            return parseJsonObject(contentRecord.text)
          } catch {
            continue
          }
        }
      }
    }
  }

  throw new Error("Unable to parse OpenAI fallback response")
}

export function normalizeOpenAIExtraction(
  request: InvoiceExtractRequest,
  openAIParsedPayload: Record<string, unknown>,
  rawResponse: unknown,
): CanonicalInvoiceExtraction {
  const payload = getRecord(openAIParsedPayload)
  const lines = toLineItems(payload.lines)

  return {
    supplier: request.supplier,
    client_id: request.client_id,
    document_id: request.document_id,
    invoice_number: asString(payload.invoice_number),
    invoice_internal: asString(payload.invoice_internal),
    doc_internal_ref: request.doc_internal_ref ?? "",
    remesa: asString(payload.remesa),
    remito: asString(payload.remito),
    invoice_date: asString(payload.invoice_date),
    due_date: asString(payload.due_date),
    currency: asString(payload.currency, "ARS"),
    subtotal: asNumberish(payload.subtotal, ""),
    iva_total: asNumberish(payload.iva_total, ""),
    perceptions_total: asNumberish(payload.perceptions_total, 0),
    grand_total: asNumberish(payload.grand_total, ""),
    extractor_primary: "docai",
    extractor_fallback_used: true,
    extract_confidence: 0.65,
    raw_extraction: getRecord(rawResponse),
    lines: lines.map((line, index) => ({
      line_no: asLineNo(pick(line.line_no, line.lineNumber), index + 1),
      code_raw: asString(pick(line.code_raw, line.code, line.sku, line.item_code, line.itemCode)),
      description: asString(pick(line.description, line.name, line.item_description)),
      qty: asNumberish(pick(line.qty, line.quantity), ""),
      unit_price: asNumberish(pick(line.unit_price, line.unitPrice, line.price), ""),
      line_total: asNumberish(pick(line.line_total, line.total, line.amount), ""),
    })),
  }
}
