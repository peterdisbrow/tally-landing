/** In-page collector (serialized into page.evaluate): returns visible "items" (text runs, buttons, icons) with rects + parts. */
export function collectItems() {
  const vw = window.innerWidth, vh = window.innerHeight;
  const items = [];
  const isAtomic = (el) => /^(BUTTON|INPUT|SELECT|TEXTAREA|CANVAS|IMG)$/.test(el.tagName) || (el.tagName.toLowerCase() === "svg" && !el.parentElement?.closest("svg"));
  const effOpacity = (el) => { let o = 1; for (let e = el; e && e !== document.documentElement; e = e.parentElement) { const cs = getComputedStyle(e); if (cs.display === "none" || cs.visibility === "hidden") return 0; o *= parseFloat(cs.opacity); } return o; };
  const clipRect = (el, r) => {
    let x1 = Math.max(0, r.left), y1 = Math.max(0, r.top), x2 = Math.min(vw, r.right), y2 = Math.min(vh, r.bottom);
    for (let e = el.parentElement; e && e !== document.documentElement; e = e.parentElement) {
      const cs = getComputedStyle(e);
      if (cs.overflowX !== "visible" || cs.overflowY !== "visible") {
        const b = e.getBoundingClientRect();
        if (cs.overflowX !== "visible") { x1 = Math.max(x1, b.left); x2 = Math.min(x2, b.right); }
        if (cs.overflowY !== "visible") { y1 = Math.max(y1, b.top); y2 = Math.min(y2, b.bottom); }
      }
    }
    return { x1, y1, x2, y2 };
  };
  const partOf = (el) => {
    const tid = el.closest("[data-testid]")?.getAttribute("data-testid") || "";
    const p = el.closest("[data-clock-part]")?.getAttribute("data-clock-part");
    if (p === "settings") return "settings";
    if (/^label-(name|sub|ampm)$/.test(el.getAttribute("data-testid") || "")) return el.getAttribute("data-testid").slice(6);
    if (p) return p;
    if (el.closest("[data-testid=adjust-bar]")) return "adjust";
    if (el.closest("[data-testid=ltc-overlay]")) return "ltc";
    if (tid === "label-hint") return "hint";
    return el.closest("[data-clock-id]") ? "other" : "page";
  };
  const ids = new Map();
  const push = (el, r, text, truncated, textNode) => {
    if (r.width < 1 || r.height < 1) return;
    const o = effOpacity(el); if (o < 0.05) return;
    const c = clipRect(el, r);
    const full = r.width * r.height;
    const vis = Math.max(0, c.x2 - c.x1) * Math.max(0, c.y2 - c.y1);
    const area = Math.max(0, Math.min(r.right, c.x2) - Math.max(r.left, c.x1)) * Math.max(0, Math.min(r.bottom, c.y2) - Math.max(r.top, c.y1));
    const cellEl = el.closest("[data-clock-id]");
    items.push({
      pid: textNode ? (ids.get(el) ?? (ids.set(el, ids.size + 1), ids.size)) : 0,
      part: partOf(el), text: (text || "").trim().slice(0, 40), cell: cellEl?.getAttribute("data-clock-id") || null,
      rect: [r.left, r.top, r.right, r.bottom].map((n) => Math.round(n * 10) / 10),
      vis: [c.x1, c.y1, c.x2, c.y2].map((n) => Math.round(n * 10) / 10),
      clippedFrac: full ? Math.round((1 - area / full) * 100) / 100 : 0, truncated: !!truncated,
    });
  };
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
  const seen = new Set();
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    if (n.nodeType === 1) {
      const el = n;
      if (["SCRIPT", "STYLE", "NOSCRIPT"].includes(el.tagName)) continue;
      if (isAtomic(el) && !el.parentElement?.closest("button, select, input, textarea, svg")) {
        if (el.tagName === "INPUT" && el.type === "range") { push(el, el.getBoundingClientRect(), "range"); continue; }
        push(el, el.getBoundingClientRect(), el.innerText || el.getAttribute("aria-label") || el.tagName);
        seen.add(el);
      }
    } else if (n.nodeType === 3 && n.textContent.trim()) {
      const par = n.parentElement;
      if (!par || par.closest("button, select, textarea, svg, option, [aria-hidden=true]")) continue;
      const range = document.createRange(); range.selectNodeContents(n);
      const r = range.getBoundingClientRect();
      const cs = getComputedStyle(par);
      let truncated = false;
      if (cs.textOverflow === "ellipsis" && par.scrollWidth > par.clientWidth + 1) truncated = true;
      push(par, r, n.textContent, truncated, true);
    }
  }
  const cells = [...document.querySelectorAll("[data-clock-id]")].filter((c) => getComputedStyle(c).display !== "none").map((c) => { const b = c.getBoundingClientRect(); return { id: c.getAttribute("data-clock-id"), rect: [b.left, b.top, b.right, b.bottom].map(Math.round) }; });
  // Decorative Glass card behind the single clock (a ::before pseudo-element): content must sit inside it.
  let card = null;
  const sc = document.querySelector("[data-single-clock]");
  if (sc) {
    const cs = getComputedStyle(sc, "::before");
    if (cs.content && cs.content !== "none" && cs.display !== "none") {
      const b = sc.getBoundingClientRect(), px = (v) => parseFloat(v) || 0;
      card = [b.left + px(cs.left), b.top + px(cs.top), b.right - px(cs.right), b.bottom - px(cs.bottom)].map((n) => Math.round(n));
    }
  }
  return { items, cells, card, vw, vh };
}

