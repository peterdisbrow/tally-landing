/* ── Church Production Health Check — Quiz Engine ── */

const QUESTIONS = [
  // ── Category 1: Streaming & Recording Reliability (25 pts) ──
  {
    category: "Streaming & Recording",
    question: "How often does your livestream drop or freeze during a service?",
    options: [
      { text: "Almost every week — we regularly have issues", score: 0 },
      { text: "A few times a month — it happens more than we'd like", score: 1 },
      { text: "Rarely — maybe once every couple months", score: 2 },
      { text: "Almost never — we can't remember the last time", score: 3 },
    ],
    riskText: "Frequent stream drops during services",
    fixText: "Tally monitors your stream in real-time and auto-restarts it automatically — before most viewers notice.",
  },
  {
    category: "Streaming & Recording",
    question: "Do you have automatic stream recovery if your encoder or streaming software crashes?",
    options: [
      { text: "No — someone has to manually restart everything", score: 0 },
      { text: "We have a rough process but it takes a few minutes", score: 1 },
      { text: "We have a backup encoder or failover, but it's manual", score: 2 },
      { text: "Yes — our system auto-recovers with no human intervention", score: 3 },
    ],
    riskText: "No automatic stream recovery — manual restart required",
    fixText: "Tally's auto-recovery engine detects stream failures and restarts them automatically, with instant alerts to your team.",
  },
  {
    category: "Streaming & Recording",
    question: "How do you monitor stream health (bitrate, frame drops, connection status) during a live service?",
    options: [
      { text: "We don't — we just hope it's working", score: 0 },
      { text: "Someone checks the streaming platform occasionally", score: 1 },
      { text: "We watch OBS/vMix stats on the production computer", score: 2 },
      { text: "We have a dedicated monitoring dashboard with alerts", score: 3 },
    ],
    riskText: "No real-time stream health monitoring",
    fixText: "Tally provides a live dashboard showing bitrate, frame drops, and connection status across all your streaming outputs.",
  },

  // ── Category 2: Equipment Monitoring (25 pts) ──
  {
    category: "Equipment Monitoring",
    question: "How do you know when a production device (switcher, encoder, computer) goes offline?",
    options: [
      { text: "We find out when something visibly breaks during service", score: 0 },
      { text: "A volunteer checks devices before service starts", score: 1 },
      { text: "We have some basic network monitoring in place", score: 2 },
      { text: "We get instant alerts the moment any device goes offline", score: 3 },
    ],
    riskText: "No alerts when production devices go offline",
    fixText: "Tally pings every device on your network and sends instant Slack or Telegram alerts when anything drops.",
  },
  {
    category: "Equipment Monitoring",
    question: "Are your video switcher, streaming encoder, and presentation software all monitored from one place?",
    options: [
      { text: "No — each system is its own island", score: 0 },
      { text: "We check each one individually before service", score: 1 },
      { text: "We have partial monitoring (e.g., just the switcher)", score: 2 },
      { text: "Yes — everything is visible from a single dashboard", score: 3 },
    ],
    riskText: "Production systems are siloed with no unified monitoring",
    fixText: "Tally connects to 26+ devices (ATEM, OBS, vMix, ProPresenter, audio consoles) in one unified dashboard.",
  },
  {
    category: "Equipment Monitoring",
    question: "How quickly can you detect that a recording failed to start or stopped mid-service?",
    options: [
      { text: "We usually don't know until after service when we check the files", score: 0 },
      { text: "Someone might notice during service if they remember to check", score: 1 },
      { text: "We have a visual indicator but no automated alert", score: 2 },
      { text: "We get an instant alert if recording isn't running", score: 3 },
    ],
    riskText: "Failed recordings go undetected until after service",
    fixText: "Tally monitors recording status in real-time and alerts your team instantly if a recording fails to start or stops.",
  },

  // ── Category 3: Pre-Service Readiness (25 pts) ──
  {
    category: "Pre-Service Readiness",
    question: "Do you run a systematic pre-service check of all production systems?",
    options: [
      { text: "No — we just turn things on and go", score: 0 },
      { text: "Informally — whoever arrives first checks a few things", score: 1 },
      { text: "We have a checklist but it's not always followed", score: 2 },
      { text: "Yes — we run a thorough documented checklist every time", score: 3 },
    ],
    riskText: "No systematic pre-service checks",
    fixText: "Tally runs automated pre-service health checks 30 minutes before every service — verifying every device, stream, and connection.",
  },
  {
    category: "Pre-Service Readiness",
    question: "How far in advance do you verify all systems are ready before service?",
    options: [
      { text: "Right when service starts — we're often scrambling", score: 0 },
      { text: "About 5-10 minutes before", score: 1 },
      { text: "15-30 minutes before", score: 2 },
      { text: "30+ minutes before, with time to fix any issues", score: 3 },
    ],
    riskText: "Systems aren't verified far enough in advance to fix issues",
    fixText: "Tally's scheduled pre-service checks run automatically at your chosen time, giving you a full status report with time to spare.",
  },
  {
    category: "Pre-Service Readiness",
    question: "Is your pre-service process documented so any volunteer could run it?",
    options: [
      { text: "No — it's all in one person's head", score: 0 },
      { text: "Partially — some notes exist but they're outdated", score: 1 },
      { text: "We have a written checklist but it needs the right person to interpret", score: 2 },
      { text: "Fully documented — any trained volunteer can execute it", score: 3 },
    ],
    riskText: "Pre-service process depends on tribal knowledge",
    fixText: "Tally replaces tribal knowledge with automated checks — any volunteer sees a simple green/red status board.",
  },

  // ── Category 4: Team & Recovery (25 pts) ──
  {
    category: "Team & Recovery",
    question: "How many people on your team can troubleshoot production issues during a live service?",
    options: [
      { text: "Just one person — if they're not there, we're stuck", score: 0 },
      { text: "Two people, but one is significantly more capable", score: 1 },
      { text: "A small team (3-4) with overlapping skills", score: 2 },
      { text: "Multiple trained people who can handle any issue", score: 3 },
    ],
    riskText: "Single point of failure — one person holds all production knowledge",
    fixText: "Tally provides guided troubleshooting steps and AI-powered diagnosis, so any volunteer can resolve issues confidently.",
  },
  {
    category: "Team & Recovery",
    question: "Do you have documented recovery procedures for common failures (stream crash, switcher freeze, audio loss)?",
    options: [
      { text: "No — we figure it out in the moment", score: 0 },
      { text: "Some people know what to do, but nothing written down", score: 1 },
      { text: "We have some recovery steps documented", score: 2 },
      { text: "Yes — clear SOPs for every common failure scenario", score: 3 },
    ],
    riskText: "No documented recovery procedures for common failures",
    fixText: "Tally auto-recovers from common failures (stream restart, scene reset) and sends diagnosis steps for issues requiring human input.",
  },
  {
    category: "Team & Recovery",
    question: "Can you diagnose and fix production issues remotely, or do you need to be physically on-site?",
    options: [
      { text: "On-site only — no remote access at all", score: 0 },
      { text: "Limited — maybe remote desktop to one computer", score: 1 },
      { text: "We can see some status remotely but can't control much", score: 2 },
      { text: "Full remote control — we can diagnose and fix from anywhere", score: 3 },
    ],
    riskText: "No remote diagnostic or control capability",
    fixText: "Tally gives you full remote monitoring and control from any browser — switch scenes, restart streams, and troubleshoot from home.",
  },
];

