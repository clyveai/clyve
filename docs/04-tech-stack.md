# Tech Stack

## Frontend & Full-Stack Framework

| Tool | Role | Link |
|---|---|---|
| [Next.js 15](https://nextjs.org) (App Router) | Full-stack framework — handles routing, SSR, API routes | [Docs](https://nextjs.org/docs) |
| [React 19](https://react.dev) | UI layer | [Docs](https://react.dev/learn) |
| [TypeScript](https://www.typescriptlang.org) | Type safety across the entire codebase | [Docs](https://www.typescriptlang.org/docs) |
| [Tailwind CSS v3](https://tailwindcss.com) | Utility-first styling | [Docs](https://v3.tailwindcss.com/docs) |
| [Framer Motion](https://www.framer.com/motion) | Animations and transitions | [Docs](https://www.framer.com/motion) |
| [Geist](https://vercel.com/font) | Typography (Vercel's typeface — matches the design language) | [Docs](https://vercel.com/font) |
| [Radix UI](https://www.radix-ui.com) | Accessible, unstyled UI primitives | [Docs](https://www.radix-ui.com/primitives/docs/overview/introduction) |
| [Lucide React](https://lucide.dev) | Icon library | [Docs](https://lucide.dev/guide) |

---

## AI & Streaming

| Tool | Role | Link |
|---|---|---|
| [Vercel AI SDK](https://sdk.vercel.ai) | Streaming LLM responses in Next.js Route Handlers | [Docs](https://sdk.vercel.ai/docs) |
| [Anthropic Claude API](https://www.anthropic.com) | Primary LLM — structures raw financial + news data into research output | [Docs](https://docs.anthropic.com) |

**Model in use:** `claude-sonnet-4-6` (balance of quality and cost for structured output)

> Multi-LLM abstraction layer (Gemini Flash, GPT-4o Mini as fallbacks) is planned via Vercel AI SDK's provider switching. Deferred to post-V1. See [ADR-004](./06-decisions.md#adr-004).

---

## Auth & Database

| Tool | Role | Link |
|---|---|---|
| [Better Auth](https://better-auth.com) | Authentication — sessions, OAuth, email/password | [Docs](https://www.better-auth.com/docs/introduction) |
| [Drizzle ORM](https://orm.drizzle.team) | Type-safe database queries and schema management | [Docs](https://orm.drizzle.team/docs/overview) |
| [PostgreSQL](https://www.postgresql.org) via [Supabase](https://supabase.com) | Primary database — free tier covers V1 | [Supabase Docs](https://supabase.com/docs) |

---

## Payments

| Tool | Role | Link |
|---|---|---|
| [Lemon Squeezy](https://www.lemonsqueezy.com) | **Active — V1 payment infrastructure.** Merchant of Record, handles global tax compliance, no monthly fees, no buyer login required, automatic email delivery | [Docs](https://docs.lemonsqueezy.com) |
| [Midtrans](https://midtrans.com) | **V2 consideration.** Local Indonesian payment gateway — QRIS, VA, e-wallet. Required if targeting IDR-paying local users at scale | [Docs](https://docs.midtrans.com) |

> Stripe and Paddle are not in scope. See [ADR-005](./06-decisions.md#adr-005) for full payment gateway decision rationale.

---

## PDF Export

| Tool | Role | Link |
|---|---|---|
| [@react-pdf/renderer](https://react-pdf.org) | PDF generation from React components — Pro tier feature | [Docs](https://react-pdf.org/components) |

---

## Infrastructure

| Tool | Role | Link |
|---|---|---|
| [Vercel](https://vercel.com) | Deployment — Next.js hosting, edge functions, CI/CD from GitHub | [Docs](https://vercel.com/docs) |
| [Vercel Analytics](https://vercel.com/analytics) | Usage analytics — pageviews, performance | [Docs](https://vercel.com/docs/analytics) |
| [Supabase](https://supabase.com) | Managed PostgreSQL + Supabase dashboard for admin/ops in V1 | [Docs](https://supabase.com/docs) |

---

## External Data APIs

| Tool | Role | Link |
|---|---|---|
| [Financial Modeling Prep](https://financialmodelingprep.com) | Financial data — revenue, EPS, P/E, market cap, analyst consensus, SEC filings, company profiles | [Docs](https://site.financialmodelingprep.com/developer/docs) |
| [NewsAPI](https://newsapi.org) | News aggregation from verified publishers | [Docs](https://newsapi.org/docs) |
| [SEC EDGAR](https://www.sec.gov/cgi-bin/browse-edgar) | Primary source for regulatory filings — accessed via FMP in V1, direct in V2 | [EDGAR Full-Text Search](https://efts.sec.gov/LATEST/search-index?q=%22full-text+search%22) |

---

## V2 / Deferred

| Tool | Role | Decision |
|---|---|---|
| [FastAPI](https://fastapi.tiangolo.com) | Python microservice framework for heavier ML workloads | Deferred — see [ADR-003](./06-decisions.md#adr-003) |
| [Pydantic v2](https://docs.pydantic.dev) | Data validation in Python service | Deferred with FastAPI |
| [Railway](https://railway.app) / [Render](https://render.com) | Python service hosting | Deferred with FastAPI |
| [Polygon.io](https://polygon.io) | Higher-quality market data, real-time quotes | Upgrade path from FMP post-V1 |