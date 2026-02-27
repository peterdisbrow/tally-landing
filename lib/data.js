/* ─── Landing page data ─── */

export const FEATURES = [
  { tag: 'AUTO-RECOVERY',   name: 'Stream Goes Down — Tally Fixes It',  desc: 'Auto-recovery restarts your stream before the congregation even notices.' },
  { tag: 'ALERTS',          name: 'Slack + Telegram Alerts',            desc: 'Alert hits your TD on Slack or Telegram in seconds — with diagnosis steps and one-tap acknowledge.' },
  { tag: 'PRE-SERVICE',     name: 'Automated System Check',             desc: 'Green-light confirmation 30 min before every service. No more manual checks.' },
  { tag: 'REMOTE CONTROL',  name: 'Deep ProPresenter + ATEM Control',   desc: 'Cut cameras, advance slides, trigger looks, send stage messages, start timers — all from your phone.' },
  { tag: 'AUTOPILOT',       name: 'AI Autopilot',                       desc: 'Create rules like "when worship slides start, switch to cam 1." Tally executes automatically during service.' },
  { tag: 'TIMELINE',        name: 'Post-Service Debrief',               desc: 'Every service gets a timeline: what happened, what broke, what auto-recovered. Copy and share with your team.' },
  { tag: 'PLANNING CENTER', name: 'Planning Center Sync + Write-Back',  desc: 'Pull service times automatically. After each service, production notes push back into the plan.' },
  { tag: 'REPORTING',       name: 'Weekly Reports For Leadership',      desc: 'Uptime stats, incidents, and auto-recoveries per church. Justify the tech budget easily.' },
  { tag: 'MULTI-SITE',      name: 'Built For Multi-Campus',             desc: 'Start with one room on Connect, then scale to multi-campus in Plus, Pro, and Managed.' },
];

export const INTEGRATIONS = [
  { name: 'ATEM Switcher',       tag: 'SWITCHER'  },
  { name: 'OBS Studio',          tag: 'STREAMING' },
  { name: 'vMix',                tag: 'STREAMING' },
  { name: 'Bitfocus Companion',  tag: 'CONTROL'   },
  { name: 'ProPresenter',        tag: 'SLIDES'    },
  { name: 'Planning Center',     tag: 'SCHEDULE'  },
  { name: 'Slack',               tag: 'ALERTS'    },
  { name: 'Telegram',            tag: 'ALERTS'    },
  { name: 'Resolume Arena',      tag: 'VIDEO WALL'},
  { name: 'Allen & Heath',       tag: 'AUDIO'     },
  { name: 'Behringer X32',       tag: 'AUDIO'     },
  { name: 'Midas M32',           tag: 'AUDIO'     },
  { name: 'Yamaha CL/QL',        tag: 'AUDIO'     },
  { name: 'HyperDeck',           tag: 'RECORD'    },
  { name: 'PTZ Cameras',         tag: 'CAMERA'    },
  { name: 'Video Hub',           tag: 'ROUTER'    },
  { name: 'Dante Audio',         tag: 'AUDIO'     },
];

export const STEPS = [
  {
    num: '01',
    title: 'Install',
    desc: '10-minute setup. Run the app on your booth computer. It auto-discovers your ATEM, OBS, and Companion.',
  },
  {
    num: '02',
    title: 'Connect',
    desc: 'Your church appears live on the Tally dashboard. Every device, every status — instantly visible.',
  },
  {
    num: '03',
    title: 'Relax',
    desc: 'Tally watches your entire production. If something breaks, it fixes it first — then tells you.',
  },
];

