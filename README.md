# PulseOps

**SaaS revenue metrics with an AI analyst — a lightweight alternative to ChartMogul for indie founders.**

Point your billing webhooks at PulseOps and it turns a raw stream of signups, payments and churn into live MRR, ARR, churn and conversion — plus a one-click AI analyst that reads the numbers and tells you what's moving and what to do next. In realtime.

> **Live demo:** https://pulse-ops-ai-five.vercel.app/
> **Demo login:** `demo@pulseops.app` · `Passkey123!` (or sign in with Google / passkey)
>
> The demo runs on a **sample workspace with generated data** so you can explore without connecting a real Stripe account.

---

## The problem

A solo founder or a small SaaS team (1–5 people) on Stripe has revenue coming in — but no clear read on it. Stripe's own dashboard shows transactions, not **MRR, churn or conversion**, and it never tells you *what to do*. The dedicated tools that do — ChartMogul, Baremetrics, ProfitWell — start at $100–500/mo, which is hard to justify pre–Series A. So founders end up back in spreadsheets, guessing whether growth is real and whether churn is creeping.

## The product

PulseOps ingests billing events (Stripe-style webhooks) through a simple API and derives the metrics that matter, in realtime:

- **Live metrics** — MRR, ARR, active users, churn and conversion, computed from the event stream (not stored and drifting — *derived*, so they're always consistent and auditable).
- **Realtime event feed** — new events appear the moment they land, over Supabase Realtime.
- **AI analyst** — the differentiator. ChartMogul shows you charts; PulseOps also **explains them**. One click produces a headline, highlights, anomalies and concrete next steps, grounded in your live numbers.
- **Analytics** — MRR-over-time, signups per day, and event-mix breakdowns.
- **Passwordless auth** — passkeys (Face ID / Touch ID / Windows Hello), Google OAuth and hCaptcha, all via Supabase.

### About the demo

The public demo uses a **sample workspace** — click *Load sample data* to generate ~60 days of realistic history, or *Simulate live events* to watch the realtime feed update. In production, the same pipeline (`POST /api/events/ingest`) accepts real billing webhooks.

## My role

Solo — **product, design and full-stack engineering**. I scoped the product, designed the brand and UI, modelled the data, built the ingestion pipeline, the analytics engine, the AI layer and the auth, and shipped it to production on Vercel.

## Key technical decisions

Each choice was deliberate — the reasoning matters more than the stack itself:

- **Event-sourced metrics.** Events are the source of truth; metrics are *derived* by a pure function, never stored. This keeps numbers self-consistent and auditable, and makes the whole domain trivial to test.
- **Drizzle over TypeORM.** Started on TypeORM, hit friction unfit for serverless (decorators, `reflect-metadata`, dynamic-`require` driver issues, a separate migration CLI). Swapped to Drizzle while the DB was still empty — lighter runtime, SQL-first migrations, no decorators.
- **Supabase for auth + realtime + Postgres.** One managed source of truth for sessions (passkeys, OAuth, captcha) and live subscriptions — no second auth library, no websocket server to run.
- **Groq for the AI layer.** OpenAI-compatible, generous free tier, ~2s inference. A strict JSON contract (schema in the prompt + `response_format: json_object` + defensive parsing + zod validation) keeps model output safe without paid structured-outputs.
- **Feature-Sliced Design.** A strict, dependency-directed layering that keeps the codebase scalable and the pure domain isolated from framework glue.
- **Serverless-aware DB pooling.** Capped `pg` pool per lambda so the Supabase pooler isn't exhausted under fan-out.

## Architecture

```
src/
├─ app/        Next.js App Router (routing, layouts, route handlers)
├─ views/      Composed page bodies (FSD "pages" layer)
├─ widgets/    Self-contained UI blocks (sidebar, topbar, charts, event feed)
├─ features/   User-facing capabilities (ai-analyst, auth, realtime)
├─ entities/   Business domains (event, metric, user) + pure domain logic
└─ shared/     Framework-agnostic primitives (ui, lib, api clients, config)
```

The **domain layer is pure and framework-free** — analytics, time-series, the event generator, and formatters take plain data and return plain data. That's what makes it fast to test and reason about.

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

## Testing

The pure domain layer is covered to **100%** (statements / branches / functions / lines) with **Vitest**. Framework glue (Server Components, route handlers, Supabase, Drizzle) is intentionally excluded — testing it would mostly test mocks, not logic.

```bash
npm run test           # watch mode
npm run test:run       # single run
npm run test:coverage  # with coverage report
```

Covered: `computeAnalytics`, `computeDailySeries` / `computeEventTypeCounts`, the event generator, currency/percent/relative-time formatters, and the AI response schema + JSON extraction.

## Getting started

### Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com) project (free tier)
- A [Groq API key](https://console.groq.com/keys) (free, optional — the app runs without AI)

### Setup

```bash
npm install
cp .env.example .env.local     # then fill in the values (see below)
npm run db:generate
npm run db:migrate
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), sign up, then click **Load sample data** to populate the workspace.

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

_A self-initiated product MVP. Data in the live demo is synthetic; not affiliated with Stripe, ChartMogul or any named company._
