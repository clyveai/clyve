import { and, asc, count, countDistinct, desc, eq, gt, inArray, isNotNull, isNull, lte, or, sql } from "drizzle-orm";
import {
  companyEvents,
  db,
  evidence,
  evidenceAssumptions,
  sources,
  thesisAssumptions,
  theses,
  thesisEvidenceAnalysisState,
} from "@/infrastructure/database";
import type {
  EvidenceAnalysisCandidates,
  EvidenceAnalysisOverview,
  PersistEvidenceAnalysisInput,
} from "../evidence-analysis-types";
import { parseEvidenceMappingOutput, validateEvidenceMappingInput } from "../schemas/evidence-mapping";

export class EvidenceAnalysisStorageError extends Error {
  constructor(message = "The thesis or evidence changed during analysis. Reload and try again.") {
    super(message);
    this.name = "EvidenceAnalysisStorageError";
  }
}

function ownedSourceConditions(userId: string, thesisId: string) {
  return and(
    eq(theses.id, thesisId),
    eq(theses.userId, userId),
    eq(evidence.ticker, theses.ticker),
    eq(sources.provider, "sec-edgar"),
    eq(sources.type, "sec_filing"),
    sql`${sources.metadata}->>'cik' = ${theses.companyCik}`,
  );
}

function filingEventConditions() {
  return and(
    eq(companyEvents.id, evidence.eventId),
    eq(companyEvents.sourceId, sources.id),
    eq(companyEvents.ticker, theses.ticker),
    eq(companyEvents.type, "filing"),
    or(isNull(companyEvents.companyCik), eq(companyEvents.companyCik, theses.companyCik)),
  );
}

function literalExcerptConditions() {
  return and(
    sql`${evidence.structuredData}->>'evidenceKind' = 'literal_excerpt'`,
    isNotNull(evidence.excerpt),
  );
}

