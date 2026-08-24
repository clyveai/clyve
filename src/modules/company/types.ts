export const tickerPattern = /^[A-Z0-9.\-]{1,16}$/;

export function normalizeTicker(value: string) {
  return value.trim().toUpperCase();
}

export function isTickerSyntaxValid(value: string) {
  return tickerPattern.test(normalizeTicker(value));
}

export type CompanyIdentity = {
  ticker: string;
  companyName: string;
  cik: string;
};
