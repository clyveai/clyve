import { setTimeout as delay } from "node:timers/promises";

const GNEWS_SEARCH_URL = "https://gnews.io/api/v4/search";
const GNEWS_REQUEST_TIMEOUT_MS = 12_000;
const GNEWS_MAX_ARTICLES = 10;
const GNEWS_MIN_REQUEST_INTERVAL_MS = 1_000;

let nextRequestAt = 0;

export type GNewsArticle = {
  id: string | null;
  title: string;
  description: string | null;
  content: string | null;
  url: string;
  publishedAt: Date;
  publisher: string;
  contentTruncated: boolean;
};

export class GNewsRequestError extends Error {
  constructor(
    message = "Company news is temporarily unavailable. Please try again later.",
    readonly status: number | null = null,
  ) {
    super(message);
    this.name = "GNewsRequestError";
  }
}

export function isGNewsConfigured() {
  return Boolean(process.env.GNEWS_API_KEY?.trim());
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function optionalText(value: unknown) {
  return typeof value === "string" ? value.trim() || null : null;
}

function articleUrl(value: unknown) {
  const text = optionalText(value);
  if (!text) return null;

  try {
    const url = new URL(text);
    if (!["https:", "http:"].includes(url.protocol) || url.username || url.password) {
      return null;
    }

    return url.toString();
  } catch {
    return null;
  }
}

function parseArticle(value: unknown): GNewsArticle | null {
  if (!isRecord(value) || !isRecord(value.source)) return null;

  const title = optionalText(value.title);
  const publisher = optionalText(value.source.name);
  const url = articleUrl(value.url);
  const publishedAtText = optionalText(value.publishedAt);
  if (!title || !publisher || !url || !publishedAtText) return null;
  if (!/^\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(publishedAtText)) {
    return null;
  }

  const [year, month, day] = publishedAtText.slice(0, 10).split("-").map(Number);
  if (day > new Date(Date.UTC(year, month, 0)).getUTCDate()) return null;

  const publishedAt = new Date(publishedAtText);
  if (!Number.isFinite(publishedAt.getTime())) return null;

  return {
    id: optionalText(value.id),
    title,
    description: optionalText(value.description),
    content: optionalText(value.content),
    url,
    publishedAt,
    publisher,
    contentTruncated: true,
  };
}

function parseArticles(payload: unknown, from: Date, to: Date) {
  if (!isRecord(payload) || !Array.isArray(payload.articles)) {
    throw new GNewsRequestError("The news provider returned an invalid response. Please try again later.");
  }

  const articles = payload.articles.slice(0, GNEWS_MAX_ARTICLES).flatMap((value) => {
    const article = parseArticle(value);
    return article ? [article] : [];
  });

  if (payload.articles.length > 0 && articles.length === 0) {
    throw new GNewsRequestError("The news provider returned an invalid response. Please try again later.");
  }

  return articles
    .filter((article) => article.publishedAt >= from && article.publishedAt <= to)
    .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
}

function responseError(status: number) {
  if (status === 401) {
    return new GNewsRequestError("The news provider API key is invalid. Please check the server configuration.", status);
  }
  if (status === 403) {
    return new GNewsRequestError("The news provider quota or subscription limit has been reached. Please try again later.", status);
  }
  if (status === 429) {
    return new GNewsRequestError("The news provider is receiving too many requests. Please try again later.", status);
  }
  return new GNewsRequestError(undefined, status);
}

async function waitForRequestSlot(signal: AbortSignal) {
  const now = Date.now();
  const requestAt = Math.max(now, nextRequestAt);
  nextRequestAt = requestAt + GNEWS_MIN_REQUEST_INTERVAL_MS;
  if (requestAt > now) await delay(requestAt - now, undefined, { signal });
}

export async function searchGNews(query: string, from: Date, to: Date): Promise<GNewsArticle[]> {
  const apiKey = process.env.GNEWS_API_KEY?.trim();
  if (!apiKey) {
    throw new GNewsRequestError("Company news is not configured yet. Add GNEWS_API_KEY to the server environment.");
  }

  const searchQuery = query.trim();
  if (!searchQuery || searchQuery.length > 200 || !Number.isFinite(from.getTime()) || !Number.isFinite(to.getTime()) || from > to) {
    throw new GNewsRequestError("The company news search parameters are invalid.");
  }

  const url = new URL(GNEWS_SEARCH_URL);
  url.search = new URLSearchParams({
    q: searchQuery,
    lang: "en",
    max: String(GNEWS_MAX_ARTICLES),
    in: "title,description",
    nullable: "image,description,content",
    sortby: "publishedAt",
    from: from.toISOString(),
    to: to.toISOString(),
    truncate: "content",
  }).toString();

  const signal = AbortSignal.timeout(GNEWS_REQUEST_TIMEOUT_MS);
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      await waitForRequestSlot(signal);
      const response = await fetch(url, {
        headers: { Accept: "application/json", "X-Api-Key": apiKey },
        cache: "no-store",
        redirect: "error",
        signal,
      });

      if (!response.ok) {
        await response.body?.cancel().catch(() => undefined);
        throw responseError(response.status);
      }

      const payload: unknown = await response.json();
      return parseArticles(payload, from, to);
    } catch (error) {
      if (error instanceof GNewsRequestError && (error.status === null || error.status < 500)) {
        throw error;
      }
      if (error instanceof SyntaxError) {
        throw new GNewsRequestError("The news provider returned an invalid response. Please try again later.");
      }
      if (attempt === 1 || signal.aborted) {
        throw error instanceof GNewsRequestError ? error : new GNewsRequestError();
      }
    }
  }

  throw new GNewsRequestError();
}
