import { getGoogleServiceAccessToken } from "@/lib/services/google/service-account"

type DocumentAIEntity = {
  type?: string
  mentionText?: string
  confidence?: number
  normalizedValue?: Record<string, unknown>
  properties?: DocumentAIEntity[]
}

type DocumentAIResponse = {
  document?: {
    entities?: DocumentAIEntity[]
  }
}

function isGoogleDocumentAIEndpoint(endpoint: string): boolean {
  return endpoint.includes("documentai.googleapis.com")
}

function normalizedType(type: string | undefined): string {
  return (type || "").toLowerCase().replace(/\s+/g, "_")
}

function moneyToString(moneyValue: Record<string, unknown> | undefined): string {
  if (!moneyValue) {
    return ""
  }

  const units = typeof moneyValue.units === "string" || typeof moneyValue.units === "number"
    ? Number(moneyValue.units)
    : 0
  const nanos = typeof moneyValue.nanos === "number" ? moneyValue.nanos : 0
  const amount = units + nanos / 1_000_000_000
  if (!Number.isFinite(amount)) {
    return ""
  }
  return amount.toFixed(2)
}

function dateToIso(dateValue: Record<string, unknown> | undefined): string {
  if (!dateValue) {
    return ""
  }

  const year = typeof dateValue.year === "number" ? dateValue.year : 0
  const month = typeof dateValue.month === "number" ? dateValue.month : 0
  const day = typeof dateValue.day === "number" ? dateValue.day : 0

  if (!year || !month || !day) {
    return ""
  }

  const monthText = String(month).padStart(2, "0")
  const dayText = String(day).padStart(2, "0")
  return `${year}-${monthText}-${dayText}`
}

function entityValue(entity: DocumentAIEntity | undefined): string {
  if (!entity) {
    return ""
  }

  if (entity.mentionText && entity.mentionText.trim()) {
    return entity.mentionText.trim()
  }

  const normalizedValue = entity.normalizedValue || {}
  if (typeof normalizedValue.text === "string" && normalizedValue.text.trim()) {
    return normalizedValue.text.trim()
  }

  if (typeof normalizedValue.floatValue === "number") {
    return String(normalizedValue.floatValue)
  }

  if (typeof normalizedValue.integerValue === "number") {
    return String(normalizedValue.integerValue)
  }

  if (normalizedValue.moneyValue && typeof normalizedValue.moneyValue === "object") {
    return moneyToString(normalizedValue.moneyValue as Record<string, unknown>)
  }

  if (normalizedValue.dateValue && typeof normalizedValue.dateValue === "object") {
    return dateToIso(normalizedValue.dateValue as Record<string, unknown>)
  }

  return ""
}

function pickEntityValue(entities: DocumentAIEntity[], expectedTypes: string[]): string {
  const normalizedExpected = expectedTypes.map((value) => value.toLowerCase())
  const match = entities.find((entity) => {
    const entityType = normalizedType(entity.type)
    return normalizedExpected.some((expected) => entityType === expected || entityType.endsWith(`/${expected}`))
  })
  return entityValue(match)
}

function averageConfidence(entities: DocumentAIEntity[]): number {
  const confidences = entities
    .map((entity) => entity.confidence)
    .filter((confidence): confidence is number => typeof confidence === "number" && Number.isFinite(confidence))

  if (confidences.length === 0) {
    return 0.7
  }

  const sum = confidences.reduce((total, confidence) => total + confidence, 0)
  return Number((sum / confidences.length).toFixed(4))
}

function getEntityPropertyValue(entity: DocumentAIEntity, expectedTypes: string[]): string {
  const properties = Array.isArray(entity.properties) ? entity.properties : []
  return pickEntityValue(properties, expectedTypes)
}

