# Environment Variables

The application relies on several environment variables. Create a `.env.local` file in the project root and provide the following keys:

- **NEXT_PUBLIC_SUPABASE_URL**: URL of your Supabase project.
- **NEXT_PUBLIC_SUPABASE_ANON_KEY**: Public anon key used by client and server actions.
- **SUPABASE_SERVICE_ROLE_KEY**: Supabase service role key.
- **NEXT_PUBLIC_SITE_URL**: Public base URL for auth callbacks.
- **NEXT_PUBLIC_VERCEL_URL**: Base URL used when generating metadata, sitemap and robots.txt.
- **OPENAI_API_KEY**: API key for optional AI features.

These variables are required for both development and production. When deploying to Vercel or another platform, configure them in your host's environment settings.

## Private Services (Invoice Extraction)

The private services API under `/api/services/v1/*` needs additional variables:

- **SERVICE_API_TOKEN**: Shared bearer token for machine-to-machine calls (for example, n8n -> Next.js).
- **DOCAI_INVOICE_ENDPOINT**: HTTP endpoint for the Document AI invoice parser.
- **DOCAI_SCOPE**: OAuth scope for Google Document AI when using the official Google `:process` endpoint. Default: `https://www.googleapis.com/auth/cloud-platform`.
- **OPENAI_INVOICE_MODEL**: Model name used for fallback extraction (default is `gpt-4.1`).

If you still use Google Drive as file source (`drive_file_id` in request), also set:

- **GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL**: Service account email used to read invoice PDFs from Google Drive.
- **GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY**: PEM private key for the service account (store with escaped newlines in `.env`).
- **GOOGLE_SERVICE_ACCOUNT_PROJECT_ID**: Google Cloud project id associated with the service account.
- **GOOGLE_DRIVE_SCOPE**: OAuth scope for Drive reads. Default: `https://www.googleapis.com/auth/drive.readonly`.

If you use Supabase Storage as file source (`storage_bucket` + `storage_path`), no extra env is required beyond:

- **NEXT_PUBLIC_SUPABASE_URL** (or **SUPABASE_URL**)
- **SUPABASE_SERVICE_ROLE_KEY**
