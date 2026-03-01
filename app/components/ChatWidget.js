'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { BG, CARD_BG, BORDER, GREEN, GREEN_LT, WHITE, MUTED, DIM } from '../../lib/tokens';
import { FEATURES, INTEGRATIONS, PRICING } from '../../lib/data';
import { parseMarkdown } from '../../lib/chat-markdown';

/* ─── Quick-action pills shown on first open ─── */
const PILLS = [
  { label: 'Ask about features', msg: 'What are the main features of Tally?' },
  { label: 'See pricing',        msg: 'What are your pricing plans?' },
  { label: 'Try a live demo',    msg: 'I want to try a live demo. What commands can I send?' },
];

/* ─── Static responses — no AI tokens needed ─── */

function buildPricingResponse() {
  const lines = PRICING.map(p => {
    const save = p.annualPrice ? ` ($${p.annualPrice}/yr — save 2 months)` : '';
    return `**${p.name}** — $${p.monthlyPrice}/mo${save}\n${p.desc}\n• ${p.features.join('\n• ')}`;
  });
  return `Here are our plans:\n\n${lines.join('\n\n')}\n\nAll plans include a 30-day free trial — no credit card required.\n\n[CTA:Start Free Trial:/signup]\n\nWhich plan sounds like the best fit for your church?`;
}

function buildFeaturesResponse() {
  const top6 = FEATURES.slice(0, 6);
  const lines = top6.map(f => `**${f.name}** — ${f.desc}`);
  return `Tally has ${FEATURES.length} major features. Here are the highlights:\n\n${lines.join('\n\n')}\n\nWant to hear about the other ${FEATURES.length - 6} features, or ask about a specific one?`;
}

function buildIntegrationsResponse() {
  const byTag = {};
  INTEGRATIONS.forEach(i => {
    if (!byTag[i.tag]) byTag[i.tag] = [];
    byTag[i.tag].push(i.name);
  });
  const lines = Object.entries(byTag).map(([tag, names]) => `**${tag}**: ${names.join(', ')}`);
  return `Tally supports ${INTEGRATIONS.length} integrations:\n\n${lines.join('\n')}\n\nIs your gear on the list? Tell me what you run and I'll confirm compatibility.`;
}

function buildSetupResponse() {
  return `Setup takes about 10 minutes:\n\n1. **Download** the Tally app on your booth computer (macOS or Windows)\n2. **Sign in** with your registration code\n3. **Auto-discovery** — Tally finds your ATEM, OBS, Companion, and other devices on the network automatically\n4. **AI Setup Assistant** (optional) — upload a patch list, camera plot, CSV, or even a photo and Tally auto-configures your mixer channels and ATEM input labels\n\nNo port forwarding needed. Works behind church firewalls. Runs alongside OBS, ProPresenter, etc. on your existing computer.\n\n[CTA:Start Free Trial:/signup]`;
}

function buildTrialResponse() {
  return `Getting started is easy:\n\n• **30-day free trial** — no credit card required\n• Full access to all features on your chosen plan\n• Cancel anytime, no questions asked\n• If you don't subscribe after the trial, monitoring stops but your data is preserved for 30 days\n\n[CTA:Start Free Trial:/signup]\n\nNot sure which plan? Tell me about your setup (how many rooms, what gear) and I'll recommend one.`;
}

function buildSupportResponse() {
  return `Here's how to get help:\n\n• **Email**: support@atemschool.com\n• **Sales**: sales@atemschool.com\n• **How-To Guides**: 16 step-by-step setup guides at tallyconnect.app → Guides\n• **Help Center**: tallyconnect.app/help\n\nOr just ask me here — I can answer most questions about features, setup, and troubleshooting!`;
}

