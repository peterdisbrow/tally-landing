import { afterEach, describe, expect, it, vi } from "vitest";
import { parseTallyTimePayload, syncServerTime } from "./timeSync";

describe("parseTallyTimePayload", () => {
  it("reads serverTime from the live Tally shape", () => {
    expect(parseTallyTimePayload({ serverTime: 1788910329927, isoTime: "2026-09-08T23:32:09.927Z" }))
      .toBe(1788910329927);
  });

  it("falls back to isoTime when serverTime is missing", () => {
    expect(parseTallyTimePayload({ isoTime: "2026-09-08T23:32:09.927Z" }))
      .toBe(Date.parse("2026-09-08T23:32:09.927Z"));
  });

  it("rejects empty or unknown payloads", () => {
    expect(parseTallyTimePayload(null)).toBeNull();
    expect(parseTallyTimePayload({})).toBeNull();
    expect(parseTallyTimePayload({ timestamp: 123 })).toBeNull();
  });
});

describe("syncServerTime", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("uses same-origin /api/time first and does not call fallbacks", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url === "/api/time") {
        return new Response(JSON.stringify({ serverTime: Date.now(), isoTime: new Date().toISOString() }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      throw new Error(`unexpected fetch ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await syncServerTime();
    expect(result.source).toBe("tally");
    expect(result.label).toBe("Tally time");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(String(fetchMock.mock.calls[0][0])).toBe("/api/time");
  });

  it("falls back to absolute Tally when same-origin fails", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url === "/api/time") {
        return new Response("nope", { status: 404 });
      }
      if (url === "https://api.tallyconnect.app/api/time") {
        return new Response(JSON.stringify({ serverTime: Date.now(), isoTime: new Date().toISOString() }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      throw new Error(`unexpected fetch ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await syncServerTime();
    expect(result.source).toBe("tally");
    expect(fetchMock.mock.calls.map((call) => String(call[0]))).toEqual([
      "/api/time",
      "https://api.tallyconnect.app/api/time",
    ]);
  });

  it("uses local clock when every source fails", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("down", { status: 503 })));
    const result = await syncServerTime();
    expect(result).toEqual({ offsetMs: 0, source: "local", label: "Local clock" });
  });

  it("does not call Supabase", async () => {
    const fetchMock = vi.fn(async () => new Response("down", { status: 503 }));
    vi.stubGlobal("fetch", fetchMock);
    await syncServerTime();
    const urls = fetchMock.mock.calls.map((call) => String(call.at(0)));
    expect(urls.some((url) => url.includes("supabase"))).toBe(false);
  });
});
