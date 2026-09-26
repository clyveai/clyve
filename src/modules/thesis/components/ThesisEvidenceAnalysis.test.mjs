import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { test } from "node:test";
import { Script } from "node:vm";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";

const nativeRequire = createRequire(import.meta.url);
const source = readFileSync(new URL("./ThesisEvidenceAnalysis.tsx", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    target: ts.ScriptTarget.ES2020,
    module: ts.ModuleKind.CommonJS,
    jsx: ts.JsxEmit.ReactJSX,
  },
}).outputText;

function mappingFixture(overrides = {}) {
  return {
    id: "saved-mapping-1",
    evidenceId: "evidence-1",
    assumptionId: "assumption-1",
    assumptionStatement: "Data center revenue continues to grow.",
    assumptionRetired: false,
    relationship: "supporting",
    materiality: "medium",
    rationale: "The reported increase supports the expected revenue trend.",
    confidence: 72,
    sourceQuote: "Revenue increased by 20%.",
    claim: "The company reported revenue growth.",
    sourceTitle: "NVDA Form 10-Q",
    sourceUrl: "https://www.sec.gov/Archives/report.htm",
    sourceLocator: "Item 7. Management discussion",
    provider: "gemini",
    model: "gemini-3.8-flash",
    promptVersion: "evidence-mapping-v1",
    thesisVersion: 3,
    createdAt: "2026-09-26T10:20:30.000Z",
    ...overrides,
  };
}

function propsFixture(overrides = {}) {
  const { overview, ...rest } = overrides;
  return {
    thesisId: "saved-thesis-1",
    thesisVersion: 3,
    canAnalyze: true,
    isAiConfigured: true,
    ...rest,
    overview: {
      eligibleEvidenceCount: 2,
      pendingPairCount: 4,
      nextAnalysisAt: null,
      mappings: [],
      ...overview,
    },
  };
}

function renderAnalysis(props = propsFixture(), options = {}) {
  const module = { exports: {} };
  const capture = { calls: [], initialValues: [], boundAction: null, initialActionState: null };
  const action = async (...args) => {
    capture.calls.push(args);
    return { result: { savedCount: 1, pendingPairCount: 3 } };
  };
  new Script(compiled, { filename: "ThesisEvidenceAnalysis.tsx" }).runInNewContext({
    module,
    exports: module.exports,
    require(name) {
      if (name === "react") {
        return {
          ...React,
          useActionState(boundAction, initialState) {
            capture.boundAction = boundAction;
            capture.initialActionState = initialState;
            return [options.state ?? initialState, "/test-analysis", options.isPending ?? false];
          },
          useState(initialValue) {
            capture.initialValues.push(initialValue);
            return [initialValue, () => assert.fail("SSR must not update state")];
          },
          useEffect() {},
        };
      }
      if (name === "@/shared/ui/spinner") {
        return {
          Spinner(props) {
            return React.createElement("span", { ...props, "data-testid": "analysis-spinner" });
          },
        };
      }
      if (name === "../actions/analyze-thesis-evidence") {
        return { analyzeThesisEvidenceAction: action };
      }
      return nativeRequire(name);
    },
    URL,
    Date,
    Intl,
  });
  const html = renderToStaticMarkup(React.createElement(module.exports.ThesisEvidenceAnalysis, props));
  return { html, capture };
}

function submitButton(html) {
  return html.match(/<button\b[^>]*type="submit"[^>]*>[\s\S]*?<\/button>/)?.[0] ?? assert.fail("Expected an analysis submit button");
}

test("empty analysis retains full section structure and explains the source-first workflow", () => {
  const { html } = renderAnalysis(propsFixture({ overview: { eligibleEvidenceCount: 0, pendingPairCount: 0 } }));
  assert.match(html, /Thesis monitoring/);
  assert.match(html, /Evidence analysis/);
  assert.match(html, /p-5 backdrop-blur-xl sm:p-8/);
  assert.match(html, /No buy or sell recommendations/);
  assert.match(html, /No evidence analysis has been saved yet/);
  assert.match(html, /No saved SEC excerpts are available/);
  assert.match(html, /Use Sync SEC filings/);
  assert.match(submitButton(html), /disabled=""/);
});

test("missing AI configuration disables analysis without removing saved mappings", () => {
  const { html } = renderAnalysis(propsFixture({
    isAiConfigured: false,
    overview: { mappings: [mappingFixture()] },
  }));
  assert.match(html, /AI analysis is not configured/);
  assert.match(html, /Add GEMINI_API_KEY from Google AI Studio to the server environment/);
  assert.match(html, /Saved filings remain available without AI/);
  assert.match(html, /Data center revenue continues to grow/);
  assert.match(submitButton(html), /disabled=""/);
});

test("inactive or otherwise ineligible theses preserve read-only history", () => {
  const { html } = renderAnalysis(propsFixture({
    canAnalyze: false,
    overview: { mappings: [mappingFixture()] },
  }));
  assert.match(html, /Analysis requires an active thesis, a verified SEC identity, and at least one active assumption/);
  assert.match(html, /Saved mappings remain available/);
  assert.match(html, /Latest saved mappings/);
  assert.match(html, /Revenue increased by 20%/);
  assert.match(submitButton(html), /disabled=""/);
});

