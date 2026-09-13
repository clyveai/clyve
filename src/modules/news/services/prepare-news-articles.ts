import { createHash } from "node:crypto";
import type { GNewsArticle } from "@/infrastructure/gnews/news-client";
import type { NewsCompanyTarget, NewsSourceInput } from "../types";

const ambiguousNames = new Set(["apple", "amazon", "alphabet", "meta", "target", "on", "gap", "block", "shell", "visa", "oracle", "snap", "toast"]);
const businessContext = /\b(stock|shares?|earnings|revenue|nasdaq|nyse|investors?|company|corporation|ceo|quarter|billion|million|acquisition|regulat\w*|guidance|dividend|semiconductor|iphone|ipad|macbook|icloud|aws|ecommerce|e-commerce|facebook|instagram|whatsapp|google|youtube|retail\w*|payments?|bank\w*)\b/i;
const ambiguousContext: Record<string, RegExp> = {
  target: /\b(retail\w*|stores?|shoppers?|merchandise|TGT)\b/i,
  shell: /\b(oil|gas|energy|petroleum|SHEL)\b/i,
  visa: /\b(payments?|cards?|transactions?|network)\b/i,
  gap: /\b(retail\w*|apparel|clothing|stores?|Old Navy|Athleta|GAP)\b/,
  block: /\b(fintech|payments?|Cash App|Square|XYZ)\b/i,
  snap: /\b(Snapchat|social media|advertising|SNAP)\b/,
  toast: /\b(restaurants?|payments?|software|TOST)\b/i,
  oracle: /\b(software|cloud|database|ORCL)\b/i,
};
const companyAliases: Record<string, string> = {
  "meta platforms": "Meta",
  alphabet: "Google",
  "international business machines": "IBM",
  "on semiconductor": "onsemi",
};

function normalizedText(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim().replace(/\s+/g, " ");
}

function companyName(value: string) {
  return value.replace(/\s*\/[A-Z]{2,3}\/?\s*$/i, "").trim()
    .replace(/(?:[,\s]+(?:incorporated|inc|corporation|corp|limited|ltd|plc|llc|co)\.?)+$/i, "")
    .trim();
}

function containsPhrase(text: string, phrase: string) {
  return Boolean(phrase) && ` ${text} `.includes(` ${phrase} `);
}

export function buildNewsQuery(target: Pick<NewsCompanyTarget, "ticker" | "companyName">) {
  const canonicalName = companyName(target.companyName);
  const name = (companyAliases[normalizedText(canonicalName)] ?? canonicalName)
    .replace(/[^a-zA-Z0-9 &.-]/g, " ").replace(/\s+/g, " ").trim().slice(0, 120);
  const ticker = target.ticker.replace(/[^a-zA-Z0-9.-]/g, "");
  const nameQuery = `"${name || ticker}"`;
  const scopedNameQuery = ambiguousNames.has(normalizedText(name))
    ? `(${nameQuery} AND (company OR stock OR earnings))`
    : nameQuery;
  const tickerQuery = ticker.length < 3 || ambiguousNames.has(ticker.toLowerCase()) ? `"$${ticker}"` : `"${ticker}"`;
  return `(${scopedNameQuery} OR ${tickerQuery})`;
}

export function isCompanyNews(article: Pick<GNewsArticle, "title" | "description">, target: Pick<NewsCompanyTarget, "ticker" | "companyName">) {
  const text = `${article.title} ${article.description ?? ""}`;
  const normalized = normalizedText(text);
  const name = normalizedText(companyName(target.companyName));
  const escapedTicker = target.ticker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const qualifiedTicker = new RegExp(`(?:\\$|\\b(?:NASDAQ|NYSE)\\s*:\\s*)${escapedTicker}(?![A-Z0-9])`, "i").test(text);
  const bareTicker = target.ticker.length >= 3
    && !ambiguousNames.has(target.ticker.toLowerCase())
    && new RegExp(`(?:^|[^A-Z0-9])${escapedTicker}(?![A-Z0-9])`).test(text)
    && businessContext.test(text);

  if (qualifiedTicker || bareTicker) {
    return true;
  }

  const alias = companyAliases[name];
  if (alias && containsPhrase(normalized, normalizedText(alias)) && businessContext.test(text)
    && !(alias === "Meta" && /\bmeta[\s-]+(?:analysis|data|study)\b/i.test(text))) {
    return true;
  }

  if (!containsPhrase(normalized, name) || name.length < 3) {
    return false;
  }
  if (!ambiguousNames.has(name)) {
    return true;
  }

  const fullName = normalizedText(target.companyName);
  if (fullName !== name && containsPhrase(normalized, fullName)) {
    return true;
  }

  const escapedName = companyName(target.companyName).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const capitalizedName = new RegExp(`\\b${escapedName.charAt(0).toUpperCase()}${escapedName.slice(1).toLowerCase()}\\b`).test(text);
  return capitalizedName && (ambiguousContext[name] ?? businessContext).test(text);
}

export function normalizeNewsUrl(value: string) {
  try {
    const url = new URL(value);
    if (!["https:", "http:"].includes(url.protocol) || url.username || url.password) {
      return null;
    }

    url.hash = "";
    for (const key of [...url.searchParams.keys()]) {
      if (/^utm_/i.test(key) || /^(fbclid|gclid|dclid|msclkid|mc_cid|mc_eid)$/i.test(key)) {
        url.searchParams.delete(key);
      }
    }
    url.searchParams.sort();
    return url.href;
  } catch {
    return null;
  }
}

export function prepareNewsArticles(articles: GNewsArticle[], target: NewsCompanyTarget, from: Date, to: Date): NewsSourceInput[] {
  const seenUrls = new Set<string>();
  const seenIds = new Set<string>();
  const prepared: NewsSourceInput[] = [];

  for (const article of articles) {
    const url = normalizeNewsUrl(article.url);
    if (!url || article.publishedAt < from || article.publishedAt > to || !isCompanyNews(article, target)
      || seenUrls.has(url) || (article.id && seenIds.has(article.id))) {
      continue;
    }

    seenUrls.add(url);
    if (article.id) {
      seenIds.add(article.id);
    }

    prepared.push({
      sourceKey: `news:url:${createHash("sha256").update(url).digest("hex")}`,
      providerArticleId: article.id,
      title: article.title,
      publisher: article.publisher,
      url,
      description: article.description,
      content: article.content,
      contentHash: createHash("sha256").update(JSON.stringify([article.title, article.description, article.content])).digest("hex"),
      publishedAt: article.publishedAt,
      metadata: {
        description: article.description,
        contentTruncated: article.contentTruncated,
        ingestionVersion: "gnews-v1",
      },
    });
  }

  return prepared;
}
