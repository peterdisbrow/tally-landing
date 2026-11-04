/** Phone remote against the LIVE relay (wss://api.tallyconnect.app/clock-remote): display and phone in
 * separate browser contexts, so commands can only travel over the internet relay. Env BASE_URL, OUT, PLAYWRIGHT_PATH. */
import { createRequire } from "node:module"; import fs from "node:fs";
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_PATH || "playwright");
const BASE = process.env.BASE_URL || "http://127.0.0.1:5199";
const OUT = process.env.OUT || "/tmp/remote-live"; fs.mkdirSync(OUT, { recursive: true });
const RELAY = "wss://api.tallyconnect.app/clock-remote";
const checks = []; const check = (n, ok, d = "") => { checks.push({ n, ok, d }); console.log(ok ? "PASS" : "FAIL", n, d); };
const cfg = { clockName: "SUNDAY SERVICE", clockColor: "#22c55e", fontName: "dseg7", timezone: "local", is24h: false, mode: "countdown", showMiniClock: true, displayStyle: "digital", labelSize: "m", scaleLabels: true, autoSize: true, fontSize: 200, countdownFrom: 1500 };
const b = await chromium.launch();
async function display(extraInit) {
  const ctx = await b.newContext({ viewport: { width: 1920, height: 1080 } });
  const p = await ctx.newPage(); p.on("pageerror", (e) => console.log("[display pageerror]", e.message));
  await p.addInitScript(({ cfg, extraInit }) => { if (sessionStorage.getItem("s")) return; sessionStorage.setItem("s", "1"); localStorage.setItem("broadcast-clock-settings", JSON.stringify(cfg)); if (extraInit) for (const [k, v] of Object.entries(extraInit)) localStorage.setItem(k, v); }, { cfg, extraInit });
  await p.goto(BASE + "/clock"); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1200);
  return { ctx, p };
}
async function phone(token) {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1" });
  const p = await ctx.newPage(); p.on("pageerror", (e) => console.log("[phone pageerror]", e.message));
  await p.goto(`${BASE}/clock/remote#k=${token}&v=single`); return { ctx, p };
}
const digits = (p) => p.locator('[data-clock-part="digits"]').first().innerText().then((t) => t.replace(/\s/g, ""));
/** Click on the phone, then time until the display's digits satisfy pred. */
async function timed(name, disp, act, pred, limit = 1000) {
  const t0 = Date.now(); await act(); let v = "";
  while (Date.now() - t0 < 4000) { v = await digits(disp); if (pred(v)) break; await disp.waitForTimeout(25); }
  const ms = Date.now() - t0; check(`${name} (${ms} ms)`, pred(v) && ms <= limit, v); return ms;
}

// ---- pair over the live relay ----
const D = await display();
await D.p.mouse.move(900, 500); await D.p.getByTestId("open-remote").click();
await D.p.waitForSelector('[data-testid="remote-status"]:has-text("Waiting for a phone")', { timeout: 10000 }).then(() => check("display joined live relay", true), () => check("display joined live relay", false));
const pairing = await D.p.evaluate(() => JSON.parse(localStorage.getItem("clock-remote-pairing-single")));
check("token 256-bit base64url, expires in 12 h", /^[A-Za-z0-9_-]{43}$/.test(pairing.token) && Math.abs(pairing.exp - Date.now() - 12 * 3600e3) < 60e3);
const qrUrl = await D.p.evaluate(() => document.querySelector('[data-testid="remote-qr"] svg') ? "svg" : "");
check("QR rendered", qrUrl === "svg");
await D.p.waitForTimeout(300); await D.p.screenshot({ path: `${OUT}/01-clock-qr-code.png` });

const P = await phone(pairing.token);
await P.p.waitForSelector('[data-testid="remote-link"]:has-text("Connected")', { timeout: 10000 }).then(() => check("phone connected via relay", true), () => check("phone connected via relay", false));
check("token stripped from phone address bar", !P.p.url().includes("#k="));
await D.p.waitForSelector('[data-testid="remote-status"]:has-text("1 phone connected")', { timeout: 8000 }).then(() => check("display sees phone", true), () => check("display sees phone", false));
await D.p.screenshot({ path: `${OUT}/02-clock-qr-phone-connected.png` });
await D.p.keyboard.press("Escape"); await D.p.mouse.move(1919, 1079);

// ---- commands, timed ----
const lat = [];
lat.push(await timed("set countdown 10:00", D.p, async () => { await P.p.getByTestId("remote-countdown-input").fill("10m"); await P.p.getByTestId("remote-countdown-set").tap(); }, (v) => /10:00/.test(v)));
lat.push(await timed("start", D.p, () => P.p.getByTestId("remote-toggle").tap(), (v) => /09:5\d/.test(v), 1600)); // first tick lands up to 1s after start
lat.push(await timed("+1m", D.p, () => P.p.getByTestId("remote-adjust").getByText("1m").last().tap(), (v) => /10:5\d/.test(v)));
lat.push(await timed("-10s", D.p, async () => { const before = await digits(D.p); await P.p.getByTestId("remote-adjust").locator("button").nth(1).tap(); return before; }, (v) => /10:4\d/.test(v)));
lat.push(await timed("pause", D.p, () => P.p.getByTestId("remote-toggle").tap(), () => true));
await D.p.waitForTimeout(400); const a = await digits(D.p); await D.p.waitForTimeout(1600); check("pause holds", a === await digits(D.p), a);
await P.p.waitForTimeout(900); await P.p.screenshot({ path: `${OUT}/03-phone-controller-paused.png` });
await P.p.getByTestId("remote-toggle").tap(); await D.p.waitForTimeout(2500);
await P.p.screenshot({ path: `${OUT}/04-phone-controller-running.png` });
await D.p.screenshot({ path: `${OUT}/05-clock-after-phone-command.png` });
lat.push(await timed("reset", D.p, () => P.p.getByTestId("remote-reset").tap(), (v) => /10:00/.test(v)));
console.log("latencies ms", lat.join(", "));

