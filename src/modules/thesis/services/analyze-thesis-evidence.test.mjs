import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { Script } from "node:vm";
import ts from "typescript";

const directory = dirname(fileURLToPath(import.meta.url));
const nativeRequire = createRequire(import.meta.url);
const thesisId = "fccee217-82ce-49c8-882f-c746e8bc065d";
const userId = "signed-in-user";

class EvidenceAnalysisStorageError extends Error {}
class GeminiClientError extends Error {}

function fixtures() {
  const assumptions = Array.from({ length: 3 }, (_, index) => ({
    id: `assumption-${index + 1}`,
    statement: "Revenue growth is sustained.",
    expectedOutcome: "Higher revenue.",
    metric: "Annual revenue growth",
    retiredAt: null,
  }));
  return {
    thesis: {
      id: thesisId,
      ticker: "NVDA",
      thesis: "Data center revenue will continue to grow.",
      timeHorizon: "2026-2028",
      version: 3,
      status: "active",
      companyCik: "0001045810",
      assumptions,
    },
    candidates: {
      assumptions,
      evidence: {
        id: "saved-evidence-1",
        ticker: "NVDA",
        sourceId: "saved-source-1",
        sourceUrl: "https://www.sec.gov/Archives/report.htm",
        sourceLocator: "Item 7",
        claim: "Revenue increased.",
        excerpt: "Revenue increased by 20%. Operating margin remained stable.",
        kind: "excerpt",
      },
    },
    overview: { eligibleEvidenceCount: 2, pendingPairCount: 3, nextAnalysisAt: null, mappings: [] },
  };
}

function outputFor(request) {
  const input = JSON.parse(request.userPrompt);
  return {
    data: {
      mappings: input.evidence.flatMap((evidence) => input.assumptions.map((assumption) => ({
        evidenceId: evidence.id,
        assumptionId: assumption.id,
        relationship: "supporting",
        materiality: "medium",
        rationale: "Revenue growth supports the assumption for the reported period.",
        confidence: 70,
        sourceQuote: "Revenue increased by 20%.",
      }))),
    },
    provider: "gemini",
    model: "gemini-3.8-flash",
  };
}

function loadAnalysis(options = {}) {
  const data = fixtures();
  const calls = [];
  const providerRequests = [];
  const persistenceInputs = [];
  const repos = {
    thesisRepository: {
      async findByIdForUser(id, owner) {
        calls.push(["findThesis", id, owner]);
        return data.thesis;
      },
    },
    evidenceAnalysisRepository: {
      async findNextCandidatesForUser(owner, id) {
        calls.push(["findCandidates", owner, id]);
        return data.candidates;
      },
      async getOverviewForUser(owner, id) {
        calls.push(["overview", owner, id]);
        return data.overview;
      },
      async claimAnalysis(...args) {
        calls.push(["claim", ...args]);
        return options.claimed ?? true;
      },
      async persistForUser(input) {
        calls.push(["persist"]);
        persistenceInputs.push(input);
        if (options.persistenceError) throw options.persistenceError;
        return input.result.mappings.length;
      },
    },
    EvidenceAnalysisStorageError,
  };
  const cache = new Map();
  function load(filename) {
    if (cache.has(filename)) return cache.get(filename).exports;
    const module = { exports: {} };
    cache.set(filename, module);
    const compiled = ts.transpileModule(readFileSync(filename, "utf8"), {
      compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS },
    }).outputText;
    new Script(compiled, { filename }).runInNewContext({
      module,
      exports: module.exports,
      require(name) {
        if (name === "@/infrastructure/ai/gemini") return {
          GeminiClientError,
          maxStructuredAiInputCharacters: options.maxInputCharacters ?? 14_000,
          isGeminiConfigured() {
            calls.push(["config"]);
            return options.configured ?? true;
          },
          async generateStructuredJson(request) {
            calls.push(["provider"]);
            providerRequests.push(request);
            return options.provider ? options.provider(request) : outputFor(request);
          },
        };
        if (name === "../repositories/thesis-repository") return repos;
        if (name === "../repositories/evidence-analysis-repository") return repos;
        if (name.startsWith(".")) return load(resolve(dirname(filename), `${name}.ts`));
        return nativeRequire(name);
      },
      URL,
      Date,
    });
    return module.exports;
  }
  return {
    ...load(resolve(directory, "../schemas/evidence-mapping.ts")),
    ...load(resolve(directory, "analyze-thesis-evidence.ts")),
    ...load(resolve(directory, "get-evidence-analysis.ts")),
    data,
    calls,
    providerRequests,
    persistenceInputs,
  };
}

