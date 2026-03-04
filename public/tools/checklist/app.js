/* ── Pre-Service Checklist Generator ── */

/* ──────────────────────────────────────
   Gear Database
   ────────────────────────────────────── */
const GEAR_CATEGORIES = [
  {
    name: "Video Switching",
    items: [
      { id: "atem-mini", label: "ATEM Mini / Mini Pro" },
      { id: "atem-tvs", label: "ATEM Television Studio" },
      { id: "vmix", label: "vMix" },
      { id: "obs-video", label: "OBS Studio" },
      { id: "wirecast", label: "Wirecast" },
    ],
  },
  {
    name: "Presentation",
    items: [
      { id: "propresenter", label: "ProPresenter" },
      { id: "easyworship", label: "EasyWorship" },
      { id: "mediashout", label: "MediaShout" },
      { id: "powerpoint", label: "PowerPoint / Slides" },
    ],
  },
  {
    name: "Streaming",
    items: [
      { id: "hw-encoder", label: "Hardware Encoder" },
      { id: "obs-stream", label: "OBS / vMix Stream Output" },
      { id: "resi", label: "Resi" },
      { id: "boxcast", label: "BoxCast" },
      { id: "restream", label: "Restream" },
    ],
  },
  {
    name: "Audio",
    items: [
      { id: "x32", label: "Behringer X32 / M32" },
      { id: "allen-heath", label: "Allen & Heath (dLive / SQ / Avantis)" },
      { id: "yamaha-tf", label: "Yamaha TF / QL / CL" },
      { id: "midas", label: "Midas" },
    ],
  },
  {
    name: "Recording",
    items: [
      { id: "hyperdeck", label: "BMD HyperDeck" },
      { id: "obs-record", label: "OBS / vMix Recording" },
      { id: "dedicated-recorder", label: "Dedicated Recorder" },
    ],
  },
  {
    name: "Other",
    items: [
      { id: "lighting", label: "Lighting Console" },
      { id: "ptz", label: "PTZ Cameras" },
      { id: "planning-center", label: "Planning Center" },
      { id: "iems", label: "In-Ear Monitors" },
    ],
  },
];

const SERVICE_TYPES = [
  { id: "sunday", label: "Regular Sunday", desc: "Weekly worship service" },
  { id: "special", label: "Special Event", desc: "Conference, concert, baptism" },
  { id: "livestream", label: "Livestream Only", desc: "Remote broadcast, no in-person" },
  { id: "recording", label: "Recording Only", desc: "Capture for later editing" },
];

const TEAM_SIZES = [
  { id: "solo", label: "Solo", desc: "Just you running everything" },
  { id: "small", label: "2-3 People", desc: "Small volunteer team" },
  { id: "full", label: "4+ People", desc: "Full production crew" },
];

/* ──────────────────────────────────────
   Checklist Item Database
   ────────────────────────────────────── */