test("eligible input enables the first batch and displays bounded batch context", () => {
  const { html } = renderAnalysis();
  assert.doesNotMatch(submitButton(html), /disabled=""/);
  assert.match(submitButton(html), /Analyze evidence/);
  assert.match(html, /2 saved excerpts available/);
  assert.match(html, /4 evidence-assumption pairs remaining/);
  assert.match(html, /one excerpt against up to three assumptions/);
  assert.match(html, /free API quota/);
  assert.match(html, /Analysis uses Google Gemini/);
  assert.match(html, /do not submit confidential or personal information/);
  assert.match(html, /href="https:\/\/ai\.google\.dev\/gemini-api\/terms"/);
});

test("saved mappings change the action label to the next batch", () => {
  const { html } = renderAnalysis(propsFixture({ overview: { mappings: [mappingFixture()] } }));
  assert.match(submitButton(html), /Analyze next batch/);
  assert.doesNotMatch(submitButton(html), /disabled=""/);
  assert.doesNotMatch(html, /No evidence analysis has been saved yet/);
});

test("pending analysis shows progress and spinners without replacing saved cards", () => {
  const { html } = renderAnalysis(
    propsFixture({ overview: { mappings: [mappingFixture()] } }),
    { isPending: true, state: { error: "Old request failed", result: { savedCount: 3, pendingPairCount: 1 } } },
  );
  assert.match(html, /aria-busy="true"/);
  assert.match(submitButton(html), /disabled=""/);
  assert.match(submitButton(html), /Analyzing\.\.\./);
  assert.equal((html.match(/data-testid="analysis-spinner"/g) ?? []).length, 2);
  assert.match(html, /Mapping the next evidence batch/);
  assert.match(html, /Previous results remain available below/);
  assert.match(html, /Data center revenue continues to grow/);
  assert.match(html, /Revenue increased by 20%/);
  assert.doesNotMatch(html, /Old request failed/);
  assert.doesNotMatch(html, /Saved 3 mappings/);
  assert.doesNotMatch(html, /skeleton/);
});

test("action failures are announced and leave the earlier evidence untouched", () => {
  const { html } = renderAnalysis(
    propsFixture({ overview: { mappings: [mappingFixture()] } }),
    { state: { error: "AI quota exceeded. Try later." } },
  );
  assert.match(html, /role="alert"/);
  assert.match(html, /AI quota exceeded\. Try later\./);
  assert.match(html, /Latest saved mappings/);
  assert.match(html, /Revenue increased by 20%/);
});

test("confirmed saved results distinguish remaining batches from completed work", () => {
  const remaining = renderAnalysis(propsFixture(), { state: { result: { savedCount: 3, pendingPairCount: 4 } } }).html;
  assert.match(remaining, /Saved 3 mappings\./);
  assert.match(remaining, /4 evidence-assumption pairs remain for later batches/);
  assert.match(remaining, /aria-live="polite" role="status"/);
  const completed = renderAnalysis(
    propsFixture({ overview: { pendingPairCount: 0 } }),
    { state: { result: { savedCount: 1, pendingPairCount: 0 } } },
  ).html;
  assert.match(completed, /Saved 1 mapping\./);
  assert.match(completed, /All currently available evidence-assumption pairs have been analyzed/);
  assert.match(completed, /No evidence-assumption pairs are waiting for analysis/);
  assert.match(submitButton(completed), /disabled=""/);
});

test("all four relationships have distinct readable labels and styles", () => {
  const mappings = ["supporting", "contradicting", "contextual", "unclear"].map((relationship) => (
    mappingFixture({ id: `mapping-${relationship}`, relationship })
  ));
  const { html } = renderAnalysis(propsFixture({ overview: { mappings } }));
  for (const [label, color] of [
    ["Supporting", "text-emerald-200"],
    ["Contradicting", "text-red-200"],
    ["Contextual", "text-amber-100"],
    ["Unclear", "text-zinc-300"],
  ]) {
    assert.match(html, new RegExp(`<span[^>]*${color}[^>]*>${label}<\\/span>`));
  }
  assert.equal((html.match(/<article\b/g) ?? []).length, 4);
});

test("mapping cards retain source evidence, rationale, materiality and confidence caveat", () => {
  const { html } = renderAnalysis(propsFixture({ overview: { mappings: [mappingFixture()] } }));
  assert.match(html, /Data center revenue continues to grow/);
  assert.match(html, /The company reported revenue growth/);
  assert.match(html, /The reported increase supports the expected revenue trend/);
  assert.match(html, /<blockquote[^>]*><p[^>]*>Revenue increased by 20%\.<\/p><\/blockquote>/);
  assert.match(html, /href="https:\/\/www\.sec\.gov\/Archives\/report\.htm"/);
  assert.match(html, /target="_blank" rel="noopener noreferrer"/);
  assert.match(html, /NVDA Form 10-Q/);
  assert.match(html, /Item 7\. Management discussion/);
  assert.match(html, /medium materiality/);
  assert.match(html, /Model confidence 72\/100/);
  assert.match(html, /gemini-3\.8-flash/);
  assert.match(html, /Analyzed Sep 26, 2026/);
  assert.match(html, /not a calibrated probability/);
});

