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

/* ─── Multistep Sunday Service Simulation ─── */
const DEMO_STAGES = [
  // Stage 0: Pre-service check
  {
    messages: [
      { content: '**Live demo!** You\'re connected to a simulated booth. Let\'s get your Sunday stream up and running.\n\nFirst \u2014 automated pre-service check...' },
      { content: '```tally-output\n\u2713 ATEM Mini Extreme \u2014 connected, Program: Color Bars\n\u2713 OBS Studio \u2014 connected, scene "Main Camera"\n\u2713 X32 Audio \u2014 online, scene "Sunday AM"\n\u2713 ProPresenter \u2014 connected, playlist "Sunday Morning"\n\u2713 YouTube stream key \u2014 verified\n\u2713 All 6 devices healthy\n\nPRE-SERVICE CHECK: ALL CLEAR \u2713\n```\n\nAll green. Right now Color Bars are in program \u2014 let\'s fix that before we go live.' },
    ],
    waitForInput: false,
    nextLabel: 'Get the stream ready \u2192',
  },
  // Stage 1: Put logo in program
  {
    messages: [
      { content: 'Let\'s put your church logo on screen so viewers see branding when they tune in.\n\nType: **"set program to media player 1"**' },
    ],
    waitForInput: true,
  },
  // Stage 2: Logo response + start stream
  {
    messages: [
      { content: '```tally-output\nATEM > Program: Media Player 1 \u2014 Church Logo\nATEM > Transition: Cut complete\nStatus: OFFLINE \u25CB Ready to stream\n```\n\nLogo\'s up. Now let\'s go live.' },
      { content: 'Time to start the stream to YouTube.\n\nType: **"start stream"**' },
    ],
    waitForInput: true,
  },
  // Stage 3: Stream started + start recording
  {
    messages: [
      { content: '```tally-output\nOBS > Stream started \u2192 YouTube Live\nOBS > Bitrate: 6000 kbps \u00B7 1080p30\nOBS > YouTube status: LIVE \u25CF\nSlack > #production \u2014 "Stream is live on YouTube"\nStatus: LIVE \u25CF 1080p30 \u00B7 6.0 Mbps \u00B7 0 dropped\n```\n\nYou\'re live! Don\'t forget to hit record \u2014 you\'ll want the local backup.' },
      { content: 'Type: **"start recording"**' },
    ],
    waitForInput: true,
  },
  // Stage 4: Recording started + stream failure + auto-recovery
  {
    messages: [
      { content: '```tally-output\nOBS > Recording started \u2192 /recordings/2026-03-02_sunday.mkv\nHyperDeck > Recording started \u2192 Slot 1, SSD 847 GB free\nStatus: LIVE \u25CF Recording \u25CF 1080p30 \u00B7 6.0 Mbps\n```\n\nStream and recording both running. Service is underway...' },
      { content: '15 minutes in \u2014 the stream just dropped. This is where Tally shines.\n\nWatch what happens...' },
      { content: '```tally-output\n\u26A0 ALERT: Stream dropped \u2014 encoder offline\n  Detecting... YouTube RTMP connection lost\n\nVerifying — is this a real outage?\n  \u2713 OBS encoder: responding (not crashed)\n  \u2713 Network: upstream OK, 48 Mbps\n  \u2713 YouTube ingest: reachable\n  \u2717 RTMP session: timed out (confirmed)\n  Verdict: connection drop, not a device failure\n\nAuto-Recovery activated (rule: restart on RTMP timeout):\n  Step 1: Closing stale RTMP session...\n  Step 2: Re-authenticating stream key...\n  Step 3: Opening new connection...\n  Step 4: Confirming upstream healthy...\n\n\u2713 Stream restored in 8.2 seconds\n\u2713 Slack alert: "#production \u2014 Stream auto-recovered (RTMP timeout)"\n\u2713 Recording continued uninterrupted\n\u2713 Viewers saw a 3-second buffer\n```\n\n**Tally verified the failure before acting** \u2014 no false restarts. The recovery rule is configurable: auto-recover, notify-only, or ask-first. Recording never stopped.' },
    ],
    waitForInput: false,
    nextLabel: 'See the debrief \u2192',
  },
  // Stage 5: Post-service debrief + CTA
  {
    messages: [
      { content: 'Service complete! Here\'s your automatic debrief:' },
      { content: '```tally-output\nSESSION DEBRIEF \u2014 Sunday Morning\n\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\nDuration: 1h 23m\nDevices: 6/6 healthy\nStream: 1h 22m uptime (99.8%)\nRecording: 1h 23m (local + HyperDeck)\nIncidents: 1 (RTMP timeout \u2192 auto-recovered in 8.2s)\nFalse alarms suppressed: 2 (brief packet loss, ignored)\nPeak viewers: 847\n\n\u2192 Full report pushed to Planning Center\n```' },
      { content: 'That\'s Tally \u2014 one command to go live, smart recovery that verifies before it acts, and a full debrief after every service. No false restarts.\n\n**Ready to try it with your gear?**\n\n[CTA:Get Started Free:/signup]\n[CTA:See Pricing:#pricing]' },
    ],
    waitForInput: false,
    nextLabel: null, // no continue — demo ends
  },
];