const CHECKLIST_DB = {
  // ── 60 min before ──
  "T-60": {
    label: "60 min before",
    title: "Power On & Boot",
    items: [
      { text: "Power on all production computers and let them fully boot", requires: [] },
      { text: "Verify network switch is online and all ports show link lights", requires: [] },
      { text: "Check internet connection speed (upload/download)", requires: ["hw-encoder", "obs-stream", "resi", "boxcast", "restream"] },
      { text: "Power on ATEM Mini and verify all input LEDs", requires: ["atem-mini"] },
      { text: "Power on ATEM Television Studio and check multiview output", requires: ["atem-tvs"] },
      { text: "Launch vMix and verify it loads the correct preset", requires: ["vmix"] },
      { text: "Launch OBS Studio and verify the correct scene collection is loaded", requires: ["obs-video", "obs-stream", "obs-record"] },
      { text: "Launch Wirecast and verify the correct document opens", requires: ["wirecast"] },
      { text: "Power on hardware encoder and verify network connectivity", requires: ["hw-encoder"] },
      { text: "Power on HyperDeck and verify storage media is inserted with free space", requires: ["hyperdeck"] },
      { text: "Power on dedicated recorder and check available storage", requires: ["dedicated-recorder"] },
      { text: "Power on lighting console and load today's lighting preset", requires: ["lighting"] },
      { text: "Power on PTZ cameras and verify they return to home positions", requires: ["ptz"] },
      { text: "Power on audio console and load today's scene/snapshot", requires: ["x32", "allen-heath", "yamaha-tf", "midas"] },
      { text: "Power on in-ear monitor transmitters and verify RF signal", requires: ["iems"] },
    ],
  },

  // ── 30 min before ──
  "T-30": {
    label: "30 min before",
    title: "Source Verification & Setup",
    items: [
      { text: "Open ProPresenter and load today's service playlist", requires: ["propresenter"] },
      { text: "Verify ProPresenter stage display is showing on confidence monitor", requires: ["propresenter"] },
      { text: "Open EasyWorship and load today's service schedule", requires: ["easyworship"] },
      { text: "Open MediaShout and load today's service script", requires: ["mediashout"] },
      { text: "Open presentation slides and verify they display correctly", requires: ["powerpoint"] },
      { text: "Verify all ATEM Mini inputs show correct sources (camera, presentation, graphics)", requires: ["atem-mini"] },
      { text: "Verify all ATEM Television Studio inputs are mapped correctly on multiview", requires: ["atem-tvs"] },
      { text: "Check all vMix inputs are active and showing correct sources", requires: ["vmix"] },
      { text: "Verify all OBS sources are active (no red exclamation marks)", requires: ["obs-video", "obs-stream", "obs-record"] },
      { text: "Check all Wirecast shots and verify no missing sources", requires: ["wirecast"] },
      { text: "Set audio console input gains and verify signal on all channels", requires: ["x32", "allen-heath", "yamaha-tf", "midas"] },
      { text: "Test each microphone — verify audio reaches streaming/recording mix", requires: ["x32", "allen-heath", "yamaha-tf", "midas"] },
      { text: "Check Planning Center live schedule and verify service order matches", requires: ["planning-center"] },
      { text: "Position PTZ cameras for opening shot presets", requires: ["ptz"] },
      { text: "Test lighting cues for service opener", requires: ["lighting"] },
      { text: "Verify in-ear monitor mixes for worship team", requires: ["iems"] },
    ],
  },

  // ── 15 min before ──
  "T-15": {
    label: "15 min before",
    title: "Stream & Recording Test",
    items: [
      { text: "Start a test stream and verify it appears on your streaming platform", requires: ["hw-encoder", "obs-stream", "resi", "boxcast", "restream"] },
      { text: "Check stream bitrate, frame rate, and dropped frames counter", requires: ["hw-encoder", "obs-stream", "resi", "boxcast", "restream"] },
      { text: "Verify stream key and destination are set correctly", requires: ["obs-stream", "restream"] },
      { text: "Start a test recording and verify file is being written", requires: ["hyperdeck", "obs-record", "dedicated-recorder"] },
      { text: "Stop test recording and play back 10 seconds to verify audio and video", requires: ["hyperdeck", "obs-record", "dedicated-recorder"] },
      { text: "Stop test stream after verification", requires: ["hw-encoder", "obs-stream", "resi", "boxcast", "restream"] },
      { text: "Verify confidence monitor shows correct lower-thirds and graphics", requires: ["propresenter", "easyworship", "mediashout"] },
      { text: "Test all PTZ camera presets (wide, medium, close-up)", requires: ["ptz"] },
      { text: "Run through 2-3 ATEM Mini scene transitions to verify they work", requires: ["atem-mini"] },
      { text: "Run through 2-3 ATEM Television Studio macro transitions", requires: ["atem-tvs"] },
      { text: "Test vMix transitions and overlays", requires: ["vmix"] },
      { text: "Test OBS scene transitions", requires: ["obs-video"] },
    ],
  },

  // ── 5 min before ──
  "T-5": {
    label: "5 min before",
    title: "Final Walk-Through",
    items: [
      { text: "Confirm all team members are in position and ready", requires: [], condition: "team-not-solo" },
      { text: "Assign monitoring responsibilities to team members", requires: [], condition: "team-full" },
      { text: "Verify you can see all critical displays from your position", requires: [] },
      { text: "Set switcher to opening scene/camera", requires: ["atem-mini", "atem-tvs", "vmix", "obs-video", "wirecast"] },
      { text: "Arm ProPresenter with first slide ready", requires: ["propresenter"] },
      { text: "Arm EasyWorship with first item ready", requires: ["easyworship"] },
      { text: "Arm MediaShout with first cue ready", requires: ["mediashout"] },
      { text: "Open presentation to first slide", requires: ["powerpoint"] },
      { text: "Unmute streaming audio mix on console", requires: ["x32", "allen-heath", "yamaha-tf", "midas"] },
      { text: "Verify in-ear monitors are live and at correct levels", requires: ["iems"] },
      { text: "Start livestream (go live on platform)", requires: ["hw-encoder", "obs-stream", "resi", "boxcast", "restream"], condition: "service-not-recording" },
      { text: "Start recording", requires: ["hyperdeck", "obs-record", "dedicated-recorder"] },
      { text: "Set opening lighting cue", requires: ["lighting"] },
      { text: "Confirm stream is live and viewer count is climbing", requires: ["hw-encoder", "obs-stream", "resi", "boxcast", "restream"], condition: "service-not-recording" },
    ],
  },

  // ── During service ──
  "DURING": {
    label: "During service",
    title: "Monitoring Checkpoints",
    items: [
      { text: "Check stream health every 15 minutes (bitrate, dropped frames)", requires: ["hw-encoder", "obs-stream", "resi", "boxcast", "restream"], condition: "service-not-recording" },
      { text: "Verify recording is still running (check file size growing or timecode advancing)", requires: ["hyperdeck", "obs-record", "dedicated-recorder"] },
      { text: "Monitor audio levels — watch for clipping or silence", requires: ["x32", "allen-heath", "yamaha-tf", "midas"] },
      { text: "Watch chat/comments for viewer reports of issues", requires: ["hw-encoder", "obs-stream", "resi", "boxcast", "restream"], condition: "service-not-recording" },
      { text: "Advance ProPresenter slides on cue", requires: ["propresenter"] },
      { text: "Advance EasyWorship items on cue", requires: ["easyworship"] },
      { text: "Advance MediaShout cues on schedule", requires: ["mediashout"] },
      { text: "Advance presentation slides on cue", requires: ["powerpoint"] },
      { text: "Execute lighting cues per service order", requires: ["lighting"] },
      { text: "Call PTZ camera moves per shot list", requires: ["ptz"] },
    ],
  },

  // ── Post-service ──
  "POST": {
    label: "Post-service",
    title: "Shutdown & Archive",
    items: [
      { text: "Stop livestream cleanly (end stream, don't just close)", requires: ["hw-encoder", "obs-stream", "resi", "boxcast", "restream"], condition: "service-not-recording" },
      { text: "Stop recording and verify final file is intact", requires: ["hyperdeck", "obs-record", "dedicated-recorder"] },
      { text: "Back up recording files to external drive or cloud", requires: ["hyperdeck", "obs-record", "dedicated-recorder"] },
      { text: "Save audio console scene with any changes made during service", requires: ["x32", "allen-heath", "yamaha-tf", "midas"] },
      { text: "Return PTZ cameras to home/park positions", requires: ["ptz"] },
      { text: "Save ProPresenter playlist for archives", requires: ["propresenter"] },
      { text: "Save current lighting state if changes were made", requires: ["lighting"] },
      { text: "Log any incidents or issues that occurred during service", requires: [] },
      { text: "Note any equipment that needs maintenance or repair", requires: [] },
      { text: "Power down equipment in reverse order (peripherals first, computers last)", requires: [] },
      { text: "Confirm stream VOD is processing correctly on platform", requires: ["hw-encoder", "obs-stream", "resi", "boxcast", "restream"], condition: "service-not-recording" },
    ],
  },
};

