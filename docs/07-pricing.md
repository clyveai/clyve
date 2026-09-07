# Pricing and Unit Economics, V1 (Final)

> **Status:** Pricing implementation aligned with `pricing.tsx`. The model and margin guardrails are mathematically consistent for monthly pricing. The `$1.40/standard thesis` cost figure is still a planning assumption until we have production telemetry. Don't present it as fact in a pitch deck without this disclaimer.

---

## 0. Design Principles

Five constraints, in priority order when they conflict:

1. **Margin first, growth second.** We're bootstrapped, no investor runway to subsidize unprofitable users. Every plan must be profitable in the base case and the worst case, not just on average.

2. **No surprise bills.** Any model that boosts revenue by counting on users not noticing what they will be charged is rejected.

3. **Prices must be defensible in public.** If someone asks why Professional costs $79, the answer has to come from real cost structure, not from what competitors charge.

4. **Design for revision.** Since COGS is not validated yet, every capacity number needs a formula behind it that can be recalculated once real data comes in, not a hardcoded number we have to re-argue from scratch every time cost changes.

5. **Billing cycle can be selected after plan selection.** V1 presents monthly and annual billing as a secondary choice below the audience selector. Annual billing provides 2 months free, equivalent to up to 17% savings. The primary product decision remains which plan fits the user's needs.

---

## 1. Pricing Structure Overview

Three top-level categories, implemented as an audience switcher:

| Category        | UI label    | Who it is for                                         | Pricing model                          | Launch status |
| --------------- | ----------- | ----------------------------------------------------- | -------------------------------------- | ------------- |
| **Individual**  | Individual  | Self-directed investors, analysts, and individual PMs | Fixed monthly or annual price per plan | Available     |
| **Team & Fund** | Team & Fund | Investment teams, family offices, and small funds     | Custom pricing                         | Coming Soon   |
| **API**         | API         | Developers and platforms building on top of Clyve     | Pricing not yet defined                | Coming Soon   |

The Individual category contains three plans:

| Plan             | Monthly price | Annual billing |
| ---------------- | ------------: | -------------: |
| **Free**         |            $0 |             $0 |
| **Investor**     |        $19/mo |        $190/yr |
| **Professional** |        $79/mo |        $790/yr |

Annual billing is calculated as 10 paid months per year:

```text
Annual total = Monthly price × (12 - 2 free months)
```

The UI displays the annual equivalent monthly price:

```text
Annual equivalent monthly price = round(Annual total / 12)
```

Therefore:

| Plan         | Monthly | Annual total | Displayed annual equivalent |
| ------------ | ------: | -----------: | --------------------------: |
| Investor     |  $19/mo |      $190/yr |                      $16/mo |
| Professional |  $79/mo |      $790/yr |                      $66/mo |

The annual equivalent is rounded for display; the actual annual charge is the annual total.

---

## 2. Unit Definitions

### Commercial unit, what we sell

```text
1 Active Thesis
```

Kept as the billing unit, not switched to per-holding pricing. Clyve sells conviction, not a watchlist slot.

### Structural constraint

```text
1 Active Thesis = 1 thesis narrative + up to 3 tracked instruments
```

This cap keeps thesis-level economics predictable. One thesis cannot expand from one instrument to an arbitrarily large portfolio while remaining at the same price.

### Free structural constraint

```text
1 Free Thesis = 1 thesis narrative + 1 tracked instrument
```

Free is intentionally narrower than paid plans.

### Internal cost unit

```text
Standard Thesis = 1 thesis, up to 3 instruments, normal event volume
```

Every financial model in this document uses Standard Thesis, not raw thesis.

---

## 3. Target COGS (Unvalidated, Planning Assumption)

| Component                               | Target Cost |
| --------------------------------------- | ----------: |
| Data ingestion                          |       $0.25 |
| Event evaluation                        |       $0.35 |
| AI synthesis                            |       $0.55 |
| Infra allocation                        |       $0.25 |
| **Total per Standard Thesis per month** |   **$1.40** |