/* ─── Static responses — no AI tokens needed ─── */

function buildPricingResponse() {
  const lines = PRICING.map(p => `**${p.name}** — $${p.monthlyPrice}/mo · ${p.desc}`);
  return `${lines.join('\n')}\n\nAll plans include **30 days free** — no credit card.\n\n[CTA:Get Started Free:/signup]\n\nHow many rooms are you running? I can narrow it down.`;
}

function buildFeaturesResponse() {
  const top = FEATURES.slice(0, 5).map(f => `• **${f.name}** — ${f.desc}`);
  return `Top features:\n\n${top.join('\n')}\n\nWant details on any of these, or ask about something specific?`;
}

function buildIntegrationsResponse() {
  const byTag = {};
  INTEGRATIONS.forEach(i => {
    if (!byTag[i.tag]) byTag[i.tag] = [];
    byTag[i.tag].push(i.name);
  });
  const lines = Object.entries(byTag).map(([tag, names]) => `**${tag}**: ${names.join(', ')}`);
  return `${INTEGRATIONS.length} integrations:\n\n${lines.join('\n')}\n\nTell me what gear you run — I'll confirm compatibility.`;
}

function buildSetupResponse() {
  return `Setup takes **10 minutes**:\n\n1. Download the app (macOS or Windows)\n2. Sign in with your code\n3. Tally auto-discovers your gear on the network\n\nNo port forwarding. Works behind firewalls. Runs on your existing booth computer.\n\n[CTA:Get Started Free:/signup]`;
}

function buildTrialResponse() {
  return `**Free for 30 days** — no credit card, full access, cancel anytime. You pick a plan later.\n\n[CTA:Get Started Free:/signup]\n\nTell me about your setup and I'll help you get the most out of it.`;
}

function buildSupportResponse() {
  return `• **Support**: support@atemschool.com\n• **Sales**: sales@atemschool.com\n• **Guides**: tallyconnect.app → Guides\n\nOr just ask me here — I can help with most questions!`;
}

function buildWhatIsTallyResponse() {
  return `**Tally** monitors every device in your church booth — ATEM, OBS, audio, encoders, ProPresenter — and fixes problems before anyone notices.\n\n• **Auto-recovery** — restarts your stream in under 10 seconds\n• **AI commands** — type "cut to camera 2" in plain English\n• **Remote control** — from your phone or Telegram\n\n10-minute setup. Runs on your existing computer.\n\n[CTA:Get Started Free:/signup]\n\nWant to see pricing or try a live demo?`;
}

function buildAutoRecoveryResponse() {
  return `**Auto-Recovery** detects a dropped stream and restarts it in under **10 seconds** — usually before anyone notices.\n\nTally **verifies before it acts** — checks your encoder, network, and platform ingest to confirm it's a real outage, not a brief blip. No false restarts.\n\nRecovery is configurable per church: auto-recover, notify-only, or ask-first. Max retry limits prevent loops.\n\nWorks with OBS, vMix, Ecamm, and hardware encoders. Included on all plans.\n\nWant to see it in action? Try the live demo!`;
}

