import { and, asc, desc, eq } from "drizzle-orm";
import { db, thesisAssumptions, theses } from "@/infrastructure/database";
import type { CreateThesisInput, ThesisDetail, ThesisListItem } from "../types";

type CreateThesisRecordInput = CreateThesisInput & {
  userId: string;
};

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
        position: theses.position,
        title: theses.title,
        thesis: theses.thesis,
        timeHorizon: theses.timeHorizon,
        status: theses.status,
        health: theses.health,
        createdAt: theses.createdAt,
        updatedAt: theses.updatedAt,
        assumptionId: thesisAssumptions.id,
        assumptionStatement: thesisAssumptions.statement,
        assumptionExpectedOutcome: thesisAssumptions.expectedOutcome,
        assumptionMetric: thesisAssumptions.metric,
        assumptionImportance: thesisAssumptions.importance,
      })
      .from(theses)
      .leftJoin(thesisAssumptions, eq(thesisAssumptions.thesisId, theses.id))
      .where(and(eq(theses.id, thesisId), eq(theses.userId, userId)))
      .orderBy(asc(thesisAssumptions.sortOrder));

    const firstRow = rows[0];
    if (!firstRow) {
      return null;
    }

    return {
      id: firstRow.id,
      ticker: firstRow.ticker,
      companyName: firstRow.companyName,
      position: firstRow.position,
      title: firstRow.title,
      thesis: firstRow.thesis,
      timeHorizon: firstRow.timeHorizon,
      status: firstRow.status,
      health: firstRow.health,
      createdAt: firstRow.createdAt,
      updatedAt: firstRow.updatedAt,
      assumptions: rows.flatMap((row) =>
        row.assumptionId && row.assumptionStatement && row.assumptionImportance
          ? [
              {
                id: row.assumptionId,
                statement: row.assumptionStatement,
                expectedOutcome: row.assumptionExpectedOutcome,
                metric: row.assumptionMetric,
                importance: row.assumptionImportance,
              },
            ]
          : [],
      ),
    };
  },

  async findManyForUser(userId: string): Promise<ThesisListItem[]> {
    return db
      .select({
        id: theses.id,
        ticker: theses.ticker,
        companyName: theses.companyName,
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