test("analysis fetches an owned thesis and validates prerequisites before selecting evidence or calling AI", async () => {
  const invalid = [
    ["could not be found", (data) => { data.thesis = null; }],
    ["Only active", (data) => { data.thesis.status = "archived"; }],
    ["Only active", (data) => { data.thesis.status = "paused"; }],
    ["has changed", (data) => { data.thesis.version = 4; }],
    ["verified SEC identity", (data) => { data.thesis.companyCik = null; }],
    ["active assumption", (data) => { data.thesis.assumptions = []; }],
  ];
  for (const [message, mutate] of invalid) {
    const analysis = loadAnalysis();
    mutate(analysis.data);
    await assert.rejects(analysis.analyzeThesisEvidence(userId, thesisId, 3), (error) => {
      assert.ok(error instanceof analysis.ThesisEvidenceAnalysisError);
      assert.match(error.message, new RegExp(message));
      return true;
    });
    assert.deepEqual(analysis.calls, [["findThesis", thesisId, userId]]);
    assert.equal(analysis.providerRequests.length, 0);
    assert.equal(analysis.persistenceInputs.length, 0);
  }
});

test("missing provider configuration is rejected before selecting evidence or reserving a lease", async () => {
  const analysis = loadAnalysis({ configured: false });
  await assert.rejects(analysis.analyzeThesisEvidence(userId, thesisId, 3), /Configure GEMINI_API_KEY/);
  assert.deepEqual(analysis.calls.map(([name]) => name), ["findThesis", "config"]);
  assert.equal(analysis.providerRequests.length, 0);
});

test("saved overview remains available when Gemini is unconfigured and never makes an AI request", async () => {
  const analysis = loadAnalysis({ configured: false });
  const result = await analysis.getEvidenceAnalysisForThesis(userId, thesisId);
  assert.equal(result.isAiConfigured, false);
  assert.equal(result.overview, analysis.data.overview);
  assert.deepEqual(analysis.calls, [["config"], ["overview", userId, thesisId]]);
  assert.equal(analysis.providerRequests.length, 0);
  assert.equal(analysis.persistenceInputs.length, 0);
});

test("empty eligible evidence and fully mapped evidence have distinct safe messages", async () => {
  for (const [eligibleCount, message] of [[0, /Sync SEC filings first/], [2, /already have saved mappings/]]) {
    const analysis = loadAnalysis();
    analysis.data.candidates = null;
    analysis.data.overview.eligibleEvidenceCount = eligibleCount;
    await assert.rejects(analysis.analyzeThesisEvidence(userId, thesisId, 3), message);
    assert.deepEqual(analysis.calls.map(([name]) => name), ["findThesis", "config", "findCandidates", "overview"]);
    assert.equal(analysis.providerRequests.length, 0);
    assert.equal(analysis.persistenceInputs.length, 0);
  }
});

test("invalid stored snapshots fail runtime validation before acquiring a lease or calling AI", async () => {
  const invalid = [
    (data) => { data.thesis.thesis = " "; },
    (data) => { data.candidates.evidence.ticker = "AAPL"; },
    (data) => { data.candidates.evidence.sourceUrl = "javascript:alert(1)"; },
    (data) => { data.candidates.evidence.excerpt = " "; },
    (data) => { data.candidates.assumptions[0].retiredAt = new Date(); },
    (data) => { data.candidates.assumptions[1].id = data.candidates.assumptions[0].id; },
  ];
  for (const mutate of invalid) {
    const analysis = loadAnalysis();
    mutate(analysis.data);
    await assert.rejects(analysis.analyzeThesisEvidence(userId, thesisId, 3), analysis.EvidenceMappingValidationError);
    assert.equal(analysis.calls.some(([name]) => name === "claim"), false);
    assert.equal(analysis.providerRequests.length, 0);
    assert.equal(analysis.persistenceInputs.length, 0);
  }
});

test("lease denial prevents both provider calls and persistence", async () => {
  const analysis = loadAnalysis({ claimed: false });
  await assert.rejects(analysis.analyzeThesisEvidence(userId, thesisId, 3), /already running or cooling down/);
  assert.equal(analysis.providerRequests.length, 0);
  assert.equal(analysis.persistenceInputs.length, 0);
  const [, owner, id, version, attemptedAt, nextAnalysisAt] = analysis.calls.find(([name]) => name === "claim");
  assert.deepEqual([owner, id, version], [userId, thesisId, 3]);
  assert.equal(nextAnalysisAt.getTime() - attemptedAt.getTime(), 90_000);
});

