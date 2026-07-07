# Architecture

## Overview

Clyve V1 is a monolithic full-stack SaaS built with Next.js App Router.

The primary goal is:

* Ship fast
* Stay maintainable as a solo founder
* Keep architecture understandable for AI agents
* Avoid premature microservices
* Scale without major rewrites

V1 intentionally uses:

* One repository
* One application
* One database
* One deployment

There are no separate backend services, workers, queues, or microservices in V1.

---

# Architecture Principles

## 1. Domain-Driven Structure

Business logic is organized by domain.

Examples:

* Research
* Company
* Filing
* News
* Billing

Each domain owns its own:

* Components
* Types
* Services
* Validation
* Hooks

This prevents giant global folders.

---

## 2. Thin Routing Layer

The `app/` directory handles:

* Routes
* Pages
* Layouts
* API endpoints

It should never contain:

* Database queries
* AI orchestration
* External API integrations
* Core business logic

---

## 3. Business Logic Lives in features

All product logic belongs inside:

```text
src/features/
```

features are the heart of the application.

---

## 4. Shared Code Must Be Truly Shared

Reusable UI and utilities belong in:

```text
src/shared/
```

If a component is only used by one feature, it belongs inside that module.

---

## 5. Infrastructure Is Separate

Infrastructure concerns belong in:

```text
src/lib/
```

Examples:

* Logging
* Environment validation
* Analytics
* Rate limiting
* Cache abstraction

---

## 6. Database Access Is Centralized

All database access belongs in:

```text
src/database/
```

No direct database queries should be scattered across features.

---

# High-Level System Architecture

```text
┌──────────────────────────────────────────┐
│                 Browser                  │
└────────────────────┬─────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────┐
│            Next.js App Router            │
│      Pages • Layouts • API Routes        │
└────────────────────┬─────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────┐
│                 features                  │
│                                          │
│ Auth                                    │
│ Research                                │
│ Company                                 │
│ Filing                                  │
│ News                                    │
│ Billing                                 │
│ Dashboard                               │
└────────────────────┬─────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────┐
│              Infrastructure              │
│                                          │
│ Logger                                  │
│ Cache                                   │
│ Analytics                               │
│ Rate Limiting                           │
│ Environment Validation                  │
└────────────────────┬─────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────┐
│                Database                  │
│         PostgreSQL (Supabase)            │
└──────────────────────────────────────────┘
```

---

# Repository Structure

```text
clyve/

docs/
drizzle/
public/

src/

├── app/
├── features/
├── shared/
├── database/
├── lib/
├── jobs/
├── cache/
├── styles/
├── middleware.ts
└── instrumentation.ts

.env.example
.env.local

package.json
tsconfig.json
next.config.ts
drizzle.config.ts
```

---

# Source Structure

```text
src/

├── app/
├── features/
├── shared/
├── database/
├── lib/
├── jobs/
├── cache/
├── styles/
├── middleware.ts
└── instrumentation.ts
```

---

# app/

Routing layer.

Responsible for:

* URL structure
* Pages
* Layouts
* Route groups
* API endpoints

Not responsible for:

* Business logic
* Database access
* AI workflows

Structure:

```text
app/

├── (marketing)
├── (auth)
├── (apps)
├── (admin)
├── api
└── layout.tsx
```

---

## (marketing)

Public website.

Purpose:

* Landing page
* Pricing page
* SEO content
* Marketing content

Structure:

```text
(marketing)

├── page.tsx
├── pricing/
├── about/
├── terms/
├── privacy/
└── layout.tsx
```

---

## (auth)

Authentication pages.

Purpose:

* Login
* Registration
* Password recovery

Structure:

```text
(auth)

├── login/
├── register/
├── forgot-password/
└── layout.tsx
```

---

## (apps)

Main application.

Purpose:

* User workspace
* Research experience
* Product features

Structure:

```text
(apps)

├── dashboard/
├── research/
├── history/
├── watchlist/
├── portfolio/
├── settings/
└── layout.tsx
```

---

## (admin)

Internal founder tools.

Purpose:

* User management
* Subscription management
* Analytics
* Customer support

Structure:

```text
(admin)

├── users/
├── subscriptions/
├── analytics/
├── support/
└── layout.tsx
```

---

## api/

Server execution layer.

Purpose:

* Secure backend operations
* External integrations
* Streaming responses

Structure:

```text
api/

├── auth/
├── analyze/
├── company/
├── filing/
├── news/
├── billing/
├── history/
├── export/
└── webhooks/
```

---

# features/

Core business layer.

Most important folder in the entire project.

Structure:

```text
features/

├── auth/
├── research/
├── company/
├── filing/
├── news/
├── billing/
├── dashboard/
├── admin/
├── portfolio/
├── watchlist/
└── api-platform/
```

