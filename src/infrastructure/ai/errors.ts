export type AIProviderName = "claude" | "gemini";

export type AIProviderErrorCode =
  | "timeout"
  | "rate_limit"
  | "empty_response"
  | "malformed_response"
  | "invalid_api_key"
  | "context_limit"
  | "provider_unavailable"
  | "provider_error";

export type AIProviderErrorOptions = {
  code: AIProviderErrorCode;
  provider: AIProviderName;
  message: string;
  retryable?: boolean;
  status?: number;
  cause?: unknown;
};

/** Typed failure from an LLM provider call, never a raw SDK exception. */
export class AIProviderError extends Error {
  readonly code: AIProviderErrorCode;
  readonly provider: AIProviderName;
  readonly retryable: boolean;
  readonly status?: number;

  constructor(options: AIProviderErrorOptions) {
    super(options.message, { cause: options.cause });
    this.name = "AIProviderError";
    this.code = options.code;
    this.provider = options.provider;
    this.retryable = options.retryable ?? false;
    this.status = options.status;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readStatus(error: unknown): number | undefined {
  if (!isRecord(error)) {
    return undefined;
  }

  if (typeof error.statusCode === "number") {
    return error.statusCode;
  }

  if (typeof error.status === "number") {
    return error.status;
  }

  return undefined;
}

function readHeader(error: unknown, name: string): string | undefined {
  if (!isRecord(error) || !isRecord(error.responseHeaders)) {
    return undefined;
  }

  const headers = error.responseHeaders;
  const direct = headers[name] ?? headers[name.toLowerCase()];
  return typeof direct === "string" ? direct : undefined;
}

function isTimeoutError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  return error.name === "TimeoutError" || error.name === "AbortError";
}

/** True when the failure is a rate limit, timeout, or 5xx and worth another attempt. */
export function isTransientProviderError(error: unknown): boolean {
  if (error instanceof AIProviderError) {
    return error.retryable;
  }

  if (isTimeoutError(error)) {
    return true;
  }

  const status = readStatus(error);
  if (status === 429) {
    return true;
  }

  if (status !== undefined && status >= 500 && status < 600) {
    return true;
  }

  if (isRecord(error) && error.isRetryable === true) {
    return true;
  }

  return false;
}

/** Reads `Retry-After` from a provider error when present. */
export function getRetryAfterMs(error: unknown): number | undefined {
  const header = readHeader(error, "retry-after") ?? readHeader(error, "Retry-After");
  if (!header) {
    return undefined;
  }

  const seconds = Number(header);
  if (Number.isFinite(seconds) && seconds >= 0) {
    return seconds * 1_000;
  }

  const dateMs = Date.parse(header);
  if (Number.isNaN(dateMs)) {
    return undefined;
  }

  return Math.max(0, dateMs - Date.now());
}

/** Converts an SDK or runtime failure into `AIProviderError` without leaking SDK types. */
export function toAIProviderError(error: unknown, provider: AIProviderName): AIProviderError {
  if (error instanceof AIProviderError) {
    return error;
  }

  if (isTimeoutError(error)) {
    return new AIProviderError({
      code: "timeout",
      provider,
      message: `${providerLabel(provider)} request timed out`,
      retryable: true,
      cause: error,
    });
  }

  const status = readStatus(error);

  if (status === 401 || status === 403) {
    return new AIProviderError({
      code: "invalid_api_key",
      provider,
      message: `${providerLabel(provider)} API key is missing or invalid`,
      status,
      cause: error,
    });
  }

  if (status === 429) {
    return new AIProviderError({
      code: "rate_limit",
      provider,
      message: `${providerLabel(provider)} rate limited the request`,
      retryable: true,
      status,
      cause: error,
    });
  }

  if (status !== undefined && status >= 500 && status < 600) {
    return new AIProviderError({
      code: "provider_unavailable",
      provider,
      message: `${providerLabel(provider)} is temporarily unavailable`,
      retryable: true,
      status,
      cause: error,
    });
  }

  return new AIProviderError({
    code: "provider_error",
    provider,
    message: `${providerLabel(provider)} request failed`,
    retryable: isTransientProviderError(error),
    status,
    cause: error,
  });
}

function providerLabel(provider: AIProviderName): string {
  return provider === "claude" ? "Claude" : "Gemini";
}
