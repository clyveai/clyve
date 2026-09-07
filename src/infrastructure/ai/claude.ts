import { createAnthropic } from "@ai-sdk/anthropic";
import { getClaudeConfig } from "@/infrastructure/env";
import { AIProviderError } from "@/infrastructure/ai/errors";
import { runGenerateJson, runGenerateText } from "@/infrastructure/ai/generate";
import type { GenerateJsonResult, GenerateTextInput, GenerateTextResult } from "@/infrastructure/ai/types";

const config = getClaudeConfig();

/** Configured Anthropic provider instance for Claude API calls. */
export const claude = createAnthropic({
  apiKey: config.apiKey,
});

export type { GenerateJsonResult, GenerateTextInput, GenerateTextResult };
export { AIProviderError };

/** Generates plain text from Claude without exposing SDK, retry, or provider details to callers. */
export async function generateText(input: GenerateTextInput): Promise<GenerateTextResult> {
  return runGenerateText({
    provider: "claude",
    model: claude(config.model),
    modelId: config.model,
    input,
    maxOutputTokens: config.maxOutputTokens,
    timeoutMs: config.timeoutMs,
    contextLimitTokens: config.contextLimitTokens,
    retry: config.retry,
  });
}

/** Generates JSON from Claude and fails with `malformed_response` if the output is not valid JSON. */
export async function generateJson<T>(input: GenerateTextInput): Promise<GenerateJsonResult<T>> {
  return runGenerateJson<T>({
    provider: "claude",
    model: claude(config.model),
    modelId: config.model,
    input,
    maxOutputTokens: config.maxOutputTokens,
    timeoutMs: config.timeoutMs,
    contextLimitTokens: config.contextLimitTokens,
    retry: config.retry,
  });
}
