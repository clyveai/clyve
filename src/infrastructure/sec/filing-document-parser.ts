import { load } from "cheerio";

const ITEM_HEADING_PATTERN = /(?:^|\n)\s*(item\s+(?:\d{1,2}[a-z]?|\d\.\d{2})[.\-:]?[^\n]{0,140})/gi;

export type SecFilingDocumentSection = {
  locator: string;
  text: string;
};

export type ParsedSecFilingDocument = {
  text: string;
  sections: SecFilingDocumentSection[];
};

function normalizeText(value: string) {
  return value
    .replace(/\u00a0/g, " ")
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function extractHtmlText(content: string) {
  const $ = load(content);
  $("script, style, noscript, template, title, ix\\:header, ix\\:hidden").remove();
  $("br").replaceWith("\n");
  $("td, th").each((_index, element) => {
    $(element).append(" | ");
  });
  $("p, li, h1, h2, h3, h4, h5, h6, tr, div, section, article").each((_index, element) => {
    $(element).append("\n");
  });

  const body = $("body");
  return normalizeText(body.length > 0 ? body.text() : $.root().text());
}

function extractSections(text: string) {
  const matches = Array.from(text.matchAll(ITEM_HEADING_PATTERN));
  const sections = new Map<string, SecFilingDocumentSection>();

  for (let index = 0; index < matches.length; index += 1) {
    const match = matches[index];
    const fullMatch = match[0];
    const locator = normalizeText(match[1] ?? "");
    const matchStart = match.index ?? 0;
    const locatorStart = matchStart + fullMatch.indexOf(match[1] ?? "");
    const nextMatchStart = matches[index + 1]?.index ?? text.length;
    const sectionText = normalizeText(text.slice(locatorStart + locator.length, nextMatchStart));

    if (!locator || sectionText.length < 120) {
      continue;
    }

    const key = locator.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
    const current = sections.get(key);

    if (!current || sectionText.length > current.text.length) {
      sections.set(key, { locator, text: sectionText });
    }
  }

  return [...sections.values()];
}

export function parseSecFilingDocument(content: string, contentType: string): ParsedSecFilingDocument {
  const text = /html|xml/i.test(contentType) || /<\s*html|<\s*body|<\s*ix:/i.test(content)
    ? extractHtmlText(content)
    : normalizeText(content);

  return {
    text,
    sections: extractSections(text),
  };
}