function buildFalseTriggersResponse() {
  return `**Tally never blindly restarts.** Before any recovery action, it verifies:\n\n• Encoder responding? (not a crash — just a connection drop)\n• Network upstream OK? (rules out local outage)\n• Platform ingest reachable? (YouTube/Facebook still accepting)\n• RTMP session state (timeout confirmed, not a momentary blip)\n\nOnly when diagnosis confirms a real failure does recovery kick in. Brief packet loss and transient dips are **ignored and logged** — you'll see them in your debrief as "suppressed false alarms."\n\nRecovery rules are **configurable per church**: auto-recover, notify-only, or ask-first. Max attempt limits prevent infinite loops. Hardware failures (ATEM disconnect, mixer offline) go straight to your TD — Tally won't try to power-cycle your gear.\n\n[CTA:Get Started Free:/signup]\n\nWant to see it in the demo?`;
}

function buildAlertsResponse() {
  return `Tally sends **Slack + Telegram alerts** with diagnosis steps — not just "something broke" but what to do.\n\n• One-tap acknowledge from your phone\n• 90-second escalation if nobody responds\n• Customizable per event type\n\nIncluded on all plans. Want to hear about on-call TD rotation?`;
}

function buildAtemResponse() {
  return `**Every ATEM model** is supported — Mini to Constellation.\n\nCut, dissolve, fade to black, run macros, control DSK/USK, route aux — all from your phone via Telegram.\n\nThe AI understands plain English: just type "dissolve to camera 3."\n\nWant to try it? Type "cut to camera 2" for a live demo!`;
}

function buildProPresenterResponse() {
  return `**Full ProPresenter control** — slides, looks, timers, stage messages, playlists. All via natural language.\n\nExample: "next slide", "start 5-minute countdown", "send stage message: 2 minutes left."\n\nAvailable on **Plus** ($99/mo) and above.\n\n[CTA:Get Started Free:/signup]\n\nWant to try ProPresenter commands in the demo?`;
}

function buildAudioResponse() {
  return `Supported: **X32, M32, Allen & Heath SQ/dLive, Yamaha CL/QL/TF, Dante.**\n\nMute/unmute, set faders, recall scenes — all from your phone. AI understands "mute channel 3" or "unmute pastor lav."\n\nWant to try audio commands in the demo?`;
}

function buildInternetResponse() {
  return `**Your gear keeps running normally** — Tally is a monitoring layer, not a dependency. No audio or video goes through the internet.\n\nIf internet drops, Tally reconnects automatically when it's back. Nothing is lost.\n\nFeel better? Want to hear about setup?`;
}

function buildSystemRequirementsResponse() {
  return `Runs on your **existing booth computer** — no dedicated hardware needed.\n\n• macOS 11+ or Windows 10+\n• Uses ~200MB RAM\n• Same network as your devices\n\nLightweight monitoring — won't affect OBS or vMix performance.\n\n[CTA:Get Started Free:/signup]`;
}

function buildVolunteerResponse() {
  return `**Built for volunteer teams.** Auto-recovery handles problems, AI commands use plain English, and alerts tell people *what to do* — not just that something broke.\n\nGuest TD tokens auto-expire in 7 days. On-call rotation ensures the right person gets pinged.\n\n[CTA:Get Started Free:/signup]\n\nWant to see pricing or try the demo?`;
}

function buildMultiSiteResponse() {
  const plans = PRICING.filter(p => p.features.some(f => /room/i.test(f)));
  const lines = plans.map(p => {
    const roomFeature = p.features.find(f => /room/i.test(f));
    return `• **${p.name}** ($${p.monthlyPrice}/mo) — ${roomFeature}`;
  });
  return `Multi-room ready:\n\n${lines.join('\n')}\n\nOne dashboard, all rooms at a glance. How many rooms are you running?`;
}

function buildPlanningCenterResponse() {
  return `**Bi-directional Planning Center sync.** Service times pull in automatically, production notes push back after each service.\n\nAvailable on **Pro** ($149/mo) and above.\n\n[CTA:Get Started Free:/signup]\n\nAlready using Planning Center? Tell me about your setup.`;
}

