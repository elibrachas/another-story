# Runbook: Invoice Extraction Service

## Scope

Operational guide for `/api/services/v1/invoices/extract`.

## Normal flow

1. n8n claims queued invoice document.
2. n8n calls extract endpoint.
3. Service returns canonical extraction + quality.
4. n8n persists payload to `nucleo_ops`.
5. n8n sets status:
   - `processed` when `quality.needs_review = false`
   - `needs_review` when `quality.needs_review = true`

## Failure handling

Technical errors (HTTP `5xx`):

1. Retry up to 3 times.
2. If all fail, set:
   - status: `needs_review`
   - note: `technical_failure_after_retries`

Functional low-confidence results (HTTP `200` + `needs_review = true`):

1. Persist extraction payload.
2. Set status `needs_review`.
3. Store reason list from `quality.reasons`.

## Incident checklist

When volume of `needs_review` spikes:

1. Check DocAI endpoint availability and latency.
2. Check OpenAI API status and error codes.
3. Validate Google service account access to target Drive files.
4. Verify `SERVICE_API_TOKEN` has not changed only in one side (n8n/app mismatch).
5. Inspect sample request ids from logs and reproduce with same payload.

## Human review checklist

For each `needs_review` invoice:

1. Verify `invoice_number` and dates.
2. Verify currency and grand total.
3. Compare subtotal and sum of line totals.
4. Verify tax/perception totals.
5. Correct payload manually if needed before downstream accounting steps.

## Security checklist

1. Rotate `SERVICE_API_TOKEN` periodically.
2. Keep service account key in secret manager only.
3. Avoid logging raw PDF content.
4. Restrict endpoint usage to automation clients only.