/* ──────────────────────────────────────
   State
   ────────────────────────────────────── */
let selectedGear = new Set();
let customGear = []; // { id, label } entries added via "Other"
let serviceType = "";
let teamSize = "";
let builderStep = 0; // 0=gear, 1=service, 2=team
const TOTAL_STEPS = 3;

/* ──────────────────────────────────────
   DOM Refs
   ────────────────────────────────────── */
const welcomeScreen = document.getElementById("welcomeScreen");
const builderScreen = document.getElementById("builderScreen");
const contactScreen = document.getElementById("contactScreen");
const checklistScreen = document.getElementById("checklistScreen");
const builderContent = document.getElementById("builderContent");
const stepIndicator = document.getElementById("stepIndicator");
const toast = document.getElementById("toast");

/* ──────────────────────────────────────
   Screen Management
   ────────────────────────────────────── */
function showScreen(screen) {
  [welcomeScreen, builderScreen, contactScreen, checklistScreen].forEach(s => s.classList.add("hidden"));
  screen.classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function updateStepDots() {
  stepIndicator.innerHTML = Array.from({ length: TOTAL_STEPS }, (_, i) => {
    const cls = i < builderStep ? "step-dot done" : i === builderStep ? "step-dot active" : "step-dot";
    return `<div class="${cls}"></div>`;
  }).join("");
}

/* ──────────────────────────────────────
   Step 1: Gear Selection
   ────────────────────────────────────── */
function renderGearStep() {
  builderStep = 0;
  updateStepDots();

  let html = `<div class="card"><p class="eyebrow">Step 1 of 3</p><h2>Select Your Gear</h2><p style="margin-bottom:24px;font-size:0.92rem">Check everything your church uses. The more you select, the more specific your checklist will be.</p>`;

  GEAR_CATEGORIES.forEach(cat => {
    html += `<div class="gear-section"><h3>${cat.name}</h3><div class="gear-grid">`;
    cat.items.forEach(item => {
      const checked = selectedGear.has(item.id);
      html += `
        <div class="gear-item${checked ? " selected" : ""}" data-gear="${item.id}">
          <input type="checkbox" id="g-${item.id}" ${checked ? "checked" : ""} />
          <label for="g-${item.id}">${item.label}</label>
        </div>`;
    });
    // Show any custom gear already added for this category
    const catCustom = customGear.filter(c => c.category === cat.name);
    catCustom.forEach(c => {
      html += `
        <div class="gear-item selected custom-gear-tag" data-gear="${c.id}">
          <input type="checkbox" id="g-${c.id}" checked />
          <label for="g-${c.id}">${c.label}</label>
          <button data-remove="${c.id}" style="background:none;border:none;color:var(--text-muted);cursor:pointer;font-size:1rem;padding:0;line-height:1">&times;</button>
        </div>`;
    });
    // "Other" input
    html += `
      <div class="gear-other-wrap">
        <input type="text" placeholder="Other ${cat.name.toLowerCase()} gear..." data-cat="${cat.name}" class="other-input" />
        <button class="gear-other-btn" data-cat-btn="${cat.name}" disabled>Add</button>
      </div>`;
    html += `</div></div>`;
  });

  html += `<div class="builder-nav"><div></div><button class="btn btn-primary" id="gearNextBtn" ${selectedGear.size === 0 ? "disabled" : ""}>Next: Service Type</button></div></div>`;

  builderContent.innerHTML = html;

  // Gear toggle events
  builderContent.querySelectorAll(".gear-item").forEach(el => {
    el.addEventListener("click", (e) => {
      if (e.target.tagName === "INPUT") return; // let checkbox handle itself
      const cb = el.querySelector("input");
      cb.checked = !cb.checked;
      toggleGear(el, cb);
    });

    const cb = el.querySelector("input");
    cb.addEventListener("change", () => toggleGear(el, cb));
  });

  // "Other" input events
  builderContent.querySelectorAll(".other-input").forEach(input => {
    const catName = input.dataset.cat;
    const addBtn = builderContent.querySelector(`[data-cat-btn="${catName}"]`);

    input.addEventListener("input", () => {
      addBtn.disabled = !input.value.trim();
    });
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && input.value.trim()) {
        addCustomGear(catName, input.value.trim());
      }
    });
    addBtn.addEventListener("click", () => {
      if (input.value.trim()) addCustomGear(catName, input.value.trim());
    });
  });

  // Remove custom gear
  builderContent.querySelectorAll("[data-remove]").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = btn.dataset.remove;
      customGear = customGear.filter(c => c.id !== id);
      selectedGear.delete(id);
      renderGearStep();
    });
  });

  document.getElementById("gearNextBtn").addEventListener("click", () => {
    if (selectedGear.size > 0) renderServiceStep();
  });
}

