# Clyve AI — Pricing & Unit Economics

> Internal reference for all pricing decisions, infrastructure cost modeling, and scaling thresholds.
> Update this document whenever a vendor plan, usage pattern, or pricing tier changes.

---

## Pricing Tiers

| Tier | Queries | Price | Notes |
|---|---|---|---|
| Free | 3 lifetime | $0 | No credit card required |
| Pro Monthly | 50 / mo | $19/mo | Full access — PDF export, history, sentiment |
| Pro Annual | 50 / mo | $149/yr | Effective $12.42/mo — save $79/yr (UI displays $12/mo rounded) |

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

Kuota Pro dibatasi **50 kueri/bulan**. Biaya variabel per pengguna Pro maksimal adalah $1.75/bulan ($0.035 × 50). Risiko kerugian dari *power users* (sebelumnya tanpa batas) telah dieliminasi secara struktural.

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

| Billing | Revenue | Variable Cost (Caps) | Lemon Squeezy Fee | Infra Share | **Net/User** | **Gross Margin** |
|---|---|---|---|---|---|---|
| Pro Monthly | $19.00 | $1.75 (Max 50 q) | $1.45 (5% + $0.50) | $0.50 | ~$15.30 | ~80.5% |
| Pro Annual | $149.00 | $21.00/yr (Max) | $7.95/yr | $6.00/yr | ~$114.05/yr | ~76.5% |

Margin kotor 76% - 80% terkunci karena batas kuota ketat 50 kueri/bulan. Tidak ada risiko degradasi margin akibat lonjakan penggunaan individual.

---

## Break-Even & Scale Projections

Fixed cost baseline: $31/mo. Semua pengguna pada Pro Monthly senilai $19/mo.
Variable cost: $1.75/user/mo (Asumsi penggunaan penuh 50 kueri).

| Paying Users | MRR | Variable Cost | Fixed Cost | **Net Profit/mo** |
|---|---|---|---|---|
| 2 | $38 | $3.50 | $31 | +$3.50 |
| 3 | $57 | $5.25 | $31 | **~$20 (break-even)** |
| 10 | $190 | $17.50 | $31 | ~$141 |
| 25 | $475 | $43.75 | $31 | ~$400 |
| 50 | $950 | $87.50 | $31 | ~$831 |
| 100 | $1,900 | $175.00 | $31 | ~$1,694 |
| 200 | $3,800 | $350.00 | $76 | ~$3,374 |

Break-even tetap pada **3 paying users**.

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

### 50–100 Users — Claude API Becomes Primary Variable Cost

At 100 users × 50 queries = Max 5,000 queries/mo:
- Claude cost: Max 5,000 × $0.028 = **$140/mo**
- Batas atas biaya Claude terkunci pada $140/mo per 100 pengguna Pro.

Mitigation: implement **response caching per ticker per time window**.
- Key = `analysis:{ticker}:{date}` pada Upstash Redis.
- Target cache hit rate: 40–60% untuk menurunkan pengeluaran Claude di bawah proyeksi maksimal.

### 100+ Users — FMP API Call Limit

FMP Basic plan: 300 calls/day = ~9,000 calls/month.
Pada 100 users × 50 kueri, dengan ~3 FMP calls per kueri = dibutuhkan 15,000 calls/month.

Action: upgrade ke FMP Starter ($29/mo, 3,000 calls/day) saat mendekati 80 pengguna.

### 200+ Users — Vercel and Supabase Free Tier Limits

| Service | Free Tier Limit | Paid Plan | Cost |
|---|---|---|---|
| Vercel | 100GB bandwidth, serverless limits | Pro | $20/mo |
| Supabase | 500MB DB, 2GB bandwidth | Pro | $25/mo |

Combined upgrade cost: +$45/mo. Ditutupi oleh ~3 pengguna bulanan baru.

---

## Annual vs Monthly Mix Assumption

Asumsi rasio 30/70 annual/monthly pada tahap awal.

| Scenario | 50 Users (30% annual) | Net Profit/mo |
|---|---|---|
| 15 annual users | $186/mo effective ($149 ÷ 12) | — |
| 35 monthly users | $665/mo | — |
| **Combined MRR equivalent** | **$851** | **~$700/mo net** |

---

## Payment Processing

**Gateway: Lemon Squeezy (Merchant of Record)**

Fee structure: 5% + $0.50 per transaction.

| Transaction | Fee | Net Revenue |
|---|---|---|
| $19 monthly | $1.45 | $17.55 |
| $149 annual | $7.95 | $141.05 |

---

## Summary

| Metric | Value |
|---|---|
| Cost per query | ~$0.035 |
| Kuota per pengguna Pro | 50 kueri / bulan (Strict) |
| Fixed cost/mo (early) | $31 |
| Gross margin (monthly Pro) | ~80.5% |
| Gross margin (annual Pro) | ~76.5% |
| Break-even | 3 paying users |
| Net profit at 50 users | ~$830/mo |
| Critical cost risk | NewsAPI — do not use Developer plan |
| Primary scaling mitigation | Response caching (Redis/Upstash) |

---

*Last updated: June 2026*