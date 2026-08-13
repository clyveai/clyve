# Pricing & Unit Economics

> V1 cost driver is fundamentally different from V0: V0 billed per discrete query (user asks, pays per answer). V1's cost scales with **number of holdings tracked × monitoring frequency**, since drift-checking runs continuously in the background, not on-demand. The V0 model below is retained for historical reference only — do not reuse its cap logic.

---

## V1 Pricing — Not Yet Finalized

**Options under consideration (see ADR discussion in 01-product.md):**

| Model | Mechanism | Risk |
|---|---|---|
| Flat with holdings cap | e.g. "$19/mo, up to 10 holdings tracked" | Needs per-holding cost model before setting the cap number |
| Flat with monitoring-frequency throttle | Unlimited holdings, checked less often | Conflicts with "faster than MyThesis" as a differentiator |
| True flat/unlimited | No cap | Not viable pre-revenue without a modeled worst-case cost — see below |

**Decision blocker:** none of these can be finalized until the per-holding monitoring cost is modeled (see next section). Do not ship "unlimited" without this.

---

## Estimated Cost Per Tracked Holding (V1 — needs validation)

Unlike V0's per-query model, V1 cost is recurring per holding, per monitoring cycle.

| Component | Basis | Est. Cost/Holding/Monitoring-Cycle |
|---|---|---|
| Event ingestion (FMP + GNews + SEC EDGAR pull) | Amortized across API plan (see below) | ~$0.002–0.005 |
| Drift classification (Claude, per new event) | Varies with event volume/holding | ~$0.01–0.03 |
| Curated history synthesis (Claude, per period) | 1 synthesis call per monitoring period, not per event (ADR-009) | ~$0.02–0.04 |
| **Total, estimated** | | **~$0.03–0.08 / holding / cycle** |

> **This table is a placeholder estimate, not a validated number.** Before setting V1 pricing, run this against real monitoring frequency assumptions (daily? weekly? on-filing-only?) and confirm against actual token usage from a working prototype. Treat every number here as provisional.

---

## Fixed Monthly Infrastructure (retained from V0, still applicable)

| Service | Plan | Cost/mo | Trigger to Upgrade |
|---|---|---|---|
| [GNews API](https://gnews.io) | Starter ($9/mo, 1,000 req/day) | $9 | Switch to TheNewsAPI at ~500 users |
| [Financial Modeling Prep](https://site.financialmodelingprep.com/developer/docs) | Basic ($14/mo, 300 calls/day) | $14 | Upgrade to Starter ($29/mo) at ~80–100 users |
| [Upstash Redis](https://upstash.com) | Free tier → paid | $0 → | **Now required for V1, not optional** — caching is structural to the monitoring-cost model, not just a scaling mitigation (see ADR-009 note on cost) |
| [Vercel](https://vercel.com/pricing) | Free tier | $0 | Upgrade to Pro ($20/mo) at ~200 users |
| [Supabase](https://supabase.com/pricing) | Free tier | $0 | Upgrade to Pro ($25/mo) at ~200 users |
| Domain | — | $1 | — |
| **Total (early stage)** | | **~$24/mo** | |

---

## News API Strategy (unchanged, still binding)

**Default: GNews API ($9/mo). Do NOT use NewsAPI Developer ($449/mo).**

| Provider | Free Tier | Paid Tier | Verdict |
|---|---|---|---|
| [NewsAPI](https://newsapi.org) | 100 req/day | $449/mo | ❌ Do not use |
| [GNews API](https://gnews.io/docs/v4) | 100 req/day | $9/mo | ✅ Default |
| [TheNewsAPI](https://www.thenewsapi.com/pricing) | 100 req/day | $29/mo unlimited | Upgrade path at ~300–500 users |

**Caching is non-negotiable** — event data per ticker per monitoring window must be cached (Upstash Redis, TTL per monitoring frequency decision). This is now a cost-model requirement, not just a nice-to-have, since V1's cost scales with continuous monitoring rather than discrete user-triggered queries.

---

## V0 Reference Pricing (deprecated — historical comparison only)

| Tier | Queries | Price |
|---|---|---|
| Free | 3 lifetime | $0 |
| Pro Monthly | 50/mo | $19/mo |
| Pro Annual | 50/mo | $149/yr |

Break-even under V0's model was 2–3 paying users at ~80% gross margin. **This margin figure does not carry over to V1** — the cost structure is no longer capped by a simple query count, and margin cannot be claimed until the per-holding monitoring cost table above is validated against a real prototype.

---

## Payment Processing

**Gateway: Polar.sh (Merchant of Record).**

> **Unresolved:** exact fee structure and payout cadence need to be pulled from Polar's current published pricing before the net revenue figures below can be trusted. The numbers in this section still use Lemon Squeezy's fee structure (5% + $0.50/transaction) as a placeholder — do not treat as final.

| Transaction (placeholder, using old fee structure) | Gross Fee | Net Revenue |
|---|---|---|
| $19 monthly | $1.45 | $17.55 |
| $149 annual | $7.95 | $141.05 |

**Action item before this section is finalized:** confirm Polar.sh's actual transaction fee % and fixed fee, and payout cycle timing (net-X days). Update ADR-004's spend-cap rationale accordingly once confirmed — the "API costs payable before revenue clears" risk still applies regardless of gateway, but the exact cash flow gap depends on Polar's payout cadence, not Lemon Squeezy's.

---

## Open Items Before This Doc Is Finalized

1. Validate per-holding-per-cycle cost against a working prototype, not estimates
2. Decide monitoring frequency (this is both a UX decision — "how fresh is the alert" — and a cost decision)
3. Set the holdings cap number for the flat-tier pricing model based on #1
4. Re-run break-even projection once #1–#3 are locked

*Last updated: August 2026 — supersedes June 2026 version, which was written entirely against the deprecated V0 query-metered model.*