function addCustomGear(category, label) {
  const id = "custom-" + label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, "");
  if (selectedGear.has(id)) return; // already exists
  customGear.push({ id, label, category });
  selectedGear.add(id);
  renderGearStep(); // re-render to show the new item
}

function toggleGear(el, cb) {
  const id = el.dataset.gear;
  if (cb.checked) {
    selectedGear.add(id);
    el.classList.add("selected");
  } else {
    selectedGear.delete(id);
    el.classList.remove("selected");
  }
  const nextBtn = document.getElementById("gearNextBtn");
  if (nextBtn) nextBtn.disabled = selectedGear.size === 0;
}

/* ──────────────────────────────────────
   Step 2: Service Type
   ────────────────────────────────────── */
function renderServiceStep() {
  builderStep = 1;
  updateStepDots();

  let html = `<div class="card"><p class="eyebrow">Step 2 of 3</p><h2>What Type of Service?</h2><p style="margin-bottom:24px;font-size:0.92rem">This determines which checklist items apply.</p><div class="choice-grid">`;

  SERVICE_TYPES.forEach(st => {
    html += `<button class="choice-btn${serviceType === st.id ? " selected" : ""}" data-val="${st.id}">${st.label}<small>${st.desc}</small></button>`;
  });

  html += `</div><div class="builder-nav"><button class="btn btn-ghost" id="serviceBackBtn">&larr; Back</button><button class="btn btn-primary" id="serviceNextBtn" ${!serviceType ? "disabled" : ""}>Next: Team Size</button></div></div>`;

  builderContent.innerHTML = html;

  builderContent.querySelectorAll(".choice-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      serviceType = btn.dataset.val;
      builderContent.querySelectorAll(".choice-btn").forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
      document.getElementById("serviceNextBtn").disabled = false;
    });
  });

  document.getElementById("serviceBackBtn").addEventListener("click", renderGearStep);
  document.getElementById("serviceNextBtn").addEventListener("click", () => {
    if (serviceType) renderTeamStep();
  });
}

