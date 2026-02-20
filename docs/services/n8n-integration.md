# n8n Integration Guide (WF_30 Invoice Validation)

This guide replaces the central extraction block in `WF_30_Invoice_Validation` with a single HTTP call to the private API.

An example importable workflow is included at:

- `docs/services/WF_30_Invoice_Validation.services.json`

## Keep current nodes

Keep:

1. `Claim next invoice_pdf doc`
2. `IF has document?` (validar `id` + source file: `drive_file_id` o `storage_path`)
3. `Persist invoice payload`
4. status updates (`processed` / `failed`)

Remove/replace:

- `Download invoice PDF`
- `DocAI - Extract Invoice`
- `Normalize DocAI + Fallback Flag`
- `IF fallback needed?`
- `Build OpenAI Fallback Request`
- `OpenAI - Invoice Fallback`
- `Normalize OpenAI fallback`
- `Pass DocAI extraction`

## New HTTP node

Create node: `Invoice Extract Service`

- Method: `POST`
- URL: `https://<your-domain>/api/services/v1/invoices/extract`
- Options:
  - `retryOnFail = true`
  - `maxTries = 3`
  - `ignoreResponseCode = true`
  - `continueOnFail = true`
- Headers:
  - `Authorization: Bearer {{$env.SERVICE_API_TOKEN}}`
  - `Content-Type: application/json`
  - `X-Request-Id: {{$execution.id}}-{{$json.id}}`
- JSON Body:

```json
{
  "document_id": "={{$json.id}}",
  "client_id": "={{$json.client_id}}",
  "supplier": "={{$json.supplier || 'bosch'}}",
  "storage_bucket": "={{$json.storage_bucket || 'nucleo-facturas'}}",
  "storage_path": "={{$json.storage_path || $json.attachment_name}}",
  "doc_internal_ref": "={{$json.doc_internal_ref || ''}}"
}
```

Alternative (legacy Google Drive source):

```json
{
  "document_id": "={{$json.id}}",
  "client_id": "={{$json.client_id}}",
  "supplier": "={{$json.supplier || 'bosch'}}",
  "drive_file_id": "={{$json.drive_file_id}}",
  "doc_internal_ref": "={{$json.doc_internal_ref || ''}}"
}
```

## Flow control after HTTP call

Add an IF node `IF extraction success?` with condition:

```text
{{$json.success === true}}
```

1. `true` branch: persist payload and continue normal status logic.
2. `false` branch: mark `failed` with note `technical_failure_after_retries`.

Technical failure status query:

```sql
={{ "select nucleo_ops.fn_set_document_status('" + $node['Claim next invoice_pdf doc'].json.id + "'::uuid, 'failed', 'technical_failure_after_retries');" }}
```

## Persist payload

Use `{{$json.extraction}}` from service response:

```sql
={{ "select nucleo_ops.fn_ingest_invoice_payload('" + JSON.stringify($json.extraction).replace(/'/g, "''") + "'::jsonb) as result;" }}
```

## Status handling

After persisting, branch on `{{$json.quality.needs_review}}`:

1. `false` -> mark processed
2. `true` -> mark failed with review reasons (`needs_review: ...`)

Processed example:

```sql
={{ "select nucleo_ops.fn_set_document_status('" + $node['Claim next invoice_pdf doc'].json.id + "'::uuid, 'processed', 'invoice validated by services api');" }}
```

Needs review example:

```sql
={{ "select nucleo_ops.fn_set_document_status('" + $node['Claim next invoice_pdf doc'].json.id + "'::uuid, 'failed', '" + ("needs_review: " + (($json.quality.reasons || []).join(', '))).replace(/'/g, "''") + "');" }}
```

## Retries

Configure node retry policy:

1. Max attempts: `3`
2. Retry on technical errors (`5xx`, timeouts)
3. After max retries (or non-200 error), route through the `false` branch and set:
   - `failed`
   - note: `technical_failure_after_retries`

## Expected response sample

```json
{
  "success": true,
  "extraction": { "document_id": "uuid", "lines": [] },
  "quality": {
    "score": 0.7,
    "needs_review": true,
    "reasons": ["totals_consistency_failed"],
    "checks": {
      "required_fields_ok": true,
      "totals_consistency_ok": false,
      "lines_consistency_ok": true
    }
  },
  "meta": {
    "request_id": "trace-id",
    "duration_ms": 2140
  }
}
```
