# Pricing & Unit Economics

> Internal reference for all pricing decisions, infrastructure cost modeling, and scaling thresholds.
> Update this document whenever a vendor plan, usage pattern, or pricing tier changes.
>
> Canonical pricing for UI and docs → [01-product.md](./01-product.md)

---

## Pricing Tiers

| Tier | Queries | Price | Notes |
|---|---|---|---|
| Free | 3 lifetime | $0 | No credit card required |
| Pro Monthly | 50 / mo | $19/mo | Full access — PDF export, history, sentiment — resets each billing cycle |
| Pro Annual | 50 / mo | $149/yr | Effective $12.42/mo (UI displays $12 rounded) · Save $79/yr |

### Why These Numbers

$19/mo sits at a deliberate position in the market:

- Bloomberg Terminal: ~$2,000/mo — institutional, inaccessible to retail
- ChatGPT Plus: $20/mo — no structured financial output, no verified sources
- Clyve Pro: $19/mo — structured intelligence, verified data, accessible to retail

The price is not race-to-the-bottom. It signals seriousness while remaining accessible to the exact user Clyve is built for: independent investors who already do their own due diligence.

---

## Cost Per Query (Variable)

Every time a user runs a research query, the following costs are incurred.

| Component | Basis | Cost/Query |
|---|---|---|
| Claude API (Sonnet) | ~2,000 input + ~1,500 output tokens @ $3/$15 per 1M | ~$0.028 |
| FMP API | Amortized across ~1,000 queries/mo on paid plan | ~$0.001 |
| GNews API | Amortized across ~1,000 queries/mo on $9/mo plan | ~$0.001 |
| **Total variable cost** | | **~$0.030** |

Working budget: use **$0.035/query** with a ~15% buffer for spikes.

Pro quota is capped at **50 queries/month**. Maximum variable cost per Pro user = **$1.75/mo** ($0.035 × 50). Margin degradation risk from power users is structurally eliminated.

---

## Fixed Monthly Infrastructure

