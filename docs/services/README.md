# Services API (Private)

This app now contains a private services layer used by automation clients (n8n) under:

- `POST /api/services/v1/invoices/extract`
- `GET /api/services/v1/health`

## Goal

Provide high-reliability invoice extraction with:

1. Primary extractor: DocAI invoice parser.
2. Fallback extractor: OpenAI Responses API (`input_file` + JSON schema).
3. Strict quality gate that determines `needs_review`.

Persistence remains outside this API (n8n writes to Postgres / `nucleo_ops`).

## Auth

All `/api/services/v1/*` endpoints are private.

- Header required: `Authorization: Bearer <SERVICE_API_TOKEN>`
- Token comparison uses constant-time checks.

## Request/Response contract

The canonical API contract is defined in:

- `docs/services/openapi.yaml`
- Example updated workflow: `docs/services/WF_30_Invoice_Validation.services.json`

## Runtime flow

`POST /api/services/v1/invoices/extract`:

1. Validate bearer token.
2. Validate body with Zod.
3. Download PDF from Google Drive using service account credentials.
4. Run DocAI extraction.
5. Normalize to canonical invoice schema.
6. Run strict quality gate.
7. If quality fails, run OpenAI fallback and re-check quality.
8. Return extraction + quality + metadata (`request_id`, `duration_ms`).

## Logging

Route logs only operational metadata:

- `request_id`
- `document_id`
- `client_id`
- `supplier`
- `duration_ms`
- fallback flags
- `needs_review`

No full PDF payload is logged.

## Files

- Route: `app/api/services/v1/invoices/extract/route.ts`
- Health: `app/api/services/v1/health/route.ts`
- Pipeline: `lib/services/invoices/pipeline.ts`
- Quality gate: `lib/services/invoices/quality.ts`
- Providers:
  - `lib/services/invoices/providers/drive.ts`
  - `lib/services/invoices/providers/docai.ts`
  - `lib/services/invoices/providers/openai-fallback.ts`