Redis caching is mandatory, not an optimization. Event and company data is processed once and reused across users.

**Validation trigger.** After 60 to 90 days of live traffic, measure actual P50, P95, and P99 COGS. All capacity figures in this document get recalculated using the formula in Section 8.

The `$1.40` figure remains an estimate until this telemetry exists.

---

## 4. Guardrail

```text
Target blended gross margin : 80% or higher
Hard floor per plan         : COGS at or below 25% of revenue
```

The core capacity formula is:

```text
Included theses = floor((Price × 0.25) / $1.40)
```

This produces the following monthly capacity:

| Plan         | Monthly Price |                  Formula | Included Theses | Implied COGS Ratio |
| ------------ | ------------: | -----------------------: | --------------: | -----------------: |
| Investor     |           $19 |  19 × 0.25 / 1.40 = 3.39 |           **3** |              22.1% |
| Professional |           $79 | 79 × 0.25 / 1.40 = 14.11 |          **14** |              24.8% |

Professional at $79 therefore supports exactly 14 included theses while remaining inside the 25% COGS ceiling under the $1.40 planning assumption.

### Annual billing caveat

The current implementation offers annual billing at two free months.

Because annual billing reduces effective monthly revenue, the monthly guardrail cannot simply be reused without adjustment.

At the current annual prices:

| Plan         | Annual Revenue Equivalent / Month | 14/3 Thesis COGS | COGS Ratio |
| ------------ | --------------------------------: | ---------------: | ---------: |
| Investor     |                            $15.83 |            $4.20 |      26.5% |
| Professional |                            $65.83 |           $19.60 |      29.8% |

Therefore, **the current annual discount does not satisfy the 25% hard COGS ceiling at full included capacity under the $1.40 assumption**.

This is an implementation/model inconsistency that should be resolved before annual pricing is treated as margin-guardrail compliant. Options are:

1. Reduce annual-plan included capacity.
2. Reduce the annual discount.
3. Accept a lower annual-plan gross margin as a deliberate exception.
4. Revisit the `$1.40` COGS assumption after telemetry.

Do not claim that the 25% hard floor applies unchanged to annual billing until this is resolved.

---

## 5. Individual Plans

### 5.1 Free

```text
FREE

$0

1 active thesis
1 tracked instrument
30 day thesis history
No credit card required
```

Purpose:

Free gives the user the complete product loop without exposing the full paid capacity.

The user can:

* Create one active investment thesis.
* Monitor it continuously.
* See the evidence chain from claim to source to impact.
* Review 30 days of thesis history.
* Experience the product without entering payment information.

The one-instrument restriction is intentional. Giving Free users three instruments per thesis would move their COGS materially closer to the Standard Thesis cost without corresponding revenue.

---

### 5.2 Investor

```text
INVESTOR

$19/mo

3 active theses included
Up to 3 tracked instruments per thesis
Continuous monitoring
Filings, earnings, and news
90 day thesis history
Priority support
Add 5 theses anytime for $35/mo
```

Included capacity is derived from the guardrail:

```text
floor((19 × 0.25) / 1.40)
= floor(3.39)
= 3 theses
```

The add-on is a discrete monthly pack:

```text
Plus 5 Theses = $35/mo
```

Add-on packs are purchased manually. There is no automatic metered overage.

---

### 5.3 Professional

```text
PROFESSIONAL

$79/mo

14 active theses included
Up to 3 tracked instruments per thesis
Everything in Investor, plus:
Portfolio-level intelligence across theses
Data export (CSV)
API access, coming soon
Unlimited thesis history
Priority support
Add 5 theses anytime for $35/mo
```

Included capacity is derived from the guardrail:

```text
floor((79 × 0.25) / 1.40)
= floor(14.11)
= 14 theses
```

Professional is positioned for analysts and PMs running a larger, active research book that needs to stay current.

The pricing page does **not** define a maximum number of add-on packs. Therefore, V1 documentation should not promise a maximum capacity or route a user to Fund Office after a fixed number of packs.