function normalizeGoogleDocumentAIResponse(rawResponse: DocumentAIResponse): Record<string, unknown> {
  const entities = Array.isArray(rawResponse.document?.entities) ? rawResponse.document?.entities || [] : []
  const lineItemEntities = entities.filter((entity) => normalizedType(entity.type).endsWith("line_item"))

  const lines = lineItemEntities.map((lineItem, index) => ({
    line_no: index + 1,
    code: getEntityPropertyValue(lineItem, ["code", "product_code", "sku", "item_code"]),
    description: getEntityPropertyValue(lineItem, ["description", "item_description"]),
    qty: getEntityPropertyValue(lineItem, ["quantity", "qty"]),
    unit_price: getEntityPropertyValue(lineItem, ["unit_price", "price"]),
    line_total: getEntityPropertyValue(lineItem, ["line_total", "amount", "total"]),
  }))

  const grandTotalEntity = entities.find((entity) => {
    const type = normalizedType(entity.type)
    return type === "total_amount" || type.endsWith("/total_amount") || type.endsWith("/amount_due")
  })

  let currency = pickEntityValue(entities, ["currency"])
  if (!currency && grandTotalEntity?.normalizedValue?.moneyValue && typeof grandTotalEntity.normalizedValue.moneyValue === "object") {
    const moneyValue = grandTotalEntity.normalizedValue.moneyValue as Record<string, unknown>
    if (typeof moneyValue.currencyCode === "string") {
      currency = moneyValue.currencyCode
    }
  }

  return {
    invoice_number: pickEntityValue(entities, ["invoice_id", "invoice_number"]),
    invoice_internal: pickEntityValue(entities, ["invoice_internal", "internal_number", "purchase_order", "po_number"]),
    remesa: pickEntityValue(entities, ["delivery_number", "remesa"]),
    remito: pickEntityValue(entities, ["remito", "shipping_number"]),
    invoice_date: pickEntityValue(entities, ["invoice_date", "issue_date"]),
    due_date: pickEntityValue(entities, ["due_date", "payment_due_date"]),
    currency: currency || "ARS",
    subtotal: pickEntityValue(entities, ["subtotal_amount", "net_amount", "sub_total"]),
    iva_total: pickEntityValue(entities, ["total_tax_amount", "tax_amount", "vat_amount"]),
    perceptions_total: pickEntityValue(entities, ["perceptions_total", "other_charges_amount", "withholding_tax"]),
    grand_total: entityValue(grandTotalEntity),
    confidence: averageConfidence(entities),
    lines,
    raw_document_ai: rawResponse,
  }
}

function getDocAIHeaders(): HeadersInit {
  const headers: HeadersInit = {
    "Content-Type": "application/pdf",
  }

  if (process.env.DOCAI_API_KEY) {
    headers.Authorization = `Bearer ${process.env.DOCAI_API_KEY}`
  }

  return headers
}

async function extractWithCustomDocAIEndpoint(endpoint: string, pdfBuffer: Buffer): Promise<unknown> {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: getDocAIHeaders(),
    body: pdfBuffer,
    cache: "no-store",
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`DocAI extraction failed (${response.status}): ${errorText}`)
  }

  const contentType = response.headers.get("content-type") || ""
  if (!contentType.includes("application/json")) {
    const responseBody = await response.text()
    throw new Error(`DocAI returned non-JSON response: ${responseBody}`)
  }

  return response.json()
}

async function extractWithGoogleDocumentAI(endpoint: string, pdfBuffer: Buffer): Promise<unknown> {
  const scope = process.env.DOCAI_SCOPE || "https://www.googleapis.com/auth/cloud-platform"
  const accessToken = await getGoogleServiceAccessToken(scope)

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      rawDocument: {
        content: pdfBuffer.toString("base64"),
        mimeType: "application/pdf",
      },
    }),
    cache: "no-store",
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Google Document AI extraction failed (${response.status}): ${errorText}`)
  }

  const responseJson = (await response.json()) as DocumentAIResponse
  return normalizeGoogleDocumentAIResponse(responseJson)
}

export async function extractInvoiceWithDocAI(pdfBuffer: Buffer): Promise<unknown> {
  const endpoint = process.env.DOCAI_INVOICE_ENDPOINT
  if (!endpoint) {
    throw new Error("Missing required environment variable: DOCAI_INVOICE_ENDPOINT")
  }

  if (isGoogleDocumentAIEndpoint(endpoint)) {
    return extractWithGoogleDocumentAI(endpoint, pdfBuffer)
  }

  return extractWithCustomDocAIEndpoint(endpoint, pdfBuffer)
}
