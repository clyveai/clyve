export type GeminiClientErrorCode =
  | "config"
  | "network"
  | "timeout"
  | "rate_limit"
  | "authentication"
  | "provider"
  | "invalid_response"
  | "input_too_large";

export class GeminiClientError extends Error {
  constructor(
    public readonly code: GeminiClientErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "GeminiClientError";
  }
}

export type StructuredJsonRequest = {
  systemPrompt: string;
  userPrompt: string;
  schemaName: string;
  jsonSchema: Record<string, unknown>;
  maxCompletionTokens?: number;
};

export type StructuredJsonResponse = {
  data: unknown;
  provider: "gemini";
  model: string;
};

const endpoint = "https://generativelanguage.googleapis.com/v1beta/models";
const defaultModel = "gemini-3.8-flash";
const modelIdentifier = /^gemini-[a-zA-Z0-9._-]+$/;
const maxOutputCharacters = 65_536;
export const maxStructuredAiInputCharacters = 14_000;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isModelIdentifier(value: unknown): value is string {
  return typeof value === "string" && value.length <= 128 && modelIdentifier.test(value);
}

function getConfiguration() {
  if (typeof window !== "undefined") {
    throw new GeminiClientError("config", "The AI client can only run on the server.");
  }

  const apiKey = process.env.GEMINI_API_KEY?.trim();
  const model = process.env.GEMINI_MODEL?.trim() || defaultModel;

  if (!apiKey || apiKey.length > 512 || /\s|[\u0000-\u001f\u007f]/.test(apiKey)) {
    throw new GeminiClientError("config", "Set a valid GEMINI_API_KEY in the server environment.");
  }

  if (!isModelIdentifier(model)) {
    throw new GeminiClientError("config", "GEMINI_MODEL is not a valid Gemini model identifier.");
  }

  return { apiKey, model };
}

function validateRequest(request: StructuredJsonRequest) {
  if (
    !isRecord(request) ||
    typeof request.systemPrompt !== "string" || !request.systemPrompt.trim() ||
    typeof request.userPrompt !== "string" || !request.userPrompt.trim() ||
    typeof request.schemaName !== "string" || !/^[a-zA-Z0-9_-]{1,64}$/.test(request.schemaName) ||
    !isRecord(request.jsonSchema) || request.jsonSchema.type !== "object"
  ) {
    throw new GeminiClientError("config", "The structured AI request is invalid.");
  }

  const maxCompletionTokens = request.maxCompletionTokens ?? 2_048;
  if (!Number.isInteger(maxCompletionTokens) || maxCompletionTokens < 1 || maxCompletionTokens > 8_192) {
    throw new GeminiClientError("config", "AI output must be limited to between 1 and 8192 tokens.");
  }

  let serializedSchema: string;
  try {
    serializedSchema = JSON.stringify(request.jsonSchema);
    if (typeof serializedSchema !== "string") {
      throw new Error();
    }
  } catch {
    throw new GeminiClientError("config", "The structured AI schema must be JSON serializable.");
  }

  if (request.systemPrompt.length + request.userPrompt.length + serializedSchema.length > maxStructuredAiInputCharacters) {
    throw new GeminiClientError("input_too_large", "The AI input is too large. Use a smaller evidence batch.");
  }

  return maxCompletionTokens;
}

export function isGeminiConfigured(): boolean {
  try {
    getConfiguration();
    return true;
  } catch {
    return false;
  }
}

function statusError(status: number): GeminiClientError {
  if (status === 401 || status === 403) {
    return new GeminiClientError("authentication", "Google rejected the API credentials. Check GEMINI_API_KEY and its permissions.");
  }
  if (status === 429) {
    return new GeminiClientError("rate_limit", "The Gemini rate limit was reached. Try again later.");
  }
  if (status === 408 || status === 504) {
    return new GeminiClientError("timeout", "The AI provider timed out. Try again later.");
  }
  if (status === 503) {
    return new GeminiClientError("provider", "Gemini is temporarily unavailable (HTTP 503). Try again later.");
  }
  return new GeminiClientError("provider", `Gemini could not complete the structured AI request (HTTP ${status}).`);
}

function hasBlockedSafetyRatings(value: unknown): boolean {
  if (value === undefined) {
    return false;
  }
  if (!Array.isArray(value)) {
    return true;
  }
  return value.some((rating: unknown) =>
    !isRecord(rating) || rating.blocked === true ||
    (rating.blocked !== undefined && typeof rating.blocked !== "boolean")
  );
}

