import { describe, expect, it } from "vitest";
import { describeLtcError, levelToDb } from "./useLtcInput";

describe("LTC input helpers", () => {
  it("maps browser errors to clear states", () => {
    expect(describeLtcError({ name: "NotAllowedError" }).status).toBe("denied");
    expect(describeLtcError({ name: "NotAllowedError" }).message).toMatch(/Allow it for this site/);
    expect(describeLtcError({ name: "NotFoundError" }).status).toBe("error");
    expect(describeLtcError({ name: "NotReadableError" }).message).toMatch(/busy/);
    expect(describeLtcError(new Error("boom")).message).toBe("boom");
  });
  it("converts peak level to dBFS", () => {
    expect(levelToDb(1)).toBeCloseTo(0, 5);
    expect(levelToDb(0.5)).toBeCloseTo(-6.02, 1);
    expect(levelToDb(0)).toBe(-100);
  });
});
