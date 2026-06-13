# Clyve AI

> Financial research intelligence, structured. No noise. No advice. Just data.

---

## Why Clyve Exists

Traditional financial research is broken for independent investors and serious retail traders. Getting a complete picture of a company — financials, recent news, analyst sentiment, risk factors — requires juggling Bloomberg (if you can afford $24k/year), multiple browser tabs, and hours of manual aggregation.

Clyve solves one problem: **time to insight**.

You type a company name or ticker. Clyve pulls verified public data, structures it, and returns a clean research brief in seconds — not hours. No predictions. No buy/sell signals. No financial advice. Just organized, sourced intelligence so you can make your own call faster.

---

## What Clyve Is Not

- Not a signal tool
- Not a trading bot
- Not financial advice of any kind
- Not a Bloomberg competitor (yet)

Clyve is an **information structuring layer** — like having a research analyst who reads everything and hands you the brief. What you do with it is entirely your decision.

---

## Target Market

**Primary — Serious Retail Investors (Global, English-first)**
Independent investors who do their own due diligence. They already know how to read a balance sheet. They just hate spending 3 hours gathering the data before they can start reading it.

**Secondary — Independent Analysts & Finance Students**
People building their own investment thesis who need fast, structured data without institutional-grade subscriptions.

**Not targeting:**
- Institutional funds (they have Bloomberg)
- Day traders looking for signals (wrong product)
- Crypto-only traders (V2 consideration)

---

## Positioning

| | Clyve AI | Bloomberg Terminal | ChatGPT / Perplexity |
|---|---|---|---|
| Price | $19/mo | ~$2,000/mo | Free / $20 |
| AI-native conversational UI | ✅ | ❌ | ✅ |
| Structured financial output | ✅ | ✅ | ❌ |
| PDF export | ✅ | ✅ | ❌ |
| Research history | ✅ | ✅ | Limited |
| Verified data sources | ✅ | ✅ | ❌ |
| Accessible to retail | ✅ | ❌ | ✅ |

---

## Core Features

- **Conversational research interface** — ask about any public company in natural language
- **Structured output** — Executive summary, financials, news, risk factors, analyst consensus
- **Research history** — every analysis saved, searchable, organized in sidebar
- **PDF export** — download any analysis as a clean, shareable report
- **News aggregation** — verified headlines with sentiment signal (positive / negative / neutral)
- **Strict disclaimer system** — every output includes a non-removable research disclaimer

---

## Data Sources

