import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createRateLimiter } from "./rate-limit";

describe("createRateLimiter", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("throws when maxRequests is not a positive integer", () => {
    expect(() => createRateLimiter({ maxRequests: 0, windowMs: 1_000 })).toThrow(
      "rateLimit.maxRequests must be a positive integer",
    );
    expect(() => createRateLimiter({ maxRequests: -1, windowMs: 1_000 })).toThrow();
    expect(() => createRateLimiter({ maxRequests: 1.5, windowMs: 1_000 })).toThrow();
  });

  it("throws when windowMs is not greater than zero", () => {
    expect(() => createRateLimiter({ maxRequests: 5, windowMs: 0 })).toThrow(
      "rateLimit.windowMs must be greater than zero",
    );
    expect(() => createRateLimiter({ maxRequests: 5, windowMs: -100 })).toThrow();
  });

  it("allows requests immediately while tokens are available", async () => {
    const limiter = createRateLimiter({ maxRequests: 3, windowMs: 1_000 });

    await expect(limiter.acquire()).resolves.toBeUndefined();
    await expect(limiter.acquire()).resolves.toBeUndefined();
    await expect(limiter.acquire()).resolves.toBeUndefined();
  });

  it("blocks once tokens are exhausted and resolves after refill", async () => {
    const limiter = createRateLimiter({ maxRequests: 1, windowMs: 1_000 });

    await limiter.acquire();

    let resolved = false;
    const pending = limiter.acquire().then(() => {
      resolved = true;
    });

    // No time has passed yet; the bucket has no token available.
    await vi.advanceTimersByTimeAsync(0);
    expect(resolved).toBe(false);

    // Advance to just before a full refill; still should not resolve.
    await vi.advanceTimersByTimeAsync(999);
    expect(resolved).toBe(false);

    // Advance past the refill window.
    await vi.advanceTimersByTimeAsync(50);
    await pending;
    expect(resolved).toBe(true);
  });

  it("keeps separate instances fully isolated from each other", async () => {
    const limiterA = createRateLimiter({ maxRequests: 1, windowMs: 1_000 });
    const limiterB = createRateLimiter({ maxRequests: 1, windowMs: 1_000 });

    await limiterA.acquire();

    // A is now exhausted, but B must be unaffected and grant immediately.
    await expect(limiterB.acquire()).resolves.toBeUndefined();

    let aResolved = false;
    const pendingA = limiterA.acquire().then(() => {
      aResolved = true;
    });
    await vi.advanceTimersByTimeAsync(0);
    expect(aResolved).toBe(false);

    await vi.advanceTimersByTimeAsync(1_000);
    await pendingA;
    expect(aResolved).toBe(true);
  });

  it("does not exceed maxRequests capacity even after a long idle period", async () => {
    const limiter = createRateLimiter({ maxRequests: 2, windowMs: 1_000 });

    await limiter.acquire();
    await limiter.acquire();

    // Idle far longer than the refill window; tokens must cap at maxRequests, not overflow.
    await vi.advanceTimersByTimeAsync(10_000);

    await limiter.acquire();
    await limiter.acquire();

    let thirdResolved = false;
    const pending = limiter.acquire().then(() => {
      thirdResolved = true;
    });
    await vi.advanceTimersByTimeAsync(0);
    expect(thirdResolved).toBe(false);

    await vi.advanceTimersByTimeAsync(500);
    await pending;
    expect(thirdResolved).toBe(true);
  });
});
