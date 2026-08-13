# Product

## Why Clyve Exists
Traditional financial research tools solve the wrong problem. Getting a complete picture of a company — financials, recent news, analyst sentiment, risk factors — is no longer the bottleneck: Bloomberg, Perplexity, and a dozen aggregators already do this. The real failure point is downstream: investors forget *why* they bought. The original thesis erodes silently — a filing shifts, a competitor moves, guidance changes — and the position gets held on inertia, not conviction.

Clyve solves one problem: **thesis decay detection**.

Clyve is a **memory layer for conviction** — not a place to find information, but a place to store and stress-test your own reasoning against time.

> "Clyve remembers why you bought, and tells you when that reason stops holding."

Clyve is a thesis journal for investors. Write down why you hold a position, Clyve tracks filings and news against it, and flags the moment reality starts to diverge.

---

## Positioning Shift (V0 → V1)
Clyve originally launched as a financial research intelligence SaaS — an AI-native conversational interface that summarized filings and news on demand. Direct testing against Perplexity Finance (querying NVDA debt/revenue, "track NVDA") confirmed that structured financial Q&A is already commoditized — Perplexity delivers this competently for free. What no aggregator or chatbot does is persist a user's specific reasoning across time and monitor it proactively. That gap is what V1 is built around.

| ✨ | V0 (deprecated) | V1 (current) |
|---|---|---|
| Core loop | Ask → get research | Write thesis → get drift alerts |
| Interface | Conversational chatbot | Dashboard — bubble/card per ticker, status color-coded (green/yellow/red), click-through to chronological document/timeline history |
| Value driver | Speed of information retrieval | Persistence of reasoning + accountability |
| Switching cost | None — stateless per session | Compounds — accumulated thesis history is not portable to a competitor |
| Unique value (one line) | "Time to insight" | "Clyve isn't a place to look for information, but a place to store and test your own reasoning over time" |

---

