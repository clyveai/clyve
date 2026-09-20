/**
 * Retries transient asynchronous failures with bounded exponential backoff. It
 * has no dependency on an HTTP client or a particular remote provider.
 */

import { HttpError, RateLimitError, TimeoutError } from "./errors";

/** Configuration for bounded exponential retry delays. */
export type RetryConfig = {
  maxAttempts: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
};

function sleep(delayMs: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, delayMs);
  });
}

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === "AbortError";
}

function isRetryable(error: unknown): boolean {
  if (error instanceof TimeoutError || error instanceof RateLimitError) {
    return true;
  }

  if (error instanceof HttpError) {
    if (isAbortError(error.cause)) {
      return false;
    }

    return error.status === undefined || error.status === 429 || error.status >= 500;
  }

  if (isAbortError(error)) {
    return false;
  }

  if (error instanceof Error) {
    return error.name === "TypeError" || error.name === "TimeoutError";
  }

  return false;
}

function getDelayMs(attempt: number, config: RetryConfig): number {
  const exponentialDelay = config.initialDelayMs * config.backoffMultiplier ** (attempt - 1);
  const cappedDelay = Math.min(exponentialDelay, config.maxDelayMs);

  // Jitter prevents concurrent callers from retrying the same failed service in lockstep.
  return Math.round(Math.random() * cappedDelay);
}

/**
 * Runs an asynchronous operation again when it fails due to a transient transport failure.
 *
 * @param fn - The operation to execute.
 * @param config - The maximum attempt count and backoff settings.
 * @returns The value produced by a successful operation.
 * @throws The final non-retryable failure or the final failed retry attempt.
 */
export async function withRetry<T>(fn: () => Promise<T>, config: RetryConfig): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= config.maxAttempts; attempt += 1) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt === config.maxAttempts || !isRetryable(error)) {
        throw error;
      }

      await sleep(getDelayMs(attempt, config));
    }
  }

  throw lastError;
}
