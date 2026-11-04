/** Glass setup + phone remote: screenshots, overlap audits and an end-to-end pairing test (BroadcastChannel transport). */
import { createRequire } from "node:module";
import fs from "node:fs";
import { collectItems, findIssues } from "./overlap-collect.mjs";
const require = createRequire(import.meta.url);
const { chromium } = require("/workspace/pw/node_modules/playwright");
const OUT = process.env.OUT || "/workspace/qa/tally/clock-glass-full-20261104";
fs.mkdirSync(OUT, { recursive: true });
const AFTER = "http://127.0.0.1:5321", BEFORE = "http://127.0.0.1:5322";
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
{ const ctx = await newCtx(); let p = await open(ctx, BEFORE + "/clock", { singleCfg: single("countdown") }); await p.mouse.move(900, 500); await p.waitForTimeout(300);
  await shot(p, "before-01-clock-toolbar", false);
  p = await open(ctx, BEFORE + "/multi-clock", { clocks: grid }); await p.mouse.move(900, 500); await p.waitForTimeout(400);
  await shot(p, "before-02-multi-toolbar", false); await ctx.close(); }

// ---------- AFTER: display screens ----------
const ctx = await newCtx();
let disp = await open(ctx, AFTER + "/clock?remoteTransport=local", { singleCfg: single("countdown"), withLegacy: true }); await disp.mouse.move(900, 500); await disp.waitForTimeout(300);
await shot(disp, "after-01-clock");
check("old top icons removed", (await disp.locator('button[title*="Change font"], button[title="Save preset"], button[title="Load preset"]').count()) === 0);
check("size buttons removed", (await disp.locator('button[title="Increase size"], [data-testid="label-size-btn"]').count()) === 0);
check("countdown chips/overrun row removed", (await disp.getByText(/Overrun: (ON|OFF)/).count()) === 0);
await disp.getByTestId("open-glass-setup").click(); await disp.waitForTimeout(600);
await shot(disp, "after-02-clock-sheet");
await disp.goto(AFTER + "/clock?remoteTransport=local&setup=1&presets=1"); await disp.waitForTimeout(1200);
await shot(disp, "after-03-clock-presets-migrated");
check("legacy preset migrated into Glass presets", (await disp.getByText("Old Sunday preset").count()) > 0);
await disp.goto(AFTER + "/clock?remoteTransport=local"); await disp.waitForTimeout(1000); await disp.mouse.move(900, 500);
await disp.getByTestId("open-remote").click(); await disp.waitForTimeout(800);
await shot(disp, "after-04-clock-qr-dialog");
check("QR rendered", (await disp.locator('[data-testid="remote-qr"] svg').count()) === 1);
const pairing = await disp.evaluate(() => JSON.parse(localStorage.getItem("clock-remote-pairing-single")));
check("pairing token is 256-bit base64url, expires ~12h", /^[A-Za-z0-9_-]{43}$/.test(pairing.token) && Math.abs(pairing.exp - Date.now() - 12 * 3600e3) < 60e3);

// ---------- phone (same browser profile so BroadcastChannel reaches the display) ----------
const phone = await ctx.newPage(); await phone.setViewportSize({ width: 390, height: 844 });
await phone.goto(`${AFTER}/clock/remote?remoteTransport=local#k=${pairing.token}&v=single`);
await phone.waitForSelector('[data-testid="remote-link"]:has-text("Connected")', { timeout: 8000 });
check("token stripped from phone address bar", !phone.url().includes("#k="));
await disp.waitForSelector('[data-testid="remote-status"]:has-text("1 phone connected")', { timeout: 6000 }).then(() => check("display sees phone", true), () => check("display sees phone", false));
await shot(disp, "after-05-clock-qr-connected");
await disp.keyboard.press("Escape");
await phone.getByTestId("remote-countdown-input").fill("7m"); await phone.getByTestId("remote-countdown-set").click(); await disp.waitForTimeout(700);
const txt = async () => (await disp.locator('[data-clock-part="digits"]').first().innerText()).replace(/\s/g, "");
check("phone sets countdown 7:00", /07:00/.test(await txt()), await txt());
await phone.getByTestId("remote-toggle").click(); await disp.waitForTimeout(2300);
check("phone starts timer", /06:5[6-9]/.test(await txt()), await txt());
await phone.getByTestId("remote-adjust").getByText("1m").last().click(); await disp.waitForTimeout(600);
check("phone +1m", /07:5\d/.test(await txt()), await txt());
await phone.getByTestId("remote-toggle").click(); await disp.waitForTimeout(500); const t1 = await txt(); await disp.waitForTimeout(1500);
check("phone pauses timer", t1 === await txt(), t1);
await shot(phone, "after-06-phone-remote-single");
await phone.getByTestId("remote-reset").click(); await disp.waitForTimeout(600);
check("phone resets", /07:00/.test(await txt()), await txt());
await phone.getByTestId("remote-modes").getByText("Count Up").click(); await disp.waitForTimeout(600);
check("phone switches mode", (await disp.locator('[data-mode-tab][data-active]').innerText()).toLowerCase().includes("count up"));

