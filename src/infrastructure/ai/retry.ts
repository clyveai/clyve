export type RetryPolicy = {
  maxAttempts: number;
  initialBackoffMs: number;
  maxBackoffMs: number;
  backoffMultiplier: number;
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function backoffMs(attempt: number, policy: RetryPolicy): number {
  const exponential = policy.initialBackoffMs * policy.backoffMultiplier ** (attempt - 1);
  const capped = Math.min(exponential, policy.maxBackoffMs);
  const jitter = 0.5 + Math.random() * 0.5;
  return Math.round(capped * jitter);
}

/** Retries `fn` on transient failures using exponential backoff with full jitter. */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    policy: RetryPolicy;
    isRetryable: (error: unknown) => boolean;
    retryAfterMs?: (error: unknown) => number | undefined;
    onRetry: (error: unknown, attempt: number, delayMs: number) => void;
  },
): Promise<T> {
  const { policy, isRetryable, retryAfterMs, onRetry } = options;
  let lastError: unknown;

  for (let attempt = 1; attempt <= policy.maxAttempts; attempt += 1) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      const canRetry = attempt < policy.maxAttempts && isRetryable(error);
      if (!canRetry) {
        throw error;
      }

      const hinted = retryAfterMs?.(error);
      const delayMs =
        hinted !== undefined ? Math.min(hinted, policy.maxBackoffMs) : backoffMs(attempt, policy);

      onRetry(error, attempt, delayMs);
      await sleep(delayMs);
    }
  }

  throw lastError;
}