| Data Type | Source | Notes |
|---|---|---|
| Financial data (revenue, EPS, P/E, market cap, etc.) | [Financial Modeling Prep](https://financialmodelingprep.com) | Public company filings |
| News & headlines | [NewsAPI](https://newsapi.org) | Aggregated from verified publishers |
| Company profiles | Financial Modeling Prep | Sector, description, exchange |
| Analyst consensus | Financial Modeling Prep | Public analyst ratings |
| SEC filings (risk factors) | Financial Modeling Prep / SEC EDGAR | Public regulatory filings |
| Sentiment analysis | Python ML microservice (internal) | Built on top of news data |

**All data is publicly available.** Clyve does not use proprietary data feeds, insider information, or any non-public sources.

---

## Tech Stack

### Frontend & Full-Stack Framework
| Tool | Role |
|---|---|
| [Next.js 15](https://nextjs.org) (App Router) | Full-stack framework |
| [React 19](https://react.dev) | UI layer |
| [TypeScript](https://www.typescriptlang.org) | Type safety |
| [Tailwind CSS v3](https://tailwindcss.com) | Styling |
| [Framer Motion](https://www.framer.com/motion) | Animations |
| [Geist](https://vercel.com/font) | Typography |
| [Radix UI](https://www.radix-ui.com) | Accessible UI primitives |
| [Lucide React](https://lucide.dev) | Icons |

### AI & Streaming
| Tool | Role |
|---|---|
| [Vercel AI SDK](https://sdk.vercel.ai) | Streaming responses in Next.js |
| [Anthropic Claude API](https://anthropic.com) | LLM backbone for structuring output |

### Auth & Database
| Tool | Role |
|---|---|
| [Better Auth](https://better-auth.com) | Authentication |
| [Drizzle ORM](https://orm.drizzle.team) | Type-safe database queries |
| [PostgreSQL](https://www.postgresql.org) via [Supabase](https://supabase.com) | Primary database |

### Payments
| Tool | Role |
|---|---|
| [Midtrans](https://midtrans.com) | Local payment gateway (Indonesia) - QRIS, VA, E-Wallet |
| [Paddle](https://paddle.com) | Global Merchant of Record - International subscription billing & tax compliance (Alternative to Stripe)
[Lemon Squeezy](https://www.lemonsqueezy.com) | Global Merchant of Record - Modern subscription billing & global tax compliance (Alternative to Stripe/Paddle) |
| [Stripe](https://stripe.com) | Global subscription billing (Requires international entity) |

### PDF Export
| Tool | Role |
|---|---|
| [@react-pdf/renderer](https://react-pdf.org) | PDF generation from React components |

### ML / Data Service (Python)
| Tool | Role |
|---|---|
| [FastAPI](https://fastapi.tiangolo.com) | Python microservice framework |
| [Pydantic v2](https://docs.pydantic.dev) | Data validation |
| [NewsAPI](https://newsapi.org) | News aggregation |
| Sentiment analysis library (TBD) | Headline sentiment scoring |

### Infrastructure
| Tool | Role |
|---|---|
| [Vercel](https://vercel.com) | Frontend + Next.js deployment |
| [Vercel Analytics](https://vercel.com/analytics) | Usage analytics |
| Python service | Deployed separately (Railway / Render) |

---

## Project Structure

```
clyve/
│
├── app/                          # Next.js App Router
│   ├── (marketing)/              # Public pages — no auth required
│   │   ├── page.tsx              # Landing page
│   │   ├── pricing/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   │
│   ├── (auth)/                   # Auth pages
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   │
│   ├── (app)/                    # Main product — protected routes
│   │   ├── layout.tsx            # Auth guard + app shell
│   │   ├── dashboard/
│   │   │   └── page.tsx          # Main research interface
│   │   ├── analyze/
│   │   │   └── [id]/
│   │   │       └── page.tsx      # Individual analysis view
│   │   └── history/
│   │       └── page.tsx          # Research history
│   │
│   ├── (admin)/                  # Admin panel — role-protected
│   │   ├── layout.tsx            # Admin role guard
│   │   ├── users/
│   │   │   └── page.tsx
│   │   └── revenue/
│   │       └── page.tsx
│   │
│   └── api/                      # API Route Handlers
│       ├── auth/
│       │   └── [...all]/
│       │       └── route.ts      # Better Auth handler
│       ├── analyze/
│       │   └── route.ts          # Core analysis pipeline
│       ├── export/
│       │   └── route.ts          # PDF generation
│       ├── history/
│       │   └── route.ts          # CRUD analysis history
│       └── webhooks/
│           └── stripe/
│               └── route.ts      # Stripe webhook handler
│
├── components/
│   ├── ui/                       # Base UI components (Radix-based)
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── dialog.tsx
│   │   └── ...
│   ├── app/                      # Product-specific components
│   │   ├── chat-interface.tsx    # Main conversational UI
│   │   ├── history-sidebar.tsx   # Left sidebar with past analyses
│   │   ├── analysis-output.tsx   # Structured analysis display
│   │   ├── pdf-template.tsx      # PDF export template
│   │   └── disclaimer.tsx        # Non-removable disclaimer block
│   └── marketing/                # Landing page components
│       ├── hero.tsx
│       ├── pricing.tsx
│       └── ...
│
├── lib/
│   ├── auth.ts                   # Better Auth config
│   ├── db/
│   │   ├── index.ts              # Drizzle DB connection
│   │   └── schema.ts             # Database schema
│   ├── stripe.ts                 # Stripe client config
│   ├── fmp.ts                    # Financial Modeling Prep API wrapper
│   ├── news.ts                   # NewsAPI wrapper
│   ├── prompt.ts                 # LLM prompt builder
│   └── quota.ts                  # Usage quota enforcement logic
│
├── hooks/
│   ├── use-analysis.ts           # Analysis state management
│   └── use-quota.ts              # Client-side quota awareness
│
├── types/
│   ├── analysis.ts               # Analysis output types
│   ├── financial.ts              # FMP response types
│   └── news.ts                   # NewsAPI response types
│
├── python-service/               # Separate ML microservice
│   ├── main.py                   # FastAPI app entry
│   ├── routers/
│   │   └── news.py               # News + sentiment endpoints
│   ├── services/
│   │   ├── news_fetcher.py       # NewsAPI integration
│   │   └── sentiment.py          # Sentiment analysis logic
│   ├── models/
│   │   └── schemas.py            # Pydantic models
│   ├── requirements.txt
│   └── README.md
│
├── drizzle/                      # DB migrations (auto-generated)
│
├── public/                       # Static assets
│
├── .env.local                    # Local environment variables (never commit)
├── .env.example                  # Environment variable template
├── drizzle.config.ts
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Database Schema

```
users                 # Managed by Better Auth
sessions              # Managed by Better Auth
subscriptions         # Stripe subscription state
usage_tracking        # Lifetime query counter (free tier enforcement)
analyses              # Research history per user
```

---

## Environment Variables

```bash
# App
NEXT_PUBLIC_APP_URL=

# Auth — Better Auth
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=

# Database
DATABASE_URL=

# AI
ANTHROPIC_API_KEY=

# Financial Data
FMP_API_KEY=                    # financialmodelingprep.com

# News
NEWS_API_KEY=                   # newsapi.org

# Billing
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Python ML Service
PYTHON_SERVICE_URL=             # internal service URL
```

---

## Pricing

| Tier | Queries | Price | Notes |
|---|---|---|---|
| Free | 3 lifetime | $0 | No credit card required |
| Pro | Unlimited | $19/month | PDF export + full history |
| Pro Annual | Unlimited | $149/year | ~$12.4/month |

> For full unit economics, infrastructure cost model, and scaling
> projections, see [PRICING.md](./PRICING.md).

---

## Legal & Compliance

Every analysis output includes a non-removable disclaimer:

> *This report is generated from publicly available data for research and informational purposes only. It does not constitute financial advice, investment advice, or a recommendation to buy or sell any security. Always consult a qualified financial advisor before making investment decisions. Clyve AI is not a licensed financial advisor.*

Clyve AI:
- Does not provide price predictions or forecasts
- Does not recommend specific investment actions
- Does not use non-public or insider information
- Sources only publicly available regulatory filings, news, and market data

---

## Roadmap

**V1 — Core Research Assistant**
- [ ] Conversational research interface (stocks, US market)
- [ ] Structured analysis output (financials + news + summary)
- [ ] Research history + PDF export
- [ ] Freemium + Pro subscription via Paddle
- [ ] Python ML service (news sentiment)

**V2 — Depth & Expansion**
- [ ] SEC filing deep-dive (10-K, 10-Q parsing)
- [ ] Competitor comparison (side-by-side analysis)
- [ ] Watchlist & alerts
- [ ] International markets (LSE, SGX, IDX)

**V3 — Intelligence Layer**
- [ ] Custom scoring models
- [ ] Portfolio-level research view
- [ ] API access for power users

---

## Development

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local

# Push database schema
pnpm db:push

# Run development server
pnpm dev

# Python ML service (separate terminal)
cd python-service
pip install -r requirements.txt
uvicorn main:app --reload --port 8001
```

---

## Contributing

Clyve is currently in early-stage development. If you're interested in contributing or joining the team, reach out via [LinkedIn](https://linkedin.com/company/clyveai).