Fund Office remains a separate product category for teams requiring custom capacity and shared intelligence.

---

## 5.4 Individual Plan Summary

```text
FREE

$0/mo

1 active thesis
1 tracked instrument
30 day thesis history
No credit card required

INVESTOR

$19/mo

3 active theses included
Up to 3 instruments per thesis
90 day thesis history
Priority support
Add 5 theses anytime for $35/mo

PROFESSIONAL

$79/mo

14 active theses included
Up to 3 instruments per thesis
Portfolio-level intelligence
Data export (CSV)
API access, coming soon
Unlimited thesis history
Priority support
Add 5 theses anytime for $35/mo
```

---

## 6. Add-On Packs

The product uses discrete add-on packs rather than metered overage.

```text
Plus 5 Theses
$35/mo
```

The principle remains:

* Purchased manually.
* No automatic charge when a threshold is crossed.
* User explicitly confirms the additional monthly cost.
* Extra active theses can be restored by reactivating the pack or upgrading the plan.
* Cancelling an add-on pack archives the associated extra theses as read-only.
* Nothing is deleted.

The current pricing implementation does not define a maximum number of packs per Individual plan. Therefore, no maximum capacity is stated in V1 pricing documentation.

The economics of each pack remain:

```text
5 theses × $1.40 COGS = $7.00 COGS

$35 revenue - $7 COGS = $28 gross profit

Gross margin = 80%
```

This calculation assumes the `$1.40` Standard Thesis planning assumption is accurate.

---

## 7. Feature Comparison

The pricing page exposes the following comparison:

| Feature                      | Free    | Investor  | Professional |
| ---------------------------- | ------- | --------- | ------------ |
| Active theses included       | 1       | 3         | 14           |
| Instruments per thesis       | 1       | Up to 3   | Up to 3      |
| Continuous monitoring        | Yes     | Yes       | Yes          |
| Thesis history               | 30 days | 90 days   | Unlimited    |
| Portfolio-level intelligence | No      | No        | Yes          |
| Data export (CSV)            | No      | No        | Yes          |
| API access                   | No      | No        | Coming soon  |
| Add-on packs                 | No      | $35 per 5 | $35 per 5    |
| Priority support             | No      | Yes       | Yes          |

The comparison table is authoritative for feature availability in V1.

---

## 8. Team & Fund / Fund Office

The pricing page labels this category:

```text
TEAM & FUND
Coming Soon
```

The underlying product positioning remains **Fund Office**.

```text
FUND OFFICE

For investment teams, family offices, and small funds

Custom thesis capacity
Shared visibility across team members
Shared intelligence
Dedicated onboarding
Annual billing
```

The current UI describes Fund Office as:

> For investment teams, family offices, and small funds who need shared visibility over conviction. Custom capacity, shared intelligence, and dedicated onboarding.

Fund Office is not priced using the Individual add-on template.

Pricing is custom and should be derived from actual usage and validated COGS.

### Pricing floor policy

Never quote a Fund Office deal below the economics required by the guardrail for the capacity being sold.

Sales should use the same underlying COGS methodology rather than inventing a discretionary number.

Fund Office is intended for customers whose requirements differ materially from the Individual product, particularly shared visibility and team-level intelligence.

---

## 9. API

The pricing page labels the API category:

```text
API

Coming Soon
```

Current product positioning:

> Build on top of Clyve's thesis monitoring and evidence graph. API access is planned for a future release, Professional customers get priority access at launch.

Planned capabilities:

```text
- Thesis monitoring infrastructure
- Evidence graph access
- Programmatic intelligence
- Built for research workflows
```

API pricing is not yet decided.

Two candidates remain:

1. Per-request pricing.
2. Flat monthly access with rate limits.

The decision should be made after Individual and Fund Office usage data provides a reliable COGS baseline.

Professional customers receive priority access when the API launches.

---

## 10. Repricing Formula

Once production telemetry exists:

```text
New included theses =
floor((Price × Guardrail%) / Actual P95 COGS per thesis)
```