/* ──────────────────────────────────────
   Step 3: Team Size
   ────────────────────────────────────── */
function renderTeamStep() {
  builderStep = 2;
  updateStepDots();

  let html = `<div class="card"><p class="eyebrow">Step 3 of 3</p><h2>How Big Is Your Team?</h2><p style="margin-bottom:24px;font-size:0.92rem">This adjusts coordination and delegation items.</p><div class="choice-grid">`;

  TEAM_SIZES.forEach(ts => {
    html += `<button class="choice-btn${teamSize === ts.id ? " selected" : ""}" data-val="${ts.id}">${ts.label}<small>${ts.desc}</small></button>`;
  });

  html += `</div><div class="builder-nav"><button class="btn btn-ghost" id="teamBackBtn">&larr; Back</button><button class="btn btn-primary" id="generateBtn" ${!teamSize ? "disabled" : ""}>Generate Checklist</button></div></div>`;

  builderContent.innerHTML = html;

  builderContent.querySelectorAll(".choice-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      teamSize = btn.dataset.val;
      builderContent.querySelectorAll(".choice-btn").forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
      document.getElementById("generateBtn").disabled = false;
    });
  });

  document.getElementById("teamBackBtn").addEventListener("click", renderServiceStep);
  document.getElementById("generateBtn").addEventListener("click", () => showScreen(contactScreen));
}