## What Clyve Is Not
- Not a research aggregator or chatbot (that was V0's positioning)
- Not a signal tool
- Not a trading bot
- Not financial advice of any kind
- Not a Bloomberg competitor

---

## Target Market
**Primary — Serious Retail Investors (Global, English-first)**
Independent investors who do their own due diligence and already hold positions with a reasoned thesis. They don't need more information — they need that thesis actively checked against reality instead of quietly forgotten.

**Secondary — Independent Analysts & Finance Students**
People building and defending their own investment theses who need a structured, persistent record of *why* — not just fast access to *what*.

**Not targeting:**
- Institutional funds (they have Bloomberg)
- Day traders looking for signals (wrong product — no thesis, no horizon)
- Crypto-only traders (V2 consideration)

---

## Positioning

| ✌🏻 | Clyve AI | MyThesis.ai | Cleriq | Horyzon | Bloomberg Terminal | Perplexity / Koyfin / Seeking Alpha |
|---|---|---|---|---|---|---|
| Price | TBD — flat tier, cap model (see Pricing) | $0 first holding, $4.99/holding/mo after | — | — | ~$2,000/mo | Free / $20 |
| Persistent per-user thesis memory | ✅ | ✅ | Partial (behavioral focus) | Partial (portfolio-tracker + reasoning) | ❌ | ❌ — stateless per session |
| Structured per-assumption evidence mapping | ✅ | ❌ — binary alerts only (intact/drift) | ❌ | ❌ | ✅ | ❌ |
| Curated periodic summary (vs. raw event feed) | ✅ | ❌ — raw per-event alert feed, thin dashboard (2 top alerts) | — | — | ✅ | Limited |
| Analysis speed | Fast (differentiator) | Slow — requires email notification on completion | — | — | Fast | Fast |
| Broker connection | the next version  | Non-functional ("Not Connected," coming soon) | — | — | ✅ | — |
| Halal ETF screening | ✅ (differentiator) | ❌ | ❌ | ❌ | ❌ | ❌ |
| Accessible to retail | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |

**Competitor notes:**
- **Cleriq** — checked directly; likely not a live product (App Store link resolves to a placeholder ID `id000000000`, website reads as AI-generated). Not counted as a real competitive threat, but positioning noted (behavioral coach — targets biases like selling winners early / holding losers too long) in case it relaunches.
- **MyThesis.ai** — closest real competitor to Clyve V1. Verified firsthand via direct testing (see above).
- **Cleriq / Horyzon** — positioned adjacently (behavioral-coach and portfolio-tracker-with-reasoning respectively) but neither does structured per-assumption/per-pillar evidence mapping — thesis health for both is effectively binary, not granular.
- **Perplexity / Koyfin / Seeking Alpha** — single-session Q&A tools, no persistent cross-session memory. Not building the switching-cost moat Clyve depends on.

---

## Core Features (V1)

| Feature | Description |
|---|---|
| Thesis capture | User writes down *why* they hold a position — the specific claims/assumptions the position depends on |
| Drift monitoring | Filings and news tracked against each stated assumption; flags the moment evidence diverges from the thesis |
| Status dashboard | Bubble/card layout per ticker, color-coded (green/yellow/red) for thesis alignment — replaces V0's chat interface |
| Curated history | LLM synthesizes raw events per period into one narrative document entry per significant period; raw events retained server-side for audit trail but not shown as default view |
| Halal ETF screening | Standalone/add-on screening feature — differentiator vs. all identified competitors |
| PDF export | Download any analysis/thesis document as a clean, shareable report *(carried over from V0 — confirm still in V1 scope)* |
| Disclaimer system | Non-removable research disclaimer on every output |

---

## Data Sources

| Data Type | Source | Notes |
|---|---|---|
| Financial data (revenue, EPS, P/E, market cap, etc.) | [Financial Modeling Prep](https://financialmodelingprep.com) | Sourced from public company filings |
| Company profiles | [Financial Modeling Prep](https://financialmodelingprep.com) | Sector, description, exchange — used for dashboard card metadata |
| News & headlines | [GNews API](https://newsapi.org) | Provider migrated from NewsAPI (V0) — confirm this is finalized for V1 |
| Analyst consensus | [Financial Modeling Prep](https://financialmodelingprep.com) | Public analyst ratings — **confirm: still used as an evidence input for thesis drift-checking in V1?** |
| SEC filings (risk factors) | [SEC EDGAR](https://www.sec.gov/cgi-bin/browse-edgar) / [Financial Modeling Prep](https://financialmodelingprep.com) | Public regulatory filings — primary source for drift detection |
| Sentiment analysis | Claude API (inline) | Derived from headline text, no separate ML service — **confirm: still surfaced per-headline in UI, or fully absorbed into thesis-synthesis output?** |
| Thesis-vs-evidence synthesis | Multi-LLM layer (Gemini Flash → Claude API) | Core V1 addition, not present in V0 — cross-checks stated thesis assumptions against incoming filings/news |

**All data is publicly available.** Clyve does not use proprietary data feeds, insider information, or any non-public sources.

---

## Pricing
V0 used query-based metering (Free/Pro Monthly/Pro Annual tiers below, retained for reference). V1's model has not been finalized and should **not** default to unlimited/flat without a cost model — Clyve's core cost driver (LLM synthesis calls + API polling) scales with number of holdings tracked × monitoring frequency, not with a fixed per-user cost. Shipping true unlimited pricing pre-revenue, without funding, and without a per-holding cost estimate is a modeled risk, not a settled decision.

**Under consideration for V1:**
- **Flat with a holdings cap** (e.g., "$X/mo, up to N holdings tracked") — bounds worst-case cost, still differentiates from MyThesis's uncapped-per-holding metering. Current leading candidate absent a cost model.
- **Flat with monitoring-frequency throttling** — controls cost without capping holdings, but conflicts with the "faster than MyThesis" differentiator above.
- **True flat/unlimited** — only viable once per-holding LLM cost (tokens/call × calls/month × $/token) is modeled, or gated via ToS-level fair use rather than technical enforcement.

**V0 reference pricing (deprecated, retained for historical comparison):**

| Tier | Queries | Price | Notes |
|---|---|---|---|
| Free | 3 lifetime | $0 | No credit card required |
| Pro Monthly | 50 / mo | $19/mo | PDF export, full history, sentiment — resets each billing cycle |
| Pro Annual | 50 / mo | $149/yr | Effective $12/mo (UI) · $12.42/mo (exact) · Save $79/yr |

> For full unit economics, infrastructure cost model, and scaling projections, see [07-pricing.md](./07-pricing.md) — **this file was written against V0's query-metered model and needs a corresponding V1 rewrite once the holdings-cap/pricing decision above is resolved.**