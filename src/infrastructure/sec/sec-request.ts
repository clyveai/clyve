const SEC_REQUEST_TIMEOUT_MS = 8_000;
const SEC_MIN_REQUEST_INTERVAL_MS = 200;
const SEC_MAX_ATTEMPTS = 2;

let requestGate: Promise<void> = Promise.resolve();
let nextRequestAt = 0;

export class SecRequestError extends Error {
  constructor(
    message = "SEC request is unavailable.",
    readonly status: number | null = null,
  ) {
    super(message);
    this.name = "SecRequestError";
  }
}

function getSecUserAgent() {
  const userAgent = process.env.SEC_USER_AGENT?.trim();
  if (!userAgent) {
    throw new SecRequestError("SEC_USER_AGENT is not configured.");
  }

  return userAgent;
}

function delay(milliseconds: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, milliseconds));
}

async function waitForRequestSlot() {
  const previousGate = requestGate;
  let releaseGate: (() => void) | undefined;

  requestGate = new Promise<void>((resolve) => {
    releaseGate = resolve;
  });

  await previousGate;

  const now = Date.now();
  const waitMilliseconds = Math.max(0, nextRequestAt - now);
  nextRequestAt = Math.max(nextRequestAt, now) + SEC_MIN_REQUEST_INTERVAL_MS;
  releaseGate?.();

  if (waitMilliseconds > 0) {
    await delay(waitMilliseconds);
  }
}

function isRetryableStatus(status: number) {
  return status === 429 || status >= 500;
}

function retryDelay(response: Response) {
  const retryAfter = response.headers.get("retry-after")?.trim();
  if (!retryAfter) {
    return 750;
  }

  const seconds = Number(retryAfter);
  if (Number.isFinite(seconds) && seconds >= 0) {
    return Math.min(seconds * 1_000, 10_000);
  }

  const retryAt = Date.parse(retryAfter);
  if (!Number.isNaN(retryAt)) {
    return Math.min(Math.max(0, retryAt - Date.now()), 10_000);
  }

  return 750;
}

async function discardResponse(response: Response) {
  try {
    await response.body?.cancel();
  } catch {
    return;
  }
}

export async function fetchSec(url: string, init: RequestInit = {}) {
  const userAgent = getSecUserAgent();
  let lastError: SecRequestError | null = null;

  for (let attempt = 1; attempt <= SEC_MAX_ATTEMPTS; attempt += 1) {
    await waitForRequestSlot();

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), SEC_REQUEST_TIMEOUT_MS);

    try {
      const headers = new Headers(init.headers);
      headers.set("Accept", headers.get("Accept") ?? "application/json");
      headers.set("Accept-Encoding", headers.get("Accept-Encoding") ?? "gzip, deflate");
      headers.set("User-Agent", userAgent);

      const response = await fetch(url, {
        ...init,
        headers,
        cache: init.cache ?? "no-store",
        signal: controller.signal,
      });

      if (response.ok) {
        return response;
      }

      lastError = new SecRequestError(`SEC request failed with status ${response.status}.`, response.status);

      if (attempt === SEC_MAX_ATTEMPTS || !isRetryableStatus(response.status)) {
        await discardResponse(response);
        throw lastError;
      }

      const waitMilliseconds = retryDelay(response);
      await discardResponse(response);
      await delay(waitMilliseconds);
    } catch (error) {
      if (error instanceof SecRequestError) {
        if (attempt === SEC_MAX_ATTEMPTS || error.status === null || !isRetryableStatus(error.status)) {
          throw error;
        }

        lastError = error;
        await delay(750);
        continue;
      }

      lastError = new SecRequestError();
      if (attempt === SEC_MAX_ATTEMPTS) {
        throw lastError;
      }

      await delay(750);
    } finally {
      clearTimeout(timeout);
    }
  }

  throw lastError ?? new SecRequestError();
}
