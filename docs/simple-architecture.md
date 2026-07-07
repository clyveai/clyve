```text
src/

├── app/                          # Routing layer (URL, pages, layouts, API endpoints)
│   │                             # Tidak menyimpan business logic
│   │                             # Tidak menyimpan query database
│   │                             # Tidak menyimpan AI logic
│   │
│   ├── (marketing)/             # Public website
│   │   │                        # Landing page
│   │   │                        # Pricing
│   │   │                        # SEO pages
│   │   │                        # Blog (future)
│   │   │
│   │   ├── page.tsx
│   │   ├── pricing/
│   │   ├── about/
│   │   ├── terms/
│   │   ├── privacy/
│   │   └── layout.tsx
│   │
│   ├── (auth)/                  # Authentication routes
│   │   │                        # Login
│   │   │                        # Register
│   │   │                        # Password recovery
│   │   │
│   │   ├── login/
│   │   ├── register/
│   │   ├── forgot-password/
│   │   └── layout.tsx
│   │
│   ├── (apps)/                  # Core SaaS application
│   │   │                        # Protected routes
│   │   │                        # Main user experience
│   │   │
│   │   ├── dashboard/
│   │   ├── research/
│   │   ├── history/
│   │   ├── watchlist/           # Future
│   │   ├── portfolio/           # Future
│   │   ├── settings/
│   │   └── layout.tsx
│   │
│   ├── (admin)/                 # Internal operations panel
│   │   │                        # Not customer-facing
│   │   │                        # Founder/admin tools
│   │   │
│   │   ├── users/
│   │   ├── subscriptions/
│   │   ├── analytics/
│   │   ├── support/
│   │   └── layout.tsx
│   │
│   ├── api/                     # Server endpoints
│   │   │                        # Secure backend execution
│   │   │                        # Used by frontend and future API clients
│   │   │
│   │   ├── auth/
│   │   ├── analyze/
│   │   ├── company/
│   │   ├── filing/
│   │   ├── news/
│   │   ├── billing/
│   │   ├── history/
│   │   ├── export/
│   │   └── webhooks/
│   │
│   └── layout.tsx               # Root application layout
│
│
├── features/                     # Business domain layer
│   │                            # Seluruh logic aplikasi hidup di sini
│   │                            # Folder paling penting di project
│   │
│   ├── auth/                    # Authentication domain
│   │   │
│   │   ├── actions/             # Login/logout actions
│   │   ├── services/            # Auth services
│   │   ├── validation/          # Zod validation
│   │   ├── components/          # Auth UI
│   │   ├── hooks/
│   │   └── types/
│   │
│   ├── research/                # Core AI research engine
│   │   │
│   │   ├── actions/             # Research execution
│   │   ├── services/            # Research orchestration
│   │   ├── prompts/             # LLM prompts
│   │   ├── pipelines/           # Multi-step AI workflows
│   │   ├── cache/               # Research cache
│   │   ├── components/          # Research UI
│   │   ├── hooks/
│   │   └── types/
│   │
│   ├── company/                 # Company intelligence
│   │   │
│   │   ├── services/            # FMP integrations
│   │   ├── cache/               # Company cache
│   │   ├── transformers/        # Normalize API responses
│   │   ├── components/
│   │   └── types/
│   │
│   ├── filing/                  # SEC filing system
│   │   │
│   │   ├── services/            # Filing retrieval
│   │   ├── parsers/             # 10-K / 10-Q parsing
│   │   ├── extractors/          # Risk factors extraction
│   │   ├── cache/
│   │   ├── components/
│   │   └── types/
│   │
│   ├── news/                    # News intelligence
│   │   │
│   │   ├── services/            # News providers
│   │   ├── sentiment/           # Sentiment scoring
│   │   ├── cache/
│   │   ├── components/
│   │   └── types/
│   │
│   ├── billing/                 # Revenue system
│   │   │
│   │   ├── services/            # Lemon/Paddle integration
│   │   ├── subscriptions/
│   │   ├── webhooks/
│   │   ├── components/
│   │   └── types/
│   │
│   ├── dashboard/               # User workspace
│   │   │
│   │   ├── widgets/
│   │   ├── cards/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── types/
│   │
│   ├── admin/                   # Internal management tools
│   │   │
│   │   ├── users/
│   │   ├── analytics/
│   │   ├── subscriptions/
│   │   ├── reports/
│   │   └── components/
│   │
│   ├── portfolio/               # Future
│   │
│   ├── watchlist/               # Future
│   │
│   └── api-platform/            # Future public API business
│
│
├── shared/                      # Global reusable code
│   │                            # Tidak boleh berisi logic bisnis
│   │
│   ├── components/              # Generic UI
│   │   │
│   │   ├── button/
│   │   ├── input/
│   │   ├── dialog/
│   │   ├── modal/
│   │   ├── table/
│   │   └── dropdown/
│   │
│   ├── hooks/                   # Generic reusable hooks
│   │
│   ├── utils/                   # Pure utility functions
│   │
│   ├── constants/               # Application constants
│   │
│   ├── config/                  # Global configuration
│   │
│   └── types/                   # Shared types
│
│
├── database/                    # Database layer
│   │                            # Semua akses database terpusat
│   │
│   ├── schema/                  # Drizzle schemas
│   │
│   ├── queries/                 # Read operations
│   │
│   ├── repositories/            # Create/update/delete
│   │
│   ├── migrations/              # Generated migrations
│   │
│   ├── seeds/                   # Seed data
│   │
│   └── index.ts                 # Database connection
│
│
├── lib/                         # Infrastructure layer
│   │                            # Bukan business logic
│   │                            # Bukan AI logic
│   │                            # Bukan database query
│   │                            # Hanya global technical utilities
│   │                            # Yang bisa digunakan lintas domain
│   │
│   ├── ai/                      # LLM client setup
│   │   │                        # Provider abstraction (Claude / Gemini / GPT)
│   │   │                        # Model registry
│   │   │                        # Token counting utilities
│   │   │
│   │   ├── client.ts
│   │   ├── providers.ts
│   │   └── tokens.ts
│   │
│   ├── cache/                   # Upstash Redis client
│   │   │                        # Cache wrappers
│   │   │                        # TTL constants
│   │   │
│   │   ├── client.ts
│   │   ├── keys.ts
│   │   └── ttl.ts
│   │
│   ├── http/                    # HTTP client wrappers
│   │   │                        # Fetch utilities
│   │   │                        # Retry logic
│   │   │                        # Rate limit handling
│   │   │
│   │   ├── client.ts
│   │   └── retry.ts
│   │
│   ├── auth/                    # Better Auth instance
│   │   │                        # Session helpers
│   │   │                        # Auth config
│   │   │
│   │   └── index.ts
│   │
│   ├── env/                     # Environment validation
│   │   │                        # Zod env schema
│   │   │                        # Type-safe env access
│   │   │
│   │   └── index.ts
│   │
│   ├── logger/                  # Structured logging
│   │   │                        # Log levels
│   │   │                        # Log formatting
│   │   │
│   │   └── index.ts
│   │
│   ├── rate-limit/              # Request rate limiting
│   │   │                        # Per-user / per-IP limits
│   │   │                        # API quota enforcement
│   │   │
│   │   └── index.ts
│   │
│   └── errors/                  # Global error handling
│       │                        # Custom error classes
│       │                        # Error serialization
│       │
│       ├── types.ts
│       └── handler.ts
│
│
├── jobs/                        # Future background workers
│   │                            # Belum digunakan di V1
│   │
│   ├── research/
│   ├── filing/
│   ├── news/
│   └── cleanup/
│
│
├── cache/                       # Future centralized caching
│   │                            # Redis / Upstash
│   │
│   ├── company/
│   ├── filing/
│   ├── research/
│   └── news/
│
│
├── styles/                      # Global styling
│   │
│   ├── globals.css
│   ├── themes.css
│   └── variables.css
│
│
├── middleware.ts                # Route protection
│                                # Auth checks
│                                # Security rules
│                                # Request filtering
│
└── instrumentation.ts           # Future observability
                                 # Analytics
                                 # Monitoring
                                 # Tracing
```

Untuk Clyve yang targetnya **equity research platform jangka panjang**, ini kira-kira arsitektur yang masih masuk akal sampai:

* 50k–100k user
* tim 5–10 engineer
* SEC filing ingestion
* AI research pipeline
* public API
* background jobs
* Redis cache
* tanpa perlu rombak total lagi.

Yang saya **tidak akan lakukan sekarang** adalah membuat:

```text
apps/
packages/
services/
workers/
microservices/
```

karena itu menambah kompleksitas terlalu dini untuk solo founder. Struktur di atas masih **1 repo, 1 deploy, 1 database**, tetapi sudah siap berkembang bertahun-tahun tanpa menjadi berantakan.