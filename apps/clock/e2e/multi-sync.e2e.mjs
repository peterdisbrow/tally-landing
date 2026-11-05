/** Multi-clock: every time-of-day tile (Local, time zones, Count To) shows the same second at the same moment.
 *  Count Up / Countdown tiles keep their own timing. Env BASE_URL, OUT, TAG. iPad viewports. */
import { createRequire } from "node:module"; import fs from "node:fs";
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_PATH || "playwright");
const BASE = process.env.BASE_URL; if (!BASE) throw new Error("set BASE_URL");
const OUT = process.env.OUT || "/tmp/multi-sync", TAG = process.env.TAG || "local"; fs.mkdirSync(OUT, { recursive: true });
const hm = (ms) => { const d = new Date(Date.now() + ms); return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`; };
const c = (id, mode, name, extra = {}) => ({ id, mode, clockName: name, clockColor: "#22c55e", fontName: "dseg7", timezone: "local", is24h: false, showSeconds: true, ...extra });
const clocks = [c("1", "clock", "Local"), c("2", "clock", "New York", { timezone: "America/New_York" }), c("3", "clock", "London", { timezone: "Europe/London" }),
  c("4", "clock", "Tokyo", { timezone: "Asia/Tokyo", is24h: true }), c("5", "countto", "Doors", { countToTime: hm(47 * 60e3) }), c("6", "countdown", "Walk-in", { countdownFrom: 600 })];
const b = await chromium.launch(); let bad = 0;
for (const [w, h] of [[1024, 1366], [1366, 1024]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, hasTouch: true });
  await ctx.routeWebSocket(/api\.tallyconnect\.app\/portal/, (ws) => { ws.send(JSON.stringify({ type: "connected", churchId: "c1", name: "Demo Church" })); });
  const p = await ctx.newPage();
  await p.addInitScript((cl) => { localStorage.setItem("tallyconnect-clock-token", "test-token"); localStorage.setItem("broadcast-multi-layout", "3x2"); localStorage.setItem("broadcast-multi-clocks", JSON.stringify(cl)); }, clocks);
  await p.goto(BASE + "/multi-clock"); await p.waitForTimeout(3000);
  let mism = 0, n = 0, flips = 0, prev = "";
  for (let i = 0; i < 80; i++) {
    const s = await p.evaluate(() => ["1", "2", "3", "4", "5"].map((id) => (document.querySelector(`[data-clock-id="${id}"] [data-clock-part="digits"]`)?.textContent || "").replace(/\s/g, "")));
    const secs = s.map((t) => (t.match(/(\d\d)(?!.*\d\d)/) || [])[1]);
    // Count To on a whole-minute target rounds remaining up: its seconds = (60 - local) mod 60, flipping on the same frame.
    const local = secs.slice(0, 4), ct = (60 - Number(secs[4])) % 60;
    if (new Set(local).size !== 1 || ct !== Number(local[0]) % 60) { mism++; if (mism < 4) console.log("  mismatch", s.join(" | ")); }
    if (local[0] !== prev) { flips++; prev = local[0]; } n++;
    await p.waitForTimeout(37 + (i % 5) * 11);
  }
  const ok = mism === 0 && n === 80 && flips >= 3; if (!ok) bad++;
  console.log(ok ? "PASS" : "FAIL", `${w}x${h}: ${n} samples, ${flips} second flips, ${mism} mismatches across Local/NY/London/Tokyo/Count To`);
  await p.screenshot({ path: `${OUT}/${TAG}-multi-sync-ipad-${w}x${h}.png` });
  await ctx.close();
}
await b.close(); process.exit(bad ? 1 : 0);
