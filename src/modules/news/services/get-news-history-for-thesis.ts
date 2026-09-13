import { isGNewsConfigured } from "@/infrastructure/gnews/news-client";
import { newsRepository } from "../repositories/news-repository";
import type { NewsHistoryData } from "../types";

export async function getNewsHistoryForThesis(userId: string, thesisId: string): Promise<NewsHistoryData> {
  const target = await newsRepository.findCompanyForUser(thesisId, userId);
  const configured = isGNewsConfigured();

  if (!target) {
    return { articles: [], lastSyncedAt: null, nextSyncAt: null, configured };
  }

  const [articles, state] = await Promise.all([
    newsRepository.findHistoryForUser(thesisId, userId),
    newsRepository.getSyncState(target.companyCik),
  ]);

  return {
    articles,
    lastSyncedAt: state?.lastSyncedAt ?? null,
    nextSyncAt: state?.nextSyncAt ?? null,
    configured,
  };
}
