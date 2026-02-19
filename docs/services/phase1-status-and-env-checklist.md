# Fase 1 - Estado, Variables y Checklist de Integracion

## 1) Estado actual (implementado en este repo)

Se implemento la mini API privada de servicios para extraccion de facturas:

- `POST /api/services/v1/invoices/extract`
- `GET /api/services/v1/health`

Con:

1. Auth por bearer token de servicio (`SERVICE_API_TOKEN`).
2. Descarga de PDF desde Google Drive (Service Account).
3. Extraccion primaria con DocAI.
4. Fallback/QA con OpenAI (`responses` + `input_file` + `json_schema`).
5. Quality gate estricto y salida `needs_review` con motivos.

Archivos clave:

- `app/api/services/v1/invoices/extract/route.ts`
- `app/api/services/v1/health/route.ts`
- `lib/services/invoices/pipeline.ts`
- `lib/services/invoices/quality.ts`

## 2) Env vars requeridas para que funcione el workflow

## 2.1 En Next.js (API privada)

Obligatorias para este servicio:

1. `SERVICE_API_TOKEN`
2. `GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL`
3. `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`
4. `GOOGLE_SERVICE_ACCOUNT_PROJECT_ID`
5. `DOCAI_INVOICE_ENDPOINT`
6. `OPENAI_API_KEY`

Recomendadas/soportadas:

1. `GOOGLE_DRIVE_SCOPE` (default: `https://www.googleapis.com/auth/drive.readonly`)
2. `DOCAI_SCOPE` (default: `https://www.googleapis.com/auth/cloud-platform`, solo para endpoint oficial Google Document AI)
3. `OPENAI_INVOICE_MODEL` (default: `gpt-4.1`)
4. `DOCAI_API_KEY` (si tu endpoint de DocAI personalizado requiere bearer token)

Tambien siguen siendo necesarias las envs base de la app:

1. `NEXT_PUBLIC_SUPABASE_URL`
2. `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. `SUPABASE_SERVICE_ROLE_KEY`
4. `NEXT_PUBLIC_SITE_URL`
5. `NEXT_PUBLIC_VERCEL_URL`

## 2.2 En n8n

Para el workflow nuevo basado en la API privada:

1. `SERVICE_API_TOKEN` (debe coincidir exactamente con la de Next.js)
2. `SERVICES_API_URL` (ejemplo: `https://cronicaslaborales.com/api/services/v1/invoices/extract`)

El workflow mantiene credenciales existentes para:

1. Postgres/Supabase (persistencia y status en `nucleo_ops`)

Ya no hace falta que n8n tenga:

1. Credenciales de OpenAI para este flujo
2. Endpoint/credenciales DocAI en nodos del workflow
3. Credenciales Google Drive para descargar PDF en n8n (ahora lo hace la API)

## 3) Cambios necesarios en workflow para que funcione

Usar como base:

- `docs/services/WF_30_Invoice_Validation.services.json`

Cambios concretos:

1. Reemplazar el bloque de extraccion actual por el nodo HTTP `Invoice Extract Service`.
2. Body enviado a la API:
   - `document_id`
   - `client_id`
   - `supplier`
   - `drive_file_id`
   - `doc_internal_ref`
3. Mantener persistencia con `nucleo_ops.fn_ingest_invoice_payload(...)`.
4. Branch por `quality.needs_review`:
   - `true` -> `status='needs_review'`
   - `false` -> `status='processed'`
5. Configurar retry tecnico del nodo HTTP:
   - max 3 intentos
   - si falla todo: marcar `needs_review` con nota `technical_failure_after_retries`

## 3.1 Sobre `DOCAI_INVOICE_ENDPOINT` (aclaracion)

Puede ser cualquiera de estas 2 opciones:

1. Endpoint personalizado (wrapper) que acepte PDF binario.
2. Endpoint oficial Google Document AI `:process`.

Con el ajuste actual de la app, ambas opciones son compatibles automaticamente.

Formato oficial Google:

`https://<location>-documentai.googleapis.com/v1/projects/<project_id>/locations/<location>/processors/<processor_id>:process`

## 4) Checklist de puesta en marcha

1. Configurar env vars de Next.js en entorno deploy.
2. Verificar que Service Account tenga acceso de lectura a los archivos/folder de Drive.
3. Configurar env vars en n8n (`SERVICE_API_TOKEN`, `SERVICES_API_URL`).
4. Importar `WF_30_Invoice_Validation.services.json` (o replicar nodos equivalentes).
5. Ejecutar prueba con una factura real y revisar:
   - respuesta API 200
   - `extraction` persistido
   - estado final `processed` o `needs_review`
6. Activar workflow en n8n cuando la prueba sea correcta.

## 5) Registros realizados (API, workflow, funcionalidades)

API:

- `docs/services/openapi.yaml`
- `docs/services/README.md`

Workflow:

- `docs/services/n8n-integration.md`
- `docs/services/WF_30_Invoice_Validation.services.json`

Operacion:

- `docs/services/runbook-invoice-extraction.md`

Variables:

- `docs/environment.md`

## 6) Aprendizajes y decisiones (registrado)

1. `pdf-parse` no es ideal como base de alta fiabilidad para facturas complejas; mejor parser especializado (DocAI) + fallback.
2. n8n funciona mejor como orquestador/reintentos y no como lugar de logica compleja de parsing.
3. Mantener contrato canonico en API reduce drift entre workflows/clientes.
4. Separar error tecnico (retry) de error funcional (needs_review) mejora operacion humana.
5. Evitar parsear PDF en OpenAI como imagen; usar `input_file` para PDF.

## 7) Pendiente operativo fuera del repo

1. Confirmar en DB que `documents_inbox.status` admite `needs_review`.
2. Confirmar permisos reales de Service Account sobre Drive del cliente.
3. Rotacion periodica de `SERVICE_API_TOKEN`.
