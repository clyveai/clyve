import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { config } from "dotenv";
import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import ts from "typescript";

config({ path: ".env.local", quiet: true });
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required for the rollback-only storage check.");

const modules = new Map();
function loadModule(filename, overrides = {}) {
  const absolute = path.resolve(filename);
  if (modules.has(absolute)) return modules.get(absolute);
  const module = { exports: {} };
  const localRequire = createRequire(absolute);
  const compiled = ts.transpileModule(readFileSync(absolute, "utf8"), {
    compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS },
  }).outputText;
  const requireModule = (name) => overrides[name] ?? (name.startsWith(".")
    ? loadModule(path.resolve(path.dirname(absolute), `${name}.ts`), overrides)
    : localRequire(name));
  new Function("require", "module", "exports", compiled)(requireModule, module, module.exports);
  modules.set(absolute, module.exports);
  return module.exports;
}

const schema = {
  ...loadModule("src/infrastructure/database/schema/auth.ts"),
  ...loadModule("src/infrastructure/database/schema/thesis.ts"),
  ...loadModule("src/infrastructure/database/schema/news.ts"),
};
const client = postgres(process.env.DATABASE_URL, { max: 1, prepare: false, connect_timeout: 10 });
const db = drizzle(client, { schema, casing: "snake_case" });
const rollback = new Error("Rollback news test fixtures");
const fixtureId = randomUUID();
let fixtureSourceKey;

try {
  await assert.rejects(db.transaction(async (tx) => {
    const { newsRepository } = loadModule("src/modules/news/repositories/news-repository.ts", {
      "@/infrastructure/database": { db: tx, ...schema },
    });
    await tx.insert(schema.user).values({ id: fixtureId, email: `${fixtureId}@example.invalid` });
    const cik = String(9_000_000_000 + Math.floor(Math.random() * 900_000_000));
    const company = { companyCik: cik, companyName: "News test company" };
    const [first, shared, other] = await tx.insert(schema.theses).values([
      { userId: fixtureId, ticker: "TESTNEWS", title: "News fixture", thesis: "Storage check", ...company },
      { userId: fixtureId, ticker: "TESTNEWS.B", title: "Shared identity", thesis: "Storage check", ...company },
      { userId: fixtureId, ticker: "OTHERNEWS", title: "Different company", thesis: "Storage check", ...company, companyCik: String(Number(cik) + 1) },
    ]).returning();

    const target = await newsRepository.findCompanyForUser(first.id, fixtureId);
    const otherTarget = await newsRepository.findCompanyForUser(other.id, fixtureId);
    assert.ok(target);
    assert.ok(otherTarget);
    assert.equal(await newsRepository.findCompanyForUser(first.id, "not-the-owner"), null);

    const now = new Date();
    const next = new Date(now.getTime() + 900_000);
    assert.equal(await newsRepository.claimSync(cik, now, next), true);
    assert.equal(await newsRepository.claimSync(cik, now, next), false);
    await newsRepository.completeSync(cik, now, now, next);
    assert.equal((await newsRepository.getSyncState(cik)).lastSyncedAt.toISOString(), now.toISOString());

    fixtureSourceKey = `news:storage-test:${fixtureId}`;
    const article = {
      sourceKey: fixtureSourceKey, providerArticleId: null,
      title: "Original title", publisher: "Example Publisher", url: `https://example.invalid/${fixtureId}`,
      description: "Original excerpt", content: "Original stored content", contentHash: "test-hash",
      publishedAt: now, metadata: { description: "Original excerpt", contentTruncated: true },
    };
    assert.equal(await newsRepository.persistArticles(target, [article]), 1);
    assert.equal(await newsRepository.persistArticles(target, [article]), 0);
    const identified = { ...article, providerArticleId: fixtureId, title: "Changed title", metadata: { description: "Changed excerpt" } };
    assert.equal(await newsRepository.persistArticles(target, [identified]), 0);
    assert.equal(await newsRepository.persistArticles(target, [{ ...identified, sourceKey: `${fixtureSourceKey}:changed-url`, url: "https://example.invalid/changed-url" }]), 0);

    const saved = await newsRepository.findHistoryForUser(first.id, fixtureId);
    assert.equal(saved.length, 1);
    assert.equal(saved[0].title, "Original title");
    assert.equal(saved[0].description, "Original excerpt");
    assert.equal((await newsRepository.findHistoryForUser(shared.id, fixtureId)).length, 1);
    assert.equal((await newsRepository.findHistoryForUser(other.id, fixtureId)).length, 0);
    assert.equal((await newsRepository.findHistoryForUser(first.id, "not-the-owner")).length, 0);
    assert.equal(await newsRepository.persistArticles(otherTarget, [identified]), 1);
    assert.equal((await newsRepository.findHistoryForUser(other.id, fixtureId)).length, 1);

    const [source] = await tx.select().from(schema.sources).where(eq(schema.sources.sourceKey, fixtureSourceKey));
    assert.equal(source.providerArticleId, fixtureId);
    const [otherEvent] = await tx.select().from(schema.companyEvents).where(and(eq(schema.companyEvents.sourceId, source.id), eq(schema.companyEvents.companyCik, otherTarget.companyCik)));
    assert.equal(otherEvent.title, "Original title");
    assert.equal(otherEvent.summary, "Original excerpt");

    const conflictingUrl = { ...article, sourceKey: `${fixtureSourceKey}:another-article`, providerArticleId: `${fixtureId}-other`, title: "Another article" };
    assert.equal(await newsRepository.persistArticles(target, [conflictingUrl]), 1);
    assert.equal(await newsRepository.persistArticles(otherTarget, [{ ...conflictingUrl, providerArticleId: fixtureId }]), 0);
    assert.equal((await newsRepository.findHistoryForUser(other.id, fixtureId)).length, 1);

    await tx.update(schema.theses).set({ status: "archived" }).where(eq(schema.theses.id, first.id));
    assert.equal((await newsRepository.findHistoryForUser(first.id, fixtureId)).length, 2);
    assert.equal((await newsRepository.findCompanyForUser(first.id, fixtureId)).status, "archived");
    throw rollback;
  }), (error) => error === rollback);

  assert.equal((await db.select().from(schema.user).where(eq(schema.user.id, fixtureId))).length, 0);
  assert.equal((await db.select().from(schema.sources).where(eq(schema.sources.sourceKey, fixtureSourceKey))).length, 0);
  console.log("News storage checks passed: ownership, CIK isolation, shared articles, ID/URL deduplication, immutable snapshots, cooldown, archive history. All fixtures rolled back.");
} finally {
  await client.end({ timeout: 5 });
}
