export type AiRetryConfig = {
  maxAttempts: number;
  initialBackoffMs: number;
  maxBackoffMs: number;
  backoffMultiplier: number;
};

export type ClaudeConfig = {
  apiKey: string;
  model: string;
  maxOutputTokens: number;
  timeoutMs: number;
  contextLimitTokens: number;
  retry: AiRetryConfig;
};

export type GeminiConfig = {
  apiKey: string;
  model: string;
  maxOutputTokens: number;
  timeoutMs: number;
  contextLimitTokens: number;
  retry: AiRetryConfig;
};

function readEnv(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

function requireEnv(name: string): string {
  const value = readEnv(name);
  if (!value) {
    throw new Error(`${name} is not set`);
  }
  return value;
}

function readPositiveInt(name: string, fallback: number): number {
  const raw = readEnv(name);
  if (!raw) {
    return fallback;
  }

  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`${name} must be a positive integer`);
  }

  return parsed;
}

function readPositiveNumber(name: string, fallback: number): number {
  const raw = readEnv(name);
  if (!raw) {
    return fallback;
  }

  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`${name} must be a positive number`);
  }

  return parsed;
}

/** Shared retry numbers for LLM providers, overridable via `AI_RETRY_*` env vars. */
export function getAiRetryPolicy(): AiRetryConfig {
  return {
    maxAttempts: readPositiveInt("AI_RETRY_MAX_ATTEMPTS", 3),
    initialBackoffMs: readPositiveInt("AI_RETRY_INITIAL_BACKOFF_MS", 500),
    maxBackoffMs: readPositiveInt("AI_RETRY_MAX_BACKOFF_MS", 8_000),
    backoffMultiplier: readPositiveNumber("AI_RETRY_BACKOFF_MULTIPLIER", 2),
  };
}

/** Claude API settings. Throws at import time if the key is missing or malformed. */
export function getClaudeConfig(): ClaudeConfig {
  const apiKey = requireEnv("ANTHROPIC_API_KEY");
  if (!apiKey.startsWith("sk-ant-")) {
    throw new Error("ANTHROPIC_API_KEY is invalid");
  }

  return {
    apiKey,
    model: readEnv("ANTHROPIC_MODEL") ?? "claude-sonnet-4-6",
    maxOutputTokens: readPositiveInt("ANTHROPIC_MAX_OUTPUT_TOKENS", 4_096),
    timeoutMs: readPositiveInt("ANTHROPIC_TIMEOUT_MS", 30_000),
    contextLimitTokens: readPositiveInt("ANTHROPIC_CONTEXT_LIMIT_TOKENS", 180_000),
    retry: getAiRetryPolicy(),
  };
}

/** Gemini Flash API settings. Throws at import time if the key is missing. */
export function getGeminiConfig(): GeminiConfig {
  const apiKey = readEnv("GEMINI_API_KEY") ?? readEnv("GOOGLE_GENERATIVE_AI_API_KEY");
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }

  return {
    apiKey,
    model: readEnv("GEMINI_MODEL") ?? "gemini-2.5-flash",
    maxOutputTokens: readPositiveInt("GEMINI_MAX_OUTPUT_TOKENS", 4_096),
    timeoutMs: readPositiveInt("GEMINI_TIMEOUT_MS", 30_000),
    contextLimitTokens: readPositiveInt("GEMINI_CONTEXT_LIMIT_TOKENS", 900_000),
    retry: getAiRetryPolicy(),
  };
}
