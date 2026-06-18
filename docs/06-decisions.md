# Decisions

Architecture Decision Records (ADRs) for Clyve AI. Each entry documents a significant choice, its context, the options considered, and the rationale. This file exists so future-you doesn't re-litigate already-resolved decisions.

---

## ADR-001: Full-Stack Next.js over Separate Backend

**Status:** Accepted  
**Date:** 2025

**Context:**
V1 needs to ship fast. Options were: (a) Next.js App Router handling everything, (b) Next.js frontend + separate Node/Express backend, (c) Next.js frontend + Python FastAPI backend from day one.

**Decision:**
Full-stack Next.js (App Router) for V1. All business logic in Route Handlers.

**Rationale:**
- Single deployment unit on Vercel — zero infra coordination overhead
- Vercel AI SDK designed for this pattern (streaming from Route Handlers)
- Python microservice adds a second deploy target, environment, and failure surface — not worth it at pre-revenue stage
- Next.js Route Handlers are sufficient for the V1 data volumes

**Consequences:**
- Python FastAPI service deferred to V2 (heavier ML workloads)
- All API logic co-located with frontend — acceptable at this scale

---

## ADR-002: No Admin Panel in V1

**Status:** Accepted  
**Date:** 2025

**Context:**
Early README included an `(admin)/` route group with `/users` and `/revenue` pages behind role-based auth.

**Decision:**
Remove admin panel from V1 scope entirely.

**Rationale:**
- Supabase dashboard provides table-level data access, SQL editor, and row filtering — sufficient for a solo founder managing tens/hundreds of users
- Building a custom admin UI is weeks of work with zero user-facing value
- Role-based auth adds complexity to the auth layer that isn't needed yet

**Consequences:**
- Operational visibility via Supabase dashboard + Vercel Analytics
- Revisit when team grows beyond 1 person or user base exceeds ~1,000

---

## ADR-003: Defer Python FastAPI Microservice to V2

**Status:** Accepted  
**Date:** 2025

**Context:**
Original architecture included a Python FastAPI service for news fetching + sentiment analysis, deployed separately on Railway or Render.

**Decision:**
Eliminate Python service from V1. Handle sentiment inline via Claude API.

**Rationale:**
- Claude can classify headline sentiment (positive / neutral / negative) as part of the same API call that structures the analysis — zero additional latency penalty
- A separate service means: second deployment, second environment to manage, inter-service latency, second failure point, second set of env vars
- "Sentiment analysis library (TBD)" in the original stack was unresolved — deferring removes a blocking unknown
- Pre-revenue bootstrapped context: operational simplicity is the highest-value constraint

**Consequences:**
- Sentiment quality bounded by Claude's inference, not a fine-tuned model — acceptable for V1 use case
- V2: introduce FastAPI service when workloads require dedicated ML (e.g., custom scoring models, real-time streaming data)

---

## ADR-004: Single LLM (Claude) in V1, Abstraction Layer in V2

**Status:** Accepted  
**Date:** 2025

**Context:**
Early planning explored a multi-LLM abstraction layer — Claude Sonnet as primary, Gemini Flash and GPT-4o Mini as cost-optimized fallbacks via Vercel AI SDK's provider switching.

**Decision:**
V1 uses Claude exclusively (`claude-sonnet-4-6`). Multi-provider abstraction is V2.

**Rationale:**
- Multi-provider adds prompt engineering complexity (each model needs tuned prompts for structured output)
- Cost optimization at this stage is premature — user volume is unknown
- Vercel AI SDK makes provider switching low-effort when the time comes
- Hard Anthropic spend cap in console mitigates cost risk at pre-revenue stage

**Critical action item:** Set a hard monthly spend cap in [Anthropic Console](https://console.anthropic.com/) before launch. Lemon Squeezy has a net-30 payout cycle — API costs are payable before revenue arrives.

---

## ADR-005: Lemon Squeezy as V1 Payment Infrastructure

**Status:** Accepted  
**Date:** 2025

**Context:**
Options evaluated: Stripe, Paddle, Lemon Squeezy, Midtrans.

| | Stripe | Paddle | Lemon Squeezy | Midtrans |
|---|---|---|---|---|
| MoR (handles global tax) | ❌ | ✅ | ✅ | ❌ |
| Monthly fee | ❌ | ❌ | ❌ | ❌ |
| Requires international entity | ✅ | Partial | ❌ | ❌ |
| Buyer login required | ❌ | ❌ | ❌ | N/A |
| Auto email delivery | ❌ | ✅ | ✅ | N/A |
| Indonesian founder compatible | ❌ | Partial | ✅ | ✅ |
| Subscription billing | ✅ | ✅ | ✅ | Limited |

**Decision:**
Lemon Squeezy for V1 global billing. Midtrans as V2 consideration for local Indonesian users.

**Rationale:**
- Stripe requires an international entity — not viable for Indonesian solo founder pre-incorporation
- Paddle viable but more complex API and onboarding than Lemon Squeezy
- Lemon Squeezy: Merchant of Record handles VAT/GST globally, no monthly fees, no buyer login requirement, clean API
- Midtrans covers QRIS/VA/e-wallet for IDR-paying users — relevant only if V2 targets local Indonesian market explicitly

**Consequences:**
- Stripe env vars removed from codebase (were in original README — now cleaned up)
- Lemon Squeezy net-30 payouts are a cash flow constraint — covered by ADR-004 spend cap requirement

---

## ADR-006: SEC EDGAR as Core Data Moat

**Status:** Accepted  
**Date:** 2025

**Context:**
V1 uses Financial Modeling Prep as the primary data source, which itself sources from EDGAR. The question was whether to go direct to EDGAR.

**Decision:**
FMP API for V1. Direct EDGAR integration for V2 (10-K / 10-Q deep-dive feature).

**Rationale:**
- FMP abstracts EDGAR's raw XBRL/XML into structured JSON — significantly reduces V1 parsing complexity
- FMP free tier covers V1 query volumes
- Direct EDGAR access unlocks full filing text (risk factors, MD&A, footnotes) — high-value but non-trivial to parse. Scope for V2.
- [Polygon.io](https://polygon.io) is the upgrade path from FMP for real-time data and higher rate limits

**Consequences:**
- V1 data quality bounded by FMP's structured output
- V2: EDGAR direct integration for filing deep-dives (10-K/10-Q parser)

---

## ADR-007: Better Auth over NextAuth / Clerk

**Status:** Accepted  
**Date:** 2025

**Context:**
Auth options: NextAuth v5 (Auth.js), Clerk, Better Auth, Supabase Auth.

**Decision:**
Better Auth.

**Rationale:**
- NextAuth v5 API surface was in flux at decision time
- Clerk is paid beyond a free tier threshold — adds cost dependency
- Supabase Auth couples DB and auth vendor (lock-in risk)
- Better Auth: self-hosted, TypeScript-native, Drizzle adapter available, no vendor pricing risk, clean API
- Fits the "zero vendor lock-in where possible" constraint for a bootstrapped product

**Consequences:**
- Auth infra is self-managed — operational responsibility on founder
- No managed dashboard for user management (Supabase table view handles this)