function buildWhatIsTallyResponse() {
  return `**Tally** is a desktop app (macOS + Windows) that monitors every device in your church production booth — ATEM switchers, OBS, audio consoles, encoders, ProPresenter, and more.\n\nWhat makes it different:\n• **Auto-recovery** — stream goes down, Tally restarts it before anyone notices\n• **AI commands** — type "cut to camera 2" in plain English\n• **Remote control** — manage your booth from your phone or Telegram\n• **Pre-service checks** — automated green-light 30 min before every service\n\nIt runs on your existing booth computer alongside your other software. Setup takes about 10 minutes — no port forwarding, works behind church firewalls.\n\n[CTA:Start Free Trial:/signup]\n\nWant to see pricing, try a live demo, or hear about a specific feature?`;
}

function buildAutoRecoveryResponse() {
  return `**Auto-Recovery** is one of Tally's most loved features.\n\nHere's how it works:\n1. Tally detects your stream dropped (OBS, vMix, or hardware encoder)\n2. Within **10 seconds**, it automatically restarts the stream\n3. Your TD gets an alert with diagnosis steps\n4. The congregation usually never notices\n\nIt works with:\n• OBS Studio\n• vMix\n• Ecamm Live\n• Hardware encoders (Blackmagic, Teradek, YoloBox, Epiphan, AJA HELO)\n\nEvery recovery is logged in the post-service timeline so your team can review what happened.\n\nAuto-recovery is included on **all plans** starting at $49/mo. Want to try a live demo of what happens when a stream drops?`;
}

function buildAlertsResponse() {
  return `Tally sends real-time alerts to **Slack** and **Telegram** when something needs attention.\n\nHow alerts work:\n• **Instant notification** — your TD gets a message within seconds\n• **Diagnosis steps** — not just "something broke" but what to do about it\n• **One-tap acknowledge** — confirm you're on it from your phone\n• **90-second escalation** — if nobody responds, the next person on the rotation gets pinged\n\nAlert examples:\n• Stream dropped + auto-recovered\n• Device disconnected\n• Pre-service check failed\n• Audio levels abnormal\n\nAlerts are included on **all plans**. You can customize which events trigger alerts and who gets them.\n\nWant to hear about on-call TD rotation, or try a live demo?`;
}

function buildAtemResponse() {
  return `Tally has **deep ATEM integration** — every model is supported, from ATEM Mini to Constellation.\n\nWhat you can do:\n• **Monitor** — see program/preview sources, transition state, streaming status\n• **Control** — cut, dissolve, fade to black, set preview/program, run macros\n• **DSK/USK** — toggle downstream and upstream keyers\n• **Aux outputs** — route any source to any aux\n• **Input labels** — rename inputs via AI Setup Assistant\n• **Recording** — start/stop HyperDeck or internal recording\n\nAll control works from your phone via Telegram or the web dashboard — you don't need to be at the switcher.\n\nThe AI understands plain English: just type "dissolve to camera 3" or "fade to black."\n\nWant to try ATEM commands in the live demo? Type "cut to camera 2" to start!`;
}

function buildProPresenterResponse() {
  return `Tally offers **deep ProPresenter integration** — not just monitoring but full control.\n\nWhat you can control:\n• **Slides** — next, previous, go to specific slide\n• **Looks** — trigger saved looks by name\n• **Timers** — start, stop, and configure countdown timers\n• **Stage messages** — send messages to confidence monitors\n• **Playlists** — navigate between playlists\n• **Clear all** — clear all layers at once\n\nAll commands work via natural language: "next slide", "start 5-minute countdown", "send stage message: 2 minutes left."\n\nProPresenter control is available on **Plus** ($99/mo) and above.\n\n[CTA:Start Free Trial:/signup?plan=plus]\n\nWant to try ProPresenter commands in the live demo?`;
}

function buildAudioResponse() {
  return `Tally monitors and controls all major audio consoles used in churches:\n\n**Supported mixers:**\n• Behringer X32 / X-Air series\n• Midas M32 / Wing\n• Allen & Heath SQ / dLive / Avantis\n• Yamaha CL / QL / TF\n• Dante audio network\n\n**What you can do:**\n• Mute/unmute channels from your phone\n• Set fader levels\n• Recall scenes/snapshots\n• Monitor channel levels in real time\n• Get alerts on audio issues\n\nThe AI understands commands like "mute channel 3" or "unmute pastor lav."\n\nThe **AI Setup Assistant** can auto-configure your mixer channels from a patch list — upload a CSV, PDF, or even a photo.\n\nWant to try audio commands in the live demo?`;
}