test("old versions and retired assumptions are clearly distinguished from current mappings", () => {
  const { html } = renderAnalysis(propsFixture({ overview: { mappings: [
    mappingFixture({ id: "old-mapping", thesisVersion: 1, assumptionRetired: true }),
    mappingFixture({ id: "current-mapping", thesisVersion: 3 }),
  ] } }));
  assert.match(html, /Retired assumption/);
  assert.match(html, /Thesis v1/);
  assert.match(html, /Earlier version/);
  assert.match(html, /Thesis v3/);
  assert.equal((html.match(/Earlier version/g) ?? []).length, 1);
});

test("unsafe, malformed and credential-bearing sources remain plain text without links", () => {
  for (const sourceUrl of [
    "javascript:alert(1)",
    "data:text/html,<script>alert(1)</script>",
    "https://private-user:private-password@example.com/report",
    "https://private-user@example.com/report",
    "/local/report",
    "not-a-url",
  ]) {
    const { html } = renderAnalysis(propsFixture({ overview: { mappings: [mappingFixture({ sourceUrl })] } }));
    const article = html.match(/<article\b[\s\S]*?<\/article>/)?.[0];
    assert.ok(article);
    assert.doesNotMatch(article, /<a\b/);
    assert.doesNotMatch(html, /javascript:|private-user|private-password|<script>/);
    assert.match(html, /NVDA Form 10-Q/);
  }
  const { html } = renderAnalysis(propsFixture({ overview: { mappings: [mappingFixture({ sourceUrl: "http://example.com/report" })] } }));
  assert.match(html, /href="http:\/\/example\.com\/report"/);
});

test("source text and model output are escaped rather than interpreted as HTML", () => {
  const { html } = renderAnalysis(propsFixture({ overview: { mappings: [mappingFixture({
    rationale: "<script>alert('model')</script>",
    sourceQuote: "<img src=x onerror=alert(1)>",
    sourceTitle: "<b>Untrusted source</b>",
  })] } }));
  assert.doesNotMatch(html, /<script>|<img|<b>Untrusted/);
  assert.match(html, /&lt;script&gt;/);
  assert.match(html, /&lt;img/);
  assert.match(html, /&lt;b&gt;Untrusted source&lt;\/b&gt;/);
});

test("SSR cooldown uses a stable initial state without consulting a hydration-sensitive clock", () => {
  for (const nextAnalysisAt of ["2099-01-01T00:00:00.000Z", "2000-01-01T00:00:00.000Z"]) {
    const props = propsFixture({ overview: { nextAnalysisAt } });
    const first = renderAnalysis(props);
    const second = renderAnalysis(props);
    assert.equal(first.html, second.html);
    assert.deepEqual(first.capture.initialValues, [null]);
    assert.match(first.html, /Checking next batch availability/);
    assert.doesNotMatch(first.html, /Next batch available in/);
    assert.match(submitButton(first.html), /disabled=""/);
  }
  const invalid = renderAnalysis(propsFixture({ overview: { nextAnalysisAt: "invalid-date" } })).html;
  assert.doesNotMatch(invalid, /Checking next batch availability/);
  assert.doesNotMatch(submitButton(invalid), /disabled=""/);
});

test("the analysis form receives the action bound to the selected thesis ID and version", async () => {
  const { html, capture } = renderAnalysis(propsFixture({ thesisId: "selected-thesis-id", thesisVersion: 7 }));
  assert.match(html, /<form\b[^>]*action="\/test-analysis"/);
  assert.deepEqual(Object.keys(capture.initialActionState), []);
  const previousState = { error: "Previous attempt" };
  const formData = new FormData();
  await capture.boundAction(previousState, formData);
  assert.equal(capture.calls.length, 1);
  assert.equal(capture.calls[0][0], "selected-thesis-id");
  assert.equal(capture.calls[0][1], 7);
  assert.equal(capture.calls[0][2], previousState);
  assert.equal(capture.calls[0][3], formData);
});

test("limited history is labeled as the latest fifty mappings rather than the entire record", () => {
  const mappings = Array.from({ length: 50 }, (_, index) => mappingFixture({ id: `mapping-${index}` }));
  const { html } = renderAnalysis(propsFixture({ overview: { mappings } }));
  assert.match(html, /Showing the 50 most recent mappings\. Earlier mappings remain saved/);
  assert.equal((html.match(/<article\b/g) ?? []).length, 50);
});

test("legacy Groq history keeps its original model label after switching the active provider", () => {
  const { html } = renderAnalysis(propsFixture({
    overview: {
      mappings: [mappingFixture({ provider: "groq", model: "openai/gpt-oss-120b" })],
    },
  }));
  assert.match(html, /openai\/gpt-oss-120b/);
  assert.match(html, /Analysis uses Google Gemini/);
  assert.match(html, /The reported increase supports the expected revenue trend/);
});