const CATEGORIES = [
  "Streaming & Recording",
  "Equipment Monitoring",
  "Pre-Service Readiness",
  "Team & Recovery",
];

const GRADES = [
  { min: 90, grade: "90+", label: "You're Crushing It",    color: "#22c55e", badgeClass: "" },
  { min: 75, grade: "75+", label: "Pretty Solid",          color: "#22c55e", badgeClass: "" },
  { min: 60, grade: "60+", label: "Not Bad — Room to Grow", color: "#eab308", badgeClass: "badge--yellow" },
  { min: 40, grade: "40+", label: "Getting There",          color: "#f97316", badgeClass: "badge--orange" },
  { min: 0,  grade: "Yikes", label: "Time for an Upgrade",  color: "#ef4444", badgeClass: "badge--red" },
];

/* ── State ── */
let currentQ = 0;
let answers = new Array(QUESTIONS.length).fill(-1);
let isAnimating = false;

/* ── DOM refs ── */
const welcomeScreen = document.getElementById("welcomeScreen");
const quizScreen    = document.getElementById("quizScreen");
const contactScreen = document.getElementById("contactScreen");
const resultsScreen = document.getElementById("resultsScreen");
const progressLabel = document.getElementById("progressLabel");
const progressFill  = document.getElementById("progressFill");
const questionCard  = document.getElementById("questionCard");
const backBtn       = document.getElementById("backBtn");
const toast         = document.getElementById("toast");

