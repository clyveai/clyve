import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { db, evidenceAssumptions, thesisAlerts, thesisAssumptions, theses } from "@/infrastructure/database";
import type {
  CreateThesisInput,
  ThesisAssumptionUpdateInput,
  ThesisDetail,
  ThesisFilingTarget,
  ThesisListItem,
  UpdateThesisInput,
} from "../types";

type CreateThesisRecordInput = CreateThesisInput & {
  userId: string;
  companyName: string;
  companyCik: string;
};

type UpdateThesisRecordInput = UpdateThesisInput & {
  thesisId: string;
  userId: string;
};

type ExistingAssumption = {
  id: string;
  statement: string;
  expectedOutcome: string | null;
  metric: string | null;
  importance: ThesisAssumptionUpdateInput["importance"];
  sortOrder: number;
};

function optionalValue(value: string | undefined | null) {
  return value || null;
}

function isSameAssumption(current: ExistingAssumption, next: ThesisAssumptionUpdateInput) {
  return (
    current.statement === next.statement &&
    current.expectedOutcome === optionalValue(next.expectedOutcome) &&
    current.metric === optionalValue(next.metric) &&
    current.importance === next.importance
  );
}

/** The sole database boundary for the thesis domain. */
export const thesisRepository = {
  async createWithAssumptions(input: CreateThesisRecordInput) {
    return db.transaction(async (tx) => {
      const [createdThesis] = await tx
        .insert(theses)
        .values({
          userId: input.userId,
          ticker: input.ticker,
          companyName: input.companyName,
          companyCik: input.companyCik,
          position: input.position,
          title: input.title,
          thesis: input.thesis,
          timeHorizon: input.timeHorizon,
        })
        .returning({ id: theses.id });

      if (!createdThesis) {
        throw new Error("Unable to create thesis.");
      }

      await tx.insert(thesisAssumptions).values(
        input.assumptions.map((assumption, index) => ({
          thesisId: createdThesis.id,
          statement: assumption.statement,
          expectedOutcome: assumption.expectedOutcome,
          metric: assumption.metric,
          importance: assumption.importance,
          sortOrder: index,
        })),
      );

      return createdThesis;
    });
  },

  async findByIdForUser(thesisId: string, userId: string): Promise<ThesisDetail | null> {
    const rows = await db
      .select({
        id: theses.id,
        ticker: theses.ticker,
        companyName: theses.companyName,
        companyCik: theses.companyCik,
        position: theses.position,
        title: theses.title,
        thesis: theses.thesis,
        timeHorizon: theses.timeHorizon,
        status: theses.status,
        health: theses.health,
        version: theses.version,
        archivedAt: theses.archivedAt,
        createdAt: theses.createdAt,
        updatedAt: theses.updatedAt,
        assumptionId: thesisAssumptions.id,
        assumptionStatement: thesisAssumptions.statement,
        assumptionExpectedOutcome: thesisAssumptions.expectedOutcome,
        assumptionMetric: thesisAssumptions.metric,
        assumptionImportance: thesisAssumptions.importance,
        assumptionStatus: thesisAssumptions.status,
        assumptionRetiredAt: thesisAssumptions.retiredAt,
      })
      .from(theses)
      .leftJoin(thesisAssumptions, eq(thesisAssumptions.thesisId, theses.id))
      .where(and(eq(theses.id, thesisId), eq(theses.userId, userId)))
      .orderBy(asc(thesisAssumptions.sortOrder));

    const firstRow = rows[0];
    if (!firstRow) {
      return null;
    }

    const assumptions = rows.flatMap((row) =>
      row.assumptionId && row.assumptionStatement && row.assumptionImportance && row.assumptionStatus
        ? [
            {
              id: row.assumptionId,
              statement: row.assumptionStatement,
              expectedOutcome: row.assumptionExpectedOutcome,
              metric: row.assumptionMetric,
              importance: row.assumptionImportance,
              status: row.assumptionStatus,
              retiredAt: row.assumptionRetiredAt,
            },
          ]
        : [],
    );

    return {
      id: firstRow.id,
      ticker: firstRow.ticker,
      companyName: firstRow.companyName,
      companyCik: firstRow.companyCik,
      position: firstRow.position,
      title: firstRow.title,
      thesis: firstRow.thesis,
      timeHorizon: firstRow.timeHorizon,
      status: firstRow.status,
      health: firstRow.health,
      version: firstRow.version,
      archivedAt: firstRow.archivedAt,
      createdAt: firstRow.createdAt,
      updatedAt: firstRow.updatedAt,
      assumptions: assumptions.filter((assumption) => assumption.status === "active"),
      retiredAssumptions: assumptions.filter((assumption) => assumption.status === "retired"),
    };
  },

  async updateForUserWithAssumptions(input: UpdateThesisRecordInput) {
    return db.transaction(async (tx) => {
      const now = new Date();
      const [updatedThesis] = await tx
        .update(theses)
        .set({
          thesis: input.thesis,
          timeHorizon: input.timeHorizon ?? null,
          version: input.version + 1,
          updatedAt: now,
        })
        .where(
          and(
            eq(theses.id, input.thesisId),
            eq(theses.userId, input.userId),
            eq(theses.status, "active"),
            eq(theses.version, input.version),
          ),
        )
        .returning({ id: theses.id });

      if (!updatedThesis) {
        throw new Error("This thesis was changed or archived in another session. Reload and try again.");
      }

      const currentAssumptions = await tx
        .select({
          id: thesisAssumptions.id,
          statement: thesisAssumptions.statement,
          expectedOutcome: thesisAssumptions.expectedOutcome,
          metric: thesisAssumptions.metric,
          importance: thesisAssumptions.importance,
          sortOrder: thesisAssumptions.sortOrder,
        })
        .from(thesisAssumptions)
        .where(and(eq(thesisAssumptions.thesisId, input.thesisId), eq(thesisAssumptions.status, "active")))
        .orderBy(asc(thesisAssumptions.sortOrder));

      const assumptionsById = new Map(currentAssumptions.map((assumption) => [assumption.id, assumption]));
      const submittedExistingIds = input.assumptions.flatMap((assumption) => (assumption.id ? [assumption.id] : []));

      if (submittedExistingIds.some((id) => !assumptionsById.has(id))) {
        throw new Error("An assumption is no longer active. Reload the page and try again.");
      }

      const currentAssumptionIds = currentAssumptions.map((assumption) => assumption.id);
      const historyAssumptionIds = new Set<string>();

      if (currentAssumptionIds.length > 0) {
        const evidenceLinks = await tx
          .select({ assumptionId: evidenceAssumptions.thesisAssumptionId })
          .from(evidenceAssumptions)
          .where(inArray(evidenceAssumptions.thesisAssumptionId, currentAssumptionIds));
        const alerts = await tx
          .select({ assumptionId: thesisAlerts.thesisAssumptionId })
          .from(thesisAlerts)
          .where(inArray(thesisAlerts.thesisAssumptionId, currentAssumptionIds));

        for (const row of evidenceLinks) {
          historyAssumptionIds.add(row.assumptionId);
        }

        for (const row of alerts) {
          historyAssumptionIds.add(row.assumptionId);
        }
      }

      const submittedIds = new Set(submittedExistingIds);

      for (const [index, assumption] of input.assumptions.entries()) {
        const current = assumption.id ? assumptionsById.get(assumption.id) : undefined;

        if (!current) {
          await tx.insert(thesisAssumptions).values({
            thesisId: input.thesisId,
            statement: assumption.statement,
            expectedOutcome: optionalValue(assumption.expectedOutcome),
            metric: optionalValue(assumption.metric),
            importance: assumption.importance,
            sortOrder: index,
          });
          continue;
        }

        if (isSameAssumption(current, assumption)) {
          if (current.sortOrder !== index) {
            await tx
              .update(thesisAssumptions)
              .set({ sortOrder: index, updatedAt: now })
              .where(eq(thesisAssumptions.id, current.id));
          }
          continue;
        }

        if (historyAssumptionIds.has(current.id)) {
          await tx
            .update(thesisAssumptions)
            .set({ status: "retired", retiredAt: now, updatedAt: now })
            .where(eq(thesisAssumptions.id, current.id));

          await tx.insert(thesisAssumptions).values({
            thesisId: input.thesisId,
            statement: assumption.statement,
            expectedOutcome: optionalValue(assumption.expectedOutcome),
            metric: optionalValue(assumption.metric),
            importance: assumption.importance,
            sortOrder: index,
          });
          continue;
        }

        await tx
          .update(thesisAssumptions)
          .set({
            statement: assumption.statement,
            expectedOutcome: optionalValue(assumption.expectedOutcome),
            metric: optionalValue(assumption.metric),
            importance: assumption.importance,
            sortOrder: index,
            updatedAt: now,
          })
          .where(eq(thesisAssumptions.id, current.id));
      }

      for (const current of currentAssumptions) {
        if (submittedIds.has(current.id)) {
          continue;
        }

        await tx
          .update(thesisAssumptions)
          .set({ status: "retired", retiredAt: now, updatedAt: now })
          .where(eq(thesisAssumptions.id, current.id));
      }

      return updatedThesis;
    });
  },

  async archiveForUser(thesisId: string, userId: string, version: number) {
    const now = new Date();
    const [archivedThesis] = await db
      .update(theses)
      .set({
        status: "archived",
        archivedAt: now,
        version: version + 1,
        updatedAt: now,
      })
      .where(
        and(
          eq(theses.id, thesisId),
          eq(theses.userId, userId),
          eq(theses.status, "active"),
          eq(theses.version, version),
        ),
      )
      .returning({ id: theses.id });

    return archivedThesis ?? null;
  },

  async findActiveFilingTargetForUser(thesisId: string, userId: string): Promise<ThesisFilingTarget | null> {
    const [target] = await db
      .select({
        id: theses.id,
        ticker: theses.ticker,
        companyCik: theses.companyCik,
      })
      .from(theses)
      .where(and(eq(theses.id, thesisId), eq(theses.userId, userId), eq(theses.status, "active")));

    const companyCik = target?.companyCik;
    if (!target || !companyCik) {
      return null;
    }

    return { id: target.id, ticker: target.ticker, companyCik };
  },

  async findManyForUser(userId: string): Promise<ThesisListItem[]> {
    return db
      .select({
        id: theses.id,
        ticker: theses.ticker,
        companyName: theses.companyName,
        companyCik: theses.companyCik,
        position: theses.position,
        title: theses.title,
        status: theses.status,
        health: theses.health,
        updatedAt: theses.updatedAt,
      })
      .from(theses)
      .where(eq(theses.userId, userId))
      .orderBy(desc(theses.updatedAt))
      .limit(50);
  },
};
