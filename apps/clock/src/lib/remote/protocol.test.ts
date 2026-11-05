import { describe, expect, it } from "vitest";
import { createVerifier, isToken, newToken, roomId, seal, validCmd } from "./protocol";

describe("clock remote protocol", () => {
  it("tokens are 256-bit, url-safe and unique; room ids hide the token", async () => {
    const a = newToken(), b = newToken();
    expect(isToken(a)).toBe(true); expect(a).not.toBe(b);
    const r = await roomId(a); expect(r).toMatch(/^[a-f0-9]{64}$/); expect(r).not.toContain(a);
  });
  it("accepts a signed command once, rejects replays, forgeries, other tokens and stale messages", async () => {
    const t = newToken(); const v = createVerifier(t);
    const e = await seal(t, "phone1", 1, { k: "cmd", c: { cmd: "toggle" } });
    expect(await v(e)).toEqual({ k: "cmd", c: { cmd: "toggle" } });
    expect(await v(e)).toBeNull(); // replay
    expect(await v({ ...(await seal(t, "phone1", 2, { k: "cmd", c: { cmd: "reset" } })), body: JSON.stringify({ k: "cmd", c: { cmd: "start" } }) })).toBeNull(); // tampered
    expect(await v(await seal(newToken(), "phone2", 1, { k: "cmd", c: { cmd: "reset" } }))).toBeNull(); // wrong token
    expect(await v(await seal(t, "phone3", 1, { k: "cmd", c: { cmd: "reset" } }, Date.now() - 60_000))).toBeNull(); // stale
    expect(await v({ t: "msg" })).toBeNull();
  });
  it("validates command shapes", () => {
    expect(validCmd({ cmd: "adjust", seconds: 60 })).toBe(true);
    expect(validCmd({ cmd: "setCountTo", time: "10:30" })).toBe(true);
    expect(validCmd({ cmd: "setCountTo", time: "24:00" })).toBe(false);
    expect(validCmd({ cmd: "setCountTo", time: 1030 })).toBe(false);
    expect(validCmd({ cmd: "adjust", seconds: 1.5 })).toBe(false);
    expect(validCmd({ cmd: "setCountdown", seconds: -1 })).toBe(false);
    expect(validCmd({ cmd: "setMode", mode: "timecode" })).toBe(false);
    expect(validCmd({ cmd: "rm -rf" })).toBe(false);
  });
});