function buildInternetResponse() {
  return `Great question — this comes up a lot!\n\n**Tally is a monitoring layer, not a dependency.** Your gear works exactly the same without it.\n\nIf your internet goes down:\n• Your ATEM, ProPresenter, audio console — everything keeps running normally\n• Tally detects the disconnection and alerts your TD via Telegram/Slack\n• When internet returns, Tally reconnects automatically and resumes monitoring\n• Nothing is lost — the app runs locally on your booth computer\n\nTally doesn't route any audio or video through the internet. It only sends status data and commands over your network.\n\nFeel better? Want to hear about setup, or try a live demo?`;
}

function buildSystemRequirementsResponse() {
  return `**No dedicated computer needed.** Tally runs on your existing booth computer alongside OBS, ProPresenter, and whatever else you're already running.\n\n**Requirements:**\n• macOS 11+ or Windows 10+\n• 4GB RAM (uses ~200MB)\n• Network connection to your devices (same LAN)\n• Internet connection for remote access and alerts\n\nTally is lightweight — it's a monitoring app, not a video processor. It won't affect your OBS or vMix performance.\n\n**Optional hardware:** We're also developing pre-configured **Tally Box** hardware ($299–$799) for churches that want a dedicated monitoring appliance — but it's not required.\n\n[CTA:Start Free Trial:/signup]`;
}

function buildVolunteerResponse() {
  return `**Tally is built specifically for volunteer-run teams.** That's the whole point.\n\nHow it helps volunteers:\n• **Auto-recovery** handles problems automatically — no troubleshooting needed\n• **Pre-service checks** verify everything is working 30 min before service\n• **AI commands** in plain English — no need to memorize switcher menus\n• **Alerts with diagnosis steps** — not just "something broke" but what to do\n• **Guest TD tokens** — temporary access for rotating volunteers (auto-expire in 7 days)\n• **On-call rotation** — alerts go to whoever is scheduled, not everyone\n\nThe goal: your volunteers focus on the creative work (camera angles, graphics, mix) while Tally handles the technical babysitting.\n\n[CTA:Start Free Trial:/signup]\n\nWant to see pricing or try the demo?`;
}

function buildMultiSiteResponse() {
  const plans = PRICING.filter(p => p.features.some(f => /room/i.test(f)));
  const lines = plans.map(p => {
    const roomFeature = p.features.find(f => /room/i.test(f));
    return `• **${p.name}** ($${p.monthlyPrice}/mo) — ${roomFeature}`;
  });
  return `Tally is **built for multi-room and multi-site** churches.\n\nRoom limits by plan:\n${lines.join('\n')}\n\nEach room gets independent monitoring, alerts, and control. Your dashboard shows all rooms at a glance — one login, full visibility.\n\nFor multi-site campuses, **Enterprise** ($499/mo) includes dedicated onboarding, custom autopilot rules, and a dedicated support engineer.\n\nHow many rooms are you running? I can recommend the right plan.`;
}

function buildPlanningCenterResponse() {
  return `Tally integrates with **Planning Center** for bi-directional sync.\n\n**What it does:**\n• **Pull** — Automatically imports service times from Planning Center. No manual scheduling.\n• **Push** — After each service, production notes push back into the plan automatically.\n• **Session recaps** — Full timeline of what happened during service goes into Planning Center.\n\nThis means your production team's notes, incidents, and auto-recoveries are all documented in the same place your worship team plans.\n\nPlanning Center sync is available on **Pro** ($149/mo) and above.\n\n[CTA:Start Free Trial:/signup?plan=pro]\n\nAlready using Planning Center? Tell me about your setup and I'll recommend a plan.`;
}

