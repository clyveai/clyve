import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { companyEvents, db, evidence, sources, theses } from "@/infrastructure/database";
import type { SecFilingEvidence, SecFilingListItem } from "../types";

type StoredSecFilingSource = {
  id: string;
  sourceKey: string;
  content: string | null;
  contentHash: string | null;
};

type PersistSecFilingInput = {
  ticker: string;
  source: {
    sourceKey: string;
    title: string;
    url: string;
    publishedAt: Date | null;
    content: string;
    contentHash: string;
    metadata: Record<string, unknown>;
  };
  event: {
    title: string;
    summary: string | null;
    occurredAt: Date | null;
  };
  evidence: SecFilingEvidence[];
};

type PersistSecFilingResult = {
  sourceCreated: boolean;
  eventCreated: boolean;
  evidenceInserted: number;
  sourceHashMismatch: boolean;
};

function metadataString(metadata: Record<string, unknown>, key: string) {
  const value = metadata[key];
  return typeof value === "string" && value.trim() ? value : null;
}

export const filingRepository = {
  async findProcessedSourceKeysForTicker(ticker: string, sourceKeys: string[]) {
    if (sourceKeys.length === 0) {
      return new Set<string>();
    }

    const rows = await db
      .select({ sourceKey: sources.sourceKey })
      .from(companyEvents)
      .innerJoin(sources, eq(companyEvents.sourceId, sources.id))
      .where(
        and(
          eq(companyEvents.ticker, ticker),
          eq(companyEvents.type, "filing"),
          inArray(sources.sourceKey, sourceKeys),
        ),
      );

    return new Set(rows.map((row) => row.sourceKey));
  },

  async findSourcesByKeys(sourceKeys: string[]) {
    if (sourceKeys.length === 0) {
      return new Map<string, StoredSecFilingSource>();
    }

    const rows = await db
      .select({
        id: sources.id,
        sourceKey: sources.sourceKey,
        content: sources.content,
        contentHash: sources.contentHash,
      })
      .from(sources)
      .where(inArray(sources.sourceKey, sourceKeys));

    return new Map(rows.map((row) => [row.sourceKey, row]));
  },

  async findSecFilingsForThesis(userId: string, thesisId: string, limit = 20): Promise<SecFilingListItem[]> {
    const rows = await db
      .select({
        id: companyEvents.id,
        title: companyEvents.title,
        summary: companyEvents.summary,
        occurredAt: companyEvents.occurredAt,
        sourceUrl: sources.url,
        metadata: sources.metadata,
      })
      .from(theses)
      .innerJoin(
        companyEvents,
        and(eq(companyEvents.ticker, theses.ticker), eq(companyEvents.type, "filing")),
      )
      .innerJoin(sources, eq(sources.id, companyEvents.sourceId))
      .where(
        and(
          eq(theses.id, thesisId),
          eq(theses.userId, userId),
          eq(sources.provider, "sec-edgar"),
          eq(sources.type, "sec_filing"),
          sql`${sources.metadata}->>'cik' = ${theses.companyCik}`,
        ),
      )
      .orderBy(desc(companyEvents.occurredAt), desc(companyEvents.createdAt))
      .limit(limit);

    return rows.map((row) => ({
      id: row.id,
      title: row.title,
      summary: row.summary,
      form: metadataString(row.metadata, "form"),
      accessionNumber: metadataString(row.metadata, "accessionNumber"),
      filingDate: metadataString(row.metadata, "filingDate"),
      reportDate: metadataString(row.metadata, "reportDate"),
      occurredAt: row.occurredAt,
      sourceUrl: row.sourceUrl,
      indexUrl: metadataString(row.metadata, "indexUrl"),
    }));
  },

  async persistSecFiling(input: PersistSecFilingInput): Promise<PersistSecFilingResult> {
    return db.transaction(async (tx) => {
      const [insertedSource] = await tx
        .insert(sources)
        .values({
          sourceKey: input.source.sourceKey,
          provider: "sec-edgar",
          type: "sec_filing",
          title: input.source.title,
          publisher: "U.S. Securities and Exchange Commission",
          url: input.source.url,
          publishedAt: input.source.publishedAt,
          content: input.source.content,
          contentHash: input.source.contentHash,
          metadata: input.source.metadata,
        })
        .onConflictDoNothing({ target: sources.sourceKey })
        .returning({ id: sources.id, contentHash: sources.contentHash });

      let sourceId = insertedSource?.id;
      let sourceCreated = Boolean(insertedSource);

      if (!sourceId) {
        const [existingSource] = await tx
          .select({ id: sources.id, contentHash: sources.contentHash })
          .from(sources)
          .where(eq(sources.sourceKey, input.source.sourceKey));

        if (!existingSource) {
          throw new Error("Unable to load the saved SEC filing source.");
        }

        if (existingSource.contentHash && existingSource.contentHash !== input.source.contentHash) {
          return {
            sourceCreated: false,
            eventCreated: false,
            evidenceInserted: 0,
            sourceHashMismatch: true,
          };
        }

        sourceId = existingSource.id;
        sourceCreated = false;
      }

      const [insertedEvent] = await tx
        .insert(companyEvents)
        .values({
          ticker: input.ticker,
          sourceId,
          type: "filing",
          title: input.event.title,
          summary: input.event.summary,
          occurredAt: input.event.occurredAt,
        })
        .onConflictDoNothing({ target: [companyEvents.sourceId, companyEvents.ticker, companyEvents.type] })
        .returning({ id: companyEvents.id });

      let eventId = insertedEvent?.id;
      const eventCreated = Boolean(insertedEvent);

      if (!eventId) {
        const [existingEvent] = await tx
          .select({ id: companyEvents.id })
          .from(companyEvents)
          .where(
            and(
              eq(companyEvents.sourceId, sourceId),
              eq(companyEvents.ticker, input.ticker),
              eq(companyEvents.type, "filing"),
            ),
          );

        if (!existingEvent) {
          throw new Error("Unable to load the saved SEC filing event.");
        }

        eventId = existingEvent.id;
      }

      const insertedEvidence = await tx
        .insert(evidence)
        .values(
          input.evidence.map((item) => ({
            sourceId,
            eventId,
            ticker: input.ticker,
            type: item.type,
            claim: item.claim,
            excerpt: item.excerpt,
            sourceLocator: item.sourceLocator,
            occurredAt: item.occurredAt,
            fingerprint: item.fingerprint,
            structuredData: item.structuredData,
          })),
        )
        .onConflictDoNothing({ target: evidence.fingerprint })
        .returning({ id: evidence.id });

      return {
        sourceCreated,
        eventCreated,
        evidenceInserted: insertedEvidence.length,
        sourceHashMismatch: false,
      };
    });
  },
};
