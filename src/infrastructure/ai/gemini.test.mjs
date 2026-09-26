import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { Script } from "node:vm";
import ts from "typescript";

const source = readFileSync(new URL("./gemini.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS },
}).outputText;
const jsonSchema = {
  type: "object",
  properties: { status: { type: "string", enum: ["ok"] } },
  required: ["status"],
  additionalProperties: false,
};
const request = {
  systemPrompt: "Return a structured response.",
  userPrompt: "Check the connection.",
  schemaName: "connection_check",
  jsonSchema,
};

function completion(content = '{"status":"ok"}', override = {}) {
  return {
    candidates: [{
      finishReason: "STOP",
      content: { role: "model", parts: [{ text: content }] },
      ...override,
    }],
  };
}

function loadClient(fetch, options = {}) {
  const module = { exports: {} };
  new Script(compiled, { filename: "gemini.ts" }).runInNewContext({
    module,
    exports: module.exports,
    process: {
      env: options.env ?? {
        GEMINI_API_KEY: options.apiKey ?? "test-private-key",
        GEMINI_MODEL: options.model,
      },
    },
    Error,
    AbortSignal: options.AbortSignal ?? AbortSignal,
    fetch,
    ...(options.browser ? { window: {} } : {}),
  });
  return module.exports;
}

test("structured requests use a server-side key header and the default Gemini model", async () => {
  const client = loadClient(async (url, init) => {
    assert.equal(url, "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent");
    assert.equal(url.includes("test-private-key"), false);
    assert.equal(init.method, "POST");
    assert.equal(init.headers["x-goog-api-key"], "test-private-key");
    assert.equal(init.headers["Content-Type"], "application/json");
    assert.equal(init.headers.Authorization, undefined);
    assert.equal(init.cache, "no-store");
    const payload = JSON.parse(init.body);
    assert.deepEqual(payload.systemInstruction, { parts: [{ text: request.systemPrompt }] });
    assert.deepEqual(payload.contents, [{ role: "user", parts: [{ text: request.userPrompt }] }]);
    assert.deepEqual(payload.generationConfig, {
      maxOutputTokens: 2_048,
      thinkingConfig: { thinkingLevel: "low" },
      responseFormat: { text: { mimeType: "APPLICATION_JSON", schema: jsonSchema } },
    });
    assert.equal(payload.tools, undefined);
    assert.equal(payload.cachedContent, undefined);
    assert.equal(payload.model, undefined);
    assert.equal(init.body.includes("test-private-key"), false);
    return Response.json(completion());
  });
  const result = await client.generateStructuredJson(request);
  assert.equal(result.provider, "gemini");
  assert.equal(result.model, "gemini-3.8-flash");
  assert.deepEqual(JSON.parse(JSON.stringify(result.data)), { status: "ok" });
});

test("Gemini 3.8 requests omit unsupported sampling and minimal thinking parameters", async () => {
  const client = loadClient(async (_url, init) => {
    const config = JSON.parse(init.body).generationConfig;
    for (const key of ["temperature", "topP", "topK", "candidateCount", "responseMimeType", "responseSchema", "responseJsonSchema"]) {
      assert.equal(config[key], undefined);
    }
    assert.equal(config.thinkingConfig.thinkingBudget, undefined);
    assert.equal(config.thinkingConfig.thinkingLevel, "low");
    return Response.json(completion());
  });
  await client.generateStructuredJson(request);
});

test("configured model and completion-token limits are forwarded explicitly", async () => {
  const client = loadClient(async (url, init) => {
    assert.equal(url, "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.7-flash:generateContent");
    assert.equal(JSON.parse(init.body).generationConfig.maxOutputTokens, 8_192);
    return Response.json(completion());
  }, { model: "gemini-3.7-flash" });
  assert.equal((await client.generateStructuredJson({ ...request, maxCompletionTokens: 8_192 })).model, "gemini-3.7-flash");
});

test("only a safe Gemini model version is returned as provenance", async () => {
  for (const [modelVersion, expected] of [
    ["gemini-3.8-flash-001", "gemini-3.8-flash-001"],
    ["test-private-key sensitive thesis", "gemini-3.8-flash"],
    ["gemini-3.8-flash/../../secret", "gemini-3.8-flash"],
    ["gemini-" + "x".repeat(129), "gemini-3.8-flash"],
    [null, "gemini-3.8-flash"],
    [123, "gemini-3.8-flash"],
  ]) {
    const client = loadClient(async () => Response.json({ ...completion(), modelVersion }));
    assert.equal((await client.generateStructuredJson(request)).model, expected);
  }
});

test("missing or unsafe configuration fails before a request", async () => {
  for (const options of [
    { env: {} },
    { env: { GROQ_API_KEY: "other-private-key", GOOGLE_API_KEY: "other-google-key" } },
    { apiKey: " " },
    { apiKey: "key\nheader" },
    { apiKey: "x".repeat(513) },
    { model: "model\nheader" },
    { model: "openai/gpt-oss-120b" },
    { model: "gemini-3.8-flash/../../models" },
    { model: "gemini-3.8-flash?key=leaked" },
    { model: "gemini-3.8-flash%2fsecret" },
    { model: "gemini-" },
    { model: "gemini-" + "x".repeat(129) },
    { browser: true },
  ]) {
    const client = loadClient(() => assert.fail("fetch must not run"), options);
    assert.equal(client.isGeminiConfigured(), false);
    await assert.rejects(client.generateStructuredJson(request), (error) => error instanceof client.GeminiClientError && error.code === "config");
  }
});

