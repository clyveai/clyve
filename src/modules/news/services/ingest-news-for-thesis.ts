import { GNewsRequestError, isGNewsConfigured, searchGNews } from "@/infrastructure/gnews/news-client";
import { newsRepository } from "../repositories/news-repository";
import { buildNewsQuery, prepareNewsArticles } from "./prepare-news-articles";
import type { NewsSyncResult } from "../types";

const SYNC_INTERVAL_MS = 15 * 60 * 1_000;
const NEWS_WINDOW_MS = 7 * 24 * 60 * 60 * 1_000;

export class NewsIngestionError extends Error {
  constructor(message: string, public readonly retryAt?: string) {
    super(message);
    this.name = "NewsIngestionError";
  }
}

export async function ingestNewsForThesis(userId: string, thesisId: string): Promise<NewsSyncResult> {
  const target = await newsRepository.findCompanyForUser(thesisId, userId);
  if (!target || target.status !== "active") {
    throw new NewsIngestionError("An active thesis with a verified company identity is required to sync news.");
  }
  if (!isGNewsConfigured()) {
    throw new NewsIngestionError("News sync is not configured yet.");
  }

  const attemptedAt = new Date();
  const nextSyncAt = new Date(attemptedAt.getTime() + SYNC_INTERVAL_MS);
  const claimed = await newsRepository.claimSync(target.companyCik, attemptedAt, nextSyncAt);
  if (!claimed) {
    const state = await newsRepository.getSyncState(target.companyCik);
    throw new NewsIngestionError("News was recently checked or a sync is in progress. Please try again later.", state?.nextSyncAt.toISOString());
  }

  try {
    const from = new Date(attemptedAt.getTime() - NEWS_WINDOW_MS);
    const articles = await searchGNews(buildNewsQuery(target), from, attemptedAt);
    const prepared = prepareNewsArticles(articles, target, from, attemptedAt);
    const addedCount = await newsRepository.persistArticles(target, prepared);
    const completedAt = new Date();
    const nextAllowedAt = new Date(completedAt.getTime() + SYNC_INTERVAL_MS);
    await newsRepository.completeSync(target.companyCik, attemptedAt, completedAt, nextAllowedAt);

    return {
      addedCount,
      skippedCount: articles.length - prepared.length,
      fetchedCount: articles.length,
      nextSyncAt: nextAllowedAt.toISOString(),
    };
  } catch (error) {
    throw new NewsIngestionError(
      error instanceof GNewsRequestError ? error.message : "We could not save the latest news. Please try again later.",
      nextSyncAt.toISOString(),
    );
  }
}
