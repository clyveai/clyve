export type GroqClientErrorCode =
  | "config"
  | "network"
  | "timeout"
  | "rate_limit"
  | "authentication"
  | "provider"
  | "invalid_response"
  | "input_too_large";

export class GroqClientError extends Error {
  constructor(
    public readonly code: GroqClientErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "GroqClientError";
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
  provider: "groq";
  model: string;
};

const endpoint = "https://api.groq.com/openai/v1/chat/completions";
const defaultModel = "openai/gpt-oss-120b";
export const maxStructuredAiInputCharacters = 14_000;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getConfiguration() {
  if (typeof window !== "undefined") {
    throw new GroqClientError("config", "The AI client can only run on the server.");
  }

  const apiKey = process.env.GROQ_API_KEY?.trim();
  const model = process.env.GROQ_MODEL?.trim() || defaultModel;

  if (!apiKey || apiKey.length > 512 || /\s|[\u0000-\u001f\u007f]/.test(apiKey)) {
    throw new GroqClientError("config", "Set a valid GROQ_API_KEY in the server environment.");
  }

  if (!/^[a-zA-Z0-9][a-zA-Z0-9._/-]{0,127}$/.test(model)) {
    throw new GroqClientError("config", "GROQ_MODEL is not a valid model identifier.");
  }

  return { apiKey, model };
}

function validateRequest(request: StructuredJsonRequest) {
  if (
    typeof request.systemPrompt !== "string" || !request.systemPrompt.trim() ||
    typeof request.userPrompt !== "string" || !request.userPrompt.trim() ||
    typeof request.schemaName !== "string" || !/^[a-zA-Z0-9_-]{1,64}$/.test(request.schemaName) ||
    !isRecord(request.jsonSchema) || request.jsonSchema.type !== "object"
  ) {
    throw new GroqClientError("config", "The structured AI request is invalid.");
  }

  const maxCompletionTokens = request.maxCompletionTokens ?? 2_048;
  if (!Number.isInteger(maxCompletionTokens) || maxCompletionTokens < 1 || maxCompletionTokens > 4_096) {
    throw new GroqClientError("config", "AI output must be limited to between 1 and 4096 tokens.");
  }

  let serializedSchema: string;
  try {
    serializedSchema = JSON.stringify(request.jsonSchema);
  } catch {
    throw new GroqClientError("config", "The structured AI schema must be JSON serializable.");
  }

  if (request.systemPrompt.length + request.userPrompt.length + serializedSchema.length > maxStructuredAiInputCharacters) {
    throw new GroqClientError("input_too_large", "The AI input is too large. Use a smaller evidence batch.");
  }

  return maxCompletionTokens;
}

export function isGroqConfigured(): boolean {
  try {
    getConfiguration();
    return true;
  } catch {
    return false;
  }
}

function statusError(status: number): GroqClientError {
  if (status === 401 || status === 403) {
    return new GroqClientError("authentication", "Groq rejected the API credentials. Check GROQ_API_KEY.");
  }
  if (status === 429) {
    return new GroqClientError("rate_limit", "The Groq rate limit was reached. Try again later.");
  }
  if (status === 408 || status === 504) {
    return new GroqClientError("timeout", "The AI provider timed out. Try again later.");
  }
  return new GroqClientError("provider", "Groq could not complete the structured AI request.");
}

function parseResult(payload: unknown): unknown {
  if (!isRecord(payload) || !Array.isArray(payload.choices) || payload.choices.length !== 1) {
    throw new GroqClientError("invalid_response", "Groq returned an invalid AI response.");
  }

  const choice: unknown = payload.choices[0];
  if (!isRecord(choice) || choice.finish_reason !== "stop" || !isRecord(choice.message)) {
    throw new GroqClientError("invalid_response", "Groq did not return a complete AI response.");
  }

  const message = choice.message;
  if (
    message.role !== "assistant" ||
    (message.refusal !== null && message.refusal !== undefined) ||
    (Array.isArray(message.tool_calls) && message.tool_calls.length > 0) ||
    typeof message.content !== "string" || !message.content.trim() || message.content.length > 65_536
  ) {
    throw new GroqClientError("invalid_response", "Groq did not return usable structured AI output.");
  }

  try {
    const data: unknown = JSON.parse(message.content);
    if (!isRecord(data)) {
      throw new Error();
    }
    return data;
  } catch {
    throw new GroqClientError("invalid_response", "Groq returned invalid structured JSON output.");
  }
}

export async function generateStructuredJson(
  request: StructuredJsonRequest,
): Promise<StructuredJsonResponse> {
  const { apiKey, model } = getConfiguration();
  const maxCompletionTokens = validateRequest(request);
  const signal = AbortSignal.timeout(30_000);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: request.systemPrompt },
          { role: "user", content: request.userPrompt },
        ],
        reasoning_effort: "low",
        max_completion_tokens: maxCompletionTokens,
        response_format: {
          type: "json_schema",
          json_schema: {
            name: request.schemaName,
            strict: true,
            schema: request.jsonSchema,
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
        throw new GroqClientError("timeout", "The AI request timed out. Try again later.");
      }
      throw new GroqClientError("invalid_response", "Groq returned an invalid JSON response.");
    }

    return { data: parseResult(payload), provider: "groq", model };
  } catch (error) {
    if (error instanceof GroqClientError) {
      throw error;
    }
    if (signal.aborted || (error instanceof Error && ["AbortError", "TimeoutError"].includes(error.name))) {
      throw new GroqClientError("timeout", "The AI request timed out. Try again later.");
    }
    throw new GroqClientError("network", "The AI provider could not be reached. Check the server connection.");
  }
}
