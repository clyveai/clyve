# Product

## Why Clyve Exists

Traditional financial research is broken for independent investors and serious retail traders. Getting a complete picture of a company — financials, recent news, analyst sentiment, risk factors — requires juggling Bloomberg (if you can afford $24k/year), multiple browser tabs, and hours of manual aggregation.

Clyve solves one problem: **time to insight**.

Clyve is an **information structuring layer** — like having a research analyst who reads everything and hands you the brief. What you do with it is entirely your decision.

---

## What Clyve Is Not

- Not a signal tool
- Not a trading bot
- Not financial advice of any kind
- Not a Bloomberg competitor (yet)

---

## Target Market

**Primary — Serious Retail Investors (Global, English-first)**
Independent investors who do their own due diligence. They already know how to read a balance sheet. They just hate spending 3 hours gathering data before they can start reading it.

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

## Core Features (V1)

| Feature | Description |
|---|---|
| Conversational research interface | Ask about any public US-listed company in natural language |
| Structured output | Executive summary, financials, news, risk factors, analyst consensus |
| Research history | Every analysis saved, searchable, organized in sidebar |
| PDF export | Download any analysis as a clean, shareable report (Pro) |
| News aggregation | Verified headlines with sentiment signal (positive / neutral / negative) |
| Disclaimer system | Non-removable research disclaimer on every output |

---

## Data Sources

| Data Type | Source | Notes |
|---|---|---|
| Financial data (revenue, EPS, P/E, market cap, etc.) | [Financial Modeling Prep](https://financialmodelingprep.com) | Sourced from public company filings |
| News & headlines | [NewsAPI](https://newsapi.org) | Aggregated from verified publishers |
| Company profiles | [Financial Modeling Prep](https://financialmodelingprep.com) | Sector, description, exchange |
| Analyst consensus | [Financial Modeling Prep](https://financialmodelingprep.com) | Public analyst ratings |
| SEC filings (risk factors) | [SEC EDGAR](https://www.sec.gov/cgi-bin/browse-edgar) / [Financial Modeling Prep](https://financialmodelingprep.com) | Public regulatory filings |
| Sentiment analysis | Claude API (inline) | Derived from headline text — no separate ML service in V1 |

**All data is publicly available.** Clyve does not use proprietary data feeds, insider information, or any non-public sources.

---

## Pricing

| Tier | Queries | Price | Notes |
|---|---|---|---|
| Free | 3 lifetime | $0 | No credit card required |
| Pro Monthly | 50 / mo | $19/mo | PDF export, full history, sentiment — resets each billing cycle |
| Pro Annual | 50 / mo | $149/yr | Effective $12/mo (UI) · $12.42/mo (exact) · Save $79/yr |

> For full unit economics, infrastructure cost model, and scaling projections, see [07-pricing.md](./07-pricing.md).