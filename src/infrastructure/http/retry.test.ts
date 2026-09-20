import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { HttpError, RateLimitError, TimeoutError } from "./errors";
import { withRetry, type RetryConfig } from "./retry";

const baseConfig: RetryConfig = {
  maxAttempts: 3,
  initialDelayMs: 100,
  maxDelayMs: 1_000,
  backoffMultiplier: 2,
};

describe("withRetry", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // getDelayMs multiplies the capped delay by Math.random(); pin it so
    // delay assertions are deterministic instead of flaky.
    vi.spyOn(Math, "random").mockReturnValue(1);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("returns the result on first success without waiting", async () => {
    const fn = vi.fn().mockResolvedValue("ok");

    await expect(withRetry(fn, baseConfig)).resolves.toBe("ok");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("retries a TimeoutError and eventually succeeds", async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new TimeoutError("timed out", "https://api.test"))
      .mockResolvedValueOnce("ok");

    const promise = withRetry(fn, baseConfig);
    await vi.runAllTimersAsync();

    await expect(promise).resolves.toBe("ok");
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("retries a RateLimitError", async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new RateLimitError("rate limited", "https://api.test", { status: 429 }))
      .mockResolvedValueOnce("ok");

    const promise = withRetry(fn, baseConfig);
    await vi.runAllTimersAsync();

    await expect(promise).resolves.toBe("ok");
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("retries an HttpError with status 429", async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new HttpError("bad", "https://api.test", { status: 429 }))
      .mockResolvedValueOnce("ok");

    const promise = withRetry(fn, baseConfig);
    await vi.runAllTimersAsync();

    await expect(promise).resolves.toBe("ok");
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("retries an HttpError with a 5xx status", async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new HttpError("server error", "https://api.test", { status: 503 }))
      .mockResolvedValueOnce("ok");

    const promise = withRetry(fn, baseConfig);
    await vi.runAllTimersAsync();

    await expect(promise).resolves.toBe("ok");
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("retries an HttpError with no status (network-level failure)", async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new HttpError("network failure", "https://api.test"))
      .mockResolvedValueOnce("ok");

    const promise = withRetry(fn, baseConfig);
    await vi.runAllTimersAsync();

    await expect(promise).resolves.toBe("ok");
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("does not retry an HttpError with a plain 4xx status", async () => {
    const error = new HttpError("bad request", "https://api.test", { status: 400 });
    const fn = vi.fn().mockRejectedValue(error);

    await expect(withRetry(fn, baseConfig)).rejects.toBe(error);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("does not retry an HttpError caused by an AbortError", async () => {
    const abortError = new Error("aborted");
    abortError.name = "AbortError";
    const error = new HttpError("aborted", "https://api.test", { cause: abortError });
    const fn = vi.fn().mockRejectedValue(error);

    await expect(withRetry(fn, baseConfig)).rejects.toBe(error);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("does not retry a bare AbortError", async () => {
    const abortError = new Error("aborted");
    abortError.name = "AbortError";
    const fn = vi.fn().mockRejectedValue(abortError);

    await expect(withRetry(fn, baseConfig)).rejects.toBe(abortError);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("retries a plain TypeError (e.g. fetch network failure)", async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new TypeError("Failed to fetch"))
      .mockResolvedValueOnce("ok");

    const promise = withRetry(fn, baseConfig);
    await vi.runAllTimersAsync();

    await expect(promise).resolves.toBe("ok");
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("does not retry an arbitrary non-retryable Error", async () => {
    const error = new Error("something unexpected");
    const fn = vi.fn().mockRejectedValue(error);

    await expect(withRetry(fn, baseConfig)).rejects.toBe(error);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("stops after maxAttempts and throws the last error", async () => {
    const error = new TimeoutError("timed out", "https://api.test");
    const fn = vi.fn().mockRejectedValue(error);

    const promise = withRetry(fn, baseConfig);
    const assertion = expect(promise).rejects.toBe(error);
    await vi.runAllTimersAsync();
    await assertion;

    expect(fn).toHaveBeenCalledTimes(baseConfig.maxAttempts);
  });

  it("caps the delay at maxDelayMs on later attempts", async () => {
    const config: RetryConfig = {
      maxAttempts: 5,
      initialDelayMs: 100,
      maxDelayMs: 300,
      backoffMultiplier: 10,
    };
    const error = new TimeoutError("timed out", "https://api.test");
    const fn = vi.fn().mockRejectedValue(error);

    const promise = withRetry(fn, config);
    promise.catch(() => {
      // prevent unhandled rejection warnings while timers advance below
    });

    // Math.random is pinned to 1, so delay === cappedDelay exactly.
    // Attempt 1 -> 2: 100ms (uncapped). Attempt 2 -> 3: 300ms (capped from 1000ms).
    await vi.advanceTimersByTimeAsync(100);
    expect(fn).toHaveBeenCalledTimes(2);

    await vi.advanceTimersByTimeAsync(299);
    expect(fn).toHaveBeenCalledTimes(2);

    await vi.advanceTimersByTimeAsync(1);
    expect(fn).toHaveBeenCalledTimes(3);

    await vi.runAllTimersAsync();
    await expect(promise).rejects.toBe(error);
    expect(fn).toHaveBeenCalledTimes(5);
  });
});