test("a valid batch makes exactly one bounded AI call and persists its verified source-linked result", async () => {
  const analysis = loadAnalysis();
  const result = await analysis.analyzeThesisEvidence(userId, thesisId, 3);
  assert.equal(result.savedCount, 3);
  assert.equal(result.pendingPairCount, 3);
  assert.equal(analysis.providerRequests.length, 1);
  assert.equal(analysis.providerRequests[0].maxCompletionTokens, 8192);
  assert.deepEqual(analysis.calls.map(([name]) => name), ["findThesis", "config", "findCandidates", "claim", "provider", "persist", "overview"]);
  const [persisted] = analysis.persistenceInputs;
  assert.equal(persisted.userId, userId);
  assert.equal(persisted.thesisId, thesisId);
  assert.equal(persisted.expectedVersion, 3);
  assert.equal(persisted.result.thesisVersion, 3);
  assert.equal(persisted.result.provider, "gemini");
  assert.equal(persisted.result.model, "gemini-3.8-flash");
  assert.equal(persisted.result.promptVersion, "evidence-mapping-v1");
  assert.equal(persisted.snapshot.evidence.length, 1);
  assert.equal(persisted.snapshot.assumptions.length, 3);
  assert.equal(persisted.attemptedAt, analysis.calls.find(([name]) => name === "claim")[4]);
  for (const mapping of persisted.result.mappings) {
    assert.equal(mapping.sourceId, analysis.data.candidates.evidence.sourceId);
    assert.equal(mapping.sourceUrl, analysis.data.candidates.evidence.sourceUrl);
    assert.equal(mapping.sourceLocator, "Item 7");
    assert.equal(mapping.sourceQuote, "Revenue increased by 20%.");
  }
});

test("oversized batches reduce only assumption count while preserving excerpts and pending work", async () => {
  const analysis = loadAnalysis();
  for (const assumption of analysis.data.candidates.assumptions) {
    assumption.statement = "S".repeat(2000);
    assumption.expectedOutcome = "O".repeat(2000);
    assumption.metric = "M".repeat(2000);
  }
  analysis.data.overview.pendingPairCount = 11;
  const originalEvidence = structuredClone(analysis.data.candidates.evidence);
  const result = await analysis.analyzeThesisEvidence(userId, thesisId, 3);
  const [persisted] = analysis.persistenceInputs;
  assert.ok(persisted.snapshot.assumptions.length >= 1);
  assert.ok(persisted.snapshot.assumptions.length < 3);
  assert.equal(analysis.data.candidates.assumptions.length, 3);
  assert.equal(result.pendingPairCount, 11);
  assert.equal(result.savedCount, persisted.snapshot.assumptions.length);
  assert.equal(analysis.providerRequests.length, 1);
  assert.deepEqual(JSON.parse(JSON.stringify(persisted.snapshot.evidence[0])), originalEvidence);
  const request = analysis.providerRequests[0];
  assert.ok(request.systemPrompt.length + request.userPrompt.length + JSON.stringify(request.jsonSchema).length <= 14_000);
});

test("an oversized single assumption is rejected without truncating the source or consuming a lease", async () => {
  const analysis = loadAnalysis();
  analysis.data.thesis.thesis = "N".repeat(10000);
  analysis.data.candidates.assumptions = [{
    ...analysis.data.candidates.assumptions[0],
    statement: "S".repeat(2000),
    expectedOutcome: "O".repeat(2000),
    metric: "M".repeat(2000),
  }];
  const originalExcerpt = analysis.data.candidates.evidence.excerpt;
  await assert.rejects(analysis.analyzeThesisEvidence(userId, thesisId, 3), /never silently truncated/);
  assert.equal(analysis.data.candidates.evidence.excerpt, originalExcerpt);
  assert.equal(analysis.calls.some(([name]) => name === "claim"), false);
  assert.equal(analysis.providerRequests.length, 0);
  assert.equal(analysis.persistenceInputs.length, 0);
});

test("one invalid provider row prevents persistence of the entire otherwise valid batch", async () => {
  const analysis = loadAnalysis({ provider(request) {
    const output = outputFor(request);
    output.data.mappings.at(-1).sourceQuote = "Fabricated revenue increased by 500%.";
    return output;
  } });
  await assert.rejects(analysis.analyzeThesisEvidence(userId, thesisId, 3), analysis.EvidenceMappingValidationError);
  assert.equal(analysis.providerRequests.length, 1);
  assert.equal(analysis.persistenceInputs.length, 0);
  assert.equal(analysis.calls.some(([name]) => name === "overview"), false);
});

test("provider failure never persists mappings or retries an AI call", async () => {
  const failure = new GeminiClientError("The Gemini rate limit was reached. Try again later.");
  const analysis = loadAnalysis({ provider() { throw failure; } });
  await assert.rejects(analysis.analyzeThesisEvidence(userId, thesisId, 3), (error) => error === failure);
  assert.equal(analysis.providerRequests.length, 1);
  assert.equal(analysis.persistenceInputs.length, 0);
  assert.equal(analysis.calls.some(([name]) => name === "overview"), false);
});

test("stale persistence rejects completion instead of reporting a saved result", async () => {
  const failure = new EvidenceAnalysisStorageError("This thesis changed while AI analysis was running. No mappings were saved.");
  const analysis = loadAnalysis({ persistenceError: failure });
  await assert.rejects(analysis.analyzeThesisEvidence(userId, thesisId, 3), (error) => error === failure);
  assert.equal(analysis.providerRequests.length, 1);
  assert.equal(analysis.persistenceInputs.length, 1);
  assert.equal(analysis.calls.some(([name]) => name === "overview"), false);
});
