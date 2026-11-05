/** Glass card fit (opt-in ?look=glass): digits must sit inside the single-clock card. Env BASE_URL, SHOTS, TAG */
import { createRequire } from "node:module"; import fs from "node:fs";
import { collectItems, findIssues } from "./overlap-collect.mjs";
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_PATH || "playwright");
const BASE = process.env.BASE_URL || "http://127.0.0.1:5199", SHOTS = process.env.SHOTS, TAG = process.env.TAG || "run";
const b = await chromium.launch(); let bad = 0;
for (const [w, h] of [[1280, 720], [1920, 1080], [390, 844], [844, 390]]) for (const is24h of [false, true]) for (const showTenths of [false, true]) for (const fs_ of [{ autoSize: true, fontSize: 200 }, { autoSize: false, fontSize: 800 }]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h } }); const p = await ctx.newPage();
  await p.route("https://api.tallyconnect.app/**", (r) => r.fulfill({ status: 404, json: {} }));
  await p.addInitScript((s) => { if (!localStorage.getItem("_seeded")) { localStorage.setItem("broadcast-clock-settings", JSON.stringify(s)); localStorage.setItem("_seeded", "1"); } }, { clockName: "BETWEEN SUNDAYS", clockColor: "#ef4444", fontName: "dseg7", timezone: "local", is24h, mode: "clock", showMiniClock: true, showTenths, displayStyle: "digital", labelSize: "m", scaleLabels: true, ...fs_ });
  await p.clock?.setFixedTime?.(new Date("2026-11-04T22:58:58")).catch(() => {});
  await p.goto(BASE + "/clock?look=glass"); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(4500);
  const got = await p.evaluate(collectItems);
  const r = findIssues(got).filter((x) => x.kind === "outside-card");
  if (!got.card || !got.items.some((i) => i.part === "digits")) r.push({ kind: "no-card-or-digits" });
  const tag = `${w}x${h}-${is24h ? "24h" : "12h"}${showTenths ? "-tenths" : ""}-${fs_.autoSize ? "auto" : "fix800"}`;
  console.log(tag, r.length ? "OVERFLOW " + JSON.stringify(r) : "ok"); bad += r.length;
  if (SHOTS && fs_.autoSize) { fs.mkdirSync(SHOTS, { recursive: true }); await p.screenshot({ path: `${SHOTS}/${TAG}-card-${tag}.png` }); }
  await ctx.close();
}
await b.close(); process.exit(bad ? 1 : 0);
