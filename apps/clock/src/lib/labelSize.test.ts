import { describe, it, expect } from "vitest";
import { labelPx, resolveLabelSize, resolveScaleLabels } from "./labelSize";

describe("labelSize", () => {
  it("old configs without the fields get M with scaling on", () => {
    expect(resolveLabelSize(undefined)).toBe("m");
    expect(resolveScaleLabels(undefined)).toBe(true);
  });
  it("rejects junk values", () => {
    expect(resolveLabelSize("huge")).toBe("m");
    expect(resolveLabelSize(3)).toBe("m");
    expect(resolveScaleLabels("yes")).toBe(true);
    expect(resolveScaleLabels(false)).toBe(false);
  });
  it("S without scaling is exactly the original 12 / 10 / 14 px", () => {
    expect(labelPx("s", false, 300)).toEqual({ name: 12, sub: 10, ampm: 14 });
  });
  it("each step is bigger", () => {
    const n = (s: string) => labelPx(s, false, 80).name;
    expect(n("s")).toBeLessThan(n("m")); expect(n("m")).toBeLessThan(n("l")); expect(n("l")).toBeLessThan(n("xl"));
  });
  it("scaling follows the digits: small cells unchanged, big ones grow, capped at x4", () => {
    expect(labelPx("m", true, 60)).toEqual(labelPx("m", false, 60));
    expect(labelPx("m", true, 200).name).toBeGreaterThan(labelPx("m", false, 200).name * 1.5);
    expect(labelPx("m", true, 250).name).toBeGreaterThan(labelPx("m", true, 150).name);
    expect(labelPx("m", true, 5000)).toEqual(labelPx("m", true, 400));
  });
  it("a short cell caps big labels, but never below 9 px", () => {
    expect(labelPx("xl", true, 300, 400).name).toBe(56);
    expect(labelPx("xl", true, 300, 400).sub).toBe(44);
    expect(labelPx("s", false, 80, 60).sub).toBe(9);
    expect(labelPx("m", true, 200, 0)).toEqual(labelPx("m", true, 200));
  });
});
