export type NewsCompanyTarget = {
  id: string;
  ticker: string;
  companyName: string;
  companyCik: string;
  status: "active" | "paused" | "archived";
};

export type NewsListItem = {
  id: string;
  title: string;
  publisher: string | null;
  url: string;
  description: string | null;
  publishedAt: Date | null;
};

export type NewsHistoryData = {
  articles: NewsListItem[];
  lastSyncedAt: Date | null;
  nextSyncAt: Date | null;
  configured: boolean;
};

export type NewsSyncResult = {
  addedCount: number;
  skippedCount: number;
  fetchedCount: number;
  nextSyncAt: string;
};

export type NewsSourceInput = {
  sourceKey: string;
  providerArticleId: string | null;
  title: string;
  publisher: string;
  url: string;
  description: string | null;
  content: string | null;
  contentHash: string;
  publishedAt: Date;
  metadata: Record<string, unknown>;
};
