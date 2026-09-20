# HTTP transport

This directory provides the generic outbound HTTP transport used by repository adapters. It handles request construction, timeouts, retrying transient failures, and local rate limiting; it does not know any provider, endpoint, response shape, business rule, or cache policy.

Provider-specific clients belong in the owning module's `repositories/` directory, for example `modules/company/repositories/` or `modules/news/repositories/`. Keep provider request paths, credentials, response mapping, and provider rules there.

## Usage

```ts
import { createHttpClient } from "@/infrastructure/http/client";

export const fmpClient = createHttpClient({
  baseUrl: "https://financialmodelingprep.com/api/v3",
  timeoutMs: 10_000,
});
```

## Adding a file

Add a file here only when all of these are true:

- The capability is generic transport infrastructure, not a provider concern.
- More than one provider uses it, or the capability is clearly reusable by transport consumers.
- It does not introduce business rules, provider response models, or module dependencies.

This layer deliberately has no caching, circuit breaker, or request logging/tracing. Those are useful only after a demonstrated need, and adding them preemptively would make the transport harder to understand and operate.