function buildAutopilotResponse() {
  return `**AI Autopilot** lets you create rules that Tally executes automatically during service.\n\nExample rules:\n• "When worship slides start → switch to camera 1"\n• "When sermon begins → switch to camera 2, unmute pastor lav"\n• "5 minutes before service → run pre-service check"\n• "When stream drops → restart and alert TD"\n\nHow it works:\n1. You define trigger conditions and actions in the dashboard\n2. Tally monitors for those conditions during service\n3. When triggered, Tally executes the actions automatically\n4. Everything is logged in the post-service timeline\n\nAutopilot limits by plan:\n• **Pro** ($149/mo) — 10 automation rules\n• **Enterprise** ($499/mo) — 25 rules + custom rules built for you\n\n[CTA:Start Free Trial:/signup?plan=pro]\n\nWant to try a demo, or hear about a specific use case?`;
}

function buildRecommendPlanResponse() {
  return `Here's a quick guide to picking the right plan:\n\n**Small church, 1 room, basic monitoring:**\n→ **Connect** at $49/mo — monitoring, alerts, auto-recovery, remote control\n\n**Growing church, 2-3 rooms, want AI features:**\n→ **Plus** at $99/mo — all integrations, AI commands, live preview, ProPresenter control\n\n**Multi-room, need automation:**\n→ **Pro** at $149/mo — AI Autopilot, Planning Center sync, monthly reports *(most popular)*\n\n**Multi-site / large organization:**\n→ **Enterprise** at $499/mo — unlimited rooms, dedicated engineer, 15-min SLA\n\n**One-time event (Easter, conference, wedding):**\n→ **Event** at $99 one-time — 72 hours of full monitoring\n\nAll plans include a **30-day free trial** — no credit card required.\n\n[CTA:Start Free Trial:/signup]\n\nTell me about your setup and I'll narrow it down!`;
}

function buildSecurityResponse() {
  return `Security and privacy are built into Tally's architecture.\n\n**How your data is protected:**\n• Tally runs **locally** on your booth computer — video and audio never leave your network\n• Remote access uses **encrypted tunnels** (Tailscale/WireGuard) — no port forwarding needed\n• All API communication is over **HTTPS/TLS**\n• **Guest TD tokens** auto-expire in 7 days with full audit trail\n• Each church gets an **isolated dashboard** — no cross-church data access\n• Credentials are stored encrypted on your local machine\n\n**What Tally does NOT do:**\n• Route video/audio through external servers\n• Store your stream content\n• Share data between churches\n\nQuestions about a specific security concern? Or want to see pricing?`;
}

function buildEventResponse() {
  return `**Tally Event** is perfect for one-time productions — Easter services, conferences, weddings, concerts.\n\n**$99 one-time** (no subscription):\n• 72 hours of full monitoring\n• All device integrations\n• Auto-recovery\n• Alerts to your TD\n• Pre-event system check\n• Post-event incident report\n\nJust download the app, enter your event code, and Tally monitors everything for the duration.\n\nRunning a recurring event? You might want a monthly plan instead — **Connect** starts at $49/mo with a 30-day free trial.\n\n[CTA:Get Event Pass:/signup?plan=event]\n\nTell me about your event and I'll help you decide!`;
}

function buildDemoIntro() {
  return `Welcome to the live demo! This simulates a real Tally-connected production booth.\n\nYour demo setup:\n• **ATEM** — 6 inputs (CAM 1 Wide, CAM 2 Pastor, CAM 3 Band, CAM 4 Overhead, Media Player 1, Color Bars)\n• **Audio** — Behringer X32 (Ch 1: Pastor Lav, Ch 2: Worship Lead, Ch 3–12: Band & Choir)\n• **OBS** — Streaming to YouTube at 6000kbps\n• **ProPresenter** — "Sunday Morning" playlist, slide 3 of 12\n\nTry any of these commands:\n• "cut to camera 2"\n• "fade to black"\n• "mute channel 3"\n• "next slide"\n• "start recording"\n• "run pre-service check"\n\nType a command and I'll show you what Tally does!`;
}

/* Keyword matching for static flows — order matters: specific patterns before generic ones.
   NOTE: Use \b only at start of keywords. Avoid trailing \b so plurals/conjugations match. */