---

## auth/

Authentication domain.

Responsible for:

* Session management
* Login
* Registration
* Authorization

---

## research/

Core AI research engine.

Responsible for:

* Research orchestration
* Prompt generation
* AI workflows
* Structured analysis generation

This is the most important module in Clyve.

---

## company/

Company intelligence.

Responsible for:

* Company profiles
* Financial metrics
* Market information
* Ticker validation

Primary source:

* Financial Modeling Prep

---

## filing/

SEC filing intelligence.

Responsible for:

* Filing retrieval
* Filing parsing
* Risk factor extraction
* Regulatory document processing

Examples:

* 10-K
* 10-Q
* 8-K

---

## news/

News intelligence.

Responsible for:

* News aggregation
* News normalization
* Sentiment analysis
* News summaries

---

## billing/

Revenue infrastructure.

Responsible for:

* Subscriptions
* Plans
* Upgrades
* Billing lifecycle

Primary provider:

* Lemon Squeezy

---

## dashboard/

User workspace.

Responsible for:

* Dashboard widgets
* Summary cards
* User metrics
* Research overview

---

## admin/

Internal operations.

Responsible for:

* User management
* Revenue reporting
* Subscription administration

---

## portfolio/

Future module.

Responsible for:

* Portfolio tracking
* Portfolio research
* Portfolio intelligence

Not part of V1.

---

## watchlist/

Future module.

Responsible for:

* Watchlists
* Alerts
* Saved companies

Not part of V1.

---

## api-platform/

Future product.

Responsible for:

* Public API
* API keys
* Usage metering
* Developer platform

Not part of V1.

---

# shared/

Reusable code.

Rule:

No business logic allowed.

Structure:

```text
shared/

├── components/
├── hooks/
├── utils/
├── constants/
├── config/
└── types/
```

Examples:

Allowed:

* Button
* Dialog
* Input
* Modal

Not allowed:

* ResearchCard
* CompanyAnalysis
* FilingViewer

Those belong to features.

---

# database/

Database layer.

Responsible for:

* Schema definitions
* Queries
* Repositories
* Migrations

Structure:

```text
database/

├── schema/
├── queries/
├── repositories/
├── migrations/
├── seeds/
└── index.ts
```

---

# lib/

Infrastructure layer.

Purpose:

Provide global technical capabilities.

Never store business logic here.

Structure:

```text
lib/

├── ai.ts
├── analytics.ts
├── cache.ts
├── cn.ts
├── env.ts
├── errors.ts
├── fetcher.ts
├── logger.ts
├── numbers.ts
├── pdf.ts
├── ratelimit.ts
├── strings.ts
├── urls.ts
├── redis.ts
├── queue.ts
├── storage.ts
├── observability.ts
├── security.ts
├── crypto.ts
└── constants.ts
```

Examples:

Good:

* class name merging
* cache abstraction
* logging
* analytics

Bad:

* getCompanyData()
* generateResearch()
* getNews()

Those belong to features.

---

# jobs/

Future background processing.

Not used in V1.

Structure:

```text
jobs/

├── research/
├── filing/
├── news/
└── cleanup/
```

Examples:

* SEC ingestion
* Cache warming
* Daily updates

---

# cache/

Future centralized caching.

Not required in V1.

Structure:

```text
cache/

├── company/
├── filing/
├── research/
└── news/
```

Future backend:

* Redis
* Upstash

---

# styles/

Global styling.

Structure:

```text
styles/

├── globals.css
├── themes.css
└── variables.css
```

---

# middleware.ts

Application middleware.

Responsibilities:

* Route protection
* Authentication checks
* Request filtering
* Security enforcement

---

# instrumentation.ts

Observability entrypoint.

Future responsibilities:

* Analytics
* Monitoring
* Error tracking
* Distributed tracing

---

# Core Research Pipeline

```text
User
 │
 ▼
Research Page
 │
 ▼
POST /api/analyze
 │
 ▼
Auth Check
 │
 ▼
Quota Check
 │
 ▼
Company Module
 │
 ▼
News Module
 │
 ▼
Filing Module
 │
 ▼
Research Module
 │
 ▼
Prompt Construction
 │
 ▼
Claude API
 │
 ▼
Structured Analysis
 │
 ▼
Database Save
 │
 ▼
Streaming Response
 │
 ▼
User
```

---

# Current Scaling Strategy

V1

* Single repository
* Single application
* Single deployment
* Single database

V2

* Redis caching
* Background jobs
* Filing ingestion

V3

* Public API
* Developer platform
* Advanced research intelligence

V4

* Monorepo
* Workers
* Dedicated data pipelines

Do not build V2, V3, or V4 infrastructure until V1 has real users and validated demand.