```markdown
# 03 — Architecture

Clyve follows a **Modular Monolith** with **Domain-Driven Design** principles: one deployable application, strict domain boundaries inside it. This keeps velocity high for a small team while staying safe to hand off to a larger engineering team later — no premature microservices, no unstructured dumping grounds.

**Analogy:**

| Layer | Role |
|---|---|
| `app/` | The waiter who takes the order |
| `modules/` | The chef who cooks the food |
| `infrastructure/` | The kitchen, stove, cooking equipment |
| `shared/` | The plates and glasses everyone uses |
| `jobs/` | Heavy work done behind the scenes |

---

# Top-Level Structure

```text
src/

├── app/                  # Routing & UI composition (the waiter)
├── modules/               # Business domains (the chefs)
├── infrastructure/        # Technology layer (the kitchen)
├── shared/                # Reusable, domain-agnostic code (the plates)
├── providers/             # Global application providers
├── contexts/              # Global React context
├── hooks/                 # Global React hooks
├── config/                # Application configuration
├── types/                 # Global TypeScript types
├── constants/             # Global constants
├── styles/                # Global styling
├── jobs/                  # Background processing (future)
├── middleware.ts           # Request-level guard
└── instrumentation.ts      # Observability entrypoint
```

---

# app/

```text
app/                        # Routing & UI composition layer — the waiter

├── (marketing)/            # Public website: landing, pricing, SEO pages
├── (auth)/                 # Login, register, password recovery
├── (app)/                  # Authenticated product workspace
├── (admin)/                # Internal founder tooling
├── api/                    # Streaming responses & external webhooks only
└── layout.tsx               # Root layout
```

`app/` is the **routing and UI composition layer**. It decides *where* the user is and *what screen* renders — nothing more.

* `page.tsx` — a route's entry UI. Composes components; contains no business logic.
* `layout.tsx` — shared shell for a route segment (nav, providers, structure).
* `route.ts` — API endpoint handler. Used only for streaming (SSE) and webhooks, never general CRUD.
* `_components/` — UI composition pieces local to that route group only (shell, sidebar, navbar). Not a business domain, not reusable outside that group.

**Allowed:** pages, layouts, route handlers for streaming/webhooks, route-group-local UI shells that assemble other components.
**Not allowed:** database queries, AI orchestration, external API integration logic, business calculations. If a route needs a mutation, it calls a Server Action from `modules/*/actions/` — it never writes the logic itself.

### Example — `(app)/`

```text
(app)/

├── dashboard/
├── thesis/
├── settings/
│
├── _components/            # UI shell local to the authenticated app — not a business domain
│
│   ├── app-shell/
│   │   ├── AppShell.tsx      # Overall authenticated layout frame
│   │   ├── Sidebar.tsx        # Left navigation
│   │   ├── Navbar.tsx         # Top bar
│   │   └── SidebarItem.tsx    # Single nav entry
│   │
│   ├── command/
│   │   ├── CommandMenu.tsx    # Cmd+K command palette
│   │   └── CommandItem.tsx    # Single command entry
│   │
│   └── user-menu/
│       ├── UserMenu.tsx        # Account dropdown
│       └── UserAvatar.tsx      # Avatar render
```

Dashboard layout chrome — sidebar, navbar, app shell, command menu, user menu — lives here because it's structural UI for the route group, not a product feature. **Business UI (a thesis card, a company financial chart) never lives here** — it belongs in the owning module's `components/`.

---

# modules/

```text
modules/                    # Business layer — the chefs

├── thesis/                  # Thesis capture, drift monitoring, curated history
├── screening/                # Halal ETF screening
├── company/                 # Company intelligence & financial data
├── filing/                  # SEC filing intelligence
├── news/                    # News intelligence & sentiment
├── auth/                    # Identity & session
├── billing/                 # Subscriptions & revenue
├── dashboard/                # Workspace summaries & widgets
├── admin/                   # Internal operations logic
├── portfolio/                # Portfolio tracking (not in V1)
└── watchlist/                # Watchlists & alerts (not in V1)
```

`modules/` is where **all product logic lives**. Every domain owns everything it needs to function end-to-end — nothing about a domain should be scattered elsewhere.

### Example — `modules/thesis/`

```text
thesis/

├── actions/                 # Server Actions
├── services/                 # Business logic
├── agents/                   # AI agents
├── pipelines/                 # Workflow AI
├── prompts/                   # LLM prompts
├── repositories/               # Database access
├── schemas/                   # Validation
├── components/                 # Domain UI
├── hooks/                     # Domain hooks
└── types.ts
```

* **`actions/`** — the entry point from the UI. Receives the request from a component or form, validates input, and calls `services/`. Contains no business rules or database access of its own.
* **`services/`** — the core business logic. This is where `detectThesisDrift()` or `synthesizeHistoryEntry()` actually live.
* **`repositories/`** — the only place that talks to the database for this domain, through a repository abstraction. No raw queries scattered elsewhere.
* **`components/`** — UI that only makes sense for this domain, e.g. `ThesisDocument.tsx`, `DriftBadge.tsx`. Never moved to `shared/` unless it becomes genuinely generic.

**Example files:**

```
modules/thesis/components/ThesisCard.tsx           # Renders a single thesis status card
modules/thesis/components/DriftBadge.tsx            # Domain-specific status indicator
modules/thesis/services/DetectThesisDrift.ts         # Orchestrates the drift-detection flow
```

**Allowed:** anything that expresses what Clyve *does* as a business — analysis, generation, extraction, calculation, domain UI, domain data access.
**Not allowed:** generic UI primitives (belongs in `shared/`), raw infra clients (belongs in `infrastructure/`).

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
├── gemini.ts                  # Gemini Flash client
└── tokens.ts                  # Token counting
```

**Contains:** API client setup, provider configuration, retry logic, token counting.
**Does not contain:** `detectThesisDrift()`, `analyzeStock()` — those are business logic and belong in `modules/thesis/services/`.

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

```
components/  → Button, Modal, Input
utils/       → formatCurrency, cn, formatDate
```

**Never place here:** `ThesisCard`, `CompanyAnalysis`, `BillingLogic` — anything that implies a domain belongs in that domain's own module.

---

# hooks/

```text
hooks/                      # Global reusable React hooks

├── useDebounce.ts
├── useMediaQuery.ts
└── useClipboard.ts
```

Global hooks with no dependency on any business domain — usable anywhere in the app. A hook that only makes sense for one module (e.g. `useThesisStream`) lives in that module's own `hooks/`, not here.

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
    price: 29,
    limit: 100
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

├── thesis/
├── filing/
├── news/
└── cleanup/
```

Future background work: SEC ingestion, cache warming, scheduled cleanup. Not implemented until V1 has real load.

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
| Thesis Document UI | `modules/thesis/components` |
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
```