import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { getGeminiConfig } from "@/infrastructure/env";
import { AIProviderError } from "@/infrastructure/ai/errors";
import { runGenerateJson, runGenerateText } from "@/infrastructure/ai/generate";
import type { GenerateJsonResult, GenerateTextInput, GenerateTextResult } from "@/infrastructure/ai/types";

const config = getGeminiConfig();

/** Configured Google provider instance for Gemini Flash API calls. */
export const gemini = createGoogleGenerativeAI({
  apiKey: config.apiKey,
});

export type { GenerateJsonResult, GenerateTextInput, GenerateTextResult };
export { AIProviderError };

/** Generates plain text from Gemini Flash without exposing SDK, retry, or provider details to callers. */
export async function generateText(input: GenerateTextInput): Promise<GenerateTextResult> {
  return runGenerateText({
    provider: "gemini",
    model: gemini(config.model),
    modelId: config.model,
    input,
    maxOutputTokens: config.maxOutputTokens,
    timeoutMs: config.timeoutMs,
    contextLimitTokens: config.contextLimitTokens,
    retry: config.retry,
  });
}

/** Generates JSON from Gemini Flash and fails with `malformed_response` if the output is not valid JSON. */
export async function generateJson<T>(input: GenerateTextInput): Promise<GenerateJsonResult<T>> {
  return runGenerateJson<T>({
    provider: "gemini",
    model: gemini(config.model),
    modelId: config.model,
    input,
    maxOutputTokens: config.maxOutputTokens,
    timeoutMs: config.timeoutMs,
    contextLimitTokens: config.contextLimitTokens,
    retry: config.retry,
  });
}
