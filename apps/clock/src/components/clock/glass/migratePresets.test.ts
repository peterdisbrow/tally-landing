import { beforeEach, describe, expect, it } from "vitest";
import { migrateLegacyPresets } from "./GlassSetupSheet";

describe("legacy /clock preset migration", () => {
  beforeEach(() => localStorage.clear());
  it("imports broadcast-clock-presets once, keeping existing Glass presets", () => {
    localStorage.setItem("broadcast-clock-presets", JSON.stringify([{ id: "1700", name: "Sunday", clockName: "MAIN", clockColor: "#22c55e", fontName: "dseg7", timezone: "local", is24h: false, mode: "countdown" }]));
    localStorage.setItem("clock-glass-presets-single", JSON.stringify([{ id: "x", name: "Mine", data: {}, savedAt: 1 }]));
    migrateLegacyPresets();
    const got = JSON.parse(localStorage.getItem("clock-glass-presets-single")!);
    expect(got.map((p: { name: string }) => p.name)).toEqual(["Mine", "Sunday"]);
    expect(got[1].data).toMatchObject({ clockName: "MAIN", mode: "countdown", clockColor: "#22c55e" });
    // deleting the migrated preset must not bring it back
    localStorage.setItem("clock-glass-presets-single", JSON.stringify([got[0]]));
    migrateLegacyPresets();
    expect(JSON.parse(localStorage.getItem("clock-glass-presets-single")!)).toHaveLength(1);
  });
  it("survives corrupt legacy data", () => {
    localStorage.setItem("broadcast-clock-presets", "{nope");
    expect(() => migrateLegacyPresets()).not.toThrow();
  });
});
