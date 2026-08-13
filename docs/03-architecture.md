**Allowed:** anything that expresses what Clyve *does* as a business — thesis capture, drift detection, curated synthesis, domain UI, domain data access.
**Not allowed:** generic UI primitives (belongs in `shared/`), raw infra clients (belongs in `infrastructure/`).

### Example — `modules/screening/`

```text
screening/

├── actions/                 # Server Actions
├── services/                 # Compliance ruleset evaluation
├── repositories/               # Database access
├── schemas/                   # Validation
├── components/                 # Domain UI (ScreeningResultTable.tsx, ComplianceBadge.tsx)
├── hooks/
└── types.ts
```

`screening/` is kept as its own module, separate from `thesis/`, because it's a rules-engine (compliance threshold evaluation) rather than an AI-reasoning feature — a different technical shape from thesis drift detection, and standalone enough that it shouldn't be forced into the core domain.

**Allowed:** compliance ruleset logic, screening result generation, domain UI for screening.
**Not allowed:** thesis logic, drift detection — those stay in `thesis/`.

---

# infrastructure/

```text
infrastructure/              # Technology layer — the kitchen

├── ai/                      # LLM provider clients
├── database/                 # Connection, schema, migrations
├── auth/                     # Auth provider/session config
├── payments/                  # Payment provider client
├── cache/                     # Redis client
├── storage/                   # File/object storage client
├── http/                      # HTTP client, retry, rate-limit
├── logger/                    # Application logging
├── security/                  # Encryption, hashing, CSRF
├── env/                       # Environment validation
└── monitoring/                 # Error tracking, tracing
```

`infrastructure/` is the **technology layer**. It answers *"how does the system technically work?"*, never *"what does Clyve do?"*. It contains **no business logic**.

### Example — `ai/`

```text
ai/

├── claude.ts                 # Claude API client
├── gemini.ts                  # Gemini Flash client (fast/cheap drift classification)
└── tokens.ts                  # Token counting
```

**Contains:** API client setup, provider configuration, retry logic, token counting.
**Does not contain:** `detectThesisDrift()`, `synthesizeHistoryEntry()` — those are business logic and belong in `modules/thesis/services/`.

### Example — `payments/`

**Contains:** Polar.sh client setup, webhook signature verification.
**Does not contain:** subscription business rules — those belong in `modules/billing/services/`.

### Example — `database/`

**Contains:** connection client, schema definitions, migrations.
**Does not contain:** business query logic — that belongs in each module's own `repositories/`.

---

# shared/

```text
shared/                     # Reusable, domain-agnostic code — the plates and glasses

├── components/               # Button, Modal, Input
├── hooks/
├── utils/                     # formatCurrency, cn, formatDate
├── constants/
├── types/
├── providers/
└── config/
```

`shared/` contains only code that is **reusable and has no knowledge of any business domain**.

**Example contents:**
components/ → Button, Modal, Input
utils/ → formatCurrency, cn, formatDate

**Never place here:** `ThesisCard`, `ScreeningResultTable`, `BillingLogic` — anything that implies a domain belongs in that domain's own module.

---

# hooks/

```text
hooks/                      # Global reusable React hooks

├── useDebounce.ts
├── useMediaQuery.ts
└── useClipboard.ts
```

Global hooks with no dependency on any business domain — usable anywhere in the app. A hook that only makes sense for one module (e.g. `useThesisDrift`) lives in that module's own `hooks/`, not here.

---

# contexts/

```text
contexts/                   # Global React context

├── ThemeContext.tsx
├── UserContext.tsx
└── AppContext.tsx
```

Application-wide state that many unrelated parts of the app need — theme, current user session, global app state.

**`contexts/` vs. module providers:** `contexts/` holds state with **no domain meaning** — it's infrastructure for the React tree itself (theme, session). A `modules/*/providers/` (if one exists) would hold state scoped to that domain only, e.g. a `ThesisSessionProvider` used only inside the thesis module's UI tree. If a context is only consumed by one module, it does not belong in `contexts/`.

---

# providers/

```text
providers/                  # Global application providers

├── AppProvider.tsx           # Composes all global providers into one
├── QueryProvider.tsx          # React Query client provider
├── ThemeProvider.tsx           # Theme provider
└── index.ts
```

`providers/` is kept separate from `contexts/`: `contexts/` defines the context itself, `providers/` wires the actual application-wide providers together (context providers, React Query, theme, etc.) into a single composition point.

**Flow:**

```text
app/layout.tsx
 │
 ▼
providers/AppProvider.tsx
 │
 ▼
Context + React Query + Theme
```

---

# config/

```text
config/                     # Application configuration

├── site.ts                   # Site metadata (name, url, description)
├── navigation.ts               # Navigation menu structure
├── plans.ts                    # Billing plan definitions
└── feature-flags.ts             # Feature flag toggles
```

Static application configuration — not business logic.

```ts
export const plans = {
  pro: {
    price: 19,
    holdingsCap: 10 // TBD — see docs/07-pricing.md, unresolved
  }
}
```

---

# types/

```text
types/                      # Global TypeScript types

├── api.ts
├── database.ts
├── global.ts
└── next-auth.d.ts
```

For small projects, `shared/types` is enough. For a larger SaaS, root-level `types/` is useful for types that span the entire app rather than a single domain or shared component (API response shapes, database row types, global ambient types, third-party type augmentation).

---

# constants/

```text
constants/                  # Global constants

├── routes.ts
├── permissions.ts
└── limits.ts
```

App-wide constant values that don't belong to any single domain or shared component — similar in spirit to `types/`.

---

# styles/

```text
styles/

├── globals.css
├── variables.css
└── themes.css
```

Global styling only — no component-scoped styles.

---

# jobs/

```text
jobs/                       # Background processing — not used in V1

├── thesis/                  # Periodic drift monitoring, curated history synthesis
├── filing/
├── news/
├── screening/                # Periodic compliance ruleset refresh
└── cleanup/
```

Future background work: SEC ingestion, cache warming, scheduled cleanup, periodic thesis drift checks. Not implemented until V1 has real load.

---

# Server Action Flow

```text
UI
 │
 ▼
modules/*/actions
 │
 ▼
modules/*/services
 │
 ▼
modules/*/repositories
 │
 ▼
infrastructure
 │
 ▼
database
```

A component calls an action → the action validates input and delegates to a service → the service applies business rules and calls a repository → the repository uses `infrastructure/database` to reach Postgres. No layer is skipped.

---

# UI Placement Rule

| UI | Location |
|---|---|
| Marketing Hero | `app/(marketing)/_components` |
| Login Form | `app/(auth)/_components` |
| Sidebar Dashboard | `app/(app)/_components` |
| Thesis Document / Drift Badge | `modules/thesis/components` |
| Screening Result Table | `modules/screening/components` |
| Button | `shared/components` |

Rule of thumb: if the UI is structural to a route group (shell, nav), it lives in that route group's `_components/`. If it expresses a business domain, it lives in that module's `components/`. If it's generic and reusable everywhere, it lives in `shared/components/`.

---

# Dependency Rule

**Allowed:**

```text
app → modules → infrastructure
```

`shared/` can be used by any layer.

**Forbidden:**

```text
shared → modules            # shared must never depend on a business domain
infrastructure → modules     # infrastructure must never depend on business logic
app storing business logic   # app must stay a thin routing/composition layer
```

Dependencies flow one direction only: `app` composes `modules`, `modules` use `infrastructure`. Nothing flows backward.