/* ──────────────────────────────────────
   Generate Checklist
   ────────────────────────────────────── */
function itemApplies(item) {
  // Check gear requirements — if requires is empty, always include
  if (item.requires.length > 0) {
    const hasAny = item.requires.some(r => selectedGear.has(r));
    if (!hasAny) return false;
  }

  // Check conditions
  if (item.condition === "team-not-solo" && teamSize === "solo") return false;
  if (item.condition === "team-full" && teamSize !== "full") return false;
  if (item.condition === "service-not-recording" && serviceType === "recording") return false;

  return true;
}

function getMatchingGearTags(item) {
  if (item.requires.length === 0) return [];
  return item.requires.filter(r => selectedGear.has(r)).map(r => {
    const allItems = GEAR_CATEGORIES.flatMap(c => c.items);
    const found = allItems.find(g => g.id === r);
    if (found) return found.label;
    const custom = customGear.find(g => g.id === r);
    return custom ? custom.label : r;
  });
}

function generateChecklist() {
  showScreen(checklistScreen);

  const output = document.getElementById("checklistOutput");
  const serviceLabel = SERVICE_TYPES.find(s => s.id === serviceType)?.label || serviceType;
  const teamLabel = TEAM_SIZES.find(t => t.id === teamSize)?.label || teamSize;
  const gearCount = selectedGear.size;

  let totalItems = 0;

  let html = `
    <div class="checklist-header">
      <div>
        <p class="eyebrow">Your Custom Checklist</p>
        <h2>Pre-Service Checklist</h2>
      </div>
    </div>
    <div class="checklist-meta">
      <span class="badge">${serviceLabel}</span>
      <span class="badge">${teamLabel}</span>
      <span class="badge">${gearCount} devices</span>
    </div>
  `;

  const phases = ["T-60", "T-30", "T-15", "T-5", "DURING", "POST"];

  phases.forEach(phaseKey => {
    const phase = CHECKLIST_DB[phaseKey];
    const applicable = phase.items.filter(itemApplies);
    if (applicable.length === 0) return;

    html += `
      <div class="phase">
        <div class="phase-header">
          <span class="phase-time">${phase.label}</span>
          <span class="phase-title">${phase.title}</span>
        </div>
    `;

    applicable.forEach((item, idx) => {
      const id = `chk-${phaseKey}-${idx}`;
      const tags = getMatchingGearTags(item);
      const tagHtml = tags.map(t => `<span class="gear-tag">${t}</span>`).join("");
      html += `
        <div class="check-item" data-id="${id}">
          <input type="checkbox" id="${id}" />
          <label for="${id}">${item.text}${tagHtml}</label>
        </div>
      `;
      totalItems++;
    });

    html += `</div>`;
  });

  output.innerHTML = html;

  // Interactive checkboxes
  output.querySelectorAll(".check-item input").forEach(cb => {
    cb.addEventListener("change", () => {
      cb.closest(".check-item").classList.toggle("checked", cb.checked);
    });
  });
}

/* ──────────────────────────────────────
   Copy as Text
   ────────────────────────────────────── */
