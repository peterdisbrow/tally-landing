/**
 * Overlap audit for /multi-clock. Env: VP=1920x1080  OUT=file.json  TAG=before|after
 * SHOTS=dir (optional: screenshot a fixed review set)  QUICK=1 (fewer combos)
 */
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import { collectItems, findIssues } from "./overlap-collect.mjs";
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_PATH || "playwright");
const BASE_URL = process.env.BASE_URL || "http://127.0.0.1:5199";
const [W, H] = (process.env.VP || "1920x1080").split("x").map(Number);
const OUT = process.env.OUT || `/tmp/audit-multi-${W}x${H}.json`;
const SHOTS = process.env.SHOTS; if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });
const TAG = process.env.TAG || "run";

const MODES = ["clock", "countup", "countdown", "countto", "service", "rundown", "timecode", "streamtime", "recordtime"];
const NAMES = ["Local", "Sermon", "Worship Set", "BETWEEN SUNDAYS", "", "", "TC-1", "STREAM", ""];
const FONTS = ["dseg7", "dseg14", "mono", "digital", "dseg7modern", "system", "dseg7", "dseg14", "mono"];
const COLORS = ["#22c55e", "#f59e0b", "#3b82f6", "#ef4444", "#06b6d4", "#d946ef", "#ef4444", "#22c55e", "#ffffff"];
const LAYOUTS = { featured: 5, "2x2": 4, "3x3": 9 };
const now = Date.now();
const cellFor = (mode, i, extra) => ({
  id: String(i + 1), mode, clockName: i === 8 ? "A VERY LONG CLOCK NAME FOR THE MAIN SANCTUARY" : NAMES[MODES.indexOf(mode)] ?? "", clockColor: COLORS[MODES.indexOf(mode)], fontName: FONTS[MODES.indexOf(mode)],
  timezone: "local", is24h: false, showSeconds: true,
  ...(mode === "countto" ? { countToTarget: now + 45 * 60e3, timeAdjust: 90 } : {}),
  ...(mode === "countup" ? { countupStart: 600, timeAdjust: -30 } : {}),
  ...(mode === "countdown" ? { countdownFrom: 1500, timeAdjust: 90 } : {}),
  ...(mode === "service" ? { serviceStartTime: now + 40 * 60e3 } : {}),
  ...extra,
});
const COMBOS = process.env.QUICK ? [["s", false], ["m", true], ["xl", true]] : [["s", false], ["s", true], ["m", false], ["m", true], ["l", false], ["l", true], ["xl", false], ["xl", true]];

const browser = await chromium.launch();
const issues = []; const stats = { pages: 0 };
const norm = (t = "") => t.replace(/\d/g, "#");
const key = (o) => [o.layout, o.size + (o.scale ? "+" : "-"), o.chunk, o.state, o.kind, norm(o.a), norm(o.b)].join("|");
const seen = new Set();

async function openPage(layout, chunkModes, size, scale) {
  const ctx = await browser.newContext({ viewport: { width: W, height: H } });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => console.log("[pageerror]", e.message));
  await page.route("https://api.tallyconnect.app/**", (r) => r.request().url().includes("/rooms") ? r.fulfill({ json: { rooms: [] } }) : r.request().url().includes("/api/time") ? r.fulfill({ json: { serverTime: Date.now() } }) : r.fulfill({ status: 404, json: {} }));
  await page.routeWebSocket(/api\.tallyconnect\.app\/portal/, (ws) => { ws.send(JSON.stringify({ type: "connected", churchId: "c1", name: "Demo Church" })); ws.send(JSON.stringify({ type: "status_update", status: { atem: { connected: false } } })); });
  const clocks = chunkModes.map((m, i) => cellFor(m, MODES.indexOf(m) , { labelSize: size, scaleLabels: scale }));
  await page.addInitScript(({ layout, clocks }) => {
    localStorage.setItem("tallyconnect-clock-token", "test-token");
    localStorage.setItem("broadcast-multi-layout", layout);
    localStorage.setItem("broadcast-multi-clocks", JSON.stringify(clocks));
  }, { layout, clocks });
  await page.goto(BASE_URL + "/multi-clock");
  await page.waitForSelector(`[data-clock-id="${clocks[clocks.length - 1].id}"]`);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);
  return { ctx, page, clocks };
}

