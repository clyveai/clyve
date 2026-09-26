import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { Script } from "node:vm";
import ts from "typescript";

const directory = dirname(fileURLToPath(import.meta.url));
const thesisId = "fccee217-82ce-49c8-882f-c746e8bc065d";

class ThesisEvidenceAnalysisError extends Error {}
class EvidenceAnalysisStorageError extends Error {}
class EvidenceMappingValidationError extends Error {}
class GeminiClientError extends Error {}

function loadAction(options = {}) {
  const calls = [];
  const filename = resolve(directory, "analyze-thesis-evidence.ts");
  const compiled = ts.transpileModule(readFileSync(filename, "utf8"), {
    compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS },
  }).outputText;
  const module = { exports: {} };
  new Script(compiled, { filename }).runInNewContext({
    module,
    exports: module.exports,
    require(name) {
      if (name === "next/cache") return { revalidatePath(path) { calls.push(["revalidate", path]); } };
      if (name === "@/infrastructure/ai/gemini") return { GeminiClientError };
      if (name === "../repositories/evidence-analysis-repository") return { EvidenceAnalysisStorageError };
      if (name === "../schemas/evidence-mapping") return { EvidenceMappingValidationError };
      if (name === "@/modules/auth/services/get-current-user") return {
        async getCurrentUser() {
          calls.push(["session"]);
          if (options.sessionError) throw options.sessionError;
          return options.signedOut ? null : { id: "authenticated-user" };
        },
      };
      if (name === "../services/analyze-thesis-evidence") return {
        ThesisEvidenceAnalysisError,
        async analyzeThesisEvidence(...args) {
          calls.push(["analysis", ...args]);
          if (options.analysisError) throw options.analysisError;
          return { savedCount: 2, pendingPairCount: 7 };
        },
      };
      throw new Error(`Unexpected import: ${name}`);
    },
  });
  return { ...module.exports, calls };
}

test("malformed IDs are rejected before auth or analysis", async () => {
  for (const id of [undefined, null, "", "not-a-uuid", `${thesisId}/other`, thesisId.slice(1), 42, [], {}, { toString: () => thesisId }]) {
    const action = loadAction();
    const result = await action.analyzeThesisEvidenceAction(id, 3, {}, new FormData());
    assert.match(result.error, /Invalid thesis/);
    assert.equal(result.result, undefined);
    assert.deepEqual(action.calls, []);
  }
});

test("invalid numeric versions are rejected before auth or analysis", async () => {
  for (const version of [undefined, null, "3", 0, -1, 1.5, NaN, Infinity, -Infinity, 2_147_483_648, Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER + 1]) {
    const action = loadAction();
    const result = await action.analyzeThesisEvidenceAction(thesisId, version, {}, new FormData());
    assert.match(result.error, /Invalid thesis/);
    assert.deepEqual(action.calls, []);
  }
});

test("an expired session cannot analyze or revalidate another user's thesis", async () => {
  const action = loadAction({ signedOut: true });
  const result = await action.analyzeThesisEvidenceAction(thesisId, 3, {}, new FormData());
  assert.match(result.error, /session has expired/);
  assert.equal(result.result, undefined);
  assert.deepEqual(action.calls, [["session"]]);
});

test("the current session owns the request and arbitrary submitted evidence or owner IDs are ignored", async () => {
  const action = loadAction();
  const injected = new FormData();
  injected.set("userId", "victim-user");
  injected.set("thesisId", "other-thesis");
  injected.set("version", "999");
  injected.set("evidence", JSON.stringify({ claim: "Invented revenue result", sourceUrl: "https://attacker.example" }));
  const result = await action.analyzeThesisEvidenceAction(thesisId, 3, { result: { savedCount: 999, pendingPairCount: 0 } }, injected);
  assert.equal(result.error, undefined);
  assert.deepEqual(JSON.parse(JSON.stringify(result)), { result: { savedCount: 2, pendingPairCount: 7 } });
  assert.deepEqual(action.calls, [
    ["session"],
    ["analysis", "authenticated-user", thesisId, 3],
    ["revalidate", `/thesis/${thesisId}`],
  ]);
});

test("known safe domain, validation, storage and provider failures are returned and refresh the detail", async () => {
  const failures = [
    new ThesisEvidenceAnalysisError("This thesis has changed. Reload before analyzing evidence."),
    new EvidenceMappingValidationError("AI mapping failed evidence validation. No results were saved."),
    new EvidenceAnalysisStorageError("This thesis changed while AI analysis was running. No mappings were saved."),
    new GeminiClientError("The Gemini rate limit was reached. Try again later."),
  ];
  for (const failure of failures) {
    const action = loadAction({ analysisError: failure });
    const result = await action.analyzeThesisEvidenceAction(thesisId, 3, {}, new FormData());
    assert.equal(result.error, failure.message);
    assert.equal(result.result, undefined);
    assert.deepEqual(action.calls, [
      ["session"],
      ["analysis", "authenticated-user", thesisId, 3],
      ["revalidate", `/thesis/${thesisId}`],
    ]);
  }
});

test("unexpected failures do not expose credentials, SQL or provider details", async () => {
  for (const failure of [new Error("postgres://private-user:private-password@database SQL SELECT secret_api_key"), "raw-private-failure", null]) {
    const options = failure === null ? { sessionError: new Error("private-session-error") } : { analysisError: failure };
    const action = loadAction(options);
    const result = await action.analyzeThesisEvidenceAction(thesisId, 3, {}, new FormData());
    assert.equal(result.error, "Evidence analysis could not be completed. Reload the page to check saved results before retrying.");
    assert.equal(result.result, undefined);
    assert.equal(JSON.stringify(result).includes("private"), false);
    assert.deepEqual(action.calls.at(-1), ["revalidate", `/thesis/${thesisId}`]);
  }
});

test("valid uppercase UUIDs and safe integer versions retain ownership checks", async () => {
  const action = loadAction();
  const id = thesisId.toUpperCase();
  const result = await action.analyzeThesisEvidenceAction(id, 2_147_483_647, {}, new FormData());
  assert.equal(result.result.savedCount, 2);
  assert.deepEqual(action.calls[1], ["analysis", "authenticated-user", id, 2_147_483_647]);
});
