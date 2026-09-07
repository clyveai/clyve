export type GenerateTextInput = {
  prompt: string;
  system?: string;
  maxTokens?: number;
  timeoutMs?: number;
};

export type GenerateTextResult = {
  text: string;
  model: string;
  inputTokens?: number;
  outputTokens?: number;
};

export type GenerateJsonResult<T> = GenerateTextResult & {
  data: T;
};
