# Another Story

Another Story is a full stack web application for anonymously sharing workplace stories. It is built with **Next.js** and uses **Supabase** for authentication and data storage. The project uses **Tailwind CSS** for styling and includes a small test suite powered by **Jest** and React Testing Library.

## Getting Started

1. **Install dependencies**
   ```bash
   pnpm install
   ```

2. **Start the development server**
   ```bash
   pnpm dev
   ```
   The app will be available at `http://localhost:3000`.

3. **Build and run in production**
   ```bash
   pnpm build
   pnpm start
   ```

4. **Lint the project**
   ```bash
   pnpm lint
   ```

5. **Run tests**
   ```bash
   npx jest
   ```
   Tests are located under the `__tests__/` directory.

## Environment Variables

Create a `.env.local` file and define the following keys:

- `NEXT_PUBLIC_SUPABASE_URL` – Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` – Supabase service role key
- `NEXT_PUBLIC_VERCEL_URL` – Base URL used to generate metadata
- `OPENAI_API_KEY` – API key for features that integrate with OpenAI

Additional variables may be required depending on your deployment. See [docs/environment.md](docs/environment.md) for more details.

## Repository Structure

```
app/              Next.js pages and layouts
components/       Reusable React components
hooks/            Custom React hooks
lib/              Server utilities and Supabase clients
styles/           Global styles (Tailwind CSS)
db/migrations/    SQL migrations for Supabase
__tests__/        Jest test suite
```

The root `middleware.ts` refreshes Supabase sessions on each request and stores the user country in a cookie. Server actions live in `lib/actions.ts` and handle tasks such as story submission and profile management.

## Contributing

Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines.


