const CHARS_PER_TOKEN = 4;

/** Estimates token count for English text using a 4-character heuristic, shared by Claude and Gemini. */
export function estimateTokens(text: string): number {
  if (!text) {
    return 0;
  }

  return Math.ceil(text.length / CHARS_PER_TOKEN);
}

/** Combines optional system and user prompt text for a pre-call context-limit check. */
export function estimatePromptTokens(input: { prompt: string; system?: string }): number {
  const systemTokens = input.system ? estimateTokens(input.system) : 0;
  return systemTokens + estimateTokens(input.prompt);
}
