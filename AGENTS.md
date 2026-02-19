# AGENTS

## Project snapshot
- Stack: Next.js (App Router) + Supabase + Tailwind CSS.
- Story submission: `components/submit-form.tsx` -> `lib/actions.ts` (`submitStory`).
- Auth: server actions read Supabase cookies; `getAuthenticatedUser` falls back to session if `getUser` fails.

## Quick commands
- Dev: `pnpm dev`
- Lint: `pnpm lint`
- Tests: `npx jest`

## Key files
- Server actions: `lib/actions.ts`
- Supabase middleware: `middleware.ts`
- Auth callback: `app/auth/callback/route.ts`
- Env docs: `docs/environment.md`