function copyAsMarkdown() {
  const serviceLabel = SERVICE_TYPES.find(s => s.id === serviceType)?.label || serviceType;
  const teamLabel = TEAM_SIZES.find(t => t.id === teamSize)?.label || teamSize;

  let txt = `PRE-SERVICE CHECKLIST\n`;
  txt += `Service: ${serviceLabel} | Team: ${teamLabel} | Devices: ${selectedGear.size}\n\n`;

  const phases = ["T-60", "T-30", "T-15", "T-5", "DURING", "POST"];

  phases.forEach(phaseKey => {
    const phase = CHECKLIST_DB[phaseKey];
    const applicable = phase.items.filter(itemApplies);
    if (applicable.length === 0) return;

    txt += `${phase.label.toUpperCase()} — ${phase.title}\n`;
    applicable.forEach(item => {
      txt += `  [ ] ${item.text}\n`;
    });
    txt += `\n`;
  });

  txt += `Generated by tallyconnect.app — Automate this checklist with Tally\n`;

  navigator.clipboard.writeText(txt).then(() => {
    showToast("Checklist copied!");
  }).catch(() => {
    showToast("Couldn't copy — try manually selecting the text.");
  });
}

/* ──────────────────────────────────────
   PDF Generation
   ────────────────────────────────────── */