| Service | Plan | Cost/mo | Trigger to Upgrade |
|---|---|---|---|
| [GNews API](https://gnews.io) | Starter ($9/mo, 1,000 req/day) | $9 | Switch to TheNewsAPI at ~500 users |
| [Financial Modeling Prep](https://site.financialmodelingprep.com/developer/docs) | Basic ($14/mo, 300 calls/day) | $14 | Upgrade to Starter ($29/mo) at ~80–100 users |
| [Vercel](https://vercel.com/pricing) | Free tier | $0 | Upgrade to Pro ($20/mo) at ~200 users |
| [Supabase](https://supabase.com/pricing) | Free tier | $0 | Upgrade to Pro ($25/mo) at ~200 users |
| Domain | — | $1 | — |
| **Total (early stage)** | | **$24/mo** | |
| **Total (200+ users)** | | **~$69/mo** | Vercel + Supabase paid kicks in |

> **Note:** Python ML service (Railway ~$7/mo) is deferred to V2. Not included in V1 fixed cost baseline. See [ADR-003](./06-decisions.md#adr-003).

---

## Gross Margin Per User

| Billing | Revenue | Variable Cost (capped) | Lemon Squeezy Fee | Infra Share | **Net/User** | **Gross Margin** |
|---|---|---|---|---|---|---|
| Pro Monthly | $19.00 | $1.75 (max 50 q) | $1.45 (5% + $0.50) | $0.50 | ~$15.30 | ~**80.5%** |
| Pro Annual | $149.00 | $21.00/yr (max) | $7.95/yr | $6.00/yr | ~$114.05/yr | ~**76.5%** |

Gross margin 76–80% is locked in by the hard 50 query cap. No margin compression risk from individual usage spikes.

---

## Break-Even & Scale Projections

Fixed cost baseline: $24/mo (V1). All users on Pro Monthly at $19/mo. Variable cost: $1.75/user/mo (full 50 query usage assumed).

| Paying Users | MRR | Variable Cost | Fixed Cost | **Net Profit/mo** |
|---|---|---|---|---|
| 2 | $38 | $3.50 | $24 | +$10.50 |
| 2–3 | — | — | — | **~Break-even** |
| 10 | $190 | $17.50 | $24 | ~$148 |
| 25 | $475 | $43.75 | $24 | ~$407 |
| 50 | $950 | $87.50 | $24 | ~$838 |
| 100 | $1,900 | $175.00 | $24 | ~$1,701 |
| 200 | $3,800 | $350.00 | $69 | ~$3,381 |

Break-even: **2–3 paying users.**

---

## News API Strategy

**Default: GNews API ($9/mo). Do not use NewsAPI Developer ($449/mo) in production.**

| Provider | Free Tier | Paid Tier | Production Verdict |
|---|---|---|---|
| [NewsAPI](https://newsapi.org) | 100 req/day | $449/mo (Developer) | ❌ Do not use — destroys unit economics |
| [GNews API](https://gnews.io/docs/v4) | 100 req/day | $9/mo (1,000 req/day) | ✅ **Default. Use this.** |
| [TheNewsAPI](https://www.thenewsapi.com/pricing) | 100 req/day | $29/mo (unlimited) | Upgrade path at ~300–500 users |
| RSS aggregation | Unlimited | $0 (engineering time) | V2 consideration for cost ceiling |

### Caching is Non-Negotiable

News results must be cached per ticker per time window. Multiple users querying AAPL within the same hour should not trigger multiple API calls.

Recommended implementation:

- Cache layer: [Upstash Redis](https://upstash.com) (free tier covers early stage)
- TTL: 60 minutes per ticker
- Expected cache hit rate at 50 users: 60–80%
- Impact: reduces effective news API cost by 60–80%

---

## Scaling Inflection Points

### 50–100 Users — Claude API Becomes Primary Variable Cost

At 100 users × 50 queries = max 5,000 queries/mo:
- Claude cost: 5,000 × $0.028 = **$140/mo maximum**
- Cap is structural — 50 query limit per user makes this ceiling firm.

Mitigation: implement **response caching per ticker per time window**.
- Key = `analysis:{ticker}:{date}` on Upstash Redis
- Target cache hit rate: 40–60% — reduces Claude spend below maximum projection

### 80–100 Users — FMP API Call Limit

FMP Basic plan: 300 calls/day ≈ 9,000 calls/month.
At 100 users × 50 queries × ~3 FMP calls per query = 15,000 calls/month needed.

**Action:** Upgrade to FMP Starter ($29/mo, 3,000 calls/day) approaching 80 users. → [FMP Pricing](https://site.financialmodelingprep.com/developer/docs/pricing)

### 200+ Users — Vercel and Supabase Free Tier Limits

| Service | Free Tier Limit | Paid Plan | Cost |
|---|---|---|---|
| [Vercel](https://vercel.com/pricing) | 100GB bandwidth, serverless limits | Pro | $20/mo |
| [Supabase](https://supabase.com/pricing) | 500MB DB, 2GB bandwidth | Pro | $25/mo |

Combined upgrade: +$45/mo — covered by ~3 net new monthly users.

---

## Annual vs Monthly Mix Assumption

Assumed 30/70 annual/monthly ratio at early stage.

| Scenario | 50 Users (30% annual) | |
|---|---|---|
| 15 annual users | $186/mo effective ($149 ÷ 12) | |
| 35 monthly users | $665/mo | |
| **Combined MRR equivalent** | **$851** | **~$707/mo net** |

---

## Payment Processing

**Gateway: [Lemon Squeezy](https://www.lemonsqueezy.com) (Merchant of Record)**

Fee structure: 5% + $0.50 per transaction. → [Lemon Squeezy Pricing](https://www.lemonsqueezy.com/pricing)

| Transaction | Gross Fee | Net Revenue |
|---|---|---|
| $19 monthly | $1.45 | $17.55 |
| $149 annual | $7.95 | $141.05 |

Net-30 payout cycle. Set a hard Anthropic API spend cap before launch — API costs are payable before revenue clears. See [ADR-004](./06-decisions.md#adr-004).

---

## Summary

| Metric | Value |
|---|---|
| Cost per query | ~$0.035 (buffered) |
| Pro query cap | 50 / month (hard) |
| Fixed cost/mo (V1 early stage) | $24 |
| Gross margin — Pro Monthly | ~80.5% |
| Gross margin — Pro Annual | ~76.5% |
| Break-even | 2–3 paying users |
| Net profit at 50 users | ~$838/mo |
| Critical cost risk | NewsAPI Developer plan — do not use |
| Primary scaling mitigation | Response caching via Upstash Redis |

---

*Last updated: June 2026*