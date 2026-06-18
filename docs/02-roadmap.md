# Roadmap

## V1 — Core Research Assistant
**Scope:** US markets (NYSE / NASDAQ) only · English-first · Single-user subscription

| Item | Status |
|---|---|
| Conversational research interface | 🔲 In progress |
| Structured analysis output (financials + news + summary) | 🔲 In progress |
| Research history + sidebar | 🔲 In progress |
| PDF export (Pro tier) | 🔲 Planned |
| Freemium + Pro subscription via Lemon Squeezy | 🔲 Planned |
| Sentiment analysis via Claude API (inline, no Python service) | 🔲 Planned |
| Disclaimer system (non-removable) | 🔲 Planned |
| Landing page + pricing page | 🔲 In progress |

**V1 intentionally excludes:**
- Python ML microservice (deferred — see [ADR-003](./06-decisions.md#adr-003))
- Admin panel (Supabase dashboard used instead)
- Non-US markets
- Crypto, forex

---

## V2 — Depth & Expansion
**Trigger:** V1 live + first revenue + validated retention signal

- [ ] SEC filing deep-dive (10-K / 10-Q full parsing via EDGAR)
- [ ] Competitor comparison (side-by-side structured analysis)
- [ ] Watchlist & price-change alerts
- [ ] International markets (LSE, SGX, IDX)
- [ ] Python FastAPI microservice for heavier ML workloads

---

## V3 — Intelligence Layer
**Trigger:** Consistent MRR + product-market fit signal from Pro users

- [ ] Custom scoring models (user-defined weighting)
- [ ] Portfolio-level research view (multi-ticker aggregation)
- [ ] API access for power users / analysts
- [ ] Non-English market support