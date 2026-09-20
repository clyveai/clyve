/**
 * Provides an in-memory, per-client token-bucket request limiter. It controls
 * local request pacing only and does not coordinate limits across processes.
 */

/** Settings for a token bucket's capacity and refill window. */
export type RateLimitConfig = {
  maxRequests: number;
  windowMs: number;
};

/** A limiter that waits until one local request token is available. */
export type RateLimiter = {
  acquire(): Promise<void>;
};

function assertValidConfig(config: RateLimitConfig): void {
  if (!Number.isInteger(config.maxRequests) || config.maxRequests <= 0) {
    throw new Error("rateLimit.maxRequests must be a positive integer");
  }

  if (!Number.isFinite(config.windowMs) || config.windowMs <= 0) {
    throw new Error("rateLimit.windowMs must be greater than zero");
  }
}

/**
 * Creates an isolated token bucket for pacing outbound requests.
 *
 * @param config - The bucket capacity and time to refill that capacity.
 * @returns A limiter whose `acquire` method waits for a request token.
 * @throws Error when the supplied capacity or refill window is invalid.
 */
export function createRateLimiter(config: RateLimitConfig): RateLimiter {
  assertValidConfig(config);

  const refillRate = config.maxRequests / config.windowMs;
  let tokens = config.maxRequests;
  let lastRefillAt = Date.now();

  function refill(): void {
    const now = Date.now();
    const elapsedMs = now - lastRefillAt;
    tokens = Math.min(config.maxRequests, tokens + elapsedMs * refillRate);
    lastRefillAt = now;
  }

  async function acquire(): Promise<void> {
    refill();

    if (tokens >= 1) {
      tokens -= 1;
      return;
    }

    const waitMs = Math.ceil((1 - tokens) / refillRate);
    await new Promise<void>((resolve) => {
      setTimeout(resolve, waitMs);
    });

    return acquire();
  }

  return { acquire };
}