function buildAutopilotResponse() {
  return `**AI Autopilot** — create rules like "when worship slides start → switch to camera 1" and Tally executes automatically.\n\n• **Pro** ($149/mo) — 10 rules\n• **Enterprise** ($499/mo) — 25 rules\n\n[CTA:Get Started Free:/signup]\n\nWant to hear about a specific use case?`;
}

function buildRecommendPlanResponse() {
  return `Quick guide:\n\n• **1 room, basic** → Connect $49/mo\n• **2-3 rooms, AI features** → Plus $99/mo\n• **Multi-room, automation** → Pro $149/mo *(most popular)*\n• **Multi-site** → Enterprise $499/mo\n• **One-time event** → Event $99\n\nAll include **30 days free**.\n\n[CTA:Get Started Free:/signup]\n\nTell me about your setup — I'll narrow it down!`;
}

function buildSecurityResponse() {
  return `Video and audio **never leave your network**. Tally runs locally — remote access uses encrypted tunnels, no port forwarding.\n\nEach church gets an isolated dashboard. Guest tokens auto-expire. All comms over HTTPS/TLS.\n\nQuestions about a specific concern?`;
}

function buildEventResponse() {
  return `**Tally Event** — **$99 one-time** for 72 hours of full monitoring. Perfect for Easter, conferences, weddings.\n\nAll integrations, auto-recovery, alerts, and a post-event report.\n\n[CTA:Get Event Pass:/signup?plan=event]\n\nTell me about your event!`;
}