const STATIC_FLOWS = [
  /* ── Specific feature questions ── */
  { match: (m) => /\bauto[- ]?recover|stream.*(down|drop|crash|restart|broke)|fix.*(stream|broadcast)/i.test(m), reply: buildAutoRecoveryResponse },
  { match: (m) => /\b(alert|notification|escalat|notify)/i.test(m) && /\b(how|what|tell|about)/i.test(m), reply: buildAlertsResponse },
  { match: (m) => /\b(propresenter|pro ?presenter|slides?|presentation|worship.*(slide|lyric))/i.test(m) && !/demo/i.test(m), reply: buildProPresenterResponse },
  { match: (m) => /\b(atem|switcher|video switch|blackmagic.*(switch|atem))/i.test(m) && !/demo/i.test(m), reply: buildAtemResponse },
  { match: (m) => /\b(audio|mixer|console|x32|m32|behringer|midas|allen.{0,3}heath|yamaha|dante|sound\b)/i.test(m) && !/demo/i.test(m), reply: buildAudioResponse },
  { match: (m) => /\b(auto ?pilot|automat|rule.*trigger|trigger.*rule)/i.test(m), reply: buildAutopilotResponse },
  { match: (m) => /\bplanning ?center/i.test(m), reply: buildPlanningCenterResponse },

  /* ── Objection handling ── */
  { match: (m) => /\binternet.*(down|go|drop|lose|out|fail)|\boffline\b|\bno internet|\bwithout internet|\bconnectivity\b/i.test(m), reply: buildInternetResponse },
  { match: (m) => /\b(dedicated ?computer|system req|what computer|hardware req|spec\b|minimum req|\bcpu\b|\bram\b)/i.test(m), reply: buildSystemRequirementsResponse },
  { match: (m) => /\b(volunteer|easy.*(use|learn)|training|non.?technical|beginner|\bsimple\b)/i.test(m), reply: buildVolunteerResponse },
  { match: (m) => /\b(security|privacy|data ?protect|encrypt|safe\b|secure)/i.test(m), reply: buildSecurityResponse },

  /* ── Sales & plan guidance ── */
  { match: (m) => /\b(which plan|recommend|what plan|best plan|right plan|plan for|suggest)/i.test(m), reply: buildRecommendPlanResponse },
  { match: (m) => /\b(multi[- ]?(site|campus|location|room)|multiple (room|site|campus)|several (room|site))/i.test(m), reply: buildMultiSiteResponse },
  { match: (m) => /\b(event|conference|easter|wedding|one[- ]?time|temporary)/i.test(m) && /\b(plan|price|monitor|tally)/i.test(m), reply: buildEventResponse },
  { match: (m) => /\b(pricing|plans?|cost|how much|price)/i.test(m),           reply: buildPricingResponse },

  /* ── General questions ── */
  { match: (m) => /\b(what is tally|tell me about tally|explain tally|what does tally do|what('s| is) tally)/i.test(m), reply: buildWhatIsTallyResponse },
  { match: (m) => /\b(features?|what (does|can)|capabilities|overview)/i.test(m) && !/demo/i.test(m), reply: buildFeaturesResponse },
  { match: (m) => /\b(integrations?|devices?|supported|compatible|work with|connect to)/i.test(m), reply: buildIntegrationsResponse },
  { match: (m) => /\b(set ?up|install|get started|onboard|how.*(start|begin))/i.test(m) && !/trial/i.test(m), reply: buildSetupResponse },
  { match: (m) => /\b(free trial|sign ?up|try|start.*trial|cancel)/i.test(m) && !/demo/i.test(m), reply: buildTrialResponse },
  { match: (m) => /\b(support|help|contact|email|phone)\b/i.test(m),           reply: buildSupportResponse },
  { match: (m) => /\b(demo|try.*command|simulate|live demo)/i.test(m),         reply: buildDemoIntro },
];

function getStaticReply(message) {
  for (const flow of STATIC_FLOWS) {
    if (flow.match(message)) return flow.reply();
  }
  return null;
}

/* ─── Proactive engagement messages by section ─── */
const PROACTIVE_MESSAGES = {
  pricing: "Looking at plans? Tell me how many rooms you run and what gear you use — I'll recommend the right one.",
  features: "I see you're checking out features. Want me to help figure out which ones matter most for your setup?",
  'the-app': "Want to try Tally commands live? Type \"cut to camera 2\" and I'll simulate what happens in your booth.",
  default: "Hey! I can answer questions about Tally, recommend a plan for your church, or give you a live demo. What sounds good?",
};

function getVisibleSection() {
  for (const id of ['pricing', 'features', 'the-app']) {
    const el = document.getElementById(id);
    if (!el) continue;
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.6 && rect.bottom > 0) return id;
  }
  return 'default';
}

/* ─── localStorage helpers ─── */
const STORAGE_KEY = 'tally-chat-messages';
const TTL = 24 * 60 * 60 * 1000; // 24 hours

function loadMessages() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (parsed.ts && Date.now() - parsed.ts > TTL) {
      localStorage.removeItem(STORAGE_KEY);
      return [];
    }
    return parsed.messages || [];
  } catch { return []; }
}

