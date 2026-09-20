import { describe, expect, it } from "vitest";
import { HttpError, RateLimitError, TimeoutError } from "./errors";

describe("HttpError", () => {
  it("sets message, url, name, status, and cause", () => {
    const cause = { detail: "bad request" };
    const error = new HttpError("request failed", "https://api.test/x", {
      status: 400,
      cause,
    });

    expect(error.message).toBe("request failed");
    expect(error.url).toBe("https://api.test/x");
    expect(error.name).toBe("HttpError");
    expect(error.status).toBe(400);
    expect(error.cause).toBe(cause);
    expect(error).toBeInstanceOf(Error);
  });

  it("leaves status and cause undefined when not provided", () => {
    const error = new HttpError("request failed", "https://api.test/x");

    expect(error.status).toBeUndefined();
    expect(error.cause).toBeUndefined();
  });
});

describe("TimeoutError", () => {
  it("is an HttpError with name TimeoutError", () => {
    const error = new TimeoutError("timed out", "https://api.test/x", {
      cause: new Error("aborted"),
    });

    expect(error).toBeInstanceOf(HttpError);
    expect(error).toBeInstanceOf(TimeoutError);
    expect(error.name).toBe("TimeoutError");
    expect(error.url).toBe("https://api.test/x");
  });
});

describe("RateLimitError", () => {
  it("is an HttpError with name RateLimitError", () => {
    const error = new RateLimitError("rate limited", "https://api.test/x", {
      status: 429,
    });

    expect(error).toBeInstanceOf(HttpError);
    expect(error).toBeInstanceOf(RateLimitError);
    expect(error.name).toBe("RateLimitError");
    expect(error.status).toBe(429);
  });
});
