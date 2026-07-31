# SalesFlow

SalesFlow is a focused CRM workspace for fibre sales teams. Sprint 1 establishes the application shell, dashboard experience, Supabase integration, and secure CRM data model.

## Stack

- Next.js 16 App Router, React 19, and TypeScript
- Tailwind CSS 4 with shadcn/ui conventions
- Supabase Auth and Postgres with row-level security

## Local setup

1. Install dependencies with `pnpm install`.
2. Copy `.env.example` to `.env.local`.
3. Add the URL and publishable key from your Supabase project.
4. Apply the SQL migration in `supabase/migrations`.
5. Start the app with `pnpm dev`.

## Sprint 1 architecture

The initial CRM schema includes accounts, contacts, leads, opportunities, and activities. Every exposed table has row-level security enabled and restricts data access to its authenticated owner.