function parseResult(payload: unknown): unknown {
  if (!isRecord(payload) || !Array.isArray(payload.candidates) || payload.candidates.length !== 1) {
    throw new GeminiClientError("invalid_response", "Gemini returned an invalid AI response.");
  }

  if (payload.promptFeedback !== undefined) {
    const feedback = payload.promptFeedback;
    if (
      !isRecord(feedback) ||
      (feedback.blockReason !== undefined && feedback.blockReason !== "BLOCK_REASON_UNSPECIFIED") ||
      hasBlockedSafetyRatings(feedback.safetyRatings)
    ) {
      throw new GeminiClientError("invalid_response", "Gemini did not return usable structured AI output.");
    }
  }

  const candidate: unknown = payload.candidates[0];
  if (
    !isRecord(candidate) || candidate.finishReason !== "STOP" ||
    hasBlockedSafetyRatings(candidate.safetyRatings) || !isRecord(candidate.content) ||
    candidate.content.role !== "model" || !Array.isArray(candidate.content.parts) ||
    candidate.content.parts.length === 0
  ) {
    throw new GeminiClientError("invalid_response", "Gemini did not return a complete AI response.");
  }

  let content = "";
  const nonTextFields = [
    "inlineData", "fileData", "functionCall", "functionResponse", "executableCode",
    "codeExecutionResult", "toolCall", "toolResponse",
  ];
  for (const part of candidate.content.parts) {
    if (
      !isRecord(part) || nonTextFields.some((field) => part[field] !== undefined) ||
      (part.thought !== undefined && typeof part.thought !== "boolean") ||
      (part.text !== undefined && typeof part.text !== "string")
    ) {
      throw new GeminiClientError("invalid_response", "Gemini did not return usable structured AI output.");
    }
    if (part.thought === true) {
      continue;
    }
    if (typeof part.text !== "string") {
      throw new GeminiClientError("invalid_response", "Gemini did not return usable structured AI output.");
    }
    content += part.text;
    if (content.length > maxOutputCharacters) {
      throw new GeminiClientError("invalid_response", "Gemini returned oversized structured AI output.");
    }
  }

  if (!content.trim()) {
    throw new GeminiClientError("invalid_response", "Gemini did not return usable structured AI output.");
  }

  try {
    const data: unknown = JSON.parse(content);
    if (!isRecord(data)) {
      throw new Error();
    }
    return data;
  } catch {
    throw new GeminiClientError("invalid_response", "Gemini returned invalid structured JSON output.");
  }
}

export async function generateStructuredJson(
  request: StructuredJsonRequest,
): Promise<StructuredJsonResponse> {
  const { apiKey, model } = getConfiguration();
  const maxCompletionTokens = validateRequest(request);
  const signal = AbortSignal.timeout(30_000);

  try {
    const response = await fetch(`${endpoint}/${model}:generateContent`, {
      method: "POST",
      headers: {
        "x-goog-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: request.systemPrompt }] },
        contents: [{ role: "user", parts: [{ text: request.userPrompt }] }],
        generationConfig: {
          maxOutputTokens: maxCompletionTokens,
          thinkingConfig: { thinkingLevel: "low" },
          responseFormat: {
            text: { mimeType: "APPLICATION_JSON", schema: request.jsonSchema },
          },
        },
      }),
      cache: "no-store",
      signal,
    });

    if (!response.ok) {
      throw statusError(response.status);
    }

    let payload: unknown;
    try {
      payload = await response.json();
    } catch (error) {
      if (signal.aborted || (error instanceof Error && ["AbortError", "TimeoutError"].includes(error.name))) {
        throw new GeminiClientError("timeout", "The AI request timed out. Try again later.");
      }
      throw new GeminiClientError("invalid_response", "Gemini returned an invalid JSON response.");
    }

    const data = parseResult(payload);
    const responseModel = isRecord(payload) && isModelIdentifier(payload.modelVersion)
      ? payload.modelVersion
      : model;
    return { data, provider: "gemini", model: responseModel };
  } catch (error) {
    if (error instanceof GeminiClientError) {
      throw error;
    }
    if (signal.aborted || (error instanceof Error && ["AbortError", "TimeoutError"].includes(error.name))) {
      throw new GeminiClientError("timeout", "The AI request timed out. Try again later.");
    }
    throw new GeminiClientError("network", "The AI provider could not be reached. Check the server connection.");
  }
}