function saveMessages(msgs) {
  try {
    const clean = msgs.map(({ role, content }) => ({ role, content }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ messages: clean, ts: Date.now() }));
  } catch {}
}

/* ─── Lead capture helper ─── */
function fireLeadCapture(email) {
  fetch('/api/early-access', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Chat Lead', church: '', email, source: 'chatbot' }),
  }).catch(() => {});
}

export default function ChatWidget() {
  const [open, setOpen]         = useState(false);
  const [messages, setMessages] = useState(loadMessages);
  const [input, setInput]       = useState('');
  const [sending, setSending]   = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [leadCaptured, setLeadCaptured] = useState(false);
  const messagesEndRef = useRef(null);
  const visibleSectionRef = useRef('default');

  /* ── Inject keyframes for typing indicator ── */
  useEffect(() => {
    if (document.getElementById('tally-chat-kf')) return;
    const style = document.createElement('style');
    style.id = 'tally-chat-kf';
    style.textContent = `@keyframes tallyBounce{0%,80%,100%{transform:scale(0.6);opacity:0.4}40%{transform:scale(1);opacity:1}}`;
    document.head.appendChild(style);
  }, []);

  /* ── Check viewport width ── */
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  /* ── Track visible section for proactive engagement ── */
  useEffect(() => {
    const ids = ['pricing', 'features', 'the-app'];
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) visibleSectionRef.current = e.target.id;
        }
      },
      { threshold: 0.3 }
    );
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  /* ── Proactive engagement: auto-open after 45s ── */
  useEffect(() => {
    if (messages.length > 0 || open) return;
    if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('tally-chat-dismissed')) return;

    const timer = setTimeout(() => {
      const section = visibleSectionRef.current || 'default';
      const msg = PROACTIVE_MESSAGES[section] || PROACTIVE_MESSAGES.default;
      setOpen(true);
      setMessages([{ role: 'assistant', content: msg }]);
    }, 45000);

    return () => clearTimeout(timer);
  }, [messages.length, open]);

  /* ── Auto-scroll ── */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /* ── Persist messages to localStorage ── */
  useEffect(() => {
    if (messages.length === 0) return;
    saveMessages(messages);
  }, [messages]);

  /* ── Process lead capture tags from assistant messages ── */
  const processLeadCapture = useCallback((content) => {
    const match = content.match(/\[LEAD_CAPTURE:([^\]]+)\]/);
    if (match && !leadCaptured) {
      fireLeadCapture(match[1]);
      setLeadCaptured(true);
    }
    return content.replace(/\[LEAD_CAPTURE:[^\]]+\]\n?/g, '');
  }, [leadCaptured]);

  /* ── Send message ── */
  const send = useCallback(async (overrideMsg) => {
    const msg = (overrideMsg || input).trim();
    if (!msg || sending) return;

    if (!overrideMsg) setInput('');
    const userMsg = { role: 'user', content: msg };
    setMessages(prev => [...prev, userMsg]);

    /* ── Try static response first (no tokens) ── */
    const staticReply = getStaticReply(msg);
    if (staticReply) {
      setMessages(prev => [...prev, { role: 'assistant', content: staticReply }]);
      return;
    }

    /* ── Fall through to AI — streaming SSE ── */
    setSending(true);
    try {
      const history = [...messages, userMsg].slice(-20).map(m => ({ role: m.role, content: m.content }));
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, history }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setMessages(prev => [...prev, { role: 'assistant', content: data.error || 'Something went wrong.' }]);
        return;
      }

      // Streaming response
      if (res.headers.get('content-type')?.includes('text/event-stream')) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        // Add empty streaming message
        setMessages(prev => [...prev, { role: 'assistant', content: '', streaming: true }]);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          const lines = buffer.split('\n\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            try {
              const data = JSON.parse(line.slice(6));
              if (data.type === 'delta') {
                setMessages(prev => {
                  const msgs = [...prev];
                  const last = msgs[msgs.length - 1];
                  msgs[msgs.length - 1] = { ...last, content: last.content + data.text };
                  return msgs;
                });
              }
              if (data.type === 'done') {
                setMessages(prev => {
                  const msgs = [...prev];
                  const last = msgs[msgs.length - 1];
                  const cleaned = processLeadCapture(last.content);
                  msgs[msgs.length - 1] = { ...last, content: cleaned, streaming: false };
                  return msgs;
                });
              }
              if (data.type === 'error') {
                setMessages(prev => {
                  const msgs = [...prev];
                  msgs[msgs.length - 1] = { role: 'assistant', content: data.message || 'Something went wrong.' };
                  return msgs;
                });
              }
            } catch {}
          }
        }

        // Ensure streaming flag is cleared even if no 'done' event
        setMessages(prev => {
          const msgs = [...prev];
          const last = msgs[msgs.length - 1];
          if (last?.streaming) {
            const cleaned = processLeadCapture(last.content);
            msgs[msgs.length - 1] = { ...last, content: cleaned, streaming: false };
          }
          return msgs;
        });
      } else {
        // Fallback: non-streaming JSON response
        const data = await res.json();
        const reply = processLeadCapture(data.reply || data.error || 'No response.');
        setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
      }
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${e.message}` }]);
    } finally {
      setSending(false);
    }
  }, [input, sending, messages, processLeadCapture]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const handleClose = () => {
    setOpen(false);
    // If proactive message was shown but user didn't engage, suppress future triggers
    if (messages.length <= 1 && typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('tally-chat-dismissed', '1');
    }
  };

  const clearChat = () => {
    setMessages([]);
    setLeadCaptured(false);
    localStorage.removeItem(STORAGE_KEY);
  };

  /* ── Lead form submit handler passed to markdown renderer ── */
  const handleLeadSubmit = useCallback((email) => {
    fireLeadCapture(email);
    setLeadCaptured(true);
  }, []);

  /* ── Typing indicator ── */
  const isStreaming = messages.length > 0 && messages[messages.length - 1]?.streaming;
  const showTyping = sending || (isStreaming && messages[messages.length - 1]?.content === '');

  /* ── Drawer sizing ── */
  const drawerStyle = isMobile
    ? { position: 'fixed', inset: 0, width: '100%', height: '100%', borderRadius: 0, zIndex: 100 }
    : { position: 'fixed', bottom: 86, right: 28, width: 380, maxHeight: '60vh', borderRadius: 14, zIndex: 100 };

  return (
    <>
      {/* ── FAB ── */}
      <button
        onClick={() => open ? handleClose() : setOpen(true)}
        aria-label={open ? 'Close chat' : 'Open Tally AI chat'}
        style={{
          position: 'fixed', bottom: 24, right: 28, width: 52, height: 52,
          borderRadius: '50%', background: open ? MUTED : GREEN, color: open ? WHITE : '#000',
          border: 'none', fontSize: 22, cursor: 'pointer', zIndex: 101,
          boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 0.2s',
        }}
        title="Tally AI"
      >
        {open ? '\u00d7' : '\u2726'}
      </button>

      {/* ── Drawer ── */}
      {open && (
        <div style={{
          ...drawerStyle,
          background: CARD_BG, border: `1px solid ${BORDER}`,
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{
            padding: '14px 16px', borderBottom: `1px solid ${BORDER}`,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span style={{ fontSize: 18, color: GREEN }}>&#10022;</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: WHITE }}>Tally AI</div>
              <div style={{ fontSize: 10, color: MUTED }}>Sales, support &amp; live demo</div>
            </div>
            {messages.length > 0 && (
              <button onClick={clearChat} style={{
                background: 'none', border: 'none', color: DIM, fontSize: 10,
                cursor: 'pointer', padding: '2px 6px',
              }}>Clear</button>
            )}
          </div>

          {/* Messages */}
          <div style={{
            flex: 1, overflow: 'auto', padding: '12px 14px',
            display: 'flex', flexDirection: 'column', gap: 10,
            minHeight: 200, maxHeight: isMobile ? 'calc(100vh - 130px)' : 'calc(60vh - 130px)',
          }}>
            {/* Welcome state — quick-action pills */}
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ color: MUTED, fontSize: 13, marginBottom: 14 }}>
                  Hi! I can answer questions, recommend plans, or give you a live demo of Tally commands.
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
                  {PILLS.map((p) => (
                    <button
                      key={p.label}
                      onClick={() => send(p.msg)}
                      style={{
                        background: 'transparent', border: `1px solid ${BORDER}`,
                        borderRadius: 20, padding: '7px 16px', color: GREEN_LT,
                        fontSize: 12, cursor: 'pointer', fontFamily: 'ui-monospace, monospace',
                        transition: 'border-color 0.2s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = GREEN}
                      onMouseLeave={e => e.currentTarget.style.borderColor = BORDER}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Message bubbles */}
            {messages.map((m, i) => (
              <div key={i} style={{
                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
              }}>
                <div style={{
                  background: m.role === 'user' ? 'rgba(34,197,94,0.15)' : BG,
                  border: `1px solid ${m.role === 'user' ? 'rgba(34,197,94,0.3)' : BORDER}`,
                  borderRadius: 10, padding: '8px 12px', fontSize: 13,
                  wordBreak: 'break-word', color: WHITE, lineHeight: 1.5,
                }}>
                  {m.role === 'assistant'
                    ? parseMarkdown(m.content, { onLeadSubmit: handleLeadSubmit })
                    : m.content}
                </div>
                <div style={{ fontSize: 9, color: DIM, marginTop: 2, textAlign: m.role === 'user' ? 'right' : 'left' }}>
                  {m.role === 'user' ? 'You' : 'Tally AI'}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {showTyping && (
              <div style={{
                alignSelf: 'flex-start', display: 'flex', gap: 4,
                padding: '8px 12px', background: BG, borderRadius: 10,
                border: `1px solid ${BORDER}`,
              }}>
                {[0, 1, 2].map(i => (
                  <span key={i} style={{
                    width: 6, height: 6, borderRadius: '50%', background: GREEN,
                    display: 'inline-block',
                    animation: `tallyBounce 1.4s ${i * 0.2}s infinite ease-in-out`,
                  }} />
                ))}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={{
            padding: '10px 14px', borderTop: `1px solid ${BORDER}`,
            display: 'flex', gap: 8,
          }}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about Tally, or try a command..."
              rows={1}
              style={{
                flex: 1, background: BG, border: `1px solid ${BORDER}`,
                borderRadius: 8, padding: '8px 10px', color: WHITE,
                fontSize: 13, resize: 'none', outline: 'none',
                fontFamily: 'inherit', maxHeight: 80,
              }}
            />
            <button
              onClick={() => send()}
              disabled={sending || !input.trim()}
              style={{
                background: GREEN, color: '#000', border: 'none',
                borderRadius: 8, padding: '8px 14px', fontSize: 13,
                fontWeight: 600, cursor: sending ? 'not-allowed' : 'pointer',
                opacity: (sending || !input.trim()) ? 0.5 : 1,
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}
