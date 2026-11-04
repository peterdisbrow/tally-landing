/**
 * Focused audit of the quick add/subtract bar (Count Up / Countdown) on /multi-clock.
 * Also Count To, 2x3 / 3x2 grids. Env: BASE_URL (default http://127.0.0.1:5199)  VPS=1280x800,1440x900,1920x1080  OUT=file.json  TAG=before|after  SHOTS=dir
 * Checks (running + paused, idle + hovered, featured / 2x2 / 3x3, label sizes S-XL, scaling on/off, with and without an ADJ offset):
 *   - bounding-box overlaps between every visible item (adjust buttons vs digits/labels/status/controls/each other)
 *   - the 6 buttons are on one line (no wrapping), inside the cell, and not clipped
 */
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import { collectItems, findIssues } from "./overlap-collect.mjs";
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_PATH || "playwright");
const BASE_URL = process.env.BASE_URL || "http://127.0.0.1:5199";
const VPS = (process.env.VPS || "1280x800,1440x900,1920x1080").split(",").map((s) => s.split("x").map(Number));
const OUT = process.env.OUT || "/tmp/audit-adjust.json";
const TAG = process.env.TAG || "run";
const SHOTS = process.env.SHOTS; if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });
const ALL_COMBOS = [["s", false], ["s", true], ["m", false], ["m", true], ["l", false], ["l", true], ["xl", false], ["xl", true]];
const COMBOS = ALL_COMBOS.filter(([z]) => !process.env.SIZES || process.env.SIZES.split(",").includes(z));
const NAMES = { countup: "Sermon", countdown: "Worship Set", countto: "Doors Open" };
const LAYOUTS = {
  featured: [["countup", "countdown", "countup", "countdown", "countup"], ["countdown", "countup", "countdown", "countup", "countdown"]],
  "2x2": [["countup", "countdown", "countup", "countdown"]],
  "2x3": [["countup", "countdown", "countto", "countdown", "countup", "countto"]],
  "3x2": [["countup", "countdown", "countto", "countdown", "countup", "countto"]],
  "3x3": [["countup", "countdown", "countto", "countdown", "countup", "countto", "countup", "countdown", "countto"]],
};
const cell = (mode, i, o) => ({
  id: String(i + 1), mode, clockName: NAMES[mode], clockColor: mode === "countup" ? "#22c55e" : mode === "countto" ? "#3b82f6" : "#f59e0b", fontName: i % 2 ? "dseg14" : "dseg7",
  timezone: "local", is24h: false, showSeconds: true, labelSize: o.size, scaleLabels: o.scale,
  ...(mode === "countup" ? { countupStart: 3725 } : mode === "countto" ? { countToTarget: Date.now() + 45 * 60e3 } : { countdownFrom: 5400 }),
  ...(o.adj ? { timeAdjust: o.adj } : {}),
});
const browser = await chromium.launch();
const issues = []; const stats = { pages: 0, hovers: 0 };
const seen = new Set();
const norm = (t = "") => t.replace(/\d/g, "#");
const rec = (found, meta) => { for (const f of found) { const o = { ...meta, ...f }; const k = [o.vp, o.layout, o.size + (o.scale ? "+" : "-"), o.state, o.kind, norm(o.a), norm(o.b)].join("|"); if (seen.has(k)) continue; seen.add(k); issues.push(o); } };

