# Environment Variables

The application relies on several environment variables. Create a `.env.local` file in the project root and provide the following keys:

- **NEXT_PUBLIC_SUPABASE_URL**: URL of your Supabase project.
- **SUPABASE_SERVICE_ROLE_KEY**: Supabase service role key.
- **NEXT_PUBLIC_VERCEL_URL**: Base URL used when generating metadata, sitemap and robots.txt.
- **OPENAI_API_KEY**: API key for optional AI features.

These variables are required for both development and production. When deploying to Vercel or another platform, configure them in your host's environment settings.
