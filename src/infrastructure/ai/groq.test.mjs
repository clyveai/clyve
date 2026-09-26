import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { Script } from "node:vm";
import ts from "typescript";

const source = readFileSync(new URL("./groq.ts", import.meta.url), "utf8");
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
  return { choices: [{ finish_reason: "stop", message: { role: "assistant", content }, ...override }] };
}

function loadClient(fetch, options = {}) {
  const module = { exports: {} };
  new Script(compiled, { filename: "groq.ts" }).runInNewContext({
    module,
    exports: module.exports,
    process: { env: { GROQ_API_KEY: options.apiKey ?? "test-private-key", GROQ_MODEL: options.model } },
    Error,
    AbortSignal: options.AbortSignal ?? AbortSignal,
    fetch,
    ...(options.browser ? { window: {} } : {}),
  });
  return module.exports;
}

test("structured requests use server-side bearer authentication and the default model", async () => {
  const client = loadClient(async (url, init) => {
    assert.equal(url, "https://api.groq.com/openai/v1/chat/completions");
    assert.equal(init.method, "POST");
    assert.equal(init.headers.Authorization, "Bearer test-private-key");
    assert.equal(init.headers["Content-Type"], "application/json");
    assert.equal(init.cache, "no-store");
    const payload = JSON.parse(init.body);
    assert.equal(payload.model, "openai/gpt-oss-120b");
    assert.equal(payload.reasoning_effort, "low");
    assert.equal(payload.max_completion_tokens, 2_048);
    assert.deepEqual(payload.messages, [
      { role: "system", content: request.systemPrompt },
      { role: "user", content: request.userPrompt },
    ]);
    assert.deepEqual(payload.response_format, {
      type: "json_schema",
      json_schema: { name: "connection_check", strict: true, schema: jsonSchema },
    });
    return Response.json(completion());
  });
  const result = await client.generateStructuredJson(request);
  assert.equal(result.provider, "groq");
  assert.equal(result.model, "openai/gpt-oss-120b");
  assert.deepEqual(JSON.parse(JSON.stringify(result.data)), { status: "ok" });
});

test("model and completion-token configuration are forwarded explicitly", async () => {
  const client = loadClient(async (_url, init) => {
    const payload = JSON.parse(init.body);
    assert.equal(payload.model, "openai/gpt-oss-20b");
    assert.equal(payload.max_completion_tokens, 4_096);
    return Response.json(completion());
  }, { model: "openai/gpt-oss-20b" });
  assert.equal((await client.generateStructuredJson({ ...request, maxCompletionTokens: 4_096 })).model, "openai/gpt-oss-20b");
});

test("missing or unsafe configuration fails before a request", async () => {
  for (const options of [
    { apiKey: " " },
    { apiKey: "key\nheader" },
    { apiKey: "x".repeat(513) },
    { model: "model\nheader" },
    { browser: true },
  ]) {
    const client = loadClient(() => assert.fail("fetch must not run"), options);
    await assert.rejects(client.generateStructuredJson(request), (error) => error instanceof client.GroqClientError && error.code === "config");
  }
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
    { maxCompletionTokens: 0 },
    { maxCompletionTokens: 4_097 },
    { maxCompletionTokens: 1.5 },
  ]) {
    await assert.rejects(client.generateStructuredJson({ ...request, ...invalid }), (error) => error.code === "config");
  }
});

test("input size includes the schema and is bounded before sending data", async () => {
  const client = loadClient(() => assert.fail("fetch must not run"));
  for (const oversized of [
    { userPrompt: "x".repeat(14_000) },
    { jsonSchema: { ...jsonSchema, description: "x".repeat(14_000) } },
  ]) {
    await assert.rejects(client.generateStructuredJson({ ...request, ...oversized }), (error) => error.code === "input_too_large");
  }
});

test("provider failures are not retried and never reveal response bodies or credentials", async () => {
  for (const [status, code] of [[401, "authentication"], [403, "authentication"], [429, "rate_limit"], [408, "timeout"], [504, "timeout"], [400, "provider"], [503, "provider"]]) {
    let requests = 0;
    const client = loadClient(async () => {
      requests += 1;
      return Response.json({ error: "test-private-key sensitive thesis" }, { status });
    });
    await assert.rejects(client.generateStructuredJson(request), (error) => {
      assert.equal(error.code, code);
      assert.equal(error.message.includes("test-private-key"), false);
      assert.equal(error.message.includes("sensitive thesis"), false);
      return true;
    });
    assert.equal(requests, 1);
  }
});

test("malformed, refused, truncated, and empty outputs are rejected", async () => {
  const payloads = [
    {},
    { choices: [] },
    { choices: [null] },
    { choices: [completion().choices[0], completion().choices[0]] },
    completion("invalid json"),
    completion("null"),
    completion("[]"),
    completion(" "),
    completion("x".repeat(65_537)),
    completion(undefined, { finish_reason: "length" }),
    completion(undefined, { message: { role: "assistant", content: '{"status":"ok"}', refusal: "Cannot comply" } }),
    completion(undefined, { message: { role: "assistant", content: '{"status":"ok"}', tool_calls: [{}] } }),
  ];
  for (const payload of payloads) {
    const client = loadClient(async () => Response.json(payload));
    await assert.rejects(client.generateStructuredJson(request), (error) => error.code === "invalid_response");
  }
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
