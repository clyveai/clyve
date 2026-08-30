# Roadmap

## V1 — Thesis Memory Layer
**Scope:** US markets (NYSE/NASDAQ) only · English-first · Single-user subscription

| Item | Status |
|---|---|
| Thesis capture flow (structured: belief, why, invalidation, horizon) | 🔲 In progress |
| Drift monitoring engine (per-assumption, not binary) | 🔲 In progress |
| Status dashboard (bubble/card, color-coded) | 🔲 In progress |
| Curated document history (periodic narrative, not raw feed) | 🔲 In progress |
| Direct SEC filing ingestion (10-K, 10-Q, 8-K) | 🔲 In progress |
| Halal ETF screening (standalone feature) | 🔲 Planned |
| PDF export (Pro tier) | 🔲 Planned |
| Freemium + Pro subscription via Polar sh | 🔲 Planned |
| Sentiment analysis via Claude API (inline) | 🔲 Planned |
| Disclaimer system (non-removable) | 🔲 Planned |
| Landing page + pricing page | 🔲 In progress |

**V1 intentionally excludes:**
- Conversational chatbot interface (deprecated — V0 concept)
- Python ML microservice (see ADR-003)
- Admin panel (Supabase dashboard used instead)
- Non-US markets, crypto, forex
- Broker connect (evaluated, deferred — see below)

---

## V2 — Depth & Expansion
**Trigger:** V1 live + first revenue + validated retention signal

- [ ] Broker connect / auto-sync holdings (differentiator vs. MyThesis's non-functional version — build this properly, not as vaporware)
- [ ] SEC filing expansion (historical backfill and exhibit parsing)
- [ ] Competitor comparison (structured, per-assumption)
- [ ] Portfolio-level cross-thesis reasoning (not just per-ticker)
- [ ] International markets (LSE, SGX, IDX)
- [ ] Python FastAPI microservice for heavier ML workloads

---

## V3 — Intelligence Layer
**Trigger:** Consistent MRR + PMF signal from Pro users

- [ ] Longitudinal behavioral pattern detection (e.g. "you historically underestimate margin compression") — not offered by any identified competitor as of this writing
- [ ] Custom scoring models
- [ ] API access for power users/analysts
- [ ] Non-English market support