function buildDemoIntro() {
  return '__DEMO_START__';
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
  { match: (m) => /\bfalse.*(trigger|positive|alarm|restart)|\baccident.*(restart|recover)|\bwrong.*(restart|recover)|\bunnecessar.*(restart|recover)|\bblind.*(restart|recover)|\breliab/i.test(m), reply: buildFalseTriggersResponse },
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
  const [demoStage, setDemoStage] = useState(null);
  const [hidden, setHidden]     = useState(false);
  const demoAdvancing = useRef(false);
  const messagesEndRef = useRef(null);
  const visibleSectionRef = useRef('default');

  /* ── Hide on admin/portal/signin/signup pages (they have their own chat) ── */
  useEffect(() => {
    const path = window.location.pathname;
    setHidden(path.startsWith('/admin') || path.startsWith('/portal') || path.startsWith('/signin') || path.startsWith('/signup'));
  }, []);

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

  /* ── Demo: fake-stream a single message ── */
  const fakeStream = useCallback(async (text) => {
    setMessages(prev => [...prev, { role: 'assistant', content: '', streaming: true }]);
    const words = text.split(/(\s+)/);
    let revealed = '';
    const chunkSize = 3;
    for (let i = 0; i < words.length; i += chunkSize) {
      revealed += words.slice(i, i + chunkSize).join('');
      const snapshot = revealed;
      await new Promise(r => setTimeout(r, 18 + Math.random() * 12));
      setMessages(prev => {
        const msgs = [...prev];
        msgs[msgs.length - 1] = { role: 'assistant', content: snapshot, streaming: true };
        return msgs;
      });
    }
    // finalize
    setMessages(prev => {
      const msgs = [...prev];
      msgs[msgs.length - 1] = { role: 'assistant', content: text };
      return msgs;
    });
  }, []);

  /* ── Demo: play a full stage ── */
  const playDemoStage = useCallback(async (stageIndex) => {
    if (stageIndex >= DEMO_STAGES.length) {
      // Demo complete — exit demo mode
      setDemoStage(null);
      demoAdvancing.current = false;
      return;
    }
    demoAdvancing.current = true;
    setDemoStage(stageIndex);
    const stage = DEMO_STAGES[stageIndex];

    for (let i = 0; i < stage.messages.length; i++) {
      if (i > 0) await new Promise(r => setTimeout(r, 800));
      await fakeStream(stage.messages[i].content);
    }

    demoAdvancing.current = false;
  }, [fakeStream]);

  /* ── Demo: advance to next stage (called by Continue button) ── */
  const advanceDemo = useCallback(() => {
    if (demoAdvancing.current) return;
    playDemoStage((demoStage ?? -1) + 1);
  }, [demoStage, playDemoStage]);

  /* ── Demo: skip demo entirely ── */
  const skipDemo = useCallback(() => {
    setDemoStage(null);
    demoAdvancing.current = false;
    setMessages(prev => [...prev, { role: 'assistant', content: 'Demo skipped. Ask me anything about Tally!' }]);
    setSending(false);
  }, []);

  /* ── Send message ── */
  const send = useCallback(async (overrideMsg) => {
    const msg = (overrideMsg || input).trim();
    if (!msg || sending) return;

    if (!overrideMsg) setInput('');
    const userMsg = { role: 'user', content: msg };
    setMessages(prev => [...prev, userMsg]);

    /* ── If in demo mode, any user input advances to next stage ── */
    if (demoStage !== null && !demoAdvancing.current) {
      setSending(true);
      const nextStage = demoStage + 1;
      if (nextStage >= DEMO_STAGES.length) {
        setDemoStage(null);
        demoAdvancing.current = false;
        setSending(false);
      } else {
        await playDemoStage(nextStage);
        setSending(false);
      }
      return;
    }

    /* ── Try static response first (no tokens) ── */
    const staticReply = getStaticReply(msg);
    if (staticReply) {
      /* Demo sentinel — enter multistep demo mode */
      if (staticReply === '__DEMO_START__') {
        setSending(true);
        await playDemoStage(0);
        setSending(false);
        return;
      }
      setSending(true);
      await fakeStream(staticReply);
      // process lead capture on finalized message
      setMessages(prev => {
        const msgs = [...prev];
        const last = msgs[msgs.length - 1];
        const cleaned = processLeadCapture(last.content);
        msgs[msgs.length - 1] = { role: 'assistant', content: cleaned };
        return msgs;
      });
      setSending(false);
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
  }, [input, sending, messages, processLeadCapture, demoStage, playDemoStage, fakeStream]);

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
    setDemoStage(null);
    demoAdvancing.current = false;
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

  /* ── Demo continue button state ── */
  const currentDemoStage = demoStage !== null ? DEMO_STAGES[demoStage] : null;
  const showDemoContinue = demoStage !== null && !sending && currentDemoStage && !currentDemoStage.waitForInput && currentDemoStage.nextLabel !== null;

  /* ── Drawer sizing ── */
  const drawerStyle = isMobile
    ? { position: 'fixed', inset: 0, width: '100%', height: '100%', borderRadius: 0, zIndex: 100 }
    : { position: 'fixed', bottom: 86, right: 28, width: 380, maxHeight: '60vh', borderRadius: 14, zIndex: 100 };

  if (hidden) return null;

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

            {/* Demo: Continue button */}
            {showDemoContinue && (
              <div style={{ alignSelf: 'flex-start', marginTop: 4 }}>
                <button
                  onClick={advanceDemo}
                  style={{
                    background: 'transparent', border: `1px solid ${GREEN}`,
                    borderRadius: 20, padding: '7px 18px', color: GREEN_LT,
                    fontSize: 12, cursor: 'pointer', fontFamily: 'ui-monospace, monospace',
                    transition: 'background 0.2s, border-color 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(34,197,94,0.1)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                >
                  {currentDemoStage.nextLabel || 'Continue \u2192'}
                </button>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={{
            padding: '10px 14px', borderTop: `1px solid ${BORDER}`,
            display: 'flex', flexDirection: 'column', gap: 6,
          }}>
            {demoStage !== null && (
              <button onClick={skipDemo} style={{
                background: 'none', border: 'none', color: DIM, fontSize: 10,
                cursor: 'pointer', padding: 0, alignSelf: 'flex-end',
                textDecoration: 'underline',
              }}>Skip demo</button>
            )}
            <div style={{ display: 'flex', gap: 8 }}>
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={demoStage !== null && currentDemoStage?.waitForInput ? 'Type the command above...' : 'Ask about Tally, or try a command...'}
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
        </div>
      )}
    </>
  );
}
