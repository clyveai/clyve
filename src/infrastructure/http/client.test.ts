import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createHttpClient } from "./client";
import { HttpError, RateLimitError, TimeoutError } from "./errors";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function emptyResponse(status = 204): Response {
  return new Response(null, { status });
}

const noRetry = { maxAttempts: 1, initialDelayMs: 1, maxDelayMs: 1, backoffMultiplier: 1 };

describe("createHttpClient", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  describe("config validation", () => {
    it("throws for an invalid base URL", () => {
      expect(() => createHttpClient({ baseUrl: "not-a-url" })).toThrow();
    });

    it("throws for a zero or negative timeoutMs", () => {
      expect(() => createHttpClient({ baseUrl: "https://api.test", timeoutMs: 0 })).toThrow(
        "timeoutMs must be greater than zero",
      );
      expect(() => createHttpClient({ baseUrl: "https://api.test", timeoutMs: -5 })).toThrow();
    });

    it("accepts a config with only a baseUrl", () => {
      expect(() => createHttpClient({ baseUrl: "https://api.test" })).not.toThrow();
    });
  });

  describe("GET", () => {
    it("requests the joined base URL and path, and returns the parsed JSON body", async () => {
      const fetchMock = vi.mocked(fetch);
      fetchMock.mockResolvedValueOnce(jsonResponse({ hello: "world" }));

      const client = createHttpClient({ baseUrl: "https://api.test/v1", retry: noRetry });
      const result = await client.get<{ hello: string }>("quotes/AAPL");

      expect(result).toEqual({ hello: "world" });
      const [calledUrl, calledInit] = fetchMock.mock.calls[0];
      expect(String(calledUrl)).toBe("https://api.test/v1/quotes/AAPL");
      expect((calledInit as RequestInit).method).toBe("GET");
      expect((calledInit as RequestInit).body).toBeUndefined();
    });

    it("normalizes duplicate slashes between baseUrl and path", async () => {
      const fetchMock = vi.mocked(fetch);
      fetchMock.mockResolvedValueOnce(jsonResponse({}));

      const client = createHttpClient({ baseUrl: "https://api.test/v1/", retry: noRetry });
      await client.get("/quotes/AAPL");

      expect(String(fetchMock.mock.calls[0][0])).toBe("https://api.test/v1/quotes/AAPL");
    });

    it("serializes query params and omits null/undefined values", async () => {
      const fetchMock = vi.mocked(fetch);
      fetchMock.mockResolvedValueOnce(jsonResponse({}));

      const client = createHttpClient({ baseUrl: "https://api.test", retry: noRetry });
      await client.get("quotes", {
        query: { symbol: "AAPL", limit: 10, active: true, missing: undefined, absent: null },
      });

      const calledUrl = new URL(String(fetchMock.mock.calls[0][0]));
      expect(calledUrl.searchParams.get("symbol")).toBe("AAPL");
      expect(calledUrl.searchParams.get("limit")).toBe("10");
      expect(calledUrl.searchParams.get("active")).toBe("true");
      expect(calledUrl.searchParams.has("missing")).toBe(false);
      expect(calledUrl.searchParams.has("absent")).toBe(false);
    });

    it("returns undefined for an empty response body", async () => {
      const fetchMock = vi.mocked(fetch);
      fetchMock.mockResolvedValueOnce(emptyResponse());

      const client = createHttpClient({ baseUrl: "https://api.test", retry: noRetry });
      const result = await client.get("ping");

      expect(result).toBeUndefined();
    });

    it("returns raw text when the response body is not valid JSON", async () => {
      const fetchMock = vi.mocked(fetch);
      fetchMock.mockResolvedValueOnce(
        new Response("plain text body", { status: 200 }),
      );

      const client = createHttpClient({ baseUrl: "https://api.test", retry: noRetry });
      const result = await client.get<string>("ping");

      expect(result).toBe("plain text body");
    });

    it("merges static client headers with per-request headers", async () => {
      const fetchMock = vi.mocked(fetch);
      fetchMock.mockResolvedValueOnce(jsonResponse({}));

      const client = createHttpClient({
        baseUrl: "https://api.test",
        retry: noRetry,
        headers: { "x-api-key": "static-key", "x-common": "base" },
      });
      await client.get("ping", { headers: { "x-common": "override", "x-request": "req" } });

      const headers = (fetchMock.mock.calls[0][1] as RequestInit).headers as Headers;
      expect(headers.get("x-api-key")).toBe("static-key");
      expect(headers.get("x-common")).toBe("override");
      expect(headers.get("x-request")).toBe("req");
    });
  });

  describe("POST", () => {
    it("sends a JSON-serialized body and defaults content-type", async () => {
      const fetchMock = vi.mocked(fetch);
      fetchMock.mockResolvedValueOnce(jsonResponse({ created: true }));

      const client = createHttpClient({ baseUrl: "https://api.test", retry: noRetry });
      const result = await client.post("theses", { ticker: "AAPL" });

      expect(result).toEqual({ created: true });
      const [, init] = fetchMock.mock.calls[0];
      expect((init as RequestInit).method).toBe("POST");
      expect((init as RequestInit).body).toBe(JSON.stringify({ ticker: "AAPL" }));
      const headers = (init as RequestInit).headers as Headers;
      expect(headers.get("content-type")).toBe("application/json");
    });

    it("does not override an explicitly provided content-type", async () => {
      const fetchMock = vi.mocked(fetch);
      fetchMock.mockResolvedValueOnce(jsonResponse({}));

      const client = createHttpClient({ baseUrl: "https://api.test", retry: noRetry });
      await client.post("theses", { a: 1 }, { headers: { "content-type": "application/vnd.custom+json" } });

      const headers = (fetchMock.mock.calls[0][1] as RequestInit).headers as Headers;
      expect(headers.get("content-type")).toBe("application/vnd.custom+json");
    });
  });

  describe("error handling", () => {
    it("throws HttpError with status and parsed body on a non-2xx response", async () => {
      const fetchMock = vi.mocked(fetch);
      fetchMock.mockResolvedValueOnce(jsonResponse({ message: "not found" }, 404));

      const client = createHttpClient({ baseUrl: "https://api.test", retry: noRetry });

      await expect(client.get("missing")).rejects.toMatchObject({
        name: "HttpError",
        status: 404,
        cause: { message: "not found" },
      });
    });

    it("throws RateLimitError specifically on a 429 response", async () => {
      const fetchMock = vi.mocked(fetch);
      fetchMock.mockResolvedValueOnce(jsonResponse({ message: "slow down" }, 429));

      const client = createHttpClient({ baseUrl: "https://api.test", retry: noRetry });

      await expect(client.get("quotes")).rejects.toBeInstanceOf(RateLimitError);
    });

    it("wraps an unexpected fetch rejection in HttpError", async () => {
      const fetchMock = vi.mocked(fetch);
      fetchMock.mockRejectedValueOnce(new TypeError("Failed to fetch"));

      const client = createHttpClient({ baseUrl: "https://api.test", retry: noRetry });

      await expect(client.get("quotes")).rejects.toBeInstanceOf(HttpError);
      await expect(client.get("quotes")).rejects.not.toBeInstanceOf(TimeoutError);
    });

    it("does not double-wrap an HttpError raised for a non-2xx response", async () => {
      const fetchMock = vi.mocked(fetch);
      fetchMock.mockResolvedValueOnce(jsonResponse({}, 500));

      const client = createHttpClient({ baseUrl: "https://api.test", retry: noRetry });

      let caught: unknown;
      try {
        await client.get("quotes");
      } catch (error) {
        caught = error;
      }

      expect(caught).toBeInstanceOf(HttpError);
      expect((caught as HttpError).status).toBe(500);
    });

    it("rejects with TimeoutError when the request exceeds timeoutMs", async () => {
      vi.useFakeTimers();
      const fetchMock = vi.mocked(fetch);
      fetchMock.mockImplementationOnce(
        (_url, init) =>
          new Promise((_resolve, reject) => {
            const signal = (init as RequestInit).signal;
            signal?.addEventListener("abort", () => {
              const abortError = new Error("This operation was aborted");
              abortError.name = "AbortError";
              reject(abortError);
            });
          }),
      );

      const client = createHttpClient({ baseUrl: "https://api.test", timeoutMs: 50, retry: noRetry });

      const promise = client.get("slow");
      const assertion = expect(promise).rejects.toBeInstanceOf(TimeoutError);

      await vi.advanceTimersByTimeAsync(50);
      await assertion;

      vi.useRealTimers();
    });
  });

  describe("instance isolation", () => {
    it("does not share rate limiter state between two client instances", async () => {
      vi.useFakeTimers();
      const fetchMock = vi.mocked(fetch);
      fetchMock.mockImplementation(async () => jsonResponse({}));

      const clientA = createHttpClient({
        baseUrl: "https://api.test",
        retry: noRetry,
        rateLimit: { maxRequests: 1, windowMs: 1_000 },
      });
      const clientB = createHttpClient({
        baseUrl: "https://api.test",
        retry: noRetry,
        rateLimit: { maxRequests: 1, windowMs: 1_000 },
      });

      await clientA.get("ping");

      // clientA's bucket is now empty, but clientB must still resolve immediately.
      let bResolved = false;
      const bPromise = clientB.get("ping").then(() => {
        bResolved = true;
      });
      await vi.advanceTimersByTimeAsync(0);
      await bPromise;
      expect(bResolved).toBe(true);

      vi.useRealTimers();
    });

    it("applies independent headers per instance", async () => {
      const fetchMock = vi.mocked(fetch);
      fetchMock.mockImplementation(async () => jsonResponse({}));

      const clientA = createHttpClient({
        baseUrl: "https://api.test",
        retry: noRetry,
        headers: { "x-client": "A" },
      });
      const clientB = createHttpClient({
        baseUrl: "https://api.test",
        retry: noRetry,
        headers: { "x-client": "B" },
      });

      await clientA.get("ping");
      await clientB.get("ping");

      const headersA = (fetchMock.mock.calls[0][1] as RequestInit).headers as Headers;
      const headersB = (fetchMock.mock.calls[1][1] as RequestInit).headers as Headers;
      expect(headersA.get("x-client")).toBe("A");
      expect(headersB.get("x-client")).toBe("B");
    });
  });

  describe("retry integration", () => {
    it("retries a 500 response and succeeds on a later attempt", async () => {
      const fetchMock = vi.mocked(fetch);
      fetchMock
        .mockResolvedValueOnce(jsonResponse({}, 500))
        .mockResolvedValueOnce(jsonResponse({ ok: true }));

      const client = createHttpClient({
        baseUrl: "https://api.test",
        retry: { maxAttempts: 2, initialDelayMs: 1, maxDelayMs: 1, backoffMultiplier: 1 },
      });

      const result = await client.get<{ ok: boolean }>("flaky");

      expect(result).toEqual({ ok: true });
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it("does not retry a 400 response", async () => {
      const fetchMock = vi.mocked(fetch);
      fetchMock.mockImplementation(async () => jsonResponse({}, 400));

      const client = createHttpClient({
        baseUrl: "https://api.test",
        retry: { maxAttempts: 3, initialDelayMs: 1, maxDelayMs: 1, backoffMultiplier: 1 },
      });

      await expect(client.get("bad")).rejects.toBeInstanceOf(HttpError);
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });
  });
});
