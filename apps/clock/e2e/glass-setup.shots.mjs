/** Mockup shots + overlap audit for the Glass setup sheet. */
import { createRequire } from "node:module";
import fs from "node:fs";
import { collectItems, findIssues } from "./overlap-collect.mjs";
const require = createRequire(import.meta.url);
const { chromium } = require("/workspace/pw/node_modules/playwright");
const OUT = process.env.OUT || "/workspace/qa/tally/clock-glass-setup-mockups-20261104";
fs.mkdirSync(OUT, { recursive: true });
const AFTER = "http://127.0.0.1:5321", BEFORE = "http://127.0.0.1:5322";
const now = Date.now();
const cell = (id, mode, name, color, extra = {}) => ({ id, mode, clockName: name, clockColor: color, fontName: "dseg7", timezone: "local", is24h: false, showSeconds: true, labelSize: "m", scaleLabels: true, ...extra });
const grid = [cell("1", "clock", "Local", "#22c55e"), cell("2", "countdown", "Worship Set", "#f59e0b", { countdownFrom: 1500 }), cell("3", "countup", "Sermon", "#3b82f6", { countupStart: 600 }), cell("4", "timecode", "TC-1", "#ef4444")];
const single = (mode, extra = {}) => ({ clockName: "BETWEEN SUNDAYS", clockColor: "#22c55e", fontName: "dseg7", timezone: "local", is24h: false, mode, showMiniClock: true, displayStyle: "digital", labelSize: "m", scaleLabels: true, autoSize: true, fontSize: 200, ...extra });
const presets = (v) => [{ id: "p1", name: "Sunday 9am", savedAt: now, data: v === "multi" ? { layout: "2x2", clocks: grid, globalScale: 1 } : single("countdown") }, { id: "p2", name: "Youth night", savedAt: now, data: v === "multi" ? { layout: "3x2", clocks: grid, globalScale: 1 } : single("clock", { clockColor: "#3b82f6" }) }, { id: "p3", name: "Conference", savedAt: now, data: v === "multi" ? { layout: "featured", clocks: grid, globalScale: 1 } : single("countup") }];
const browser = await chromium.launch();
const audits = [];
async function open(base, path, { singleCfg, clocks, signedIn = true }) {
  const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => console.log("[pageerror]", e.message));
  await page.route("https://api.tallyconnect.app/**", (r) => r.request().url().includes("/api/time") ? r.fulfill({ json: { serverTime: Date.now() } }) : r.fulfill({ status: 404, json: {} }));
  await page.routeWebSocket(/api\.tallyconnect\.app\/portal/, (ws) => { ws.send(JSON.stringify({ type: "connected", churchId: "c1", name: "Demo Church" })); });
  await page.addInitScript(({ singleCfg, clocks, signedIn, ps, pm }) => {
    if (signedIn) localStorage.setItem("tallyconnect-clock-token", "test-token");
    if (singleCfg) localStorage.setItem("broadcast-clock-settings", JSON.stringify(singleCfg));
    if (clocks) { localStorage.setItem("broadcast-multi-layout", "2x2"); localStorage.setItem("broadcast-multi-clocks", JSON.stringify(clocks)); }
    localStorage.setItem("clock-glass-presets-single", JSON.stringify(ps)); localStorage.setItem("clock-glass-presets-multi", JSON.stringify(pm));
  }, { singleCfg, clocks, signedIn, ps: presets("single"), pm: presets("multi") });
  await page.goto(base + path);
  await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(1500);
  return { page, ctx };
}
async function audit(page, name) {
  const data = await page.evaluate(collectItems);
  // Only the sheet + anything sharing its screen area. Items scrolled out of the sheet's scroll box are expected, not clipping.
  const sheet = await page.evaluate(() => { const r = document.querySelector("[data-glass-sheet]")?.getBoundingClientRect(); return r ? [r.left, r.top, r.right, r.bottom] : null; });
  const issues = findIssues(data).filter((i) => !(i.kind === "clipped"));
  let sheetOverlapsPage = 0;
  if (sheet) for (const it of data.items) { const inSheet = it.vis[0] >= sheet[0] - 1 && it.vis[2] <= sheet[2] + 1 && it.vis[1] >= sheet[1] - 1 && it.vis[3] <= sheet[3] + 1; const hits = it.vis[2] > sheet[0] + 1 && it.vis[0] < sheet[2] && it.vis[3] > sheet[1] && it.vis[1] < sheet[3]; if (hits && !inSheet) sheetOverlapsPage++; }
  const partialClip = data.items.filter((i) => i.clippedFrac > 0.1 && i.clippedFrac < 1 && !i.truncated).length;
  audits.push({ name, overlaps: issues.filter((i) => i.kind === "overlap").length, truncated: issues.filter((i) => i.kind === "truncated").length, pageUnderSheet: sheetOverlapsPage, partialClipAtScrollEdge: partialClip, issues: issues.slice(0, 20) });
}
async function shot(page, name) { await page.screenshot({ path: `${OUT}/${name}.png` }); await audit(page, name); }

