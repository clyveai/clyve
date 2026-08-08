# Development

## Prerequisites

- Node.js 20+
- pnpm (`npm install -g pnpm`)
- A Supabase project (free tier)
- API keys — see environment variables below

---

## Local Setup

```bash
# 1. Clone and install
git clone https://github.com/clyveai/clyve.git
cd clyve
pnpm install

# 2. Configure environment
cp .env.example .env.local
# Fill in all required variables (see below)

# 3. Push database schema
pnpm db:push

# 4. Run dev server
pnpm dev
```

App runs at `http://localhost:3000`

---

## Available Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start Next.js development server |
| `pnpm build` | Production build |
| `pnpm start` | Start production server locally |
| `pnpm lint` | Run ESLint |
| `pnpm db:push` | Push Drizzle schema to database (no migration file) |
| `pnpm db:generate` | Generate Drizzle migration files |
| `pnpm db:migrate` | Run pending migrations |
| `pnpm db:studio` | Open Drizzle Studio (local DB GUI) |

---

## Environment Variables

```bash
# ─────────────────────────────────────────
# App
# ─────────────────────────────────────────
NEXT_PUBLIC_APP_URL=http://localhost:3000

# ─────────────────────────────────────────
# Auth — Better Auth
# https://www.better-auth.com/docs/installation
# ─────────────────────────────────────────
BETTER_AUTH_SECRET=                  # generate: openssl rand -hex 32
BETTER_AUTH_URL=http://localhost:3000

# ─────────────────────────────────────────
# Database — Supabase PostgreSQL
# https://supabase.com/docs/guides/database/connecting-to-postgres
# ─────────────────────────────────────────
DATABASE_URL=                        # postgres://... (Transaction pooler URL from Supabase)

# ─────────────────────────────────────────
# AI — Anthropic
# https://console.anthropic.com/
# ─────────────────────────────────────────
ANTHROPIC_API_KEY=                   # sk-ant-...
                                     # ⚠️ Set a hard spend cap in Anthropic console before launch

# ─────────────────────────────────────────
# Financial Data — Financial Modeling Prep
# https://site.financialmodelingprep.com/developer/docs
# ─────────────────────────────────────────
FMP_API_KEY=                         # financialmodelingprep.com → API Keys

# ─────────────────────────────────────────
# News — NewsAPI
# https://newsapi.org/register
# ─────────────────────────────────────────
NEWS_API_KEY=                        # newsapi.org → Account → API Key

# ─────────────────────────────────────────
# Billing — Lemon Squeezy
# https://docs.lemonsqueezy.com/api
# ─────────────────────────────────────────
LEMONSQUEEZY_API_KEY=                # app.lemonsqueezy.com → Settings → API
LEMONSQUEEZY_WEBHOOK_SECRET=         # app.lemonsqueezy.com → Settings → Webhooks
NEXT_PUBLIC_LEMONSQUEEZY_STORE_ID=   # your store ID
```

---

## Database Management

Clyve uses [Drizzle ORM](https://orm.drizzle.team) with [Drizzle Kit](https://orm.drizzle.team/kit-docs/overview) for schema management.

- Schema is defined in `lib/db/schema.ts`
- For local development, `pnpm db:push` applies schema changes directly without generating migration files (faster iteration)
- For production, use `pnpm db:generate` + `pnpm db:migrate` to maintain a migration history

---

## Deployment

Clyve deploys to [Vercel](https://vercel.com) via GitHub integration.

```
Push to main → Vercel CI/CD → Production deploy
Push to feature/* → Vercel preview deployment (unique URL)
```

**Required Vercel environment variables:** Mirror all variables from `.env.local` into Vercel project settings → Environment Variables.

**Supabase connection note:** Use the **Transaction Pooler** connection string (port 6543) for `DATABASE_URL` on Vercel — not the direct connection — to avoid connection exhaustion on serverless.

---

## No Python Service in V1

The Python FastAPI microservice listed in older docs has been **deferred to V2**. Sentiment analysis in V1 is handled inline by the Claude API call. See [ADR-003](./06-decisions.md#adr-003).
