import { describe, expect, it } from "vitest";
import { getRouterBasename } from "./clockBasename";

describe("getRouterBasename", () => {
  it("uses /tools/clock when the SPA is hosted under that prefix", () => {
    expect(getRouterBasename("/tools/clock")).toBe("/tools/clock");
    expect(getRouterBasename("/tools/clock/")).toBe("/tools/clock");
    expect(getRouterBasename("/tools/clock/clock")).toBe("/tools/clock");
    expect(getRouterBasename("/tools/clock/quote")).toBe("/tools/clock");
  });

  it("has no basename on tallyconnect.app /clock and /multi-clock rewrites", () => {
    expect(getRouterBasename("/clock")).toBeUndefined();
    expect(getRouterBasename("/multi-clock")).toBeUndefined();
    expect(getRouterBasename("/quote")).toBeUndefined();
    expect(getRouterBasename("/")).toBeUndefined();
  });
});