// ---- BEFORE (live main) ----
let { page, ctx } = await open(BEFORE, "/clock", { singleCfg: single("countdown") });
await page.mouse.move(900, 500); await page.waitForTimeout(400);
await page.screenshot({ path: `${OUT}/before-01-single-controls.png` });
await page.locator('button[title*="Change font"]').click(); await page.waitForTimeout(400);
await page.screenshot({ path: `${OUT}/before-02-single-font-popover.png` }); await ctx.close();
({ page, ctx } = await open(BEFORE, "/multi-clock", { clocks: grid }));
await page.mouse.move(1500, 300); await page.waitForTimeout(400);
await page.locator('[data-clock-id="2"]').hover(); await page.locator('[data-clock-id="2"] svg.lucide-settings').first().click(); await page.waitForTimeout(500);
await page.screenshot({ path: `${OUT}/before-03-multi-cell-settings.png` });
await page.locator('[data-clock-id="2"] [data-clock-part=settings]').evaluate((e) => e.scrollTo(0, 9999)); await page.waitForTimeout(300);
await page.screenshot({ path: `${OUT}/before-04-multi-cell-settings-scrolled.png` });
await page.mouse.move(5, 5); await page.locator('[data-clock-id="4"]').hover(); await page.locator('[data-clock-id="4"] svg.lucide-settings').first().click(); await page.waitForTimeout(600);
await page.screenshot({ path: `${OUT}/before-05-timecode-cell-settings.png` }); await ctx.close();

// ---- AFTER (Glass setup) ----
const G = "?look=glass&setup=1";
({ page, ctx } = await open(AFTER, `/clock${G}`, { singleCfg: single("countdown", { countdownFrom: 1800 }) }));
await page.mouse.move(700, 500); await page.waitForTimeout(500); await shot(page, "after-01-single-setup-open");
await page.locator("#gs-time").scrollIntoViewIfNeeded(); await page.locator('[data-testid="gs-time-countdown-input"]').click(); await page.waitForTimeout(300); await shot(page, "after-02-single-time-entry");
await page.locator('[data-testid="gs-more-time"]').click(); await page.waitForTimeout(200);
await page.locator("#gs-look").evaluate((e) => e.scrollIntoView({ block: "start" })); await page.locator('[data-testid="gs-more-look"]').click(); await page.waitForTimeout(300); await shot(page, "after-03-single-look-section");
await page.locator("#gs-display").evaluate((e) => e.scrollIntoView({ block: "end" })); await page.waitForTimeout(300); await shot(page, "after-04-single-timecode-display-sections");
await page.locator('[data-testid="gs-presets-toggle"]').click(); await page.waitForTimeout(300); await shot(page, "after-05-single-presets-menu"); await ctx.close();
({ page, ctx } = await open(AFTER, `/clock${G}`, { singleCfg: single("clock") }));
await page.mouse.move(700, 500); await page.waitForTimeout(300); await shot(page, "after-06-single-clock-mode"); await ctx.close();
({ page, ctx } = await open(AFTER, `/clock${G}`, { singleCfg: single("countup") }));
await page.mouse.move(700, 500); await page.locator('[data-testid="gs-time-countup-input"]').fill("30:00"); await page.keyboard.press("Enter"); await page.waitForTimeout(800); await shot(page, "after-07-single-countup-start-30m"); await ctx.close();

({ page, ctx } = await open(AFTER, `/multi-clock${G}&sel=2`, { clocks: grid }));
await page.mouse.move(700, 500); await page.waitForTimeout(500); await shot(page, "after-10-multi-setup-preview-cards");
await page.locator('[data-testid="gs-time-countdown"]').scrollIntoViewIfNeeded(); await page.waitForTimeout(300); await shot(page, "after-11-multi-time-entry-adjust");
await page.locator('[data-testid="gs-preview-3"]').click(); await page.waitForTimeout(300); await page.locator("[data-gs-scroll]").evaluate((e) => e.scrollTo(0, 0)); await page.waitForTimeout(200); await shot(page, "after-12-multi-select-other-card");
await page.locator('[data-testid="gs-preview-1"]').dragTo(page.locator('[data-testid="gs-preview-3"]')); await page.waitForTimeout(600); await shot(page, "after-13-multi-after-drag-reorder");
await page.locator('[data-testid="gs-presets-toggle"]').click(); await page.waitForTimeout(300); await shot(page, "after-14-multi-presets-menu");
await page.locator('[data-testid="gs-presets-toggle"]').click();
await page.locator("#gs-display").evaluate((e) => e.scrollIntoView({ block: "end" })); await page.waitForTimeout(300); await shot(page, "after-15-multi-look-display-sections"); await ctx.close();
({ page, ctx } = await open(AFTER, `/multi-clock${G}&sel=4&section=timecode`, { clocks: grid }));
await page.mouse.move(700, 500); await page.waitForTimeout(600); await shot(page, "after-16-multi-timecode-section");
await page.locator("[data-gs-scroll]").evaluate((e) => e.scrollBy(0, 500)); await page.waitForTimeout(300); await shot(page, "after-17-multi-timecode-jam-trim"); 
await page.locator("[data-gs-scroll]").evaluate((e) => e.scrollTo(0, 0)); await page.locator('[data-testid="gs-more-mode"]').click(); await page.waitForTimeout(300); await shot(page, "after-18-multi-mode-sources-more"); await ctx.close();
({ page, ctx } = await open(AFTER, `/multi-clock${G}&sel=2`, { clocks: grid.map((c) => c.id === "2" ? { ...c, mode: "rundown" } : c) }));
await page.mouse.move(700, 500); await page.waitForTimeout(500); await shot(page, "after-19-multi-rundown-mode"); await ctx.close();

fs.writeFileSync(`${OUT}/audit-glass-setup.json`, JSON.stringify(audits, null, 2));
console.log(audits.map((a) => `${a.name}: overlaps=${a.overlaps} truncated=${a.truncated} pageUnderSheet=${a.pageUnderSheet} edgeClip=${a.partialClipAtScrollEdge}${a.issues.length ? " :: " + JSON.stringify(a.issues.slice(0, 3)) : ""}`).join("\n"));
await browser.close();
