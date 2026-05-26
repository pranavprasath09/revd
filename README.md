# RevD

The home base for car culture — a social platform where enthusiasts discover cars, find their community, attend meets, showcase their builds, and connect with creators and photographers.

## Tech stack

- **Frontend:** React 19, Vite 8, TypeScript (strict), Tailwind 4, React Router v7, Zustand 5, Framer Motion 12
- **Backend:** Supabase (Auth, Postgres, Storage, Realtime) + Supabase Edge Functions (Stripe)
- **Hosting:** Vercel (frontend), Supabase (database)

## Getting started

```bash
npm install
npm run dev
```

The app runs at `http://localhost:5173`.

### Environment variables

Create a `.env` in the project root. None of these are secrets beyond the Supabase
anon key (which is safe to ship to the client); never commit real values.

| Variable                  | Purpose                                          |
| ------------------------- | ------------------------------------------------ |
| `VITE_SUPABASE_URL`       | Supabase project URL                             |
| `VITE_SUPABASE_ANON_KEY`  | Supabase anonymous (public) key                  |
| `VITE_STRIPE_PRICE_ID`    | Stripe price ID for the premium plan (Sprint 7)  |

## Scripts

| Command           | Description                          |
| ----------------- | ------------------------------------ |
| `npm run dev`     | Start the Vite dev server            |
| `npm run build`   | Type-check (`tsc -b`) and build      |
| `npm run preview` | Preview the production build locally |
| `npm run lint`    | Run ESLint                           |

## Database

Schema lives in `supabase/migrations/` as numbered SQL files. Migrations are applied
to the live project via the Supabase ↔ GitHub integration, which re-runs the entire
chain on every push to `main` — so **every migration must be idempotent**
(`drop policy if exists` before `create policy`, `if [not] exists`, `create or replace`,
`drop trigger if exists`). Row Level Security is enabled on all tables; never disable it.

## Project structure

```
src/
  components/   UI, layout, and feature components (cars, news, ui, layout)
  context/      React context providers (AuthContext)
  data/         Static datasets (cars, news, mods, reliability)
  hooks/        Data hooks (useAuth, useGarage, useMeets, useForums, …)
  lib/          Supabase client, Stripe, upload, utils
  pages/        Route-level pages
  types/        Shared TypeScript types
  utils/        Helpers (newsFetcher, …)
supabase/
  migrations/   Idempotent SQL migrations (001 → 011)
  functions/    Edge Functions (Stripe checkout, portal, webhook)
```

## Deployment

The frontend deploys to Vercel from `main`. `vercel.json` defines the SPA rewrite
(all routes fall through to `index.html`) and security headers including a strict CSP.
Database changes deploy through the Supabase GitHub integration as described above.
