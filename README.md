# Another Story

Another Story is a full stack web application for anonymously sharing workplace stories. It is built with **Next.js** and uses **Supabase** for authentication and data storage. The project uses **Tailwind CSS** for styling and includes a small test suite powered by **Jest** and React Testing Library.

## Getting Started

1. **Install dependencies**
   \`\`\`bash
   pnpm install
   \`\`\`

2. **Start the development server**
   \`\`\`bash
   pnpm dev
   \`\`\`
   The app will be available at `http://localhost:3000`.

3. **Build and run in production**
   \`\`\`bash
   pnpm build
   pnpm start
   \`\`\`

4. **Lint the project**
   \`\`\`bash
   pnpm lint
   \`\`\`

5. **Run tests**
   \`\`\`bash
   npx jest
   \`\`\`
   Tests are located under the `__tests__/` directory.

## Environment Variables

Create a `.env.local` file and define the following keys:

- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase public anon key (required by client + server actions)
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `NEXT_PUBLIC_SITE_URL` - Public base URL for auth callbacks
- `NEXT_PUBLIC_VERCEL_URL` - Base URL used to generate metadata
- `OPENAI_API_KEY` - API key for features that integrate with OpenAI

Additional variables may be required depending on your deployment. See [docs/environment.md](docs/environment.md) for more details.

For the private services API (invoice extraction), see:

- [docs/services/README.md](docs/services/README.md)
- [docs/services/openapi.yaml](docs/services/openapi.yaml)
- [docs/services/n8n-integration.md](docs/services/n8n-integration.md)
- [docs/services/runbook-invoice-extraction.md](docs/services/runbook-invoice-extraction.md)
- [docs/services/WF_30_Invoice_Validation.services.json](docs/services/WF_30_Invoice_Validation.services.json)
- [docs/services/phase1-status-and-env-checklist.md](docs/services/phase1-status-and-env-checklist.md)

## Repository Structure

\`\`\`
app/              Next.js pages and layouts
components/       Reusable React components
hooks/            Custom React hooks
lib/              Server utilities and Supabase clients
styles/           Global styles (Tailwind CSS)
db/migrations/    SQL migrations for Supabase
__tests__/        Jest test suite
\`\`\`

The root `middleware.ts` refreshes Supabase sessions on each request and stores the user country in a cookie. Server actions live in `lib/actions.ts` and handle tasks such as story submission and profile management.

## Contributing

Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines.