For add-on packs:

```text
New add-on pack price =
Actual COGS per thesis × Pack Size
÷ (1 - Target Margin)
```

Policy when repricing:

If actual COGS comes in higher than `$1.40`, lower included capacity for new customers first rather than immediately raising prices for existing customers.

Existing customers should retain their existing included capacity through an appropriate grandfathering or transition period.

The goal is to preserve pricing trust while allowing the unit economics to evolve with actual telemetry.

---

## 11. Financial Model, Monthly Individual Plans

### Base case: included capacity only

| Plan         | Revenue | Included Theses |   COGS |  Gross | Gross Margin |
| ------------ | ------: | --------------: | -----: | -----: | -----------: |
| Investor     |     $19 |               3 |  $4.20 | $14.80 |        77.9% |
| Professional |     $79 |              14 | $19.60 | $59.40 |        75.2% |

Free is intentionally excluded from gross-margin calculations because it has no revenue.

The Professional plan operates close to the 75% hard floor at full included usage, which is consistent with the pricing formula.

### Add-on economics

| Item                 |    Value |
| -------------------- | -------: |
| Add-on size          | 5 theses |
| Price                |   $35/mo |
| COGS at $1.40/thesis |       $7 |
| Gross profit         |      $28 |
| Gross margin         |      80% |

Because the current UI does not define a maximum pack count, there is no V1 maximum-capacity worst-case table.

---

## 12. Annual Billing

Annual billing is implemented for paid Individual plans.

```text
ANNUAL_MONTHS_FREE = 2
```

Therefore:

```text
Annual total = Monthly price × 10
```

| Plan         | Monthly Price | Annual Total | Effective Monthly Cost | Nominal Saving |
| ------------ | ------------: | -----------: | ---------------------: | -------------: |
| Investor     |           $19 |         $190 |              $15.83/mo |          16.7% |
| Professional |           $79 |         $790 |              $65.83/mo |          16.7% |

The UI displays:

```text
Save up to 17%
```

The annual equivalent displayed to the user is rounded:

| Plan         | Displayed annual equivalent |
| ------------ | --------------------------: |
| Investor     |                      $16/mo |
| Professional |                      $66/mo |

Annual billing is a payment option, not a separate product tier.

**Important unit-economics issue:** at the current 2-month-free discount, the annual plans fall below the 75% gross-margin floor when users consume their full included monthly capacity under the `$1.40` COGS assumption. This needs to be resolved before the annual offer is considered fully guardrail-compliant.

---

## 13. Payment Processing

Merchant of Record:

```text
Polar.sh
5% + $0.50 per transaction
```

For monthly billing:

| Plan         | Revenue |   Fee |    Net |
| ------------ | ------: | ----: | -----: |
| Investor     |     $19 | $1.45 | $17.55 |
| Professional |     $79 | $4.45 | $74.55 |

For annual billing:

| Plan         | Annual Revenue |    Fee |     Net |
| ------------ | -------------: | -----: | ------: |
| Investor     |           $190 | $10.00 | $180.00 |
| Professional |           $790 | $40.00 | $750.00 |

Payment processing is separate from product COGS.

Gross margin calculations above represent product gross margin before payment-processing fees. Internal contribution/net margin reporting should subtract payment-processing fees separately.

---

## 14. Trust and Anti-Scam Safeguards

1. **Real-time usage visibility.** Users should always know how many active theses they are using relative to their plan.

2. **Capacity warning.** Users should receive a warning around 80% of their included capacity before reaching the limit.

3. **Manual add-on purchase.** Add-on packs are purchased explicitly at `$35/mo` per 5 theses. No automatic metered overage.

4. **No destructive downgrade.** Extra theses become read-only/archived when no longer covered by the active plan or add-on. Data is not deleted.

5. **Marketed capacity equals costed capacity.** Capacity claims should remain tied to the same COGS model used for pricing.

6. **Annual pricing must be margin-checked.** The annual discount cannot be assumed to preserve the monthly margin guardrail automatically.

---