function record(found, meta) {
  for (const f of found) {
    const o = { ...meta, ...f };
    const k = key(o);
    if (seen.has(k)) continue; seen.add(k); issues.push(o);
  }
}

const shotKeys = new Set(); // review set
const wantShot = (layout, size, scale, chunkIdx) => SHOTS && (W === 1920 || W === 1280) && ["featured", "2x2", "3x3"].includes(layout) && ((size === "m" && scale) || (size === "xl" && scale)) && chunkIdx <= 1;

for (const [layout, max] of Object.entries(LAYOUTS)) {
  const chunks = []; for (let i = 0; i < MODES.length; i += max) chunks.push(MODES.slice(i, i + max));
  for (const [size, scale] of COMBOS) for (let ci = 0; ci < chunks.length; ci++) {
    const modes = chunks[ci]; const chunk = modes.join(",");
    const { ctx, page, clocks } = await openPage(layout, modes, size, scale);
    stats.pages++;
    const meta = { layout, size, scale, chunk, vp: `${W}x${H}` };
    await page.waitForTimeout(2800); // let the page-level hover state expire
    const idle = await page.evaluate(collectItems);
    record(findIssues(idle), { ...meta, state: "idle" });
    if (wantShot(layout, size, scale, ci)) await page.screenshot({ path: path.join(SHOTS, `${TAG}-${W}x${H}-${layout}-${size}${scale ? "" : "-noscale"}-c${ci}-idle.png`) });
    for (let k = 0; k < clocks.length; k++) {
      const box = await page.locator(`[data-clock-id="${clocks[k].id}"]`).boundingBox();
      if (!box) continue;
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2 - 10); await page.mouse.move(box.x + box.width / 2 + 3, box.y + box.height / 2 - 8);
      await page.waitForTimeout(450);
      const hov = await page.evaluate(collectItems);
      const found = findIssues(hov).filter((f) => f.cell === clocks[k].id || f.cell == null || f.cell === undefined);
      record(found, { ...meta, state: `hover:${modes[k]}` });
      if (wantShot(layout, size, scale, ci) && (k < 2 || modes[k] === "timecode" || modes[k] === "countup")) await page.screenshot({ path: path.join(SHOTS, `${TAG}-${W}x${H}-${layout}-${size}${scale ? "" : "-noscale"}-c${ci}-hover-${modes[k]}.png`) });
      // settings panel (only for the first two combos to keep the run short)
      if (size === "xl" || size === "s") {
        const gear = page.locator(`[data-clock-id="${clocks[k].id}"] button:has(svg.lucide-settings)`);
        if (await gear.count()) {
          await gear.first().click(); await page.waitForTimeout(450);
          const st = await page.evaluate(collectItems);
          record(findIssues(st, { settingsCell: clocks[k].id }), { ...meta, state: `settings:${modes[k]}` });
          if (wantShot(layout, size, scale, ci) && k === 0) await page.screenshot({ path: path.join(SHOTS, `${TAG}-${W}x${H}-${layout}-${size}-c${ci}-settings-open.png`) });
          await page.mouse.move(2, H - 2); await page.waitForTimeout(250);
        }
      }
    }
    await ctx.close();
  }
}
await browser.close();
fs.writeFileSync(OUT, JSON.stringify({ vp: `${W}x${H}`, stats, issues }, null, 1));
const by = {}; for (const i of issues) by[i.kind] = (by[i.kind] || 0) + 1;
console.log(`${W}x${H}: ${stats.pages} pages, issues`, JSON.stringify(by));
