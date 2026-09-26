import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { config } from "dotenv";
import { eq } from "drizzle-orm";
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
  modules.set(absolute, module.exports);
  const localRequire = createRequire(absolute);
  const compiled = ts.transpileModule(readFileSync(absolute, "utf8"), {
    compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS },
  }).outputText;
  const requireModule = (name) => overrides[name] ?? (name.startsWith(".")
    ? loadModule(path.resolve(path.dirname(absolute), `${name}.ts`), overrides)
    : localRequire(name));
  new Function("require", "module", "exports", compiled)(requireModule, module, module.exports);
  return module.exports;
}

const schema = {
  ...loadModule("src/infrastructure/database/schema/auth.ts"),
  ...loadModule("src/infrastructure/database/schema/thesis.ts"),
};
const client = postgres(process.env.DATABASE_URL, { max: 1, prepare: false, connect_timeout: 10 });
const db = drizzle(client, { schema, casing: "snake_case" });
const rollback = new Error("Rollback evidence analysis test fixtures");
const fixtureId = randomUUID();

try {
  await assert.rejects(db.transaction(async (tx) => {
    const overrides = { "@/infrastructure/database": { db: tx, ...schema } };
    const { evidenceAnalysisRepository: repository, EvidenceAnalysisStorageError } = loadModule("src/modules/thesis/repositories/evidence-analysis-repository.ts", overrides);
    const { thesisRepository } = loadModule("src/modules/thesis/repositories/thesis-repository.ts", overrides);
    const otherUserId = randomUUID();
    await tx.insert(schema.user).values([
      { id: fixtureId, email: `${fixtureId}@example.invalid` },
      { id: otherUserId, email: `${otherUserId}@example.invalid` },
    ]);
    const cik = String(9_000_000_000 + Math.floor(Math.random() * 900_000_000));
    const otherCik = String(Number(cik) + 1);
    const [thesis, otherCompanyThesis] = await tx.insert(schema.theses).values([
      { userId: fixtureId, ticker: "TESTAI", companyCik: cik, title: "AI storage fixture", thesis: "Revenue growth will continue over the following two years.", timeHorizon: "Two years" },
      { userId: fixtureId, ticker: "TESTAI", companyCik: otherCik, title: "Other company with same ticker", thesis: "Different company history" },
    ]).returning();
    const assumptions = await tx.insert(schema.thesisAssumptions).values(Array.from({ length: 4 }, (_, index) => ({
      thesisId: thesis.id,
      statement: `Revenue assumption ${index + 1}`,
      expectedOutcome: "Higher revenue",
      metric: "Revenue",
      importance: "medium",
      sortOrder: index,
    }))).returning();
    await tx.insert(schema.thesisAssumptions).values({ thesisId: otherCompanyThesis.id, statement: "Other company grows" });

    async function addEvidence(label, sourceCik, kind = "literal_excerpt", provider = "sec-edgar", eventCik = null) {
      const date = new Date(label === "newest" ? "2026-09-25T12:00:00Z" : "2026-09-24T12:00:00Z");
      const [source] = await tx.insert(schema.sources).values({
        sourceKey: `ai-storage:${fixtureId}:${label}`,
        provider,
        type: provider === "sec-edgar" ? "sec_filing" : "news",
        title: `${label} source`,
        url: `https://example.invalid/${fixtureId}/${label}`,
        metadata: { cik: sourceCik },
        publishedAt: date,
      }).returning();
      const [event] = await tx.insert(schema.companyEvents).values({
        ticker: "TESTAI", sourceId: source.id, companyCik: eventCik,
        type: provider === "sec-edgar" ? "filing" : "news", title: `${label} event`, occurredAt: date,
      }).returning();
      const [item] = await tx.insert(schema.evidence).values({
        ticker: "TESTAI", sourceId: source.id, eventId: event.id,
        type: "fact", claim: "Revenue increased.", excerpt: "Revenue increased by 20% in the reported period.",
        sourceLocator: "Item 7", occurredAt: date, structuredData: { evidenceKind: kind },
      }).returning();
      return { item, source };
    }

    const newest = await addEvidence("newest", cik);
    await addEvidence("older", cik);
    const foreign = await addEvidence("foreign", otherCik);
    await addEvidence("metadata", cik, "filing_metadata");
    await addEvidence("news", cik, "literal_excerpt", "gnews");
    await addEvidence("invalid-event-cik", cik, "literal_excerpt", "sec-edgar", otherCik);

    const emptyOverview = await repository.getOverviewForUser(otherUserId, thesis.id);
    assert.deepEqual(emptyOverview, { eligibleEvidenceCount: 0, pendingPairCount: 0, nextAnalysisAt: null, mappings: [] });
    assert.equal(await repository.findNextCandidatesForUser(otherUserId, thesis.id), null);
    const initial = await repository.getOverviewForUser(fixtureId, thesis.id);
    assert.equal(initial.eligibleEvidenceCount, 2);
    assert.equal(initial.pendingPairCount, 8);
    assert.equal((await repository.getOverviewForUser(fixtureId, otherCompanyThesis.id)).eligibleEvidenceCount, 1);

    const candidates = await repository.findNextCandidatesForUser(fixtureId, thesis.id);
    assert.ok(candidates);
    assert.equal(candidates.evidence.id, newest.item.id);
    assert.equal(candidates.evidence.kind, "excerpt");
    assert.equal(candidates.assumptions.length, 3);
    assert.deepEqual(candidates.assumptions.map((item) => item.id), assumptions.slice(0, 3).map((item) => item.id));
    const attemptedAt = new Date();
    const nextAnalysisAt = new Date(attemptedAt.getTime() + 90_000);
    assert.equal(await repository.claimAnalysis(otherUserId, thesis.id, 1, attemptedAt, nextAnalysisAt), false);
    assert.equal(await repository.claimAnalysis(fixtureId, thesis.id, 2, attemptedAt, nextAnalysisAt), false);
    assert.equal(await repository.claimAnalysis(fixtureId, thesis.id, 1, attemptedAt, nextAnalysisAt), true);
    assert.equal(await repository.claimAnalysis(fixtureId, thesis.id, 1, attemptedAt, nextAnalysisAt), false);
    assert.equal((await repository.getOverviewForUser(fixtureId, thesis.id)).nextAnalysisAt, nextAnalysisAt.toISOString());

    const snapshot = {
      thesis: { id: thesis.id, ticker: thesis.ticker, narrative: thesis.thesis, timeHorizon: thesis.timeHorizon, version: 1 },
      assumptions: candidates.assumptions,
      evidence: [candidates.evidence],
    };
    const result = {
      thesisId: thesis.id, thesisVersion: 1, provider: "gemini", model: "gemini-3.8-flash", promptVersion: "evidence-mapping-v1",
      mappings: candidates.assumptions.map((item) => ({
        evidenceId: newest.item.id, assumptionId: item.id,
        relationship: "supporting", materiality: "medium", rationale: "Revenue supports the stated assumption with a period limitation.",
        confidence: 75, sourceQuote: "Revenue increased by 20%", sourceId: newest.source.id,
        sourceUrl: newest.source.url, sourceLocator: newest.item.sourceLocator,
      })),
    };
    const input = { userId: fixtureId, thesisId: thesis.id, expectedVersion: 1, attemptedAt, snapshot, result };
    assert.equal(await repository.persistForUser(input), 3);
    assert.equal(await repository.persistForUser({ ...input, result: { ...result, mappings: result.mappings.map((item) => ({ ...item, rationale: "Changed rationale" })) } }), 0);
    const saved = await repository.getOverviewForUser(fixtureId, thesis.id);
    assert.equal(saved.mappings.length, 3);
    assert.equal(saved.pendingPairCount, 5);
    assert.equal(saved.mappings[0].rationale, result.mappings[0].rationale);
    assert.equal(saved.mappings[0].sourceQuote, "Revenue increased by 20%");
    assert.equal(saved.mappings[0].provider, "gemini");
    assert.equal(saved.mappings[0].model, result.model);
    assert.equal(saved.mappings[0].thesisVersion, 1);
    assert.equal(typeof saved.mappings[0].createdAt, "string");
    assert.equal((await repository.getOverviewForUser(fixtureId, otherCompanyThesis.id)).mappings.length, 0);
    assert.equal((await repository.findNextCandidatesForUser(fixtureId, thesis.id)).assumptions.length, 1);

    const invalid = structuredClone(input);
    invalid.result.mappings[0].sourceQuote = "Fabricated revenue increased by 500%.";
    await assert.rejects(repository.persistForUser(invalid), /evidence validation/);
    assert.equal((await repository.getOverviewForUser(fixtureId, thesis.id)).mappings.length, 3);
    await assert.rejects(repository.persistForUser({ ...input, result: { ...result, provider: "groq" } }), EvidenceAnalysisStorageError);
    await assert.rejects(repository.persistForUser({ ...input, userId: otherUserId }), EvidenceAnalysisStorageError);
    await assert.rejects(repository.persistForUser({ ...input, attemptedAt: new Date(attemptedAt.getTime() - 1) }), EvidenceAnalysisStorageError);

    const forgedSnapshot = structuredClone(snapshot);
    forgedSnapshot.evidence[0] = { ...forgedSnapshot.evidence[0], id: foreign.item.id, sourceId: foreign.source.id, sourceUrl: foreign.source.url };
    const forgedResult = { ...result, mappings: result.mappings.map((item) => ({ ...item, evidenceId: foreign.item.id })) };
    await assert.rejects(repository.persistForUser({ ...input, snapshot: forgedSnapshot, result: forgedResult }), EvidenceAnalysisStorageError);
    const changedSnapshot = structuredClone(snapshot);
    changedSnapshot.assumptions[0].statement = "Changed while AI ran";
    await assert.rejects(repository.persistForUser({ ...input, snapshot: changedSnapshot }), EvidenceAnalysisStorageError);
    await tx.update(schema.evidence).set({ claim: "Changed stored claim" }).where(eq(schema.evidence.id, newest.item.id));
    await assert.rejects(repository.persistForUser(input), EvidenceAnalysisStorageError);
    await tx.update(schema.evidence).set({ claim: newest.item.claim }).where(eq(schema.evidence.id, newest.item.id));

    const [legacyMapping] = await tx.insert(schema.evidenceAssumptions).values({
      evidenceId: newest.item.id,
      thesisAssumptionId: assumptions[3].id,
      relationship: "supporting",
      materiality: "medium",
      rationale: "Legacy Groq result retained from an earlier analysis.",
      confidence: 72,
      sourceQuote: "Revenue increased by 20%",
      aiProvider: "groq",
      aiModel: "openai/gpt-oss-120b",
      promptVersion: "evidence-mapping-v1",
      thesisVersion: 1,
    }).returning();
    const legacyPairInput = {
      ...input,
      snapshot: { ...snapshot, assumptions: [{
        id: assumptions[3].id,
        statement: assumptions[3].statement,
        expectedOutcome: assumptions[3].expectedOutcome,
        metric: assumptions[3].metric,
        retiredAt: null,
      }] },
      result: { ...result, mappings: [{ ...result.mappings[0], assumptionId: assumptions[3].id, rationale: "Gemini must not replace legacy history." }] },
    };
    assert.equal(await repository.persistForUser(legacyPairInput), 0);
    const [unchangedLegacy] = await tx.select().from(schema.evidenceAssumptions).where(eq(schema.evidenceAssumptions.id, legacyMapping.id));
    assert.deepEqual(unchangedLegacy, legacyMapping);
    const mixedHistory = await repository.getOverviewForUser(fixtureId, thesis.id);
    assert.equal(mixedHistory.mappings.length, 4);
    const legacyHistory = mixedHistory.mappings.find((item) => item.id === legacyMapping.id);
    assert.equal(legacyHistory.provider, "groq");
    assert.equal(legacyHistory.model, "openai/gpt-oss-120b");
    assert.equal(legacyHistory.rationale, legacyMapping.rationale);
    assert.equal(mixedHistory.mappings.filter((item) => item.provider === "gemini").length, 3);

    await thesisRepository.updateForUserWithAssumptions({
      userId: fixtureId, thesisId: thesis.id, version: 1, thesis: thesis.thesis, timeHorizon: thesis.timeHorizon,
      assumptions: assumptions.map((item, index) => ({
        id: item.id, statement: index === 0 ? "Updated revenue assumption" : item.statement,
        expectedOutcome: item.expectedOutcome, metric: item.metric, importance: item.importance,
      })),
    });
    const afterEdit = await repository.getOverviewForUser(fixtureId, thesis.id);
    assert.equal(afterEdit.mappings.length, 4);
    assert.equal(afterEdit.mappings.find((item) => item.assumptionId === assumptions[0].id).assumptionRetired, true);
    await assert.rejects(repository.persistForUser(input), EvidenceAnalysisStorageError);
    assert.equal(await repository.claimAnalysis(fixtureId, thesis.id, 1, attemptedAt, nextAnalysisAt), false);
    assert.ok(await thesisRepository.archiveForUser(thesis.id, fixtureId, 2));
    await assert.rejects(repository.persistForUser(input), EvidenceAnalysisStorageError);
    assert.equal(await repository.claimAnalysis(fixtureId, thesis.id, 3, attemptedAt, nextAnalysisAt), false);
    assert.equal(await repository.findNextCandidatesForUser(fixtureId, thesis.id), null);
    assert.equal((await repository.getOverviewForUser(fixtureId, thesis.id)).mappings.length, 4);

    throw rollback;
  }), (error) => error === rollback);

  assert.equal((await db.select().from(schema.user).where(eq(schema.user.id, fixtureId))).length, 0);
  console.log("Evidence analysis storage checks passed: ownership, CIK isolation, bounded candidates, cooldown, validated Gemini insert-only mappings, unchanged Groq history, stale snapshots, retirement, and archive history. All fixtures rolled back.");
} finally {
  await client.end({ timeout: 5 });
}