test("configuration checks do not call the provider or consume quota", () => {
  const client = loadClient(() => assert.fail("fetch must not run"));
  assert.equal(client.isGeminiConfigured(), true);
});

test("invalid prompts, schemas, names, and token limits fail before a request", async () => {
  const cyclicSchema = { type: "object" };
  cyclicSchema.self = cyclicSchema;
  const client = loadClient(() => assert.fail("fetch must not run"));
  for (const invalid of [
    { systemPrompt: " " },
    { userPrompt: "" },
    { schemaName: "not valid" },
    { jsonSchema: { type: "array" } },
    { jsonSchema: cyclicSchema },
    { jsonSchema: { type: "object", toJSON: () => undefined } },
    { maxCompletionTokens: 0 },
    { maxCompletionTokens: 8_193 },
    { maxCompletionTokens: 1.5 },
    { maxCompletionTokens: Number.NaN },
  ]) {
    await assert.rejects(client.generateStructuredJson({ ...request, ...invalid }), (error) => error.code === "config");
  }
  await assert.rejects(client.generateStructuredJson(null), (error) => error.code === "config");
});

test("input size includes the schema and is bounded before sending data", async () => {
  const client = loadClient(() => assert.fail("fetch must not run"));
  assert.equal(client.maxStructuredAiInputCharacters, 14_000);
  for (const oversized of [
    { userPrompt: "x".repeat(14_000) },
    { jsonSchema: { ...jsonSchema, description: "x".repeat(14_000) } },
  ]) {
    await assert.rejects(client.generateStructuredJson({ ...request, ...oversized }), (error) => error.code === "input_too_large");
  }
});

test("provider failures are not retried and never reveal response bodies or credentials", async () => {
  for (const [status, code] of [[401, "authentication"], [403, "authentication"], [429, "rate_limit"], [408, "timeout"], [504, "timeout"], [400, "provider"], [404, "provider"], [503, "provider"]]) {
    let requests = 0;
    const client = loadClient(async () => {
      requests += 1;
      return Response.json({ error: "test-private-key sensitive thesis" }, { status });
    });
    await assert.rejects(client.generateStructuredJson(request), (error) => {
      assert.equal(error.code, code);
      assert.equal(error.message.includes("test-private-key"), false);
      assert.equal(error.message.includes("sensitive thesis"), false);
      if (code === "provider") {
        assert.equal(error.message.includes(`HTTP ${status}`), true);
      }
      if (status === 503) {
        assert.equal(error.message.includes("temporarily unavailable"), true);
      }
      return true;
    });
    assert.equal(requests, 1);
  }
});

test("malformed, truncated, non-model, and empty outputs are rejected", async () => {
  const payloads = [
    {},
    { candidates: [] },
    { candidates: [null] },
    { candidates: [completion().candidates[0], completion().candidates[0]] },
    completion("invalid json"),
    completion("null"),
    completion("[]"),
    completion(" "),
    completion("x".repeat(65_537)),
    completion(undefined, { finishReason: "MAX_TOKENS" }),
    completion(undefined, { finishReason: undefined }),
    completion(undefined, { content: { role: "user", parts: [{ text: '{"status":"ok"}' }] } }),
    completion(undefined, { content: { parts: [{ text: '{"status":"ok"}' }] } }),
    completion(undefined, { content: { role: "model", parts: [] } }),
    completion(undefined, { content: { role: "model", parts: [null] } }),
    completion(undefined, { content: { role: "model", parts: [{ text: 123 }] } }),
    completion(undefined, { content: { role: "model", parts: [{ text: '{"status":"ok"}', thought: "false" }] } }),
  ];
  for (const payload of payloads) {
    const client = loadClient(async () => Response.json(payload));
    await assert.rejects(client.generateStructuredJson(request), (error) => error.code === "invalid_response");
  }
});

test("blocked prompt feedback and candidate safety refusals are rejected", async () => {
  const payloads = [
    { ...completion(), promptFeedback: { blockReason: "SAFETY" } },
    { ...completion(), promptFeedback: { blockReason: "PROHIBITED_CONTENT" } },
    { ...completion(), promptFeedback: { safetyRatings: [{ blocked: true }] } },
    { ...completion(), promptFeedback: null },
    { ...completion(), promptFeedback: { safetyRatings: {} } },
    completion(undefined, { safetyRatings: [{ blocked: true }] }),
    completion(undefined, { safetyRatings: [{ blocked: "true" }] }),
    completion(undefined, { safetyRatings: [null] }),
    ...["SAFETY", "RECITATION", "BLOCKLIST", "SPII", "MALFORMED_RESPONSE", "UNEXPECTED_TOOL_CALL"].map((finishReason) => completion(undefined, { finishReason })),
  ];
  for (const payload of payloads) {
    const client = loadClient(async () => Response.json(payload));
    await assert.rejects(client.generateStructuredJson(request), (error) => error.code === "invalid_response");
  }
});

