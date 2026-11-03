/**
 * End-to-end LTC test for the Multi-Clock "Timecode (Deity TC-1)" mode.
 *
 * Generates LTC WAVs (23.98 / 24 / 25 / 29.97 DF / 30), feeds each to Chrome as a
 * *fake microphone* (--use-file-for-fake-audio-capture), and checks what the real
 * UI shows. Also covers silence, non-LTC audio, signal loss, permission denied,
 * and the signed-in gate.
 *
 * Run (needs Playwright + a Vite dev server for apps/clock on $BASE_URL):
 *   cd apps/clock && npx vite --port 5199 &
 *   PLAYWRIGHT_PATH=/path/to/node_modules/playwright SHOTS=/some/dir node e2e/ltc.e2e.mjs
 * Node >= 22.18 (runs the TS generator directly).
 */
import { createRequire } from "node:module";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { generateLtc, toWav16 } from "../src/test/ltcGenerator.ts";

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_PATH || "playwright");
const BASE_URL = process.env.BASE_URL || "http://127.0.0.1:5199";
const SHOTS = process.env.SHOTS || path.join(os.tmpdir(), "ltc-shots");
fs.mkdirSync(SHOTS, { recursive: true });
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "ltc-wav-"));

const results = [];
const check = (name, ok, detail = "") => {
  results.push({ name, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? "  — " + detail : ""}`);
};

const wav = (name, samples) => { const p = path.join(tmp, name + ".wav"); fs.writeFileSync(p, toWav16(samples)); return p; };

const RATES = [
  { id: "23.98", fps: 24000 / 1001, nominal: 24, drop: false, label: "23.98 fps", sep: ":" },
  { id: "24", fps: 24, nominal: 24, drop: false, label: "24 fps", sep: ":" },
  { id: "25", fps: 25, nominal: 25, drop: false, label: "25 fps", sep: ":" },
  { id: "29.97df", fps: 30000 / 1001, nominal: 30, drop: true, label: "29.97 fps DF", sep: ";" },
  { id: "30", fps: 30, nominal: 30, drop: false, label: "30 fps", sep: ":" },
];

async function launch(wavPath, { fakeUi = true, noloop = false } = {}) {
  const args = ["--use-fake-device-for-media-stream", "--autoplay-policy=no-user-gesture-required"];
  if (fakeUi) args.push("--use-fake-ui-for-media-stream");
  else args.push("--deny-permission-prompts");
  if (wavPath) args.push(`--use-file-for-fake-audio-capture=${wavPath}${noloop ? "%noloop" : ""}`);
  return chromium.launch({ args });
}

/** Opens /multi-clock signed in (mocked relay), with a clock + an LTC cell. */
async function openApp(browser, { signedIn = true, ltcMode = true, viewport = { width: 1280, height: 720 }, extra } = {}) {
  const ctx = await browser.newContext({ viewport });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => console.log("  [pageerror]", e.message));
  if (extra) await extra(page, ctx);
  await page.route("https://api.tallyconnect.app/**", (r) => {
    const u = r.request().url();
    if (u.includes("/rooms")) return r.fulfill({ json: { rooms: [] } });
    if (u.includes("/api/time")) return r.fulfill({ json: { serverTime: Date.now() } });
    return r.fulfill({ status: 404, json: {} });
  });
  await page.routeWebSocket(/api\.tallyconnect\.app\/portal/, (ws) => {
    ws.send(JSON.stringify({ type: "connected", churchId: "c1", name: "Demo Church" }));
    ws.send(JSON.stringify({ type: "status_update", status: { atem: { connected: false } } }));
  });
  await page.addInitScript(({ signedIn, ltcMode }) => {
    if (signedIn) localStorage.setItem("tallyconnect-clock-token", "test-token");
    localStorage.setItem("broadcast-multi-layout", "2x2");
    localStorage.setItem("broadcast-multi-clocks", JSON.stringify([
      { id: "1", clockName: "Local Time", clockColor: "#22c55e", fontName: "dseg7", timezone: "America/New_York", is24h: false, showSeconds: true },
      { id: "2", clockName: "TC-1 Timecode", clockColor: "#ef4444", fontName: "dseg7", timezone: "local", is24h: true, showSeconds: true, mode: ltcMode ? "timecode" : "clock" },
    ]));
  }, { signedIn, ltcMode });
  await page.goto(BASE_URL + "/multi-clock");
  if (signedIn) await page.waitForSelector('[data-clock-id="2"]');
  return { ctx, page, cell: page.locator('[data-clock-id="2"]') };
}

const cellText = async (cell) => (await cell.innerText()).replace(/\s+/g, " ");
const TC_RE = (sep) => new RegExp(`\\b(\\d\\d):(\\d\\d):(\\d\\d)${sep}(\\d\\d)\\b`);

async function waitFor(fn, ms = 8000, step = 100) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) { const v = await fn(); if (v) return v; await new Promise((r) => setTimeout(r, step)); }
  return null;
}

async function main() {
  // ── 1. Every frame rate: locks, shows HH:MM:SS:FF, right fps label, advancing ──
  for (const r of RATES) {
    const file = wav("ltc-" + r.id, generateLtc({ fps: r.fps, nominal: r.nominal, drop: r.drop, seconds: 30, start: [1, 0, 0, 0] }));
    const browser = await launch(file);
    const { ctx, page, cell } = await openApp(browser);
    await page.screenshot({ path: path.join(SHOTS, `01-idle-start-button.png`) }).catch(() => {});
    await cell.hover();
    await cell.getByRole("button", { name: /Start timecode input/ }).click();
    const locked = await waitFor(async () => (await cell.getAttribute("data-ltc") ) || (await cell.locator('[data-testid="ltc-overlay"]').getAttribute("data-ltc-status")) === "locked");
    const sub = await waitFor(async () => { const t = await cellText(cell); return t.includes(`TC-1 · ${r.label.replace(" DF", "")}`) ? t : null; }, 10000);
    check(`[${r.id}] locks and reports "${r.label}"`, !!sub, sub ? "" : await cellText(cell));
    const t1 = (await cellText(cell)).match(TC_RE(r.sep));
    check(`[${r.id}] shows HH:MM:SS${r.sep}FF`, !!t1, t1 ? t1[0] : await cellText(cell));
    await page.waitForTimeout(1200);
    const t2 = (await cellText(cell)).match(TC_RE(r.sep));
    const toSec = (m) => (+m[1] * 3600 + +m[2] * 60 + +m[3]);
    check(`[${r.id}] timecode advances (~1 s in 1.2 s)`, !!(t1 && t2) && toSec(t2) - toSec(t1) >= 1 && toSec(t2) - toSec(t1) <= 2, t1 && t2 ? `${t1[0]} → ${t2[0]}` : "");
    if (r.drop) check(`[${r.id}] drop-frame labelled DF`, (await cellText(cell)).includes("DF"));
    const db = await cell.locator('[data-testid="ltc-db"]').innerText();
    check(`[${r.id}] level meter reads a real level`, /-\d+ dB/.test(db) && !db.includes("∞"), db);
    await page.screenshot({ path: path.join(SHOTS, `02-locked-${r.id}.png`) });
    await ctx.close(); await browser.close();
  }

  // ── 2. Silence → NO SIGNAL ; non-LTC tone → AUDIO PRESENT · NO TIMECODE ──
  {
    const silent = wav("silence", new Float32Array(48000 * 10));
    const browser = await launch(silent);
    const { ctx, page, cell } = await openApp(browser);
    await cell.hover(); await cell.getByRole("button", { name: /Start timecode input/ }).click();
    const ok = await waitFor(async () => (await cellText(cell)).includes("NO SIGNAL"));
    check("silence shows NO SIGNAL", !!ok, await cellText(cell));
    check("silence shows placeholder, not a stale time", (await cellText(cell)).includes("--:--:--:--"));
    await page.screenshot({ path: path.join(SHOTS, "03-no-signal.png") });
    await ctx.close(); await browser.close();
  }
  {
    const tone = new Float32Array(48000 * 10).map((_, i) => 0.5 * Math.sin((2 * Math.PI * 440 * i) / 48000));
    const browser = await launch(wav("tone", tone));
    const { ctx, page, cell } = await openApp(browser);
    await cell.hover(); await cell.getByRole("button", { name: /Start timecode input/ }).click();
    const ok = await waitFor(async () => (await cellText(cell)).includes("NO TIMECODE"));
    check("non-LTC audio shows AUDIO PRESENT · NO TIMECODE", !!ok, await cellText(cell));
    await page.screenshot({ path: path.join(SHOTS, "04-audio-but-no-timecode.png") });
    await ctx.close(); await browser.close();
  }

  // ── 3. Signal lost mid-stream (LTC for 4 s then silence, no loop) ──
  {
    const a = generateLtc({ fps: 25, nominal: 25, seconds: 4 });
    const s = new Float32Array(48000 * 20); s.set(a);
    const browser = await launch(wav("lose", s), { noloop: true });
    const { ctx, page, cell } = await openApp(browser);
    await cell.hover(); await cell.getByRole("button", { name: /Start timecode input/ }).click();
    const locked = await waitFor(async () => (await cellText(cell)).includes("TC-1 · 25 fps"), 6000);
    const lost = await waitFor(async () => (await cellText(cell)).includes("NO SIGNAL"), 10000);
    check("locks, then shows NO SIGNAL when the timecode stops", !!locked && !!lost, `locked=${!!locked} lost=${!!lost}`);
    await ctx.close(); await browser.close();
  }

  // ── 4. Permission denied (browser really denies the prompt) ──
  {
    // Chrome throws NotAllowedError("Permission denied") when the user (or policy) refuses the prompt;
    // headless can't click the real prompt, so reject exactly that way.
    const browser = await launch(wav("any", new Float32Array(48000)));
    const { ctx, page, cell } = await openApp(browser, {
      extra: (p) => p.addInitScript(() => {
        navigator.mediaDevices.getUserMedia = () => Promise.reject(new DOMException("Permission denied", "NotAllowedError"));
      }),
    });
    await cell.hover(); await cell.getByRole("button", { name: /Start timecode input/ }).click();
    const ok = await waitFor(async () => (await cellText(cell)).includes("MIC PERMISSION DENIED"), 8000);
    check("permission denied shows a clear state", !!ok, await cellText(cell));
    const msg = await cell.locator('[data-testid="ltc-message"]').innerText().catch(() => "");
    check("denied state explains how to fix it", /Allow it for this site/i.test(msg), msg);
    check("denied state offers Try again", await cell.getByRole("button", { name: /Try again/ }).isVisible());
    await page.screenshot({ path: path.join(SHOTS, "05-permission-denied.png") });
    await ctx.close(); await browser.close();
  }

  // ── 5. No audio device at all ──
  {
    const browser = await chromium.launch({ args: ["--use-fake-ui-for-media-stream"] });
    const { ctx, page, cell } = await openApp(browser, {
      extra: (p) => p.addInitScript(() => {
        const orig = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
        navigator.mediaDevices.getUserMedia = () => Promise.reject(Object.assign(new Error("none"), { name: "NotFoundError" }));
        void orig;
      }),
    });
    await cell.hover(); await cell.getByRole("button", { name: /Start timecode input/ }).click();
    const ok = await waitFor(async () => (await cellText(cell)).includes("AUDIO INPUT ERROR"));
    check("no input device shows a helpful error", !!ok && (await cellText(cell)).includes("No audio input found"), await cellText(cell));
    await ctx.close(); await browser.close();
  }

  // ── 6. Echo cancellation / noise suppression / AGC are OFF in the real request ──
  // ── 7. Device picker, mode picker (signed-in only), settings panel ──
  {
    const file = wav("ltc25", generateLtc({ fps: 25, nominal: 25, seconds: 30 }));
    const browser = await launch(file);
    const { ctx, page, cell } = await openApp(browser, {
      extra: (p) => p.addInitScript(() => {
        window.__gumCalls = [];
        const orig = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
        navigator.mediaDevices.getUserMedia = (c) => { window.__gumCalls.push(JSON.parse(JSON.stringify(c))); return orig(c); };
      }),
    });
    await cell.hover(); await cell.getByRole("button", { name: /Start timecode input/ }).click();
    await waitFor(async () => (await cellText(cell)).includes("TC-1 · 25 fps"));
    const calls = await page.evaluate(() => window.__gumCalls);
    const a = calls[0]?.audio || {};
    check("getUserMedia asks for echoCancellation/noiseSuppression/autoGainControl = false",
      a.echoCancellation === false && a.noiseSuppression === false && a.autoGainControl === false, JSON.stringify(a));
    // open settings
    await cell.hover();
    await cell.locator("button:has(svg.lucide-settings)").click();
    const sel = cell.getByLabel("Audio input device");
    await sel.waitFor();
    await page.waitForTimeout(600); // let the settings panel finish fading in
    const opts = await sel.locator("option").allInnerTexts();
    check("device picker lists the audio inputs", opts.length >= 2, opts.join(" | "));
    await page.screenshot({ path: path.join(SHOTS, "06-settings-device-picker.png") });
    const val = await sel.locator("option").nth(1).getAttribute("value");
    await sel.selectOption(val);
    const relocked = await waitFor(async () => (await cellText(cell)).includes("TC-1 · 25 fps"), 8000);
    check("choosing a device restarts capture and locks again", !!relocked);
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("broadcast-multi-clocks"))[1].ltcDeviceId);
    check("chosen device is remembered in the saved layout", saved === val, String(saved));
    const calls2 = await page.evaluate(() => window.__gumCalls);
    check("chosen device is requested by exact deviceId", calls2.at(-1)?.audio?.deviceId?.exact === val, JSON.stringify(calls2.at(-1)?.audio?.deviceId));
    await ctx.close();

    // Mode picker: LTC offered when signed in, hidden when not
    const a1 = await openApp(browser, { ltcMode: false });
    await a1.cell.hover(); await a1.cell.locator("button:has(svg.lucide-settings)").click();
    const has = await a1.cell.getByRole("button", { name: "Timecode (Deity TC-1)" }).count();
    check("mode picker offers 'Timecode (Deity TC-1)' when signed in to Tally", has === 1);
    await a1.cell.getByRole("button", { name: "Timecode (Deity TC-1)" }).click();
    await a1.page.waitForTimeout(300);
    await a1.page.screenshot({ path: path.join(SHOTS, "07-mode-picker-ltc.png") });
    check("picking the mode shows the Start button (no surprise permission prompt)", (await a1.cell.locator('[data-testid="ltc-overlay"]').getAttribute("data-ltc-status")) === "idle");
    await a1.ctx.close();

    // Not signed in: LTC not offered, a saved LTC cell says Not Connected and never opens the mic
    const a2 = await openApp(browser, { signedIn: false });
    await a2.page.waitForTimeout(500);
    const calls3 = await a2.page.evaluate(() => (window.__gumCalls || []).length);
    const gate = await a2.page.locator("body").innerText();
    check("signed-out users don't get the LTC clock (login gate, no mic access)", !gate.includes("Timecode") && calls3 === 0, gate.slice(0, 80).replace(/\n/g, " "));
    await a2.ctx.close();
    await browser.close();
  }


  // ── 8. JAM: lock for a few seconds, unplug, free-run, reload keeps it, re-jam, clear ──
  {
    const lead = 0.3;
    const a = generateLtc({ fps: 24000 / 1001, nominal: 24, seconds: 9, start: [1, 0, 0, 0], leadSilence: lead });
    const s = new Float32Array(48000 * 90); s.set(a); // 9 s of LTC, then the "TC-1 is unplugged" silence
    const browser = await launch(wav("jam", s), { noloop: true });
    const { ctx, page, cell } = await openApp(browser, {
      extra: (p) => p.addInitScript(() => {
        window.__gumCalls = [];
        const orig = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
        navigator.mediaDevices.getUserMedia = (c) => { window.__gumCalls.push(1); return orig(c); };
      }),
    });
    const toFrames = (m) => ((+m[1] * 3600 + +m[2] * 60 + +m[3]) * 24000) / 1001 + +m[4];
    const tcNow = async () => { const m = (await cellText(cell)).match(TC_RE(":")); return m ? { m, f: Math.round(((+m[1] * 3600 + +m[2] * 60 + +m[3]) * 24) + +m[4]) } : null; };
    await cell.hover();
    await cell.getByRole("button", { name: /Start timecode input/ }).click();
    await waitFor(async () => (await cellText(cell)).includes("TC-1 · 23.98 fps · LIVE"), 10000);
    check("[jam] Jam button is disabled until the rate is locked, then enabled", await waitFor(async () => !(await cell.getByTestId("jam-button").isDisabled()), 8000));
    check("[jam] not jammed yet: no saved jam", (await page.evaluate(() => localStorage.getItem("tally-clock-tc-jam-v1"))) === null);
    await cell.getByTestId("jam-button").click();
    const jamming = await waitFor(async () => (await cellText(cell)).includes("JAMMING"), 1500);
    check("[jam] shows JAMMING… progress while locking", !!jamming, await cellText(cell));
    await page.screenshot({ path: path.join(SHOTS, "08-jamming.png") });
    const tJam0 = Date.now();
    const done = await waitFor(async () => (await page.evaluate(() => localStorage.getItem("tally-clock-tc-jam-v1"))) !== null, 9000, 100);
    const jamMs = Date.now() - tJam0;
    check("[jam] jam completes after a few seconds of clean frames", !!done && jamMs > 1500, `${jamMs} ms`);
    const rec = JSON.parse(await page.evaluate(() => localStorage.getItem("tally-clock-tc-jam-v1"))).jams["deity-tc1-ltc"];
    check("[jam] stored: anchor wall time + count + fps, 48+ validated frames", rec && rec.frames >= 48 && Math.abs(rec.fps - 24000 / 1001) < 0.01 && rec.nominal === 24, JSON.stringify(rec));
    check("[jam] anchor jitter is small (spread < 60 ms)", rec && rec.spreadMs < 60, `${rec?.spreadMs?.toFixed(1)} ms`);
    await page.waitForTimeout(600);
    const live = await cellText(cell);
    check("[jam] while the signal is live it shows LIVE + 'jammed'", /LIVE · jammed (just now|\d+s ago)/.test(live), live);
    await page.screenshot({ path: path.join(SHOTS, "09-jammed-live.png") });

    // Unplug: the wav runs out of LTC ~9.3 s after the stream opened.
    const lost = await waitFor(async () => (await cell.locator('[data-testid="ltc-overlay"]').getAttribute("data-tc-state")) === "freerun", 15000);
    check("[jam] signal gone -> switches to FREE-RUN", !!lost, await cellText(cell));
    const t1 = await tcNow(); const w1 = Date.now();
    await page.waitForTimeout(3000);
    const t2 = await tcNow(); const w2 = Date.now();
    const elapsedFrames = ((w2 - w1) / 1000) * (24000 / 1001);
    check("[jam] free-run keeps advancing at the real frame rate", !!(t1 && t2) && Math.abs((t2.f - t1.f) - elapsedFrames) < 5, t1 && t2 ? `${t1.m[0]} → ${t2.m[0]} (${t2.f - t1.f} frames in ${elapsedFrames.toFixed(1)} expected)` : "");
    const fr = await cellText(cell);
    check("[jam] free-run is labelled FREE-RUN + 'jammed Xs ago' + fps", /FREE-RUN · 23\.98 fps · jammed (just now|\d+s ago)/.test(fr), fr);
    const dot = await cell.locator("span.rounded-full").first().getAttribute("class");
    check("[jam] status dot is amber (not green) in free-run", /amber/.test(dot || ""), dot || "");
    await page.screenshot({ path: path.join(SHOTS, "10-freerun-after-unplug.png") });

    // Reload: jam survives, free-run resumes without touching the mic
    const before = await tcNow();
    await page.reload();
    await page.waitForSelector('[data-clock-id="2"]');
    await page.waitForTimeout(700);
    const after = await tcNow();
    const txt = await cellText(cell);
    check("[jam] after a RELOAD the clock is still free-running from the jam", !!after && /FREE-RUN/.test(txt), txt);
    check("[jam] reload resumes at the right time (ahead of before-reload by ~the reload gap)", !!(before && after) && after.f > before.f && after.f - before.f < 24 * 6, before && after ? `${before.m[0]} → ${after.m[0]}` : "");
    const gum = await page.evaluate(() => window.__gumCalls.length);
    check("[jam] free-run after reload does not open the microphone", gum === 0, `${gum} getUserMedia calls`);
    await page.screenshot({ path: path.join(SHOTS, "11-freerun-after-reload.png") });

    // Settings: shows source, jam status; Clear works
    await cell.hover();
    await cell.locator("button:has(svg.lucide-settings)").click();
    await cell.getByTestId("jam-status").waitFor();
    await page.waitForTimeout(600);
    const st = await cell.getByTestId("jam-status").innerText();
    check("[jam] settings say 'Jammed … free-running' and name the Deity TC-1", /Jammed .* 23\.98 fps · free-running/.test(st) && (await cell.getByTestId("tc-source-label").innerText()).includes("Deity TC-1"), st);
    await page.screenshot({ path: path.join(SHOTS, "12-settings-jam.png") });
    await cell.locator("button:has(svg.lucide-settings)").click().catch(() => {});
    await cell.hover();
    await cell.getByTestId("jam-clear").click();
    await page.waitForTimeout(300);
    check("[jam] Clear removes the jam (back to --:--:--:--)", (await cellText(cell)).includes("--:--:--:--") && (await page.evaluate(() => JSON.parse(localStorage.getItem("tally-clock-tc-jam-v1")).jams["deity-tc1-ltc"])) === undefined, await cellText(cell));
    await ctx.close(); await browser.close();
  }

  // ── 9. JAM across a drop-frame minute (29.97 DF): never shows ;00 / ;01, not even in free-run ──
  {
    const a = generateLtc({ fps: 30000 / 1001, nominal: 30, drop: true, seconds: 7, start: [0, 0, 50, 0], leadSilence: 0.3 });
    const s = new Float32Array(48000 * 60); s.set(a);
    const browser = await launch(wav("jam-df", s), { noloop: true });
    const { ctx, page, cell } = await openApp(browser);
    await cell.hover();
    await cell.getByRole("button", { name: /Start timecode input/ }).click();
    await waitFor(async () => !(await cell.getByTestId("jam-button").isDisabled().catch(() => true)), 10000);
    await cell.getByTestId("jam-button").click();
    await waitFor(async () => (await cell.locator('[data-testid="ltc-overlay"]').getAttribute("data-tc-state")) === "freerun", 15000);
    // Sample the cell's text every 8 ms inside the page (Playwright round-trips are too slow to catch every frame).
    const seen = await page.evaluate(() => new Promise((resolve) => {
      const el = document.querySelector('[data-clock-id="2"]'); const out = [];
      const id = setInterval(() => { const m = el.innerText.match(/\b\d\d:\d\d:\d\d;\d\d\b/); if (m) out.push(m[0]); }, 8);
      setTimeout(() => { clearInterval(id); resolve(out); }, 9000);
    }));
    const uniq = [...new Set(seen)];
    const crossed = uniq.some((t) => t.startsWith("00:01:00;"));
    check("[jam-df] free-run crosses the minute: 00:00:59;29 → 00:01:00;02", crossed && uniq.includes("00:01:00;02") && !uniq.includes("00:01:00;00") && !uniq.includes("00:01:00;01"), uniq.filter((t) => t.startsWith("00:00:59") || t.startsWith("00:01:00")).join(" "));
    await page.screenshot({ path: path.join(SHOTS, "13-freerun-dropframe.png") });
    await ctx.close(); await browser.close();
  }

  // ── 10. Signed out: a saved jam never runs; no mic ──
  {
    const browser = await launch(wav("so", new Float32Array(48000 * 3)));
    const { ctx, page } = await openApp(browser, { signedIn: false, extra: (p) => p.addInitScript(() => {
      localStorage.setItem("tally-clock-tc-jam-v1", JSON.stringify({ jams: { "deity-tc1-ltc": { v: 1, sourceId: "deity-tc1-ltc", nominal: 24, fps: 24000 / 1001, drop: false, anchorWallMs: Date.now() - 60000, anchorCount: 86400, jammedAtMs: Date.now() - 60000, frames: 60, spreadMs: 2 } }, trim: {} }));
    }) });
    await page.waitForTimeout(800);
    const body = await page.locator("body").innerText();
    check("[gate] signed out: login screen only, a saved jam shows no timecode", !/\d\d:\d\d:\d\d:\d\d/.test(body) && /Sign in/i.test(body), body.slice(0, 60).replace(/\n/g, " "));
    await ctx.close(); await browser.close();
  }

  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
  fs.rmSync(tmp, { recursive: true, force: true });
  process.exit(failed.length ? 1 : 0);
}
main().catch((e) => { console.error(e); process.exit(2); });
