import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";
import ts from "typescript";

const projectRoot = fileURLToPath(new URL("../", import.meta.url));
config({ path: path.join(projectRoot, ".env.local"), quiet: true });

const modules = new Map();
function loadModule(filename) {
  const absolute = path.resolve(projectRoot, filename);
  if (modules.has(absolute)) return modules.get(absolute);
  const module = { exports: {} };
  const localRequire = createRequire(absolute);
  const compiled = ts.transpileModule(readFileSync(absolute, "utf8"), {
    compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS },
  }).outputText;
  const requireModule = (name) => {
    if (name.startsWith("@/")) return loadModule(`src/${name.slice(2)}.ts`);
    if (name.startsWith(".")) return loadModule(path.resolve(path.dirname(absolute), `${name}.ts`));
    return localRequire(name);
  };
  new Function("require", "module", "exports", compiled)(requireModule, module, module.exports);
  modules.set(absolute, module.exports);
  return module.exports;
}

const { GroqClientError } = loadModule("src/infrastructure/ai/groq.ts");
const { EvidenceMappingValidationError } = loadModule("src/modules/thesis/schemas/evidence-mapping.ts");
const { mapEvidenceToAssumptions } = loadModule("src/modules/thesis/services/map-evidence-to-assumptions.ts");

try {
  const result = await mapEvidenceToAssumptions({
    thesis: {
      id: "demo-thesis",
      ticker: "DEMO",
      narrative: "This synthetic test thesis assumes annual revenue growth stays above 20%.",
      timeHorizon: "Fiscal year 2026",
      version: 1,
    },
    assumptions: [{
      id: "demo-assumption",
      statement: "Annual revenue growth is above 20% in fiscal year 2026.",
      expectedOutcome: "Annual revenue growth above 20%",
      metric: "Year-over-year annual revenue growth",
      retiredAt: null,
    }],
    evidence: [{
      id: "demo-evidence",
      ticker: "DEMO",
      sourceId: "demo-source",
      sourceUrl: "https://example.invalid/synthetic-filing",
      sourceLocator: "Synthetic revenue excerpt",
      claim: "Annual revenue grew 25% in fiscal year 2026.",
      excerpt: "Annual revenue grew 25% in fiscal year 2026 compared with fiscal year 2025.",
      kind: "excerpt",
    }],
  });

  const mapping = result.mappings[0];
  if (mapping.relationship !== "supporting") {
    console.error("Groq responded, but the synthetic evidence was not classified as supporting. Review the model before using it.");
    process.exitCode = 1;
  } else {
    console.log("AI connection and synthetic evidence mapping passed.");
    console.log(JSON.stringify({
      provider: result.provider,
      model: result.model,
      promptVersion: result.promptVersion,
      relationship: mapping.relationship,
      materiality: mapping.materiality,
      confidence: mapping.confidence,
    }, null, 2));
    console.log("Only synthetic data was sent. No database records were read or written.");
  }
} catch (error) {
  if (error instanceof GroqClientError || error instanceof EvidenceMappingValidationError) {
    console.error(error.message);
  } else {
    console.error("The AI connection check failed unexpectedly. Run pnpm ai:test and review the local configuration.");
  }
  process.exitCode = 1;
}