## 15. Cancellation and Reactivation Policy

### 15.1 Core principle

A paid subscription pays for active monitoring, not merely data storage.

Monitoring, event evaluation, and AI synthesis are the primary ongoing compute costs. Previously generated thesis text, history, and evidence are substantially cheaper to retain.

Therefore, cancellation should stop active monitoring without unnecessarily deleting historical work.

### 15.2 Cancel vs downgrade

| Action            | Monitoring After        | Theses Still Monitored | Still a plan? |
| ----------------- | ----------------------- | ---------------------: | ------------- |
| Downgrade to Free | Continues at Free level |                      1 | Yes           |
| Cancel entirely   | Stops completely        |                      0 | No            |

Cancelling does not require downgrading to Free first.

Downgrading is a tier change. Cancelling is a service stop.

### 15.3 Account states

| State        | How you get there                    | Monitoring              | Data access                                         | Duration   |
| ------------ | ------------------------------------ | ----------------------- | --------------------------------------------------- | ---------- |
| Active       | Subscribed, in good standing         | Full, per plan capacity | Full read/write                                     | Ongoing    |
| Grace Period | User cancels                         | None                    | Full read-only, all history, export enabled         | 90 days    |
| Dormant      | Grace period expires, no resubscribe | None                    | Free-tier visibility, 1 thesis visible, rest hidden | Indefinite |
| Deleted      | User explicitly requests deletion    | None                    | None                                                | Permanent  |

### 15.4 Flow

```text
ACTIVE
(paying, monitoring on)
    |
    | user cancels
    v
GRACE PERIOD
(90 days, read only, monitoring off,
 full data and export access)
    |                              |
    | resubscribes                 | 90 days pass
    | within window                | no action
    v                              v
ACTIVE                         DORMANT
(resumed, no data loss)        (1 thesis visible,
                               rest hidden,
                               nothing deleted)
                                   |
                                   | resubscribes anytime
                                   v
                                ACTIVE
                              (all data restored)
                                   |
                                   | user explicitly
                                   | requests deletion
                                   v
                                DELETED
                               (permanent)
```

### 15.5 Why this does not break the margin model

Grace Period and Dormant states do not perform active AI synthesis or event evaluation.

They primarily require storage and account access. These costs should therefore remain substantially below the cost of an actively monitored Standard Thesis.

---

## 16. Final Summary

```text
INDIVIDUAL

FREE

$0/mo

1 active thesis
1 tracked instrument
30 day history
No credit card required

INVESTOR

$19/mo

3 active theses included
Up to 3 instruments per thesis
90 day history
Priority support
Add 5 theses anytime for $35/mo

PROFESSIONAL

$79/mo

14 active theses included
Up to 3 instruments per thesis
Portfolio-level intelligence
Data export (CSV)
API access, coming soon
Unlimited thesis history
Priority support
Add 5 theses anytime for $35/mo


TEAM & FUND

FUND OFFICE

Coming Soon

For investment teams, family offices,
and small funds

Custom thesis capacity
Shared visibility
Shared intelligence
Dedicated onboarding
Annual billing


API

Coming Soon

Thesis monitoring infrastructure
Evidence graph access
Programmatic intelligence
Built for research workflows
```

### Current V1 pricing source of truth

The public pricing implementation establishes:

```text
Free         $0
Investor     $19/mo
Professional $79/mo

Annual billing:
2 months free
$190/yr Investor
$790/yr Professional

Add-on:
$35/mo per 5 theses

Free:
1 thesis / 1 instrument / 30 days

Investor:
3 theses / up to 3 instruments / 90 days

Professional:
14 theses / up to 3 instruments / unlimited history

Team & Fund:
Coming Soon

API:
Coming Soon
```

The `$1.40` Standard Thesis COGS remains a planning assumption pending production telemetry. Monthly pricing is consistent with the 25% COGS ceiling at included capacity; the current 2-month annual discount is **not** consistent with that ceiling at full included usage and therefore requires a separate pricing decision before being treated as fully margin-safe.