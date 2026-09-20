/**
 * Defines normalized failures produced by the generic HTTP transport. These
 * errors describe transport concerns only and contain no provider-specific codes.
 */

type HttpErrorOptions = {
  status?: number;
  cause?: unknown;
};

/**
 * A failed HTTP request with the request URL and, when available, its response status.
 *
 * @param message - A transport-level description of the failure.
 * @param url - The complete URL requested.
 * @param options - Optional response status and underlying failure or response body.
 */
export class HttpError extends Error {
  readonly status?: number;
  readonly url: string;
  override readonly cause?: unknown;

  constructor(message: string, url: string, options: HttpErrorOptions = {}) {
    super(message, { cause: options.cause });
    this.name = "HttpError";
    this.status = options.status;
    this.url = url;
    this.cause = options.cause;
  }
}

/**
 * A request that exceeded the configured client timeout.
 *
 * @param message - A transport-level description of the timeout.
 * @param url - The complete URL requested.
 * @param options - Optional underlying abort failure.
 */
export class TimeoutError extends HttpError {
  constructor(message: string, url: string, options: HttpErrorOptions = {}) {
    super(message, url, options);
    this.name = "TimeoutError";
  }
}

/**
 * A response rejected because the remote service imposed a request limit.
 *
 * @param message - A transport-level description of the limit.
 * @param url - The complete URL requested.
 * @param options - Optional response status and parsed response body.
 */
export class RateLimitError extends HttpError {
  constructor(message: string, url: string, options: HttpErrorOptions = {}) {
    super(message, url, options);
    this.name = "RateLimitError";
  }
}
