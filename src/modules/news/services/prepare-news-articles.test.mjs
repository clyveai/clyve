import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { test } from "node:test";
import { Script } from "node:vm";
import ts from "typescript";

const source = readFileSync(new URL("./prepare-news-articles.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS },
}).outputText;
const module = { exports: {} };
new Script(compiled).runInNewContext({ module, exports: module.exports, require: createRequire(import.meta.url), URL, Date });
const { buildNewsQuery, isCompanyNews, normalizeNewsUrl, prepareNewsArticles } = module.exports;
const target = { id: "test-thesis", ticker: "NVDA", companyName: "NVIDIA CORP", companyCik: "0001045810", status: "active" };
const from = new Date("2026-09-06T00:00:00Z");
const to = new Date("2026-09-13T00:00:00Z");
const article = {
  id: "article-1", title: "NVIDIA announces new products", publisher: "Example News",
  url: "https://example.com/news/nvidia", publishedAt: new Date("2026-09-12T12:00:00Z"),
  description: "NVIDIA will release new semiconductors.", content: "A provider-supplied excerpt...", contentTruncated: true,
};

test("company search handles legal suffixes and avoids bare one-letter tickers", () => {
  assert.equal(buildNewsQuery(target), '("NVIDIA" OR "NVDA")');
  assert.equal(buildNewsQuery({ ticker: "T", companyName: "AT&T INC." }), '("AT&T" OR "$T")');
  assert.ok(buildNewsQuery({ ticker: "TEST", companyName: "A".repeat(300) }).length <= 200);
});

test("company matching distinguishes ambiguous names and qualified tickers", () => {
  assert.equal(isCompanyNews(article, target), true);
  assert.equal(isCompanyNews({ title: "AMD announces products", description: null }, target), false);
  const apple = { ticker: "AAPL", companyName: "Apple Inc." };
  assert.equal(isCompanyNews({ title: "Apple pie recipes for autumn", description: null }, apple), false);
  assert.equal(isCompanyNews({ title: "Apple announces new iPhone", description: null }, apple), true);
  assert.equal(isCompanyNews({ title: "NASDAQ:AAPL releases a new product", description: null }, apple), true);
  assert.equal(isCompanyNews({ title: "NASDAQ:AAPLX releases a new product", description: null }, apple), false);
  assert.equal(isCompanyNews({ title: "Stock prices are on the rise", description: null }, { ticker: "ON", companyName: "ON Semiconductor Corp" }), false);
  assert.equal(isCompanyNews({ title: "Company raises revenue target", description: null }, { ticker: "TGT", companyName: "TARGET CORP" }), false);
  assert.equal(isCompanyNews({ title: "Target expands retail stores", description: null }, { ticker: "TGT", companyName: "TARGET CORP" }), true);
  assert.equal(isCompanyNews({ title: "META ANALYSIS: Company earnings improved", description: null }, { ticker: "META", companyName: "Meta Platforms, Inc." }), false);
  assert.equal(isCompanyNews({ title: "Meta announces earnings", description: null }, { ticker: "META", companyName: "Meta Platforms, Inc." }), true);
  assert.equal(isCompanyNews({ title: "Google reports revenue growth", description: null }, { ticker: "GOOG", companyName: "Alphabet Inc." }), true);
});

test("URL normalization removes tracking without merging different articles", () => {
  assert.equal(normalizeNewsUrl("https://EXAMPLE.com/read?id=1&utm_source=mail#part"), "https://example.com/read?id=1");
  assert.notEqual(normalizeNewsUrl("https://example.com/read?id=1"), normalizeNewsUrl("https://example.com/read?id=2"));
  assert.equal(normalizeNewsUrl("javascript:alert(1)"), null);
  assert.equal(normalizeNewsUrl("https://user:password@example.com/read"), null);
});

test("preparation deduplicates by URL and provider ID and retains only recent company coverage", () => {
  const result = prepareNewsArticles([
    article,
    { ...article, id: "another-id", url: `${article.url}?utm_source=email` },
    { ...article, url: "https://example.com/updated-url" },
    { ...article, id: "other-publisher", publisher: "Another Publisher", url: "https://another.example/same-story" },
    { ...article, id: "old", url: "https://example.com/old", publishedAt: new Date("2026-09-01") },
    { ...article, id: "future", url: "https://example.com/future", publishedAt: new Date("2026-09-14") },
    { ...article, id: "irrelevant", title: "AMD announces products", description: null, url: "https://example.com/amd" },
  ], target, from, to);
  assert.equal(result.length, 2);
  assert.equal(result[0].metadata.contentTruncated, true);
  assert.equal(result[0].metadata.cik, undefined);
  assert.equal(result[0].description, article.description);
  assert.equal(result[0].content, article.content);
  assert.notEqual(result[0].sourceKey, result[1].sourceKey);
});
