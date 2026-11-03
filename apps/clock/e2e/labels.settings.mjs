/** Opens a cell's settings, picks XL, reloads, checks it persisted; screenshots the panel + the result. */
import { createRequire } from "node:module";
import path from "node:path";
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_PATH || "playwright");
const BASE_URL = process.env.BASE_URL || "http://127.0.0.1:5199";
const OUT = process.env.OUT || "/tmp";
const browser = await chromium.launch();
const page = await (await browser.newContext({ viewport: { width: 1920, height: 1080 } })).newPage();
await page.route("https://api.tallyconnect.app/**", (r) => r.request().url().includes("/rooms") ? r.fulfill({ json: { rooms: [] } }) : r.request().url().includes("/api/time") ? r.fulfill({ json: { serverTime: Date.now() } }) : r.fulfill({ status: 404, json: {} }));
await page.routeWebSocket(/api\.tallyconnect\.app\/portal/, (ws) => { ws.send(JSON.stringify({ type: "connected", churchId: "c1", name: "Demo Church" })); });
await page.addInitScript(() => {
  localStorage.setItem("tallyconnect-clock-token", "test-token");
  if (sessionStorage.getItem("seeded")) return; sessionStorage.setItem("seeded", "1");
  localStorage.setItem("broadcast-multi-layout", "featured");
  // an OLD saved config: no labelSize / scaleLabels fields at all
  localStorage.setItem("broadcast-multi-clocks", JSON.stringify([
    { id: "1", clockName: "BETWEEN SUNDAYS", clockColor: "#ef4444", fontName: "dseg7", timezone: "local", is24h: true, showSeconds: true },
    { id: "2", clockName: "Local", clockColor: "#22c55e", fontName: "dseg7", timezone: "local", is24h: false, showSeconds: true },
  ]));
});
await page.goto(BASE_URL + "/multi-clock");
await page.waitForSelector('[data-clock-id="2"]');
const px = () => page.evaluate(() => getComputedStyle(document.querySelector('[data-clock-id="2"] [data-testid="label-name"]')).fontSize);
console.log("old config, default:", await px());
const cell = page.locator('[data-clock-id="2"]');
await cell.hover();
await cell.locator("button:has(svg.lucide-settings)").click();
await page.waitForTimeout(500);
await cell.getByTestId("label-size-controls").evaluate((el) => el.scrollIntoView({ block: "center" }));
await page.waitForTimeout(500); await cell.hover();
await cell.screenshot({ path: path.join(OUT, "7-cell-settings-label-size.png") });
await cell.getByTestId("label-size-controls").getByRole("button", { name: "XL", exact: true }).click();
console.log("after XL:", await px());
await page.reload(); await page.waitForSelector('[data-clock-id="2"]');
console.log("after reload:", await px());
console.log("saved:", await page.evaluate(() => JSON.parse(localStorage.getItem("broadcast-multi-clocks"))[1].labelSize));
await browser.close();
