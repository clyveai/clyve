import { generateText as generateTextSdk, type LanguageModel } from "ai";
import { logger } from "@/infrastructure/logger";
import {
  AIProviderError,
  getRetryAfterMs,
  isTransientProviderError,
  toAIProviderError,
  type AIProviderName,
} from "@/infrastructure/ai/errors";
import { withRetry, type RetryPolicy } from "@/infrastructure/ai/retry";
import { estimatePromptTokens } from "@/infrastructure/ai/tokens";
import type { GenerateJsonResult, GenerateTextInput, GenerateTextResult } from "@/infrastructure/ai/types";

type RunGenerateTextOptions = {
  provider: AIProviderName;
  model: LanguageModel;
  modelId: string;
  input: GenerateTextInput;
  maxOutputTokens: number;
  timeoutMs: number;
  contextLimitTokens: number;
  retry: RetryPolicy;
};

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "unknown error";
}

function parseJsonPayload<T>(text: string): T {
  const stripped = text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "");

  return JSON.parse(stripped) as T;
}

/** Runs a typed text generation call with context-limit check, timeout, and retry. */
export async function runGenerateText(options: RunGenerateTextOptions): Promise<GenerateTextResult> {
  const { provider, model, modelId, input, retry } = options;
  const estimatedTokens = estimatePromptTokens(input);

  if (estimatedTokens > options.contextLimitTokens) {
    throw new AIProviderError({
      code: "context_limit",
      provider,
      message: `${provider === "claude" ? "Claude" : "Gemini"} prompt exceeds the context limit`,
    });
  }

  try {
    const result = await withRetry(
      async () => {
        const generated = await generateTextSdk({
          model,
          system: input.system,
          prompt: input.prompt,
          maxOutputTokens: input.maxTokens ?? options.maxOutputTokens,
          timeout: input.timeoutMs ?? options.timeoutMs,
          maxRetries: 0,
        });

        if (!generated.text.trim()) {
          throw new AIProviderError({
            code: "empty_response",
            provider,
            message: `${provider === "claude" ? "Claude" : "Gemini"} returned an empty response`,
          });
        }

        return generated;
      },
      {
        policy: retry,
        isRetryable: (error) => isTransientProviderError(error),
        retryAfterMs: getRetryAfterMs,
        onRetry: (error, attempt, delayMs) => {
          logger.warn("ai.provider.retry", {
            provider,
            model: modelId,
            attempt,
            delayMs,
            error: errorMessage(error),
          });
        },
      },
    );

    return {
      text: result.text,
      model: modelId,
      inputTokens: result.usage.inputTokens,
      outputTokens: result.usage.outputTokens,
    };
  } catch (error) {
    const mapped = toAIProviderError(error, provider);
    logger.error("ai.provider.failed", {
      provider,
      model: modelId,
      code: mapped.code,
      status: mapped.status,
      error: mapped.message,
    });
    throw mapped;
  }
}

/** Runs text generation then parses the model output as JSON. */
export async function runGenerateJson<T>(
  options: RunGenerateTextOptions,
): Promise<GenerateJsonResult<T>> {
  const result = await runGenerateText(options);

  try {
    return {
      ...result,
      data: parseJsonPayload<T>(result.text),
    };
  } catch (error) {
    const mapped = new AIProviderError({
      code: "malformed_response",
      provider: options.provider,
      message: `${options.provider === "claude" ? "Claude" : "Gemini"} returned malformed JSON`,
      cause: error,
    });
    logger.error("ai.provider.failed", {
      provider: options.provider,
      model: options.modelId,
      code: mapped.code,
      error: mapped.message,
    });
    throw mapped;
  }
}