test("unblocked feedback and safety ratings permit a complete structured answer", async () => {
  const client = loadClient(async () => Response.json({
    ...completion(undefined, { safetyRatings: [{ blocked: false }] }),
    promptFeedback: { blockReason: "BLOCK_REASON_UNSPECIFIED", safetyRatings: [{ blocked: false }] },
  }));
  assert.deepEqual(JSON.parse(JSON.stringify((await client.generateStructuredJson(request)).data)), { status: "ok" });
});

test("thoughts are excluded while ordered answer text parts are joined", async () => {
  const client = loadClient(async () => Response.json(completion(undefined, {
    content: {
      role: "model",
      parts: [
        { thought: true, text: "private reasoning that is not JSON" },
        { thought: true, thoughtSignature: "opaque-private-signature" },
        { text: '{"status":', thoughtSignature: "opaque-private-signature" },
        { text: '"ok"}' },
      ],
    },
  })));
  const result = await client.generateStructuredJson(request);
  assert.deepEqual(JSON.parse(JSON.stringify(result.data)), { status: "ok" });
  assert.equal(JSON.stringify(result).includes("private"), false);
  assert.equal(JSON.stringify(result).includes("signature"), false);
});

test("thought-only output never becomes the structured answer", async () => {
  const client = loadClient(async () => Response.json(completion(undefined, {
    content: { role: "model", parts: [{ thought: true, text: '{"status":"ok"}' }] },
  })));
  await assert.rejects(client.generateStructuredJson(request), (error) => error.code === "invalid_response");
});

test("tool calls and non-text parts cannot be silently ignored", async () => {
  for (const field of ["inlineData", "fileData", "functionCall", "functionResponse", "executableCode", "codeExecutionResult", "toolCall", "toolResponse"]) {
    for (const thought of [true, false]) {
      const client = loadClient(async () => Response.json(completion(undefined, {
        content: { role: "model", parts: [{ [field]: {}, thought }, { text: '{"status":"ok"}' }] },
      })));
      await assert.rejects(client.generateStructuredJson(request), (error) => error.code === "invalid_response");
    }
  }
});

test("answer size is bounded across multiple text parts", async () => {
  const client = loadClient(async () => Response.json(completion(undefined, {
    content: { role: "model", parts: [{ text: "x".repeat(40_000) }, { text: "x".repeat(40_000) }] },
  })));
  await assert.rejects(client.generateStructuredJson(request), (error) => error.code === "invalid_response");
});

test("invalid provider JSON is not retried or leaked", async () => {
  let requests = 0;
  const client = loadClient(async () => {
    requests += 1;
    return new Response("test-private-key not JSON");
  });
  await assert.rejects(client.generateStructuredJson(request), (error) => {
    assert.equal(error.code, "invalid_response");
    assert.equal(error.message.includes("test-private-key"), false);
    return true;
  });
  assert.equal(requests, 1);
});

test("network errors are not retried or echoed", async () => {
  let requests = 0;
  const client = loadClient(async () => {
    requests += 1;
    throw new TypeError("test-private-key sensitive thesis");
  });
  await assert.rejects(client.generateStructuredJson(request), (error) => {
    assert.equal(error.code, "network");
    assert.equal(error.message.includes("test-private-key"), false);
    assert.equal(error.message.includes("sensitive thesis"), false);
    return true;
  });
  assert.equal(requests, 1);
});

test("timeouts are classified during both the request and response body", async () => {
  const signal = AbortSignal.abort();
  const timeout = { timeout(milliseconds) { assert.equal(milliseconds, 30_000); return signal; } };
  for (const fetch of [
    async () => { throw new Error("private timeout detail"); },
    async () => ({ ok: true, json: async () => { throw new Error("private timeout detail"); } }),
  ]) {
    const client = loadClient(fetch, { AbortSignal: timeout });
    await assert.rejects(client.generateStructuredJson(request), (error) => {
      assert.equal(error.code, "timeout");
      assert.equal(error.message.includes("private timeout detail"), false);
      return true;
    });
  }
});

test("the deadline remains active until the response body finishes", async () => {
  const controller = new AbortController();
  let timeout;
  const client = loadClient(async (_url, init) => {
    assert.equal(init.signal, controller.signal);
    return new Response(new ReadableStream({
      start(stream) {
        init.signal.addEventListener("abort", () => stream.error(init.signal.reason), { once: true });
      },
    }));
  }, {
    AbortSignal: {
      timeout(milliseconds) {
        assert.equal(milliseconds, 30_000);
        timeout = setTimeout(() => controller.abort(), 20);
        return controller.signal;
      },
    },
  });
  try {
    await assert.rejects(client.generateStructuredJson(request), (error) => error.code === "timeout");
  } finally {
    clearTimeout(timeout);
  }
});