function generatePDF(theme) {
  const serviceLabel = SERVICE_TYPES.find(s => s.id === serviceType)?.label || serviceType;
  const teamLabel = TEAM_SIZES.find(t => t.id === teamSize)?.label || teamSize;
  const phases = ["T-60", "T-30", "T-15", "T-5", "DURING", "POST"];

  const dark = theme === "dark";
  const bg      = dark ? "#09090B" : "#ffffff";
  const cardBg  = dark ? "#0F1613" : "#f8f9fa";
  const itemBg  = dark ? "#111318" : "#ffffff";
  const border  = dark ? "#1a2e1f" : "#e2e8f0";
  const txt     = dark ? "#F8FAFC" : "#1a202c";
  const txtDim  = dark ? "#94A3B8" : "#64748b";
  const txtMuted= dark ? "#475569" : "#94a3b8";
  const accent  = "#22c55e";
  const accentBg= dark ? "rgba(34,197,94,0.08)" : "#ecfdf5";
  const accentBd= dark ? "rgba(34,197,94,0.2)" : "#a7f3d0";
  const checkBg = dark ? "#1a2e1f" : "#e2e8f0";

  let phasesHtml = "";
  phases.forEach(phaseKey => {
    const phase = CHECKLIST_DB[phaseKey];
    const applicable = phase.items.filter(itemApplies);
    if (applicable.length === 0) return;

    let itemsHtml = applicable.map(item => {
      const tags = getMatchingGearTags(item);
      const tagStr = tags.map(t =>
        `<span style="font-family:ui-monospace,monospace;font-size:10px;color:${txtMuted};background:${dark ? "rgba(255,255,255,0.04)" : "#f1f5f9"};padding:2px 6px;border-radius:3px;margin-left:6px">${t}</span>`
      ).join("");
      return `
        <div style="display:flex;align-items:flex-start;gap:10px;padding:10px 0;border-bottom:1px solid ${dark ? "rgba(26,46,31,0.5)" : "#f1f5f9"}">
          <div style="flex-shrink:0;width:16px;height:16px;border:2px solid ${checkBg};border-radius:3px;margin-top:2px"></div>
          <span style="font-size:13px;color:${txt};line-height:1.5">${item.text}${tagStr}</span>
        </div>`;
    }).join("");

    phasesHtml += `
      <div style="background:${cardBg};border:1px solid ${border};border-radius:10px;padding:20px;margin-bottom:16px;page-break-inside:avoid">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">
          <span style="font-family:ui-monospace,monospace;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:${accent};padding:4px 10px;background:${accentBg};border:1px solid ${accentBd};border-radius:4px">${phase.label}</span>
          <span style="font-size:15px;font-weight:700;color:${txt}">${phase.title}</span>
        </div>
        ${itemsHtml}
      </div>`;
  });

  const html = `<!DOCTYPE html>
<html><head>
<meta charset="UTF-8" />
<title>Pre-Service Checklist</title>
<style>
  @page { size: A4; margin: 16mm; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
    background: ${bg}; color: ${txt};
    padding: 40px 36px;
    -webkit-print-color-adjust: exact; print-color-adjust: exact;
  }
  @media print {
    body { padding: 0; }
    .no-print { display: none !important; }
  }
</style>
</head><body>

<!-- Header -->
<div style="display:flex;justify-content:space-between;align-items:center;padding-bottom:16px;border-bottom:1px solid ${border};margin-bottom:24px">
  <div>
    <span style="font-weight:800;font-size:18px;color:${accent}">Tally</span>
    <span style="font-size:12px;color:${txtDim};margin-left:12px">Pre-Service Checklist</span>
  </div>
  <span style="font-family:ui-monospace,monospace;font-size:11px;color:${txtDim}">tallyconnect.app</span>
</div>

<!-- Meta badges -->
<div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:24px">
  <span style="font-family:ui-monospace,monospace;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:${accent};padding:4px 10px;background:${accentBg};border:1px solid ${accentBd};border-radius:4px">${serviceLabel}</span>
  <span style="font-family:ui-monospace,monospace;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:${accent};padding:4px 10px;background:${accentBg};border:1px solid ${accentBd};border-radius:4px">${teamLabel}</span>
  <span style="font-family:ui-monospace,monospace;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:${accent};padding:4px 10px;background:${accentBg};border:1px solid ${accentBd};border-radius:4px">${selectedGear.size} devices</span>
</div>

<!-- Phases -->
${phasesHtml}

<!-- CTA -->
<div style="text-align:center;padding:28px 24px;background:${cardBg};border:1px solid ${border};border-radius:10px;margin-top:24px">
  <p style="font-size:14px;font-weight:700;color:${txt};margin-bottom:6px">Running this manually every Sunday?</p>
  <p style="font-size:12px;color:${txtDim};margin-bottom:12px">Tally automates your entire pre-service check. Start free at tallyconnect.app</p>
  <div style="display:inline-block;padding:10px 28px;background:${accent};color:#000;font-weight:700;font-size:13px;border-radius:8px">Start Free — 30 Days</div>
</div>

<!-- Footer -->
<div style="margin-top:24px;padding-top:12px;border-top:1px solid ${border};text-align:center">
  <p style="font-size:10px;color:${txtDim}">Generated by tallyconnect.app — Church production monitoring & remote control</p>
</div>

<!-- Print button -->
<div class="no-print" style="text-align:center;margin-top:24px">
  <button onclick="window.print()" style="padding:12px 32px;background:${accent};color:#000;border:none;border-radius:8px;font-weight:700;font-size:14px;cursor:pointer">
    Save as PDF (Ctrl+P / Cmd+P)
  </button>
</div>

</body></html>`;

  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank");
}

/* ──────────────────────────────────────
   Toast
   ────────────────────────────────────── */
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2500);
}

/* ──────────────────────────────────────
   Event Listeners
   ────────────────────────────────────── */
document.getElementById("startBtn").addEventListener("click", () => {
  showScreen(builderScreen);
  renderGearStep();
});

document.getElementById("viewChecklistBtn").addEventListener("click", generateChecklist);
document.getElementById("skipContactBtn").addEventListener("click", generateChecklist);

document.getElementById("copyMdBtn").addEventListener("click", copyAsMarkdown);

document.getElementById("pdfDarkBtn").addEventListener("click", () => generatePDF("dark"));
document.getElementById("pdfLightBtn").addEventListener("click", () => generatePDF("light"));

document.getElementById("restartBtn").addEventListener("click", () => {
  selectedGear.clear();
  customGear = [];
  serviceType = "";
  teamSize = "";
  builderStep = 0;
  showScreen(welcomeScreen);
});
