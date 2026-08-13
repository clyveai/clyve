## ADR-005: Polar.sh as V1 Payment Infrastructure

**Status:** Accepted
**Date:** 2025

**Context:**
Options evaluated: Stripe, Paddle, Lemon Squeezy, Polar.sh, Midtrans.

| | Stripe | Paddle | Lemon Squeezy | Polar.sh | Midtrans |
|---|---|---|---|---|---|
| MoR (handles global tax) | ❌ | ✅ | ✅ | ✅ | ❌ |
| Monthly fee | ❌ | ❌ | ❌ | ❌ | ❌ |
| Requires international entity | ✅ | Partial | ❌ | ❌ | ❌ |
| Buyer login required | ❌ | ❌ | ❌ | ❌ | N/A |
| Auto email delivery | ❌ | ✅ | ✅ | ✅ | N/A |
| Indonesian founder compatible | ❌ | Partial | ✅ | ✅ | ✅ |
| Subscription billing | ✅ | ✅ | ✅ | ✅ | Limited |
| Developer-first API/DX | Partial | Partial | Partial | ✅ | ❌ |

**Decision:**
Polar.sh for V1 global billing. Midtrans as V2 consideration for local Indonesian users.

**Rationale:**
- Stripe requires an international entity — not viable for Indonesian solo founder pre-incorporation
- Polar.sh: Merchant of Record handles VAT/GST globally, no monthly fees, no buyer login requirement, developer-first API/DX
- Midtrans covers QRIS/VA/e-wallet for IDR-paying users — relevant only if V2 targets local Indonesian market explicitly

**Consequences:**
- Env vars: `POLAR_ACCESS_TOKEN`, `POLAR_WEBHOOK_SECRET`, `NEXT_PUBLIC_POLAR_ORGANIZATION_ID` — see [05-development.md](./05-development.md)
- Fee structure and payout cadence need to be confirmed against Polar's current published rate before finalizing unit economics in [07-pricing.md](./07-pricing.md)
- Payout timing affects the Anthropic spend-cap requirement in ADR-004 — confirm once Polar's fee/payout terms are pulled