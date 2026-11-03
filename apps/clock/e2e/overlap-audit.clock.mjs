/** Overlap audit for the single /clock page. Env: VP=1920x1080 OUT=file.json TAG SHOTS=dir */
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import { collectItems, findIssues } from "./overlap-collect.mjs";
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_PATH || "playwright");
const BASE_URL = process.env.BASE_URL || "http://127.0.0.1:5199";
const [W, H] = (process.env.VP || "1920x1080").split("x").map(Number);
const OUT = process.env.OUT || `/tmp/audit-clock-${W}x${H}.json`;
const SHOTS = process.env.SHOTS; if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });
const TAG = process.env.TAG || "run";
const COMBOS = process.env.QUICK ? [["s", false], ["m", true], ["xl", true]] : [["s", false], ["s", true], ["m", false], ["m", true], ["l", false], ["l", true], ["xl", false], ["xl", true]];
const FS = [{ autoSize: true, fontSize: 200, tag: "auto" }, { autoSize: false, fontSize: 300, tag: "fix300" }, { autoSize: false, fontSize: 800, tag: "fix800" }];
const norm = (t = "") => t.replace(/\d/g, "#");
const issues = []; const seen = new Set(); let pages = 0;
const browser = await chromium.launch();
const shot = (size, scale, mode, f, style, is24h) => SHOTS && (W === 1920 || W === 1280) && ((size === "m" && scale) || (size === "xl" && scale)) && f.tag !== "fix300" && style === "digital";

for (const style of ["digital", "analog"]) for (const mode of ["clock", "countup", "countdown", "countto"]) for (const [size, scale] of COMBOS) for (const f of FS) for (const is24h of style === "digital" && mode === "clock" ? [false, true] : [false]) {
  if (style === "analog" && (size === "s" || f.tag === "fix300" || !scale)) continue;
  const ctx = await browser.newContext({ viewport: { width: W, height: H } });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => console.log("[pageerror]", e.message));
  await page.route("https://api.tallyconnect.app/**", (r) => r.fulfill({ status: 404, json: {} }));
  await page.addInitScript((s) => localStorage.setItem("broadcast-clock-settings", JSON.stringify(s)), {
    clockName: "BETWEEN SUNDAYS", clockColor: "#ef4444", fontName: "dseg7", timezone: "local", is24h, mode, showMiniClock: true, showTenths: mode !== "clock",
    displayStyle: style, labelSize: size, scaleLabels: scale, autoSize: f.autoSize, fontSize: f.fontSize,
  });
  await page.goto(BASE_URL + "/clock");
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(900);
  pages++;
  const meta = { page: "clock", vp: `${W}x${H}`, size, scale, mode, style, fs: f.tag, is24h };
  await page.mouse.move(W / 2, H / 2); await page.mouse.move(W / 2 + 4, H / 2 + 3);
  await page.waitForTimeout(700);
  const act = await page.evaluate(collectItems);
  for (const x of findIssues(act)) { const o = { ...meta, state: "active", ...x }; const k = [o.size + o.scale, o.mode, o.style, o.fs, o.is24h, o.kind, norm(o.a), norm(o.b)].join("|"); if (!seen.has(k)) { seen.add(k); issues.push(o); } }
  if (shot(size, scale, mode, f, style, is24h)) await page.screenshot({ path: path.join(SHOTS, `${TAG}-clock-${W}x${H}-${mode}-${size}${scale ? "" : "-noscale"}-${f.tag}${is24h ? "-24h" : ""}-active.png`) });
  await page.waitForTimeout(3300);
  const idle = await page.evaluate(collectItems);
  for (const x of findIssues(idle)) { const o = { ...meta, state: "idle", ...x }; const k = [o.size + o.scale, o.mode, o.style, o.fs, o.is24h, o.kind, norm(o.a), norm(o.b), "idle"].join("|"); if (!seen.has(k)) { seen.add(k); issues.push(o); } }
  await ctx.close();
}
await browser.close();
fs.writeFileSync(OUT, JSON.stringify({ vp: `${W}x${H}`, pages, issues }, null, 1));
const by = {}; for (const i of issues) by[i.kind] = (by[i.kind] || 0) + 1;
console.log(`/clock ${W}x${H}: ${pages} pages, issues`, JSON.stringify(by));
