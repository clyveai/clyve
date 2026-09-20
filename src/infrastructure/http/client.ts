/**
 * Creates provider-neutral HTTP clients for module repository adapters. This
 * transport does not know provider endpoints or response shapes, and does not cache responses.
 */

import { HttpError, RateLimitError, TimeoutError } from "./errors";
import { createRateLimiter, type RateLimitConfig, type RateLimiter } from "./rate-limit";
import { type RetryConfig, withRetry } from "./retry";

/** Configuration used to create one isolated HTTP client instance. */
export type HttpClientConfig = {
  baseUrl: string;
  timeoutMs?: number;
  retry?: RetryConfig;
  rateLimit?: RateLimitConfig;
  headers?: Record<string, string>;
};

/** Per-request options for headers, URL query values, and cancellation. */
export type RequestOpts = {
  headers?: Record<string, string>;
  query?: Record<string, string | number | boolean | null | undefined>;
  signal?: AbortSignal;
};

/** The constrained HTTP methods available to repository adapters. */
export type HttpClient = {
  get<T>(path: string, options?: RequestOpts): Promise<T>;
  post<T>(path: string, body: unknown, options?: RequestOpts): Promise<T>;
};

const DEFAULT_TIMEOUT_MS = 10_000;
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  initialDelayMs: 500,
  maxDelayMs: 8_000,
  backoffMultiplier: 2,
};

function buildUrl(baseUrl: string, path: string, query: RequestOpts["query"]): string {
  const normalizedBaseUrl = baseUrl.replace(/\/+$/, "");
  const normalizedPath = path.replace(/^\/+/, "");
  const url = new URL(`${normalizedBaseUrl}/${normalizedPath}`);

  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, String(value));
    }
  }

  return url.toString();
}

async function parseResponseBody(response: Response): Promise<unknown> {
  const body = await response.text();
  if (body.length === 0) {
    return undefined;
  }

  try {
    return JSON.parse(body) as unknown;
  } catch {
    return body;
  }
}

function createRequestHeaders(
  staticHeaders: Record<string, string> | undefined,
  requestHeaders: Record<string, string> | undefined,
  hasBody: boolean,
): Headers {
  const headers = new Headers({ ...staticHeaders, ...requestHeaders });

  if (hasBody && !headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }

  return headers;
}

function toRequestError(error: unknown, url: string, timedOut: boolean): HttpError {
  if (error instanceof HttpError) {
    return error;
  }

  if (timedOut) {
    return new TimeoutError("HTTP request timed out", url, { cause: error });
  }

  return new HttpError("HTTP request failed", url, { cause: error });
}

function assertValidClientConfig(config: HttpClientConfig): void {
  new URL(config.baseUrl);

  if (config.timeoutMs !== undefined && (!Number.isFinite(config.timeoutMs) || config.timeoutMs <= 0)) {
    throw new Error("timeoutMs must be greater than zero");
  }
}

/**
 * Creates a provider-neutral client with independent timeout, retry, and rate-limit state.
 *
 * @param config - The remote base URL and optional transport settings.
 * @returns A client exposing generic `get` and `post` methods.
 * @throws Error when the base URL or timeout configuration is invalid.
 * @example
 * ```ts
 * const fmpClient = createHttpClient({
 *   baseUrl: "https://financialmodelingprep.com/api/v3",
 *   timeoutMs: 10_000,
 * });
 * ```
 */
export function createHttpClient(config: HttpClientConfig): HttpClient {
  assertValidClientConfig(config);

  const timeoutMs = config.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const retryConfig = config.retry ?? DEFAULT_RETRY_CONFIG;
  const limiter: RateLimiter | undefined = config.rateLimit
    ? createRateLimiter(config.rateLimit)
    : undefined;

  async function request<T>(
    method: "GET" | "POST",
    path: string,
    body: unknown | undefined,
    options: RequestOpts = {},
  ): Promise<T> {
    const url = buildUrl(config.baseUrl, path, options.query);
    const headers = createRequestHeaders(config.headers, options.headers, body !== undefined);

    return withRetry(async () => {
      await limiter?.acquire();

      const controller = new AbortController();
      let timedOut = false;
      const abortForCaller = (): void => controller.abort();
      const timeoutId = setTimeout(() => {
        timedOut = true;
        controller.abort();
      }, timeoutMs);

      options.signal?.addEventListener("abort", abortForCaller, { once: true });
      if (options.signal?.aborted) {
        controller.abort();
      }

      try {
        const response = await fetch(url, {
          method,
          headers,
          body: body === undefined ? undefined : JSON.stringify(body),
          signal: controller.signal,
        });
        const parsedBody = await parseResponseBody(response);

        if (!response.ok) {
          if (response.status === 429) {
            throw new RateLimitError("HTTP request was rate limited", url, {
              status: response.status,
              cause: parsedBody,
            });
          }

          throw new HttpError("HTTP request returned an unsuccessful response", url, {
            status: response.status,
            cause: parsedBody,
          });
        }

        return parsedBody as T;
      } catch (error) {
        throw toRequestError(error, url, timedOut);
      } finally {
        clearTimeout(timeoutId);
        options.signal?.removeEventListener("abort", abortForCaller);
      }
    }, retryConfig);
  }

  return {
    /**
     * Sends a GET request and parses its response body.
     *
     * @param path - The path relative to this client's base URL.
     * @param options - Optional request headers, query values, and cancellation signal.
     * @returns The parsed response as the caller-provided type.
     * @throws HttpError, TimeoutError, or RateLimitError when the request cannot succeed.
     */
    get<T>(path: string, options?: RequestOpts): Promise<T> {
      return request<T>("GET", path, undefined, options);
    },
    /**
     * Sends a JSON POST request and parses its response body.
     *
     * @param path - The path relative to this client's base URL.
     * @param body - The value to serialize as a JSON request body.
     * @param options - Optional request headers, query values, and cancellation signal.
     * @returns The parsed response as the caller-provided type.
     * @throws HttpError, TimeoutError, or RateLimitError when the request cannot succeed.
     */
    post<T>(path: string, body: unknown, options?: RequestOpts): Promise<T> {
      return request<T>("POST", path, body, options);
    },
  };
}