/* ── Screen management ── */
function showScreen(screen) {
  [welcomeScreen, quizScreen, contactScreen, resultsScreen].forEach(s => s.classList.add("hidden"));
  screen.classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ── Quiz rendering ── */
function renderQuestion() {
  const q = QUESTIONS[currentQ];
  const pct = ((currentQ) / QUESTIONS.length * 100).toFixed(0);
  progressLabel.textContent = `Question ${currentQ + 1} of ${QUESTIONS.length}`;
  progressFill.style.width = pct + "%";

  backBtn.classList.toggle("hidden", currentQ === 0);

  const keys = ["A", "B", "C", "D"];
  questionCard.innerHTML = `
    <span class="badge category-badge">${q.category}</span>
    <h2>${q.question}</h2>
    <div class="options">
      ${q.options.map((opt, i) => `
        <button class="option-btn${answers[currentQ] === i ? " selected" : ""}" data-idx="${i}">
          <span class="option-key">${keys[i]}</span>
          <span>${opt.text}</span>
        </button>
      `).join("")}
    </div>
  `;

  questionCard.querySelectorAll(".option-btn").forEach(btn => {
    btn.addEventListener("click", () => selectAnswer(Number(btn.dataset.idx)));
  });
}

function selectAnswer(idx) {
  if (isAnimating) return;
  isAnimating = true;

  answers[currentQ] = idx;

  // Confirm the chosen answer and dim the rest
  const btns = questionCard.querySelectorAll(".option-btn");
  btns.forEach((b, i) => {
    b.classList.remove("selected");
    b.classList.toggle("confirmed", i === idx);
  });
  questionCard.querySelector(".options").classList.add("answered");

  // Slide out, then render next question with slide in
  setTimeout(() => {
    if (currentQ < QUESTIONS.length - 1) {
      questionCard.classList.add("slide-out");
      setTimeout(() => {
        currentQ++;
        renderQuestion();
        document.activeElement?.blur();
        // Suppress hover flash until the user actually moves their mouse
        const opts = questionCard.querySelector(".options");
        if (opts) opts.classList.add("no-hover");
        questionCard.classList.remove("slide-out");
        questionCard.classList.add("slide-in");
        setTimeout(() => {
          questionCard.classList.remove("slide-in");
          isAnimating = false;
          // Listen for real mouse movement AFTER animation settles
          if (opts) {
            questionCard.addEventListener("pointermove", () => {
              opts.classList.remove("no-hover");
            }, { once: true });
          }
        }, 300);
      }, 250);
    } else {
      progressFill.style.width = "100%";
      isAnimating = false;
      showScreen(contactScreen);
    }
  }, 400);
}

/* ── Scoring ── */
function calcScores() {
  const catScores = {};
  CATEGORIES.forEach(c => { catScores[c] = { earned: 0, max: 0 }; });

  QUESTIONS.forEach((q, i) => {
    const chosen = answers[i];
    const pts = chosen >= 0 ? q.options[chosen].score : 0;
    catScores[q.category].earned += pts;
    catScores[q.category].max += 3;
  });

  let totalEarned = 0, totalMax = 0;
  CATEGORIES.forEach(c => {
    totalEarned += catScores[c].earned;
    totalMax += catScores[c].max;
  });

  // Normalize to 100
  const pct = Math.round((totalEarned / totalMax) * 100);

  // Per-category normalized to 25
  const catNorm = {};
  CATEGORIES.forEach(c => {
    catNorm[c] = Math.round((catScores[c].earned / catScores[c].max) * 25);
  });

  return { total: pct, categories: catNorm };
}

function getGrade(score) {
  return GRADES.find(g => score >= g.min) || GRADES[GRADES.length - 1];
}

/* ── Risk analysis ── */
function getRisks() {
  // Find questions where user scored 0 or 1
  const risks = [];
  QUESTIONS.forEach((q, i) => {
    const chosen = answers[i];
    const score = chosen >= 0 ? q.options[chosen].score : 0;
    if (score <= 1) {
      risks.push({ risk: q.riskText, fix: q.fixText, score });
    }
  });
  // Sort by worst first, take top 3
  risks.sort((a, b) => a.score - b.score);
  return risks.slice(0, 3);
}

/* ── Render results ── */
function showResults() {
  showScreen(resultsScreen);
  const { total, categories } = calcScores();
  const grade = getGrade(total);
  const risks = getRisks();

  // Score ring animation
  const arc = document.getElementById("scoreArc");
  const circumference = 2 * Math.PI * 88; // ~553
  const offset = circumference - (total / 100) * circumference;
  arc.style.stroke = grade.color;
  requestAnimationFrame(() => {
    arc.style.strokeDashoffset = offset;
  });

  // Animate number
  const scoreNum = document.getElementById("scoreNumber");
  animateNumber(scoreNum, 0, total, 1000);

  // Grade label
  document.getElementById("scoreGrade").textContent = `${grade.grade} — ${grade.label}`;
  document.getElementById("scoreGrade").style.color = grade.color;
  document.getElementById("scoreLabel").textContent = `Your church production reliability score`;

  // Category bars
  const breakdown = document.getElementById("categoryBreakdown");
  breakdown.innerHTML = CATEGORIES.map(cat => {
    const pts = categories[cat];
    const pct = (pts / 25 * 100).toFixed(0);
    const barColor = pct >= 75 ? "#22c55e" : pct >= 50 ? "#eab308" : pct >= 30 ? "#f97316" : "#ef4444";
    return `
      <div class="cat-row">
        <div class="cat-row-head">
          <span>${cat}</span>
          <span>${pts}/25</span>
        </div>
        <div class="cat-bar">
          <div class="cat-bar-fill" style="width:${pct}%;background:${barColor}"></div>
        </div>
      </div>
    `;
  }).join("");

  // Risks
  const risksList = document.getElementById("risksList");
  if (risks.length === 0) {
    document.getElementById("risksCard").classList.add("hidden");
  } else {
    document.getElementById("risksCard").classList.remove("hidden");
    risksList.innerHTML = risks.map(r => `
      <div class="risk-card">
        <span class="risk-icon">&#9888;</span>
        <div>
          <strong>${r.risk}</strong>
          <p>This was flagged based on your answers.</p>
        </div>
      </div>
    `).join("");
  }

  // Fixes
  const fixesList = document.getElementById("fixesList");
  if (risks.length === 0) {
    document.getElementById("fixesCard").classList.add("hidden");
  } else {
    document.getElementById("fixesCard").classList.remove("hidden");
    fixesList.innerHTML = risks.map(r => `
      <div class="fix-card">
        <span class="risk-icon" style="color:var(--accent)">&#10003;</span>
        <div>
          <strong>${r.risk}</strong>
          <p>${r.fix}</p>
        </div>
      </div>
    `).join("");
  }
}

function animateNumber(el, from, to, duration) {
  const start = performance.now();
  function tick(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    el.textContent = Math.round(from + (to - from) * eased);
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

/* ── Copy results ── */
function copyResults() {
  const { total, categories } = calcScores();
  const grade = getGrade(total);
  const risks = getRisks();

  const name = document.getElementById("contactName").value;
  const church = document.getElementById("contactChurch").value;

  let text = `Church Production Health Check Results\n`;
  if (church) text += `${church}\n`;
  if (name) text += `Assessed by: ${name}\n`;
  text += `\nScore: ${total}/100 (${grade.grade} — ${grade.label})\n\n`;

  CATEGORIES.forEach(cat => {
    text += `${cat}: ${categories[cat]}/25\n`;
  });

  if (risks.length > 0) {
    text += `\nTop risks:\n`;
    risks.forEach(r => { text += `- ${r.risk}\n`; });
  }

  text += `\nTake the free assessment: https://tallyconnect.app/tools/healthcheck/`;
  text += `\nTry Tally free for 30 days: https://tallyconnect.app`;

  navigator.clipboard.writeText(text).then(() => {
    showToast("Results copied to clipboard!");
  }).catch(() => {
    showToast("Couldn't copy — try manually selecting the text.");
  });
}

/* ── PDF Generation ── */
function generatePDF(theme) {
  const { total, categories } = calcScores();
  const grade = getGrade(total);
  const risks = getRisks();

  const name = document.getElementById("contactName").value;
  const church = document.getElementById("contactChurch").value;

  const dark = theme === "dark";
  const bg      = dark ? "#09090B" : "#ffffff";
  const cardBg  = dark ? "#0F1613" : "#f8f9fa";
  const border  = dark ? "#1a2e1f" : "#e2e8f0";
  const text    = dark ? "#F8FAFC" : "#1a202c";
  const textDim = dark ? "#94A3B8" : "#64748b";
  const accent  = "#22c55e";

  const catBarsHtml = CATEGORIES.map(cat => {
    const pts = categories[cat];
    const pct = (pts / 25 * 100).toFixed(0);
    const barColor = pct >= 75 ? "#22c55e" : pct >= 50 ? "#eab308" : pct >= 30 ? "#f97316" : "#ef4444";
    return `
      <div style="margin-bottom:14px">
        <div style="display:flex;justify-content:space-between;margin-bottom:4px">
          <span style="font-size:14px;font-weight:600;color:${text}">${cat}</span>
          <span style="font-family:ui-monospace,monospace;font-size:12px;font-weight:700;color:${textDim}">${pts}/25</span>
        </div>
        <div style="width:100%;height:8px;background:${border};border-radius:4px;overflow:hidden">
          <div style="width:${pct}%;height:100%;background:${barColor};border-radius:4px"></div>
        </div>
      </div>`;
  }).join("");

  const risksHtml = risks.length > 0 ? `
    <div style="margin-top:32px">
      <h3 style="font-size:16px;font-weight:700;color:${text};margin-bottom:14px">Top Risks Identified</h3>
      ${risks.map(r => `
        <div style="display:flex;gap:12px;padding:14px 16px;background:${dark ? "rgba(239,68,68,0.06)" : "#fef2f2"};border:1px solid ${dark ? "rgba(239,68,68,0.15)" : "#fecaca"};border-radius:10px;margin-bottom:8px">
          <span style="flex-shrink:0;font-size:16px">&#9888;</span>
          <div>
            <strong style="display:block;font-size:13px;color:${text}">${r.risk}</strong>
          </div>
        </div>
      `).join("")}
    </div>` : "";

  const fixesHtml = risks.length > 0 ? `
    <div style="margin-top:24px">
      <h3 style="font-size:16px;font-weight:700;color:${text};margin-bottom:14px">How Tally Fixes This</h3>
      ${risks.map(r => `
        <div style="display:flex;gap:12px;padding:14px 16px;background:${dark ? "rgba(34,197,94,0.04)" : "#f0fdf4"};border:1px solid ${dark ? "rgba(34,197,94,0.15)" : "#bbf7d0"};border-radius:10px;margin-bottom:8px">
          <span style="flex-shrink:0;font-size:16px;color:${accent}">&#10003;</span>
          <div>
            <strong style="display:block;font-size:13px;color:${accent}">${r.risk}</strong>
            <p style="font-size:12px;color:${textDim};margin:4px 0 0;line-height:1.5">${r.fix}</p>
          </div>
        </div>
      `).join("")}
    </div>` : "";

  const html = `<!DOCTYPE html>
<html><head>
<meta charset="UTF-8" />
<title>Church Production Health Check — Results</title>
<style>
  @page { size: A4; margin: 20mm; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
    background: ${bg}; color: ${text};
    padding: 48px 40px;
    -webkit-print-color-adjust: exact; print-color-adjust: exact;
  }
  @media print {
    body { padding: 0; }
    .no-print { display: none !important; }
  }
</style>
</head><body>

<!-- Header -->
<div style="display:flex;justify-content:space-between;align-items:center;padding-bottom:20px;border-bottom:1px solid ${border};margin-bottom:32px">
  <div>
    <span style="font-weight:800;font-size:18px;color:${accent}">Tally</span>
    <span style="font-size:12px;color:${textDim};margin-left:12px">Church Production Health Check</span>
  </div>
  <span style="font-family:ui-monospace,monospace;font-size:11px;color:${textDim}">tallyconnect.app</span>
</div>

${church ? `<p style="font-size:20px;font-weight:800;color:${text};margin-bottom:4px">${church}</p>` : ""}
${name ? `<p style="font-size:13px;color:${textDim};margin-bottom:24px">Assessed by ${name}</p>` : '<div style="margin-bottom:24px"></div>'}

<!-- Score -->
<div style="text-align:center;margin-bottom:36px">
  <div style="display:inline-block;width:140px;height:140px;border-radius:50%;border:6px solid ${grade.color};position:relative;margin-bottom:16px">
    <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center">
      <span style="font-size:48px;font-weight:900;color:${text};line-height:1">${total}</span>
      <span style="font-size:13px;color:${textDim};font-weight:600">/ 100</span>
    </div>
  </div>
  <div style="font-size:22px;font-weight:800;color:${grade.color}">${grade.grade} — ${grade.label}</div>
  <div style="font-size:13px;color:${textDim};margin-top:4px">Production Reliability Score</div>
</div>

<!-- Category Breakdown -->
<div style="background:${cardBg};border:1px solid ${border};border-radius:12px;padding:24px;margin-bottom:24px">
  <h3 style="font-size:16px;font-weight:700;color:${text};margin-bottom:16px">Category Breakdown</h3>
  ${catBarsHtml}
</div>

<!-- Risks & Fixes -->
<div style="background:${cardBg};border:1px solid ${border};border-radius:12px;padding:24px;margin-bottom:24px">
  ${risksHtml}
  ${fixesHtml}
</div>

<!-- CTA -->
<div style="text-align:center;padding:32px 24px;background:${cardBg};border:1px solid ${border};border-radius:12px;margin-top:24px">
  <p style="font-size:15px;font-weight:700;color:${text};margin-bottom:6px">Ready to automate your production?</p>
  <p style="font-size:13px;color:${textDim};margin-bottom:12px">Start your free 30-day trial at tallyconnect.app</p>
  <div style="display:inline-block;padding:10px 28px;background:${accent};color:#000;font-weight:700;font-size:14px;border-radius:8px">Start Free Trial</div>
</div>

<!-- Footer -->
<div style="margin-top:32px;padding-top:16px;border-top:1px solid ${border};text-align:center">
  <p style="font-size:11px;color:${textDim}">Generated by tallyconnect.app — Church production monitoring & remote control</p>
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

/* ── Toast ── */
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2500);
}

/* ── Lead capture ── */
function submitLead(source) {
  const name = document.getElementById("contactName").value.trim();
  const email = document.getElementById("contactEmail").value.trim();
  const church = document.getElementById("contactChurch").value.trim();
  const role = document.getElementById("contactRole").value;

  if (!name || !email) return; // silently skip if fields empty

  const { total } = calcScores();

  fetch("/api/early-access", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, church, role, source, score: total }),
  }).catch(() => {}); // fire-and-forget
}

/* ── Event listeners ── */
document.getElementById("startBtn").addEventListener("click", () => {
  currentQ = 0;
  answers = new Array(QUESTIONS.length).fill(-1);
  showScreen(quizScreen);
  renderQuestion();
});

backBtn.addEventListener("click", () => {
  if (currentQ > 0 && !isAnimating) {
    currentQ--;
    renderQuestion();
  }
});

document.getElementById("viewResultsBtn").addEventListener("click", () => {
  submitLead("healthcheck");
  showResults();
});
document.getElementById("skipContactBtn").addEventListener("click", showResults);
document.getElementById("copyResultsBtn").addEventListener("click", copyResults);
document.getElementById("pdfDarkBtn").addEventListener("click", () => generatePDF("dark"));
document.getElementById("pdfLightBtn").addEventListener("click", () => generatePDF("light"));

document.getElementById("retakeBtn").addEventListener("click", () => {
  currentQ = 0;
  answers = new Array(QUESTIONS.length).fill(-1);
  isAnimating = false;
  // Reset arc
  document.getElementById("scoreArc").style.strokeDashoffset = 553;
  showScreen(welcomeScreen);
});

/* ── Keyboard shortcuts ── */
document.addEventListener("keydown", (e) => {
  if (quizScreen.classList.contains("hidden")) return;
  const key = e.key.toUpperCase();
  const map = { A: 0, B: 1, C: 2, D: 3, "1": 0, "2": 1, "3": 2, "4": 3 };
  if (key in map) {
    selectAnswer(map[key]);
  }
});
