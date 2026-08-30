import { createHash } from "node:crypto";
import { fetchSec, SecRequestError } from "./sec-request";

const SEC_ARCHIVES_URL = "https://www.sec.gov/Archives/edgar/data";
const MAX_DOCUMENT_BYTES = 20 * 1024 * 1024;

export type SecFilingDocument = {
  url: string;
  content: string;
  contentHash: string;
  contentType: string;
};

export class SecFilingDocumentUnavailableError extends Error {
  constructor() {
    super("SEC filing document is currently unavailable.");
    this.name = "SecFilingDocumentUnavailableError";
  }
}

function archiveCik(cik: string) {
  if (!/^\d{10}$/.test(cik)) {
    throw new SecFilingDocumentUnavailableError();
  }

  return String(Number(cik));
}

function accessionDirectory(accessionNumber: string) {
  if (!/^\d{10}-\d{2}-\d{6}$/.test(accessionNumber)) {
    throw new SecFilingDocumentUnavailableError();
  }

  return accessionNumber.replaceAll("-", "");
}

function documentPath(primaryDocument: string) {
  const segments = primaryDocument.trim().split("/");
  if (segments.length === 0 || segments.some((segment) => !segment || segment === "." || segment === ".." || segment.includes("\\"))) {
    throw new SecFilingDocumentUnavailableError();
  }

  return segments.map((segment) => encodeURIComponent(segment)).join("/");
}

export function getSecFilingIndexUrl(cik: string, accessionNumber: string) {
  return `${SEC_ARCHIVES_URL}/${archiveCik(cik)}/${accessionNumber}-index.html`;
}

export function getSecFilingDocumentUrl(cik: string, accessionNumber: string, primaryDocument: string) {
  return `${SEC_ARCHIVES_URL}/${archiveCik(cik)}/${accessionDirectory(accessionNumber)}/${documentPath(primaryDocument)}`;
}

export async function getSecFilingDocument(
  cik: string,
  accessionNumber: string,
  primaryDocument: string,
): Promise<SecFilingDocument> {
  const url = getSecFilingDocumentUrl(cik, accessionNumber, primaryDocument);
  let response: Response;

  try {
    response = await fetchSec(url, {
      headers: { Accept: "text/html, text/plain, application/xhtml+xml, application/xml" },
    });
  } catch (error) {
    if (error instanceof SecRequestError) {
      throw new SecFilingDocumentUnavailableError();
    }

    throw error;
  }

  const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";
  if (contentType && !/(text|html|xml)/.test(contentType)) {
    await response.body?.cancel();
    throw new SecFilingDocumentUnavailableError();
  }

  const contentLength = Number(response.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > MAX_DOCUMENT_BYTES) {
    await response.body?.cancel();
    throw new SecFilingDocumentUnavailableError();
  }

  let bytes: Uint8Array;

  try {
    bytes = new Uint8Array(await response.arrayBuffer());
  } catch {
    throw new SecFilingDocumentUnavailableError();
  }

  if (bytes.byteLength === 0 || bytes.byteLength > MAX_DOCUMENT_BYTES) {
    throw new SecFilingDocumentUnavailableError();
  }

  const content = new TextDecoder("utf-8").decode(bytes).trim();
  if (!content) {
    throw new SecFilingDocumentUnavailableError();
  }

  return {
    url,
    content,
    contentHash: createHash("sha256").update(bytes).digest("hex"),
    contentType,
  };
}
