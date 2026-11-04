import { describe, it, expect } from "vitest";
import { jamDrift } from "./display";
const DAY = 30 * 86400;
describe("jamDrift", () => {
  it("counts pairs when not hfr", () => { expect(jamDrift({ count: 10, sub: 1 }, { count: 9, sub: 0 }, DAY, false)).toBe(1); });
  it("uses displayed frames with hfr", () => {
    expect(jamDrift({ count: 10, sub: 1 }, { count: 10, sub: 0 }, DAY, true)).toBe(1);
    expect(jamDrift({ count: 10, sub: 0 }, { count: 9, sub: 0 }, DAY, true)).toBe(2);
  });
  it("wraps midnight", () => { expect(jamDrift({ count: 0, sub: 0 }, { count: DAY - 1, sub: 1 }, DAY, true)).toBe(1); });
});
