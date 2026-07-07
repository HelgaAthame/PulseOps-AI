# PulseOps

**A simulated SaaS analytics dashboard** — business events (sign-ups, payments, churn) flow into live metrics (MRR / ARR / churn / conversion), a realtime event feed, and an AI analyst that explains what's happening in plain English.

Built as a portfolio-grade project: it's meant to look and behave like a real SaaS product, not a toy. Dark mode, custom brand styling, passwordless auth, and a fully typed, layered codebase.

> **Live demo:** _add your Vercel URL after deploying_
> **Demo login:** `demo@pulseops.app` (passkey / password)

---

## Features

- **Live metrics** — MRR, ARR, active users, churn and conversion, derived from a raw event stream by a pure analytics engine.
- **Realtime event feed** — new events stream in over Supabase Realtime, no refresh.
- **AI Analyst** — a one-click "Explain what's happening" read-out (headline, highlights, anomalies, recommendations), grounded in your live numbers. Runs on a **free** LLM tier (Groq).
- **Analytics page** — MRR-over-time, sign-ups per day, and event-mix charts (Recharts).
- **Event explorer** — searchable, server-paginated stream with a page-size selector and jump-to-page input.
- **Passwordless auth** — Passkeys (Face ID / Touch ID / Windows Hello), Google OAuth, and hCaptcha, all via Supabase Auth.
- **Polished UX** — light/dark themes, loading skeletons, error boundaries, a custom 404, and empty states throughout.
- **Seed & simulate** — generate ~60 days of realistic history or simulate live activity on demand.

## Tech stack

| Area | Choice |
|------|--------|
| Framework | **Next.js 16** (App Router, Turbopack), **React 19** |
| Language | **TypeScript** (strict) |
| Styling | **Tailwind CSS v4**, shadcn/ui components on **@base-ui/react** |
| Charts | **Recharts** |
| Database | **Postgres** via **Supabase**, **Drizzle ORM** |
| Auth | **Supabase Auth** — passkeys, Google OAuth, hCaptcha |
| Realtime | **Supabase Realtime** |
| Validation | **zod** |
| AI | **Groq** (OpenAI-compatible, free tier) |
| Testing | **Vitest** (+ v8 coverage) |
| Architecture | **Feature-Sliced Design** |

## Architecture

The codebase follows **Feature-Sliced Design** — a strict, dependency-directed layering:

```
src/
├─ app/        Next.js App Router (routing, layouts, route handlers)
├─ views/      Composed page bodies (FSD "pages" layer)
├─ widgets/    Self-contained UI blocks (sidebar, topbar, charts, event feed)
├─ features/   User-facing capabilities (ai-analyst, auth, realtime)
├─ entities/   Business domains (event, metric, user) + pure domain logic
└─ shared/     Framework-agnostic primitives (ui, lib, api clients, config)
```

The **domain layer is pure and framework-free** — analytics, time-series, the event generator, and formatters take plain data and return plain data. That's what makes it fast to test and reason about (see [Testing](#testing)).

## AI Analyst

The `/ai` page builds a compact snapshot of your metrics and sends it to an LLM with a strict JSON contract (schema in the prompt + `response_format: json_object` + defensive parsing + zod validation on the way back). The provider is **Groq** — free, no credit card, ~30 requests/min. Models rotate (`llama-3.3-70b-versatile` → `llama-3.1-8b-instant`) with a per-attempt timeout, and rate limits surface as a friendly message rather than a crash. Without a key, the route returns a clear 503 and the rest of the app works normally.

## Getting started

### Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com) project (free tier)
- A [Groq API key](https://console.groq.com/keys) (free, optional — the app runs without AI)

### Setup

```bash
# 1. Install
npm install

# 2. Configure environment
cp .env.example .env.local
# then fill in the values (see below)

# 3. Apply the database schema
npm run db:generate
npm run db:migrate

# 4. Run
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sign up, then click **Seed demo data** to populate history.

### Environment variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase publishable/anon key |
| `SUPABASE_SECRET_KEY` | ✅ | Supabase secret key (server-only) |
| `DATABASE_URL` | ✅ | Postgres connection string |
| `NEXT_PUBLIC_SITE_URL` | ✅ | Base URL for OAuth/passkey redirects |
| `NEXT_PUBLIC_HCAPTCHA_SITE_KEY` | — | hCaptcha site key (auth works without it) |
| `GROQ_API_KEY` | — | Enables the AI Analyst |
| `GROQ_MODEL` | — | Override the default model |

## Testing

The pure domain layer is covered to **100%** (statements / branches / functions / lines) with **Vitest**. Framework glue (Server Components, route handlers, Supabase, Drizzle) is intentionally excluded — testing it would mostly test mocks, not logic.

```bash
npm run test           # watch mode
npm run test:run       # single run
npm run test:coverage  # with coverage report
```

Covered: `computeAnalytics`, `computeDailySeries` / `computeEventTypeCounts`, the event generator, currency/percent/relative-time formatters, and the AI response schema + JSON extraction.

## Scripts

| Script | What it does |
|--------|--------------|
| `npm run dev` | Start the dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Lint with ESLint |
| `npm run test` / `test:run` / `test:coverage` | Vitest |
| `npm run db:generate` / `db:migrate` | Drizzle schema & migrations |

---

_Educational project. Not affiliated with any real company; all data is synthetic._
