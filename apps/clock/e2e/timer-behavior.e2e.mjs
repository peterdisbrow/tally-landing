/** Single clock: Count Up / Countdown never auto-start; Count To targets a time of day with + overtime. Env BASE_URL */
import { createRequire } from "node:module";
import { collectItems } from "./overlap-collect.mjs";
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_PATH || "playwright");
const BASE = process.env.BASE_URL; if (!BASE) throw new Error("set BASE_URL");
const b = await chromium.launch(); let bad = 0;
const ok = (name, cond, extra = "") => { console.log(cond ? "PASS" : "FAIL", name, extra); if (!cond) bad++; };
const hm = (d) => `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
async function open(settings) {
  const ctx = await b.newContext({ viewport: { width: 1280, height: 720 } }); const p = await ctx.newPage();
  await p.route("https://api.tallyconnect.app/**", (r) => r.fulfill({ status: 404, json: {} }));
  await p.addInitScript((s) => { if (!sessionStorage.getItem("_seeded")) { localStorage.setItem("broadcast-clock-settings", JSON.stringify(s)); sessionStorage.setItem("_seeded", "1"); } }, { clockName: "T", clockColor: "#ef4444", fontName: "dseg7", timezone: "local", is24h: true, displayStyle: "digital", ...settings });
  await p.goto(BASE + "/clock"); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(800);
  return { p, ctx };
}
const digits = (p) => p.evaluate(collectItems).then((g) => g.items.filter((i) => i.part === "digits").map((i) => i.text).join(""));
const body = (p) => p.evaluate(() => document.body.innerText);

// Reload in countdown: paused at the start value
{ const { p, ctx } = await open({ mode: "countdown" });
  const a = await digits(p); await p.waitForTimeout(2200); const c = await digits(p);
  ok("countdown reload stays paused at start", a === c && /05:00/.test(a), `${a} -> ${c}`);
  await p.keyboard.press("s"); await p.waitForTimeout(300); const u1 = await digits(p); await p.waitForTimeout(2000); const u2 = await digits(p);
  ok("switch to count up (key s) stays paused at 00:00", u1 === u2 && /00:00/.test(u1), `${u1} -> ${u2}`);
  await p.keyboard.press("7"); await p.waitForTimeout(300); const d1 = await digits(p); await p.waitForTimeout(2000); const d2 = await digits(p);
  ok("set a countdown time (key 7) stays paused", d1 === d2 && /07:00/.test(d1), `${d1} -> ${d2}`);
  await p.getByTestId("timer-toggle").click(); await p.waitForTimeout(2200); const d3 = await digits(p);
  ok("Start runs the timer", d3 !== d2, `${d2} -> ${d3}`);
  await ctx.close(); }
// Count up reload
{ const { p, ctx } = await open({ mode: "countup" });
  const a = await digits(p); await p.waitForTimeout(2200); const c = await digits(p);
  ok("count up reload stays paused", a === c, `${a} -> ${c}`); await ctx.close(); }
// Count To future: counts down to a time of day, today
{ const t = new Date(Date.now() + 65 * 60e3); if (t.getDate() !== new Date().getDate()) t.setTime(Date.now() + 60e3);
  const { p, ctx } = await open({ mode: "countto", countToTime: hm(t) });
  const a = await digits(p); await p.waitForTimeout(2200); const c = await digits(p);
  const plus = await p.evaluate(() => [...document.querySelectorAll("span")].some((s) => s.textContent === "+" && getComputedStyle(s).color === "rgb(220, 38, 38)"));
  ok("count to future runs off real time, no overtime +", a !== c && !plus && /01:0[45]/.test(a), `${a} -> ${c}`); await ctx.close(); }
// Count To past: never rolls to tomorrow, counts up as overtime with + in red
{ const t = new Date(Date.now() - 3 * 60e3);
  const { p, ctx } = await open({ mode: "countto", countToTime: hm(t) });
  const a = await digits(p); await p.waitForTimeout(2200); const c = await digits(p);
  const plus = await p.evaluate(() => [...document.querySelectorAll("span")].some((s) => s.textContent === "+" && getComputedStyle(s).color === "rgb(220, 38, 38)"));
  const red = await p.evaluate(() => [...document.querySelectorAll("[data-single-clock] *")].some((e) => getComputedStyle(e).color === "rgb(239, 68, 68)" && /\d/.test(e.textContent || "")));
  ok("count to past shows + overtime (not tomorrow)", plus && /0[23]:\d\d/.test(a) && a !== c, `${a} -> ${c}`);
  ok("count to overtime digits are red", red);
  await ctx.close(); }
// Settings sheet: Count To picker is a time of day in the clock's format (12h with AM/PM), survives reload
{ const { p, ctx } = await open({ mode: "countto", is24h: false, countToTime: "09:00" });
  await p.mouse.move(640, 300); await p.getByLabel("Clock setup").click(); await p.waitForTimeout(500);
  const h = new Date().getHours(); const pmNow = h >= 12; const tgtH = (h + 1) % 24; if (tgtH === 0) console.log("SKIP late-night sheet check");
  else {
    await p.getByTestId("gs-time-countto-hour").selectOption(String(tgtH % 12 || 12));
    await p.getByTestId("gs-time-countto-minute").selectOption("30");
    await p.getByTestId(`gs-time-countto-${tgtH >= 12 ? "pm" : "am"}`).click(); await p.waitForTimeout(400);
    const sum = await p.getByTestId("gs-time-countto-summary").innerText();
    const want = `${tgtH % 12 || 12}:30 ${tgtH >= 12 ? "PM" : "AM"}`;
    ok("sheet picker shows 12h time with AM/PM", sum.includes(want), sum);
    if (process.env.OUT) await p.screenshot({ path: `${process.env.OUT}/${process.env.TAG || "local"}-sheet-countto-picker.png` });
    const saved = await p.evaluate(() => JSON.parse(localStorage.getItem("broadcast-clock-settings")).countToTime);
    ok("count to time autosaves as HH:MM", saved === `${String(tgtH).padStart(2, "0")}:30`, saved);
    await p.reload(); await p.waitForTimeout(1200); const d = await digits(p);
    const left = (new Date().setHours(tgtH, 30, 0, 0) - Date.now()) / 1000; const [hh, mm] = d.replace("+", "").split(":").map(Number);
    ok("reload keeps the count-to target", Math.abs(hh * 3600 + mm * 60 - left) < 120, `${d} (expected ~${Math.round(left / 60)} min)`);
  }
  void pmNow; await ctx.close(); }
await b.close(); console.log(bad ? `${bad} FAILED` : "ALL PASS"); process.exit(bad ? 1 : 0);
