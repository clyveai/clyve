import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { Script } from "node:vm";
import ts from "typescript";

const source = readFileSync(new URL("./news-client.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS },
}).outputText;
const from = new Date("2026-09-06T00:00:00Z");
const to = new Date("2026-09-13T00:00:00Z");
const article = {
  id: "article-one",
  title: "NVIDIA announces new products",
  description: null,
  content: "NVIDIA announced new products... [2000 chars]",
  url: "https://publisher.example/news/nvidia",
  publishedAt: "2026-09-12T12:00:00Z",
  source: { name: "Example Publisher" },
};

function loadClient(fetch, options = {}) {
  const module = { exports: {} };
  new Script(compiled, { filename: "news-client.ts" }).runInNewContext({
    module,
    exports: module.exports,
    require: (name) => {
      assert.equal(name, "node:timers/promises");
      return { setTimeout: async () => undefined };
    },
    process: { env: { GNEWS_API_KEY: options.apiKey ?? "test-private-key" } },
    URL,
    URLSearchParams,
    Date,
    SyntaxError,
    AbortSignal: options.AbortSignal ?? AbortSignal,
    fetch,
  });
  return module.exports;
}

test("missing configuration fails before making a request", async () => {
  const client = loadClient(() => assert.fail("fetch must not run"), { apiKey: " " });
  assert.equal(client.isGNewsConfigured(), false);
  await assert.rejects(client.searchGNews("NVIDIA", from, to), client.GNewsRequestError);
});

test("search keeps the key in headers and rejects unsafe or invalid articles", async () => {
  const client = loadClient(async (url, init) => {
    assert.equal(url.origin, "https://gnews.io");
    assert.equal(url.searchParams.has("apikey"), false);
    assert.equal(init.headers["X-Api-Key"], "test-private-key");
    assert.equal(init.cache, "no-store");
    assert.equal(url.searchParams.get("q"), '"NVIDIA" OR "NVDA"');
    assert.equal(url.searchParams.get("lang"), "en");
    assert.equal(url.searchParams.get("max"), "10");
    assert.equal(url.searchParams.get("in"), "title,description");
    assert.equal(url.searchParams.get("nullable"), "image,description,content");
    assert.equal(url.searchParams.get("sortby"), "publishedAt");
    assert.equal(url.searchParams.get("truncate"), "content");
    assert.equal(url.searchParams.get("from"), from.toISOString());
    assert.equal(url.searchParams.get("to"), to.toISOString());
    return Response.json({ articles: [
      article,
      { ...article, id: null, content: null, publishedAt: "2026-09-11T10:00:00Z" },
      { ...article, url: "javascript:alert(1)" },
      { ...article, url: "https://username:password@publisher.example/article" },
      { ...article, publishedAt: "invalid date" },
      { ...article, publishedAt: "2026-02-30T10:00:00Z" },
      { ...article, publishedAt: "2026-09-14T10:00:00Z" },
      { ...article, source: null },
      { ...article, title: " " },
    ] });
  });
  const result = await client.searchGNews('"NVIDIA" OR "NVDA"', from, to);
  assert.equal(result.length, 2);
  assert.equal(result[0].description, null);
  assert.equal(result[0].publisher, "Example Publisher");
  assert.equal(result[0].contentTruncated, true);
  assert.equal(result[1].id, null);
  assert.equal(result[1].content, null);
  assert.equal(result[1].contentTruncated, true);
});

test("a provider cannot return more than ten articles", async () => {
  const client = loadClient(async () => Response.json({ articles: Array(15).fill(article) }));
  assert.equal((await client.searchGNews("NVIDIA", from, to)).length, 10);
});

test("authentication and quota failures are not retried or echoed", async () => {
  for (const status of [401, 403, 429]) {
    let requests = 0;
    const client = loadClient(async () => {
      requests += 1;
      return Response.json({ errors: ["test-private-key"] }, { status });
    });
    await assert.rejects(client.searchGNews("NVIDIA", from, to), (error) => {
      assert.equal(error.status, status);
      assert.equal(error.message.includes("test-private-key"), false);
      return true;
    });
    assert.equal(requests, 1);
  }
});

test("a temporary provider failure is retried only once", async () => {
  let requests = 0;
  const client = loadClient(async () => {
    requests += 1;
    return requests === 1
      ? new Response(null, { status: 503 })
      : Response.json({ articles: [article] });
  });
  assert.equal((await client.searchGNews("NVIDIA", from, to)).length, 1);
  assert.equal(requests, 2);
});

test("network errors are bounded and do not expose their original messages", async () => {
  let requests = 0;
  const client = loadClient(async () => {
    requests += 1;
    throw new TypeError("Request failed with test-private-key");
  });
  await assert.rejects(client.searchGNews("NVIDIA", from, to), (error) => {
    assert.equal(error instanceof client.GNewsRequestError, true);
    assert.equal(error.message.includes("test-private-key"), false);
    return true;
  });
  assert.equal(requests, 2);
});

test("invalid JSON is not retried", async () => {
  let requests = 0;
  const client = loadClient(async () => {
    requests += 1;
    return new Response("invalid json");
  });
  await assert.rejects(client.searchGNews("NVIDIA", from, to), client.GNewsRequestError);
  assert.equal(requests, 1);
});

test("the request deadline remains active while reading the response body", async () => {
  let requests = 0;
  let timeout;
  const controller = new AbortController();
  const client = loadClient(async () => {
    requests += 1;
    return new Response(new ReadableStream({
      start(stream) {
        controller.signal.addEventListener("abort", () => stream.error(controller.signal.reason), { once: true });
      },
    }));
  }, {
    AbortSignal: {
      timeout(milliseconds) {
        assert.equal(milliseconds, 12_000);
        timeout = setTimeout(() => controller.abort(), 20);
        return controller.signal;
      },
    },
  });
  try {
    await assert.rejects(client.searchGNews("NVIDIA", from, to), client.GNewsRequestError);
    assert.equal(requests, 1);
  } finally {
    clearTimeout(timeout);
  }
});