// ---- bad token & forged messages ----
const rogueTok = Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString("base64url");
const R = await phone(rogueTok); await R.p.waitForTimeout(3000);
check("phone with wrong token never connects", !(await R.p.getByTestId("remote-link").innerText()).includes("Connected"), await R.p.getByTestId("remote-link").innerText());
const room = await D.p.evaluate(async (t) => [...new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`tally-clock-remote:v1:${t}`)))].map((x) => x.toString(16).padStart(2, "0")).join(""), pairing.token);
const before = await digits(D.p);
// Attacker who knows the room id but not the token: forged signature, and a command signed with the wrong key.
await R.p.evaluate(async ({ RELAY, room, rogueTok }) => {
  const b64u = (b) => btoa(String.fromCharCode(...new Uint8Array(b))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  const raw = Uint8Array.from(atob(rogueTok.replace(/-/g, "+").replace(/_/g, "/") + "="), (c) => c.charCodeAt(0));
  const k = await crypto.subtle.importKey("raw", raw, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const body = JSON.stringify({ k: "cmd", c: { cmd: "setCountdown", seconds: 60 } }); const ts = Date.now();
  const sig = b64u(await crypto.subtle.sign("HMAC", k, new TextEncoder().encode(`evil.1.${ts}.${body}`)));
  await new Promise((res) => { const w = new WebSocket(RELAY); w.onopen = () => { w.send(JSON.stringify({ t: "join", room, as: "remote" })); setTimeout(() => { w.send(JSON.stringify({ t: "msg", from: "evil", seq: 0, ts, body, sig: "AAAA" })); w.send(JSON.stringify({ t: "msg", from: "evil", seq: 1, ts, body, sig })); setTimeout(() => { w.close(); res(); }, 800); }, 400); }; w.onerror = () => res(); });
}, { RELAY, room, rogueTok });
await D.p.waitForTimeout(800);
check("forged / wrong-key commands in the real room are dropped", !/01:00/.test(await digits(D.p)) && /10:00/.test(await digits(D.p)), `${before} -> ${await digits(D.p)}`);
// Replay of a genuine captured message must be dropped too.
await R.ctx.close();

// ---- New code revokes old phone ----
await D.p.mouse.move(900, 500); await D.p.getByTestId("open-remote").click(); await D.p.getByTestId("remote-new-code").click(); await D.p.waitForTimeout(1500); await D.p.keyboard.press("Escape");
const t0 = await digits(D.p); await P.p.getByTestId("remote-toggle").tap().catch(() => {}); await D.p.waitForTimeout(2000);
check("after New code, old phone is ignored", t0 === await digits(D.p), `${t0} -> ${await digits(D.p)}`);
await P.ctx.close(); await D.ctx.close();

// ---- pairing expiry: a pairing that expires in 9 s ----
const tok = Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString("base64url");
const E = await display({ "clock-remote-pairing-single": JSON.stringify({ token: tok, exp: Date.now() + 9000 }) });
const EP = await phone(tok);
await EP.p.waitForSelector('[data-testid="remote-link"]:has-text("Connected")', { timeout: 8000 }).then(() => check("short pairing connects", true), () => check("short pairing connects", false));
const pre = await digits(E.p);
await timed("cmd before expiry works", E.p, () => EP.p.getByTestId("remote-adjust").getByText("1m").last().tap(), (v) => v !== pre);
await E.p.waitForTimeout(9000);
check("display drops expired pairing", (await E.p.evaluate(() => localStorage.getItem("clock-remote-pairing-single"))) === null);
const e0 = await digits(E.p); await EP.p.getByTestId("remote-adjust").getByText("1m").last().tap().catch(() => {}); await E.p.waitForTimeout(1500);
check("phone command after expiry is ignored", e0 === await digits(E.p), `${e0} -> ${await digits(E.p)}`);
await EP.p.waitForTimeout(2500);
check("phone shows clock offline after expiry", !(await EP.p.getByTestId("remote-link").innerText()).includes("Connected"), await EP.p.getByTestId("remote-link").innerText());
await EP.p.screenshot({ path: `${OUT}/06-phone-after-pairing-expired.png` });
await b.close();
fs.writeFileSync(`${OUT}/live-checks.json`, JSON.stringify({ latenciesMs: lat, checks }, null, 2));
const failed = checks.filter((c) => !c.ok).length; console.log("checks", checks.length, "failed", failed); process.exit(failed ? 1 : 0);