for (const [W, H] of VPS) for (const [layout, chunks] of Object.entries(LAYOUTS).filter(([l]) => !process.env.ONLY || process.env.ONLY.split(",").includes(l))) for (const [size, scale] of COMBOS) for (const adj of [0, 3725]) for (let ci = 0; ci < chunks.length; ci++) {
  if (adj && !(size === "s" || size === "xl")) continue;
  const modes = chunks[ci];
  const ctx = await browser.newContext({ viewport: { width: W, height: H } });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => console.log("[pageerror]", e.message));
  await page.route("https://api.tallyconnect.app/**", (r) => r.request().url().includes("/rooms") ? r.fulfill({ json: { rooms: [] } }) : r.request().url().includes("/api/time") ? r.fulfill({ json: { serverTime: Date.now() } }) : r.fulfill({ status: 404, json: {} }));
  await page.routeWebSocket(/api\.tallyconnect\.app\/portal/, (ws) => { ws.send(JSON.stringify({ type: "connected", churchId: "c1", name: "Demo Church" })); });
  const clocks = modes.map((m, i) => cell(m, i, { size, scale, adj }));
  await page.addInitScript(({ layout, clocks }) => {
    localStorage.setItem("tallyconnect-clock-token", "test-token");
    localStorage.setItem("broadcast-multi-layout", layout);
    localStorage.setItem("broadcast-multi-clocks", JSON.stringify(clocks));
  }, { layout, clocks });
  for (let t = 0; ; t++) { try { await page.goto(BASE_URL + "/multi-clock", { waitUntil: "domcontentloaded", timeout: 90000 }); break; } catch (e) { if (t >= 3) throw e; await page.waitForTimeout(2000); } }
  await page.waitForSelector(`[data-clock-id="${clocks[clocks.length - 1].id}"]`);
  await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(400);
  stats.pages++;
  const meta = { vp: `${W}x${H}`, layout, size, scale, adj, chunk: ci };
  await page.waitForTimeout(2800);
  rec(findIssues(await page.evaluate(collectItems)), { ...meta, state: "idle" });
  for (let k = 0; k < clocks.length; k++) {
    const sel = `[data-clock-id="${clocks[k].id}"]`;
    for (const run of ["running", "paused"]) {
      const box = await page.locator(sel).boundingBox(); if (!box) continue;
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2 - 10); await page.mouse.move(box.x + box.width / 2 + 3, box.y + box.height / 2 - 8);
      await page.waitForTimeout(450);
      const pb = page.locator(`${sel} button[aria-label$="timer"]`).first();
      if (!(await pb.count())) { if (run === "paused") continue; } // Count To has no pause button
      const label = (await pb.count()) ? await pb.getAttribute("aria-label") : "Pause timer";
      const isPaused = label === "Start timer";
      if ((await pb.count()) && (run === "paused") !== isPaused) { await pb.click(); await page.mouse.move(box.x + box.width / 2 + 5, box.y + box.height / 2 - 8); await page.waitForTimeout(450); }
      stats.hovers++;
      const st = `hover:${modes[k]}#${k}:${run}`;
      const items = await page.evaluate(collectItems);
      rec(findIssues(items).filter((f) => f.cell === clocks[k].id || f.cell == null), { ...meta, state: st });
      // adjust-bar geometry: one line, inside the cell, no mutual overlap, not clipped
      const geo = await page.evaluate((sel) => {
        const c = document.querySelector(sel).getBoundingClientRect();
        const bar = document.querySelector(sel + " [data-testid=adjust-bar]");
        const btns = [...bar.querySelectorAll("button")].map((b) => { const r = b.getBoundingClientRect(); return [r.left, r.top, r.right, r.bottom, b.scrollWidth > b.clientWidth + 1 ? 1 : 0, r.height]; });
        const br = bar.getBoundingClientRect();
        return { c: [c.left, c.top, c.right, c.bottom], bar: [br.left, br.top, br.right, br.bottom], btns, opacity: getComputedStyle(bar).opacity, sw: bar.scrollWidth, cw: bar.clientWidth };
      }, sel);
      const problems = [];
      if (geo.opacity < 0.9) problems.push("bar-not-visible");
      const tops = new Set(geo.btns.map((b) => Math.round(b[1])));
      if (tops.size > 1) problems.push("buttons-wrapped");
      for (const b of geo.btns) { if (b[0] < geo.c[0] - 0.5 || b[2] > geo.c[2] + 0.5 || b[1] < geo.c[1] - 0.5 || b[3] > geo.c[3] + 0.5) { problems.push("button-outside-cell"); break; } if (b[4]) { problems.push("button-text-clipped"); break; } }
      for (let a = 0; a < geo.btns.length - 1; a++) if (geo.btns[a][2] > geo.btns[a + 1][0] + 0.5) { problems.push("buttons-overlap-each-other"); break; }
      if (geo.sw > geo.cw + 1) problems.push("bar-overflows-row");
      for (const p of problems) rec([{ kind: p, a: "adjust-bar", cell: clocks[k].id, w: Math.round(geo.bar[2] - geo.bar[0]), h: Math.round(geo.c[2] - geo.c[0]) }], { ...meta, state: st });
      if (SHOTS && size !== "l" && ["m", "xl"].includes(size) && scale && !adj && (k < 2) && (W !== 1440)) await page.screenshot({ path: path.join(SHOTS, `${TAG}-${W}x${H}-${layout}${ci ? "-b" : ""}-${size}-${modes[k]}-${run}-hover.png`) });
    }
    if (process.env.SETTINGS) { // settings panel (contains the "Add / subtract time" input + buttons)
      const box = await page.locator(sel).boundingBox();
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2 - 10); await page.mouse.move(box.x + box.width / 2 + 3, box.y + box.height / 2 - 8); await page.waitForTimeout(450);
      const gear = page.locator(`${sel} button:has(svg.lucide-settings)`);
      if (await gear.count()) {
        await gear.first().click(); await page.waitForTimeout(450);
        rec(findIssues(await page.evaluate(collectItems), { settingsCell: clocks[k].id }), { ...meta, state: `settings:${modes[k]}#${k}` });
        if (SHOTS && size === "xl" && scale && !adj && k < 2 && W !== 1440) await page.screenshot({ path: path.join(SHOTS, `${TAG}-${W}x${H}-${layout}${ci ? "-b" : ""}-${modes[k]}-settings.png`) });
        await gear.first().click().catch(() => {}); await page.waitForTimeout(200);
      }
    }
    await page.mouse.move(2, H - 2); await page.waitForTimeout(150);
  }
  await ctx.close();
  fs.writeFileSync(OUT, JSON.stringify({ partial: true, stats, issues }, null, 1));
}
await browser.close();
fs.writeFileSync(OUT, JSON.stringify({ stats, issues }, null, 1));
const by = {}; for (const i of issues) by[i.kind] = (by[i.kind] || 0) + 1;
console.log(JSON.stringify(stats), "issues", JSON.stringify(by));