export const evidenceAnalysisRepository = {
  async getOverviewForUser(userId: string, thesisId: string): Promise<EvidenceAnalysisOverview> {
    const [eligibleRows, pendingRows, mappingRows, stateRows] = await Promise.all([
      db.select({ total: countDistinct(evidence.id) }).from(theses)
        .innerJoin(evidence, eq(evidence.ticker, theses.ticker))
        .innerJoin(sources, eq(sources.id, evidence.sourceId))
        .innerJoin(companyEvents, filingEventConditions())
        .where(and(ownedSourceConditions(userId, thesisId), literalExcerptConditions())),
      db.select({ total: count() }).from(theses)
        .innerJoin(thesisAssumptions, and(eq(thesisAssumptions.thesisId, theses.id), eq(thesisAssumptions.status, "active")))
        .innerJoin(evidence, eq(evidence.ticker, theses.ticker))
        .innerJoin(sources, eq(sources.id, evidence.sourceId))
        .innerJoin(companyEvents, filingEventConditions())
        .leftJoin(evidenceAssumptions, and(eq(evidenceAssumptions.evidenceId, evidence.id), eq(evidenceAssumptions.thesisAssumptionId, thesisAssumptions.id)))
        .where(and(ownedSourceConditions(userId, thesisId), literalExcerptConditions(), isNull(evidenceAssumptions.id))),
      db.select({
        id: evidenceAssumptions.id,
        evidenceId: evidence.id,
        assumptionId: thesisAssumptions.id,
        assumptionStatement: thesisAssumptions.statement,
        assumptionStatus: thesisAssumptions.status,
        relationship: evidenceAssumptions.relationship,
        materiality: evidenceAssumptions.materiality,
        rationale: evidenceAssumptions.rationale,
        confidence: evidenceAssumptions.confidence,
        sourceQuote: evidenceAssumptions.sourceQuote,
        claim: evidence.claim,
        sourceTitle: sources.title,
        sourceUrl: sources.url,
        sourceLocator: evidence.sourceLocator,
        provider: evidenceAssumptions.aiProvider,
        model: evidenceAssumptions.aiModel,
        promptVersion: evidenceAssumptions.promptVersion,
        thesisVersion: evidenceAssumptions.thesisVersion,
        createdAt: evidenceAssumptions.createdAt,
      }).from(theses)
        .innerJoin(thesisAssumptions, eq(thesisAssumptions.thesisId, theses.id))
        .innerJoin(evidenceAssumptions, eq(evidenceAssumptions.thesisAssumptionId, thesisAssumptions.id))
        .innerJoin(evidence, eq(evidence.id, evidenceAssumptions.evidenceId))
        .innerJoin(sources, eq(sources.id, evidence.sourceId))
        .innerJoin(companyEvents, filingEventConditions())
        .where(ownedSourceConditions(userId, thesisId))
        .orderBy(desc(evidenceAssumptions.createdAt), desc(evidenceAssumptions.id))
        .limit(50),
      db.select({ nextAnalysisAt: thesisEvidenceAnalysisState.nextAnalysisAt }).from(theses)
        .innerJoin(thesisEvidenceAnalysisState, eq(thesisEvidenceAnalysisState.thesisId, theses.id))
        .where(and(eq(theses.id, thesisId), eq(theses.userId, userId)))
        .limit(1),
    ]);

    return {
      eligibleEvidenceCount: Number(eligibleRows[0]?.total ?? 0),
      pendingPairCount: Number(pendingRows[0]?.total ?? 0),
      nextAnalysisAt: stateRows[0]?.nextAnalysisAt.toISOString() ?? null,
      mappings: mappingRows.map(({ assumptionStatus, createdAt, confidence, ...row }) => ({
        ...row,
        assumptionRetired: assumptionStatus === "retired",
        confidence: confidence ?? 0,
        createdAt: createdAt.toISOString(),
      })),
    };
  },

  async findNextCandidatesForUser(userId: string, thesisId: string): Promise<EvidenceAnalysisCandidates | null> {
    const rows = await db.select({
      evidenceId: evidence.id,
      ticker: evidence.ticker,
      sourceId: sources.id,
      sourceUrl: sources.url,
      sourceLocator: evidence.sourceLocator,
      claim: evidence.claim,
      excerpt: evidence.excerpt,
      assumptionId: thesisAssumptions.id,
      statement: thesisAssumptions.statement,
      expectedOutcome: thesisAssumptions.expectedOutcome,
      metric: thesisAssumptions.metric,
      retiredAt: thesisAssumptions.retiredAt,
    }).from(theses)
      .innerJoin(thesisAssumptions, and(eq(thesisAssumptions.thesisId, theses.id), eq(thesisAssumptions.status, "active")))
      .innerJoin(evidence, eq(evidence.ticker, theses.ticker))
      .innerJoin(sources, eq(sources.id, evidence.sourceId))
      .innerJoin(companyEvents, filingEventConditions())
      .leftJoin(evidenceAssumptions, and(eq(evidenceAssumptions.evidenceId, evidence.id), eq(evidenceAssumptions.thesisAssumptionId, thesisAssumptions.id)))
      .where(and(ownedSourceConditions(userId, thesisId), eq(theses.status, "active"), literalExcerptConditions(), isNull(evidenceAssumptions.id)))
      .orderBy(desc(sql`coalesce(${evidence.occurredAt}, ${evidence.createdAt})`), desc(evidence.createdAt), desc(evidence.id), asc(thesisAssumptions.sortOrder), asc(thesisAssumptions.id))
      .limit(3);

    const first = rows[0];
    if (!first) return null;
    if (first.excerpt === null) throw new EvidenceAnalysisStorageError("The saved evidence has no excerpt to analyze.");

    return {
      evidence: {
        id: first.evidenceId,
        ticker: first.ticker,
        sourceId: first.sourceId,
        sourceUrl: first.sourceUrl,
        sourceLocator: first.sourceLocator,
        claim: first.claim,
        excerpt: first.excerpt,
        kind: "excerpt",
      },
      assumptions: rows.filter((row) => row.evidenceId === first.evidenceId).map((row) => ({
        id: row.assumptionId,
        statement: row.statement,
        expectedOutcome: row.expectedOutcome,
        metric: row.metric,
        retiredAt: row.retiredAt,
      })),
    };
  },

  async claimAnalysis(userId: string, thesisId: string, expectedVersion: number, attemptedAt: Date, nextAnalysisAt: Date): Promise<boolean> {
    return db.transaction(async (tx) => {
      const [ownedThesis] = await tx.select({ id: theses.id }).from(theses)
        .where(and(eq(theses.id, thesisId), eq(theses.userId, userId), eq(theses.status, "active"), eq(theses.version, expectedVersion)))
        .for("update");
      if (!ownedThesis) return false;

      const [claimed] = await tx.insert(thesisEvidenceAnalysisState).values({ thesisId, lastAttemptAt: attemptedAt, nextAnalysisAt })
        .onConflictDoUpdate({
          target: thesisEvidenceAnalysisState.thesisId,
          set: { lastAttemptAt: attemptedAt, nextAnalysisAt },
          setWhere: lte(thesisEvidenceAnalysisState.nextAnalysisAt, attemptedAt),
        })
        .returning({ thesisId: thesisEvidenceAnalysisState.thesisId });
      return Boolean(claimed);
    });
  },

  async persistForUser(input: PersistEvidenceAnalysisInput): Promise<number> {
    validateEvidenceMappingInput(input.snapshot);
    const { snapshot, result } = input;
    if (snapshot.thesis.id !== input.thesisId || snapshot.thesis.version !== input.expectedVersion
      || result.thesisId !== input.thesisId || result.thesisVersion !== input.expectedVersion
      || result.provider !== "gemini" || !result.model.trim() || !result.promptVersion.trim()) {
      throw new EvidenceAnalysisStorageError();
    }
    const mappings = parseEvidenceMappingOutput({ mappings: result.mappings.map(({ evidenceId, assumptionId, relationship, materiality, rationale, confidence, sourceQuote }) => ({
      evidenceId, assumptionId, relationship, materiality, rationale, confidence, sourceQuote,
    })) }, snapshot);

    return db.transaction(async (tx) => {
      const [ownedThesis] = await tx.select().from(theses)
        .where(and(eq(theses.id, input.thesisId), eq(theses.userId, input.userId), eq(theses.status, "active")))
        .for("update");
      if (!ownedThesis || ownedThesis.version !== input.expectedVersion
        || ownedThesis.ticker !== snapshot.thesis.ticker || ownedThesis.thesis !== snapshot.thesis.narrative
        || ownedThesis.timeHorizon !== snapshot.thesis.timeHorizon) {
        throw new EvidenceAnalysisStorageError();
      }

      const [lease] = await tx.select({ thesisId: thesisEvidenceAnalysisState.thesisId }).from(thesisEvidenceAnalysisState)
        .where(and(
          eq(thesisEvidenceAnalysisState.thesisId, input.thesisId),
          eq(thesisEvidenceAnalysisState.lastAttemptAt, input.attemptedAt),
          gt(thesisEvidenceAnalysisState.nextAnalysisAt, new Date()),
        ));
      if (!lease) throw new EvidenceAnalysisStorageError("The analysis session expired. Reload and try again.");

      const currentAssumptions = await tx.select().from(thesisAssumptions)
        .where(and(eq(thesisAssumptions.thesisId, input.thesisId), eq(thesisAssumptions.status, "active"), inArray(thesisAssumptions.id, snapshot.assumptions.map((item) => item.id))));
      const assumptionsById = new Map(currentAssumptions.map((item) => [item.id, item]));
      if (currentAssumptions.length !== snapshot.assumptions.length || snapshot.assumptions.some((item) => {
        const current = assumptionsById.get(item.id);
        return !current || current.statement !== item.statement || current.expectedOutcome !== item.expectedOutcome
          || current.metric !== item.metric || current.retiredAt !== null;
      })) throw new EvidenceAnalysisStorageError();

      const currentEvidence = await tx.select({
        id: evidence.id,
        ticker: evidence.ticker,
        sourceId: sources.id,
        sourceUrl: sources.url,
        sourceLocator: evidence.sourceLocator,
        claim: evidence.claim,
        excerpt: evidence.excerpt,
      }).from(theses)
        .innerJoin(evidence, eq(evidence.ticker, theses.ticker))
        .innerJoin(sources, eq(sources.id, evidence.sourceId))
        .innerJoin(companyEvents, filingEventConditions())
        .where(and(ownedSourceConditions(input.userId, input.thesisId), literalExcerptConditions(), inArray(evidence.id, snapshot.evidence.map((item) => item.id))));
      const evidenceById = new Map(currentEvidence.map((item) => [item.id, item]));
      if (currentEvidence.length !== snapshot.evidence.length || snapshot.evidence.some((item) => {
        const current = evidenceById.get(item.id);
        return item.kind !== "excerpt" || !current || current.ticker !== item.ticker || current.sourceId !== item.sourceId
          || current.sourceUrl !== item.sourceUrl || current.sourceLocator !== item.sourceLocator
          || current.claim !== item.claim || current.excerpt !== item.excerpt;
      })) throw new EvidenceAnalysisStorageError();

      const inserted = await tx.insert(evidenceAssumptions).values(mappings.map((item) => ({
        evidenceId: item.evidenceId,
        thesisAssumptionId: item.assumptionId,
        relationship: item.relationship,
        materiality: item.materiality,
        rationale: item.rationale,
        confidence: item.confidence,
        sourceQuote: item.sourceQuote,
        aiProvider: result.provider,
        aiModel: result.model,
        promptVersion: result.promptVersion,
        thesisVersion: input.expectedVersion,
      }))).onConflictDoNothing({ target: [evidenceAssumptions.evidenceId, evidenceAssumptions.thesisAssumptionId] })
        .returning({ id: evidenceAssumptions.id });
      return inserted.length;
    });
  },
};