const inter = (a, b) => ({ w: Math.min(a[2], b[2]) - Math.max(a[0], b[0]), h: Math.min(a[3], b[3]) - Math.max(a[1], b[1]) });

/** Overlaps between visible rects of different items + clipped items. */
export function findIssues({ items, cells, card }, { settingsCell = null } = {}) {
  const out = [];
  if (card && settingsCell == null) for (const it of items) {
    if (it.cell != null || !["digits", "name", "sub", "ampm"].includes(it.part)) continue;
    const [l, t, r, b] = it.rect, tol = 2;
    if (l < card[0] - tol || t < card[1] - tol || r > card[2] + tol || b > card[3] + tol)
      out.push({ kind: "outside-card", a: `${it.part}:${it.text}`, b: "card", cell: null, over: Math.round(Math.max(card[0] - l, card[1] - t, r - card[2], b - card[3])) });
  }
  const list = items.filter((i) => settingsCell == null ? true : (i.cell === settingsCell || i.cell === null));
  for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) {
    const a = list[i], b = list[j];
    if (a.pid && a.pid === b.pid) continue; // two text nodes of one wrapped paragraph
    if (a.part === "page" && b.part === "page") { /* page-level crowding still counts */ }
    // in the settings pass the panel covers the cell content: only items inside the panel (and the controls above it) count
    if (settingsCell != null) {
      const ok = (x) => x.part === "settings" || x.part === "controls" || x.cell === null;
      if (!ok(a) || !ok(b)) continue;
    }
    const x = inter(a.vis, b.vis);
    if (x.w > 1.5 && x.h > 1.5) out.push({ kind: "overlap", a: `${a.part}:${a.text}`, b: `${b.part}:${b.text}`, cell: a.cell ?? b.cell, area: Math.round(x.w * x.h), w: Math.round(x.w), h: Math.round(x.h) });
  }
  for (const it of list) {
    if (settingsCell != null) continue;
    if (it.clippedFrac > 0.1 && !it.truncated) out.push({ kind: "clipped", a: `${it.part}:${it.text}`, cell: it.cell, frac: it.clippedFrac });
    if (it.truncated && ["name", "digits"].includes(it.part)) out.push({ kind: "truncated", a: `${it.part}:${it.text}`, cell: it.cell });
  }
  return out;
}