// security: a phone with a different token is ignored; a forged message with the right room but wrong key is ignored
const rogue = await ctx.newPage(); await rogue.setViewportSize({ width: 390, height: 844 });
await rogue.goto(`${AFTER}/clock/remote?remoteTransport=local#k=${"A".repeat(43)}&v=single`); await rogue.waitForTimeout(1500);
check("unpaired phone never connects to this display", !(await rogue.getByTestId("remote-link").innerText()).includes("Connected"));
const room = await disp.evaluate(async (t) => [...new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`tally-clock-remote:v1:${t}`)))].map((x) => x.toString(16).padStart(2, "0")).join(""), pairing.token);
const before = await txt();
await rogue.evaluate((room) => { const ch = new BroadcastChannel(`clock-remote:${room}`); ch.postMessage({ t: "data", as: "remote", data: { t: "msg", from: "x", seq: 99, ts: Date.now(), body: JSON.stringify({ k: "cmd", c: { cmd: "setCountdown", seconds: 60 } }), sig: "AAAA" } }); }, room);
await disp.waitForTimeout(800);
check("forged unsigned command in the right room is dropped", (await disp.locator('[data-mode-tab][data-active]').innerText()).toLowerCase().includes("count up"), before);
// rotate: old phone stops working
await disp.mouse.move(900, 500); await disp.getByTestId("open-remote").click(); await disp.waitForTimeout(400); await disp.getByTestId("remote-new-code").click(); await disp.waitForTimeout(1500);
await phone.getByTestId("remote-modes").getByText("Clock").click(); await disp.waitForTimeout(700);
check("after New code, the old phone is ignored", (await disp.locator('[data-mode-tab][data-active]').innerText()).toLowerCase().includes("count up"));
await phone.close(); await rogue.close(); await disp.close();

// unpaired phone landing
{ const p = await ctx.newPage(); await p.setViewportSize({ width: 390, height: 844 }); await p.goto(AFTER + "/clock/remote"); await p.waitForTimeout(800); await shot(p, "after-07-phone-unpaired"); await p.close(); }

// ---------- multi ----------
let m = await open(ctx, AFTER + "/multi-clock?remoteTransport=local", { clocks: grid }); await m.mouse.move(900, 500); await m.waitForTimeout(500);
await shot(m, "after-08-multi-toolbar");
check("multi layout pills are Glass (no red)", (await m.evaluate(() => [...document.querySelectorAll("[data-glass-pill]")].some((b) => getComputedStyle(b).color.includes("239, 68, 68")))) === false);
await m.getByTestId("open-glass-setup").click(); await m.waitForTimeout(700);
await shot(m, "after-09-multi-sheet");
await m.getByTestId("open-glass-setup").click(); await m.waitForTimeout(500); await m.mouse.move(900, 500);
await m.getByTestId("open-remote").click(); await m.waitForTimeout(800);
await shot(m, "after-10-multi-qr-dialog");
const mp = await m.evaluate(() => JSON.parse(localStorage.getItem("clock-remote-pairing-multi")));
const ph = await ctx.newPage(); await ph.setViewportSize({ width: 390, height: 844 });
await ph.goto(`${AFTER}/clock/remote?remoteTransport=local#k=${mp.token}&v=multi`);
await ph.waitForSelector('[data-testid="remote-clocks"]', { timeout: 8000 });
check("phone lists every clock", (await ph.locator('[data-testid="remote-clocks"] button').count()) === 4);
await ph.locator('[data-testid="remote-clocks"] button', { hasText: "Walk-in" }).click();
await ph.getByTestId("remote-toggle").click(); await m.keyboard.press("Escape"); await m.waitForTimeout(2300);
const cellText = async (id) => (await m.locator(`[data-clock-id="${id}"] [data-clock-part="digits"]`).first().innerText()).replace(/\s/g, "");
check("multi: only the selected clock starts", /09:5[6-9]/.test(await cellText("4")) && /25:00/.test(await cellText("2")), `${await cellText("4")} / ${await cellText("2")}`);
await ph.locator('[data-testid="remote-clocks"] button', { hasText: "Worship Set" }).click();
await ph.getByTestId("remote-adjust").getByText("1m").last().click(); await m.waitForTimeout(700);
check("multi: +1m hits Worship Set only", /26:00/.test(await cellText("2")), await cellText("2"));
await ph.waitForTimeout(600);
await shot(ph, "after-11-phone-remote-multi");
await ctx.close(); await browser.close();
fs.writeFileSync(`${OUT}/audit-remote.json`, JSON.stringify({ audits, checks }, null, 2));
console.log("TOTAL overlaps", audits.reduce((s, a) => s + a.overlaps, 0), "truncated", audits.reduce((s, a) => s + a.truncated, 0), "checks failed", checks.filter((c) => !c.ok).length);
