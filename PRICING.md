# Clyve AI — Pricing & Unit Economics

> Internal reference for all pricing decisions, infrastructure cost modeling, and scaling thresholds.
> Update this document whenever a vendor plan, usage pattern, or pricing tier changes.

---

## Pricing Tiers

| Tier | Queries | Price | Notes |
|---|---|---|---|
| Free | 3 lifetime | $0 | No credit card required |
| Pro Monthly | Unlimited | $19/mo | Full access — PDF export, history, sentiment |
| Pro Annual | Unlimited | $149/yr | Effective $12.42/mo — save $79/yr |

### Why These Numbers

$19/mo sits at a deliberate position in the market:

- Bloomberg Terminal: ~$2,000/mo — institutional, inaccessible to retail
- ChatGPT Plus: $20/mo — no structured financial output, no verified sources
- Clyve Pro: $19/mo — structured intelligence, verified data, accessible to retail

The price is not race-to-the-bottom. It is not trying to compete on cost alone.
It is priced to signal seriousness while remaining accessible to the exact user
Clyve is built for: independent investors who already do their own due diligence.

---

## Cost Per Query (Variable)

Every time a user runs a research query, the following costs are incurred.

| Component | Basis | Cost/Query |
|---|---|---|
| Claude API (Sonnet) | ~2,000 input + ~1,500 output tokens @ $3/$15 per 1M | ~$0.028 |
| FMP API | Amortized across ~1,000 queries/mo on paid plan | ~$0.001 |
| GNews API | Amortized across ~1,000 queries/mo on $9/mo plan | ~$0.001 |
| Railway (Python ML) | Fixed cost, negligible per query | ~$0.001 |
| **Total variable cost** | | **~$0.031** |

Working budget: use **$0.035/query** with a 10% buffer for spikes.

Assumes average Pro user runs ~50 queries/month. Power users at 200+ queries/month
are still profitable — variable cost at 200 queries = $7.00, well within the $19 margin.

---

## Fixed Monthly Infrastructure

| Service | Plan | Cost/mo | Trigger to Upgrade |
|---|---|---|---|
| GNews API | Starter ($9/mo, 1,000 req/day) | $9 | Switch to TheNewsAPI at ~500 users |
| FMP API | Basic ($14/mo, 300 calls/day) | $14 | Upgrade to Starter ($29/mo) at ~100 users |
| Railway | Hobby ($7/mo) | $7 | Upgrade to Pro at ~200 users |
| Domain | — | $1 | — |
| Vercel | Free tier | $0 | Upgrade to Pro ($20/mo) at ~200 users |
| Supabase | Free tier | $0 | Upgrade to Pro ($25/mo) at ~200 users |
| **Total (early stage)** | | **$31/mo** | |
| **Total (200+ users)** | | **~$76/mo** | Vercel + Supabase paid kicks in |

---

## Gross Margin Per User

| Billing | Revenue | Variable Cost | Lemon Squeezy Fee | Infra Share | **Net/User** | **Gross Margin** |
|---|---|---|---|---|---|---|
| Pro Monthly | $19.00 | $1.75 | $1.45 (5% + $0.50) | $0.50 | ~$15.30 | ~80% |
| Pro Annual | $149.00 | $21.00/yr | $7.95/yr | $6.00/yr | ~$114.00/yr | ~76% |

80% gross margin is healthy for an early-stage SaaS. Industry benchmark for
B2B SaaS is 70–80%. Clyve sits at the top of that range from day one.

---

## Break-Even & Scale Projections

Fixed cost baseline: $31/mo. All users on Pro Monthly at $19/mo.
Variable cost: $1.75/user/mo (50 queries average).

| Paying Users | MRR | Variable Cost | Fixed Cost | **Net Profit/mo** |
|---|---|---|---|---|
| 2 | $38 | $3.50 | $31 | +$3.50 |
| 3 | $57 | $5.25 | $31 | **~$0 (break-even)** |
| 10 | $190 | $17.50 | $31 | ~$141 |
| 25 | $475 | $43.75 | $31 | ~$400 |
| 50 | $950 | $87.50 | $31 | ~$831 |
| 100 | $1,900 | $175.00 | $31 | ~$1,694 |
| 200 | $3,800 | $350.00 | $76 | ~$3,374 |

Break-even at **3 paying users**. This assumes GNews ($9/mo) is used.
If NewsAPI Developer ($449/mo) is used instead, break-even jumps to ~25 users.

---

## News API Strategy

**Default: GNews API ($9/mo). Do not use NewsAPI Developer ($449/mo) in production.**

