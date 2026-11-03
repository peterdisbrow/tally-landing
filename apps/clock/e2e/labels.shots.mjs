/**
 * Screenshots /multi-clock (big top clock + 4 cells) and /clock, for label-size review.
 *   BASE_URL=http://localhost:5199 PLAYWRIGHT_PATH=... OUT=dir PREFIX=before CFG='{"labelSize":"l"}' node e2e/labels.shots.mjs
 * CFG is merged into every cell config. Prints the computed label font sizes as JSON.
 */
import { createRequire } from "node:module";
import path from "node:path";
import fs from "node:fs";
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_PATH || "playwright");
const BASE_URL = process.env.BASE_URL || "http://127.0.0.1:5199";
const OUT = process.env.OUT || "/tmp/label-shots"; fs.mkdirSync(OUT, { recursive: true });
const PREFIX = process.env.PREFIX || "shot";
const CFG = JSON.parse(process.env.CFG || "{}");
const W = +(process.env.W || 1920), H = +(process.env.H || 1080);
const inHour = Date.now() + 45 * 60 * 1000;
const cells = [
  { id: "1", clockName: "BETWEEN SUNDAYS", clockColor: "#ef4444", fontName: "dseg7", timezone: "America/New_York", is24h: false, showSeconds: true, mode: "countto", countToTarget: inHour },
  { id: "2", clockName: "Local", clockColor: "#22c55e", fontName: "dseg7", timezone: "local", is24h: false, showSeconds: true },
  { id: "3", clockName: "Sermon", clockColor: "#f59e0b", fontName: "dseg7", timezone: "local", is24h: true, showSeconds: true, mode: "countup" },
  { id: "4", clockName: "Worship Set", clockColor: "#3b82f6", fontName: "dseg7", timezone: "local", is24h: true, showSeconds: true, mode: "countdown", countdownFrom: 1500 },
  { id: "5", clockName: "", clockColor: "#06b6d4", fontName: "dseg7", timezone: "local", is24h: true, showSeconds: true, mode: "rundown" },
].map((c) => ({ ...c, ...CFG }));
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: W, height: H } });
const page = await ctx.newPage();
page.on("pageerror", (e) => console.log("[pageerror]", e.message));
await page.route("https://api.tallyconnect.app/**", (r) => r.request().url().includes("/rooms") ? r.fulfill({ json: { rooms: [] } }) : r.request().url().includes("/api/time") ? r.fulfill({ json: { serverTime: Date.now() } }) : r.fulfill({ status: 404, json: {} }));
await page.routeWebSocket(/api\.tallyconnect\.app\/portal/, (ws) => { ws.send(JSON.stringify({ type: "connected", churchId: "c1", name: "Demo Church" })); ws.send(JSON.stringify({ type: "status_update", status: { atem: { connected: false } } })); });
await page.addInitScript(({ cells }) => {
  localStorage.setItem("tallyconnect-clock-token", "test-token");
  localStorage.setItem("broadcast-multi-layout", "featured");
  localStorage.setItem("broadcast-multi-clocks", JSON.stringify(cells));
}, { cells });
await page.goto(BASE_URL + "/multi-clock");
await page.waitForSelector('[data-clock-id="5"]');
await page.waitForTimeout(1500);
await page.mouse.move(W - 5, H - 5);
await page.screenshot({ path: path.join(OUT, `${PREFIX}-multi-clock-${W}x${H}.png`) });
const sizes = await page.evaluate(() => [...document.querySelectorAll("[data-clock-id]")].map((el) => ({
  id: el.getAttribute("data-clock-id"), box: [Math.round(el.getBoundingClientRect().width), Math.round(el.getBoundingClientRect().height)],
  spans: [...el.querySelectorAll("span")].filter((s) => s.innerText.trim() && getComputedStyle(s).fontFamily.includes("mono") || false).slice(0, 4).map((s) => [s.innerText.trim().slice(0, 24), getComputedStyle(s).fontSize]),
})));
console.log(JSON.stringify(sizes));
// /clock page
const p2 = await ctx.newPage();
await p2.addInitScript(({ cfg }) => localStorage.setItem("broadcast-clock-settings", JSON.stringify({ clockName: "BETWEEN SUNDAYS", clockColor: "#ef4444", fontName: "dseg7", timezone: "local", is24h: false, mode: "clock", fontSize: 200, autoSize: false, displayStyle: "digital", ...cfg })), { cfg: CFG });
await p2.goto(BASE_URL + "/clock");
await p2.waitForTimeout(1500);
await p2.mouse.move(W - 5, H - 5);
await p2.screenshot({ path: path.join(OUT, `${PREFIX}-clock-${W}x${H}.png`) });
await browser.close();
