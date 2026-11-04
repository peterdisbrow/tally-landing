/** Glass setup sheet + toolbar cleanup + preset migration: screenshots, overlap audits and checks. BASE=http://127.0.0.1:5323 (default) or a live URL. */
import { createRequire } from "node:module";
import fs from "node:fs";
import { collectItems, findIssues } from "./overlap-collect.mjs";
const require = createRequire(import.meta.url);
const { chromium } = require("/workspace/pw/node_modules/playwright");
const OUT = process.env.OUT || "/workspace/qa/tally/clock-glass-ship-20261104";
fs.mkdirSync(OUT, { recursive: true });
const AFTER = process.env.BASE || "http://127.0.0.1:5323", BEFORE = process.env.BEFORE || "http://127.0.0.1:5322";
const cell = (id, mode, name, color, extra = {}) => ({ id, mode, clockName: name, clockColor: color, fontName: "dseg7", timezone: "local", is24h: false, showSeconds: true, labelSize: "m", scaleLabels: true, ...extra });
const grid = [cell("1", "clock", "Local", "#22c55e"), cell("2", "countdown", "Worship Set", "#f59e0b", { countdownFrom: 1500 }), cell("3", "countup", "Sermon", "#3b82f6", { countupStart: 600 }), cell("4", "countdown", "Walk-in", "#ef4444", { countdownFrom: 600 })];
const single = (mode, extra = {}) => ({ clockName: "BETWEEN SUNDAYS", clockColor: "#22c55e", fontName: "dseg7", timezone: "local", is24h: false, mode, showMiniClock: true, displayStyle: "digital", labelSize: "m", scaleLabels: true, autoSize: true, fontSize: 200, countdownFrom: 1500, ...extra });
const legacy = [{ id: "1700000000000", name: "Old Sunday preset", clockName: "SUNDAY", clockColor: "#3b82f6", fontName: "dseg7", timezone: "local", is24h: false, mode: "countdown" }];
const browser = await chromium.launch();
const audits = []; const checks = [];
const check = (name, ok, detail = "") => { checks.push({ name, ok, detail }); console.log(ok ? "PASS" : "FAIL", name, detail); };

async function newCtx(vp = { width: 1920, height: 1080 }) {
  const ctx = await browser.newContext({ viewport: vp });
  await ctx.route("https://api.tallyconnect.app/**", (r) => r.request().url().includes("/api/time") ? r.fulfill({ json: { serverTime: Date.now() } }) : r.fulfill({ status: 404, json: {} }));
  await ctx.routeWebSocket(/api\.tallyconnect\.app\/portal/, (ws) => { ws.send(JSON.stringify({ type: "connected", churchId: "c1", name: "Demo Church" })); });
  return ctx;
}
async function open(ctx, url, { singleCfg, clocks, signedIn = true, withLegacy = false } = {}) {
  const page = await ctx.newPage();
  page.on("pageerror", (e) => console.log("[pageerror]", e.message));
  await page.addInitScript(({ singleCfg, clocks, signedIn, withLegacy, legacy }) => {
    if (sessionStorage.getItem("seeded")) return; sessionStorage.setItem("seeded", "1");
    if (signedIn) localStorage.setItem("tallyconnect-clock-token", "test-token");
    if (singleCfg) localStorage.setItem("broadcast-clock-settings", JSON.stringify(singleCfg));
    if (clocks) { localStorage.setItem("broadcast-multi-layout", "2x2"); localStorage.setItem("broadcast-multi-clocks", JSON.stringify(clocks)); }
    if (withLegacy) localStorage.setItem("broadcast-clock-presets", JSON.stringify(legacy));
  }, { singleCfg, clocks, signedIn, withLegacy, legacy });
  await page.goto(url);
  await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(1200);
  return page;
}
async function audit(page, name) {
  const data = await page.evaluate(collectItems);
  const box = await page.evaluate(() => { const r = document.querySelector('[role="dialog"]')?.getBoundingClientRect(); return r ? [r.left, r.top, r.right, r.bottom] : null; });
  // With a modal open, the dimmed page behind it is not interactive: audit the dialog's own contents.
  const inside = (v) => !box || (v[0] >= box[0] - 1 && v[2] <= box[2] + 1 && v[1] >= box[1] - 1 && v[3] <= box[3] + 1);
  const items = data.items.filter((i) => inside(i.vis));
  const issues = findIssues({ ...data, items }).filter((i) => i.kind !== "clipped");
  const vw = page.viewportSize().width;
  const offscreen = items.filter((i) => i.vis[2] > vw + 1 || i.vis[0] < -1).length;
  const a = { name, overlaps: issues.filter((i) => i.kind === "overlap").length, truncated: issues.filter((i) => i.kind === "truncated").length, offscreen, items: items.length, issues: issues.slice(0, 10) };
  audits.push(a); console.log("audit", name, a.overlaps, a.truncated, offscreen);
}
async function shot(page, name, doAudit = true) { await page.screenshot({ path: `${OUT}/${name}.png` }); if (doAudit) await audit(page, name); }

// ---------- BEFORE (main) ----------
if (!process.env.SKIP_BEFORE) { const ctx = await newCtx(); let p = await open(ctx, BEFORE + "/clock", { singleCfg: single("countdown") }); await p.mouse.move(900, 500); await p.waitForTimeout(300);
  await shot(p, "before-01-clock-toolbar", false);
  p = await open(ctx, BEFORE + "/multi-clock", { clocks: grid }); await p.mouse.move(900, 500); await p.waitForTimeout(400);
  await shot(p, "before-02-multi-toolbar", false); await ctx.close(); }

// ---------- AFTER: display screens ----------
const ctx = await newCtx();
let disp = await open(ctx, AFTER + "/clock", { singleCfg: single("countdown"), withLegacy: true }); await disp.mouse.move(900, 500); await disp.waitForTimeout(300);
await shot(disp, "after-01-clock");
check("old top icons removed", (await disp.locator('button[title*="Change font"], button[title="Save preset"], button[title="Load preset"]').count()) === 0);
check("size buttons removed", (await disp.locator('button[title="Increase size"], [data-testid="label-size-btn"]').count()) === 0);
check("countdown chips/overrun row removed", (await disp.getByText(/Overrun: (ON|OFF)/).count()) === 0);
await disp.getByTestId("open-glass-setup").click(); await disp.waitForTimeout(600);
await shot(disp, "after-02-clock-sheet");
await disp.goto(AFTER + "/clock?setup=1&presets=1"); await disp.waitForTimeout(1200);
await shot(disp, "after-03-clock-presets-migrated");
check("legacy preset migrated into Glass presets", (await disp.getByText("Old Sunday preset").count()) > 0);
await disp.close();

// ---------- multi ----------
let m = await open(ctx, AFTER + "/multi-clock", { clocks: grid }); await m.mouse.move(900, 500); await m.waitForTimeout(500);
await shot(m, "after-08-multi-toolbar");
check("multi layout pills are Glass (no red)", (await m.evaluate(() => [...document.querySelectorAll("[data-glass-pill]")].some((b) => getComputedStyle(b).color.includes("239, 68, 68")))) === false);
await m.getByTestId("open-glass-setup").click(); await m.waitForTimeout(700);
await shot(m, "after-09-multi-sheet");
await ctx.close(); await browser.close();
fs.writeFileSync(`${OUT}/audit-ship.json`, JSON.stringify({ audits, checks }, null, 2));
console.log("TOTAL overlaps", audits.reduce((s, a) => s + a.overlaps, 0), "truncated", audits.reduce((s, a) => s + a.truncated, 0), "checks failed", checks.filter((c) => !c.ok).length);