| Provider | Free Tier | Paid Tier | Production Verdict |
|---|---|---|---|
| NewsAPI | 100 req/day | $449/mo (Developer) | Do not use — destroys unit economics |
| GNews API | 100 req/day | $9/mo (1,000 req/day) | **Default. Use this.** |
| TheNewsAPI.com | 100 req/day | $29/mo (unlimited) | Upgrade path at ~300–500 users |
| RSS aggregation | Unlimited | $0 (engineering time) | V2 consideration for cost ceiling |

### Caching is Non-Negotiable

Regardless of provider, news results must be cached per ticker per time window.
Multiple users querying AAPL within the same hour should not trigger multiple API calls.

Recommended implementation:
- Cache layer: Upstash Redis (free tier covers early stage)
- TTL: 60 minutes per ticker
- Expected cache hit rate at 50 users: 60–80%
- Impact: reduces effective news API cost by 60–80%

---

## Scaling Inflection Points

These are the thresholds where cost structure changes materially.
Review this section when approaching each threshold.

### 50–100 Users — Claude API Becomes Primary Variable Cost

At 100 users × 50 queries = 5,000 queries/mo:
- Claude cost: 5,000 × $0.028 = **$140/mo**
- Still profitable, but Claude is now the single largest cost line

Mitigation: implement **response caching per ticker per time window**.
- If 10 users query TSLA on the same day, run Claude once, serve cache 9 times
- Target cache hit rate: 40–60% on popular tickers
- Implementation: Redis on Upstash → key = `analysis:{ticker}:{date}`
- Expected Claude cost reduction: 40–60%

### 100+ Users — FMP API Call Limit

FMP Basic plan: 300 calls/day = ~9,000 calls/month.
At 100 users × 50 queries, with ~3 FMP calls per query = 15,000 calls/month needed.

Action: upgrade to FMP Starter ($29/mo, 3,000 calls/day) when approaching 80 users.
Cost delta: +$15/mo. Covered by revenue from ~1 additional user.

### 200+ Users — Vercel and Supabase Free Tier Limits

| Service | Free Tier Limit | Paid Plan | Cost |
|---|---|---|---|
| Vercel | 100GB bandwidth, serverless limits | Pro | $20/mo |
| Supabase | 500MB DB, 2GB bandwidth | Pro | $25/mo |

Combined upgrade cost: +$45/mo. Covered by ~3 additional users at $19/mo.
No material impact on gross margin.

### 500+ Users — Consider TheNewsAPI or RSS Layer

GNews Starter (1,000 req/day) may be insufficient at sustained 500-user scale
with low cache hit rates. Options at this point:

- Upgrade to TheNewsAPI.com unlimited: $29/mo
- Build RSS aggregation layer: $0 ongoing, one-time engineering investment
- Negotiate custom GNews plan

---

## Annual vs Monthly Mix Assumption

For revenue projections, assume a 30/70 annual/monthly split at early stage,
shifting toward 40/60 as the product matures.

| Scenario | 50 Users (30% annual) | Net Profit/mo |
|---|---|---|
| 15 annual users | $186/mo effective ($149 ÷ 12) | — |
| 35 monthly users | $665/mo | — |
| **Combined MRR equivalent** | **$851** | **~$700/mo net** |

Annual subscribers improve cash flow significantly — $149 upfront vs $19/mo.
Consider offering a modest incentive (e.g. 2 months free = $149 vs $228) to push annual conversion.
Current annual pricing already reflects this: $149/yr vs $228/yr monthly equivalent.

---

## Payment Processing

**Gateway: Lemon Squeezy (Merchant of Record)**

Chosen because:
- Handles global tax compliance automatically (VAT, GST, etc.)
- No need for a registered legal entity to accept international payments
- Critical for an Indonesia-based founder selling globally

Fee structure: 5% + $0.50 per transaction.

| Transaction | Fee | Net Revenue |
|---|---|---|
| $19 monthly | $1.45 | $17.55 |
| $149 annual | $7.95 | $141.05 |

Alternative considered: Stripe — rejected because it requires an international legal entity.
Alternative considered: Paddle — similar MoR model, higher fees at early stage.

---

## Summary

| Metric | Value |
|---|---|
| Cost per query | ~$0.035 |
| Fixed cost/mo (early) | $31 |
| Gross margin (monthly Pro) | ~80% |
| Gross margin (annual Pro) | ~76% |
| Break-even | 3 paying users |
| Net profit at 50 users | ~$830/mo |
| Net profit at 100 users | ~$1,690/mo |
| Critical cost risk | NewsAPI — do not use Developer plan |
| Primary scaling mitigation | Response caching (Redis/Upstash) |

---

*Last updated: June 2026*