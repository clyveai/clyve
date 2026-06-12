/**
 * Auto-generate a research history title from a query string.
 * Priority logic:
 * 1. If ticker detected (AAPL, NVDA, etc.) → "AAPL — [first 4 words of query]"
 * 2. If no ticker → first 6 words of query
 */
export function generateResearchTitle(query: string): string {
  // Match uppercase word boundaries (1-5 uppercase letters) — common ticker format
  const tickerMatch = query.match(/\b[A-Z]{1,5}\b/);

  if (tickerMatch) {
    const ticker = tickerMatch[0];
    const words = query.split(/\s+/).slice(0, 4).join(" ");
    return `${ticker} — ${words}`;
  }

  // Fallback: first 6 words
  const words = query.split(/\s+/).slice(0, 6).join(" ");
  return words;
}
