# Tech Stack

## Frontend & Full-Stack Framework

| Tool | Role |
|---|---|
| [Next.js 16](https://nextjs.org) (App Router, Turbo) | Full-stack framework |
| [React 19](https://react.dev) | UI layer |
| [TypeScript](https://www.typescriptlang.org) | Type safety |
| [Tailwind CSS](https://tailwindcss.com) (cva, tailwind-merge, tailwindcss-animate) | Styling |
| [Framer Motion](https://www.framer.com/motion) | Animations |
| [Geist](https://vercel.com/font) | Typography |
| [Radix UI](https://www.radix-ui.com) | Accessible primitives |
| [Tabler Icons](https://tabler.io/icons) + [Lucide React](https://lucide.dev) | Icon libraries |
| [Three.js](https://threejs.org) / [@paper-design/shaders](https://paper.design) | Landing page visual accents |
| [SWR](https://swr.vercel.app) | Client-side data fetching/caching |

**Design system:** background `#000000`, accent `#FE4E00`, surface `#111111`/`#101010`, text `#FFFFFF`, muted `#a1a1aa` — styled after Resend/TradingView aesthetic. Dark monochrome dashboard, not the light-mode generic look of MyThesis.ai.

---

## AI & Streaming

| Tool | Role |
|---|---|
| [Vercel AI SDK](https://sdk.vercel.ai) | Streaming responses |
| [Anthropic Claude API](https://www.anthropic.com) | Thesis-vs-evidence synthesis, curated history narrative generation |

**Model in use:** `claude-sonnet-4-6`

> **Revision from V0 plan:** Multi-LLM abstraction (Gemini Flash for fast/cheap drift classification, Claude for narrative synthesis) is reconsidered as **earlier-priority than originally planned**, not deferred to V2 — analysis speed is an explicit V1 differentiator against MyThesis.ai's slow, email-notified completion flow. Single-LLM-only (ADR-004) should be revisited if Claude-only latency can't beat MyThesis's turnaround time.

---

## Auth & Database

| Tool | Role |
|---|---|
| [Better Auth](https://better-auth.com) | Authentication |
| [Drizzle ORM](https://orm.drizzle.team) + postgres | Type-safe queries, schema |
| [PostgreSQL](https://www.postgresql.org) via [Supabase](https://supabase.com) | Primary database |

---

## Payments

| Tool | Role |
|---|---|
| [Polar.sh](https://polar.sh) | Active — V1 payment infra, Merchant of Record (global) |
| [Midtrans](https://midtrans.com) | V2 consideration — local Indonesian payment |

---

## PDF Export

| Tool | Role |
|---|---|
| [@react-pdf/renderer](https://react-pdf.org) | Export thesis document as PDF — Pro tier feature |

---

## Infrastructure

| Tool | Role |
|---|---|
| [Vercel](https://vercel.com) | Deployment, edge functions, CI/CD |
| [Vercel Analytics](https://vercel.com/analytics) | Usage analytics |
| [Supabase](https://supabase.com) | Managed Postgres + dashboard for ops |

---

## External Data APIs (unchanged — all retained)

| Tool | Role |
|---|---|
| [Financial Modeling Prep](https://financialmodelingprep.com) | Financial data, company profiles, analyst consensus, SEC filings access |
| [GNews API](https://gnews.io) | News aggregation — see [07-pricing.md](./07-pricing.md), NOT NewsAPI Developer plan |
| [SEC EDGAR](https://www.sec.gov/cgi-bin/browse-edgar) | Primary regulatory filing source — via FMP in V1, direct in V2 |

---

## Tooling

| Tool | Role |
|---|---|
| husky + lint-staged | Pre-commit hooks |

---

## V2 / Deferred

| Tool | Role | Decision |
|---|---|---|
| [FastAPI](https://fastapi.tiangolo.com) | Heavier ML workloads | Deferred — ADR-003 |
| [Pydantic v2](https://docs.pydantic.dev) | Validation in Python service | Deferred with FastAPI |
| [Railway](https://railway.app)/[Render](https://render.com) | Python hosting | Deferred with FastAPI |
| [Polygon.io](https://polygon.io) | Real-time data upgrade | Upgrade path from FMP |
| Broker connect (Plaid or similar) | Auto-sync holdings | V2 — build functional, unlike MyThesis's non-working version |