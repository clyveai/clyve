import { and, desc, eq, isNull, lte, or, sql } from "drizzle-orm";
import { companyEvents, db, newsSyncState, sources, theses } from "@/infrastructure/database";
import type { NewsCompanyTarget, NewsListItem, NewsSourceInput } from "../types";

export const newsRepository = {
  async findCompanyForUser(thesisId: string, userId: string): Promise<NewsCompanyTarget | null> {
    const [row] = await db.select({
      id: theses.id,
      ticker: theses.ticker,
      companyName: theses.companyName,
      companyCik: theses.companyCik,
      status: theses.status,
    }).from(theses).where(and(eq(theses.id, thesisId), eq(theses.userId, userId)));

    if (!row?.companyName || !row.companyCik) {
      return null;
    }

    return { ...row, companyName: row.companyName, companyCik: row.companyCik };
  },

  async findHistoryForUser(thesisId: string, userId: string): Promise<NewsListItem[]> {
    return db.selectDistinct({
      id: sources.id,
      title: sources.title,
      publisher: sources.publisher,
      url: sources.url,
      description: sql<string | null>`${sources.metadata}->>'description'`,
      publishedAt: sources.publishedAt,
    }).from(theses)
      .innerJoin(companyEvents, eq(companyEvents.companyCik, theses.companyCik))
      .innerJoin(sources, eq(sources.id, companyEvents.sourceId))
      .where(and(
        eq(theses.id, thesisId),
        eq(theses.userId, userId),
        eq(companyEvents.type, "news"),
        eq(sources.type, "news"),
        eq(sources.provider, "gnews"),
      ))
      .orderBy(desc(sources.publishedAt), desc(sources.id))
      .limit(20);
  },

  async getSyncState(companyCik: string) {
    const [state] = await db.select().from(newsSyncState).where(eq(newsSyncState.companyCik, companyCik));
    return state ?? null;
  },

  async claimSync(companyCik: string, attemptedAt: Date, nextSyncAt: Date) {
    const [claimed] = await db.insert(newsSyncState)
      .values({ companyCik, lastAttemptAt: attemptedAt, nextSyncAt })
      .onConflictDoUpdate({
        target: newsSyncState.companyCik,
        set: { lastAttemptAt: attemptedAt, nextSyncAt },
        setWhere: lte(newsSyncState.nextSyncAt, attemptedAt),
      })
      .returning({ companyCik: newsSyncState.companyCik });

    return Boolean(claimed);
  },

  async completeSync(companyCik: string, attemptedAt: Date, completedAt: Date, nextSyncAt: Date) {
    await db.update(newsSyncState)
      .set({ lastSyncedAt: completedAt, nextSyncAt })
      .where(and(eq(newsSyncState.companyCik, companyCik), eq(newsSyncState.lastAttemptAt, attemptedAt)));
  },

  async persistArticles(target: NewsCompanyTarget, articles: NewsSourceInput[]) {
    if (articles.length === 0) {
      return 0;
    }

    return db.transaction(async (tx) => {
      let addedCount = 0;

      const lockKeys = new Set(articles.flatMap((article) => [
        article.sourceKey,
        ...(article.providerArticleId ? [`gnews:id:${article.providerArticleId}`] : []),
      ]));
      for (const key of [...lockKeys].sort()) {
        await tx.execute(sql`select pg_advisory_xact_lock(hashtextextended(${key}, 0))`);
      }

      for (const article of [...articles].sort((left, right) => left.sourceKey.localeCompare(right.sourceKey))) {
        const [inserted] = await tx.insert(sources).values({
          sourceKey: article.sourceKey,
          provider: "gnews",
          providerArticleId: article.providerArticleId,
          type: "news",
          title: article.title,
          publisher: article.publisher,
          url: article.url,
          publishedAt: article.publishedAt,
          content: article.content,
          contentHash: article.contentHash,
          metadata: article.metadata,
        }).onConflictDoNothing().returning({ id: sources.id, title: sources.title, metadata: sources.metadata, publishedAt: sources.publishedAt });

        const saved = inserted ?? (await tx.select({ id: sources.id, title: sources.title, metadata: sources.metadata, publishedAt: sources.publishedAt }).from(sources).where(and(
          eq(sources.type, "news"),
          eq(sources.provider, "gnews"),
          or(
            eq(sources.sourceKey, article.sourceKey),
            article.providerArticleId ? eq(sources.providerArticleId, article.providerArticleId) : undefined,
          ),
        )).orderBy(desc(sql`coalesce(${sources.providerArticleId} = ${article.providerArticleId}, false)`), desc(sources.id)).limit(1))[0];

        if (!saved) {
          throw new Error("Unable to load saved news article.");
        }

        if (article.providerArticleId) {
          await tx.update(sources).set({ providerArticleId: article.providerArticleId })
            .where(and(eq(sources.id, saved.id), isNull(sources.providerArticleId)));
        }

        const [existingEvent] = await tx.select({ id: companyEvents.id }).from(companyEvents).where(and(
          eq(companyEvents.sourceId, saved.id),
          eq(companyEvents.companyCik, target.companyCik),
          eq(companyEvents.type, "news"),
        )).limit(1);

        if (existingEvent) {
          continue;
        }

        const [event] = await tx.insert(companyEvents).values({
          sourceId: saved.id,
          companyCik: target.companyCik,
          ticker: target.ticker,
          type: "news",
          title: saved.title,
          summary: typeof saved.metadata.description === "string" ? saved.metadata.description : null,
          occurredAt: saved.publishedAt,
        }).onConflictDoNothing().returning({ id: companyEvents.id });

        if (event) {
          addedCount += 1;
        }
      }

      return addedCount;
    });
  },
};