export const PRICING = [
  {
    name: 'Connect',
    plan: 'connect',
    monthlyPrice: 49,
    annualPrice: 490,
    desc: 'Monitoring, alerts, and remote control for a single room/campus.',
    featured: false,
    cta: 'Start Free Trial →',
    ctaHref: '/signup?plan=connect',
    features: [
      '1 room/campus included',
      'ATEM, OBS, vMix monitoring',
      'Pre-service automated check',
      'Slack + Telegram alerts',
      'Telegram remote control',
      'Auto-recovery playbook',
      'Post-service incident timeline',
      'Email support',
    ],
  },
  {
    name: 'Plus',
    plan: 'plus',
    monthlyPrice: 99,
    annualPrice: 990,
    desc: 'Full integrations, live preview, and multi-campus support for growing teams.',
    featured: false,
    cta: 'Start Free Trial →',
    ctaHref: '/signup?plan=plus',
    features: [
      'Everything in Connect',
      'Up to 3 rooms/campuses',
      'All 17 device integrations',
      'Deep ProPresenter control (looks, timers, stage messages)',
      'Live video preview stream',
      'On-call TD rotation',
      'Priority email support',
    ],
  },
  {
    name: 'Pro',
    plan: 'pro',
    monthlyPrice: 149,
    annualPrice: 1490,
    desc: 'AI autopilot, Planning Center sync + write-back, and larger multi-campus coverage.',
    featured: true,
    cta: 'Start Free Trial →',
    ctaHref: '/signup?plan=pro',
    features: [
      'Everything in Plus',
      'Up to 10 rooms/campuses',
      'AI Autopilot automation rules',
      'Planning Center sync + production write-back',
      'Priority support',
    ],
  },
  {
    name: 'Managed',
    plan: 'managed',
    monthlyPrice: 299,
    annualPrice: 2990,
    desc: 'Andrew handles everything. Setup, config, and high-scale multi-campus operations.',
    featured: false,
    cta: 'Contact Andrew →',
    ctaHref: 'mailto:andrew@atemschool.com',
    features: [
      'Everything in Pro',
      'Up to 50 rooms/campuses',
      'Andrew handles setup & config',
      'Custom autopilot rules built for you',
      'Remote configuration changes',
      'Weekly system health review',
      '15-minute response SLA',
      'Direct line to Andrew',
    ],
  },
];

export const HARDWARE = [
  {
    name: 'Tally Box Standard',
    price: '$299',
    period: 'one-time',
    badge: 'HARDWARE',
    comingSoon: true,
    desc: 'Pre-configured Raspberry Pi encoder. Plug into your ATEM aux HDMI output — streams live video to Andrew automatically.',
    specs: [
      'Raspberry Pi 4 (4GB)',
      'HDMI capture input',
      'Pre-installed Tally software',
      'Tailscale VPN + SSH for remote management',
      '3Mbps H.264 monitoring stream',
      'Remote config via Tally dashboard',
    ],
    cta: 'Coming Soon',
    ctaHref: '/signup',
    featured: false,
  },
  {
    name: 'Tally Box Pro',
    price: '$799',
    period: 'one-time',
    badge: 'HARDWARE',
    comingSoon: true,
    desc: 'Intel NUC with Blackmagic capture. Supports HDMI and 3G-SDI — plugs directly into your ATEM SDI aux output.',
    specs: [
      'Intel NUC mini PC',
      'HDMI + 3G-SDI capture input',
      'Pre-installed Tally software',
      'Tailscale VPN + SSH for remote management',
      '3Mbps H.264 monitoring stream',
      'OBS, ProPresenter, audio console on same machine',
    ],
    cta: 'Coming Soon',
    ctaHref: '/signup',
    featured: true,
  },
];

export const SCROLL_DEVICES = [
  'ATEM', 'OBS', 'vMix', 'Companion', 'ProPresenter',
  'Planning Center', 'Slack', 'Telegram',
  'Resolume', 'X32', 'Allen & Heath', 'Yamaha', 'HyperDeck', 'PTZ',
];

export const NAV_LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#the-app', label: 'The App' },
  { href: '#pricing', label: 'Pricing' },
  { href: '/help', label: 'Help' },
  { href: '/signup', label: 'Get Started' },
  { href: '/signin', label: 'Sign In' },
];
