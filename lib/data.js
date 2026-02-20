/* ─── Landing page data ─── */

export const FEATURES = [
  { tag: 'AUTO-RECOVERY',   name: 'Stream Goes Down — Tally Fixes It',  desc: 'Auto-recovery restarts your stream before the congregation even notices' },
  { tag: 'ALERTS',          name: 'TD Gets Paged Instantly',            desc: 'Alert hits their phone in seconds — not after someone in the lobby complains' },
  { tag: 'PRE-SERVICE',     name: 'Automated System Check',             desc: 'Green-light confirmation 30 min before every service. No more manual checks.' },
  { tag: 'REMOTE CONTROL',  name: 'Control From Anywhere',              desc: 'Cut cameras, advance slides, mute channels — all from Telegram on your phone' },
  { tag: 'REPORTING',       name: 'Monthly Reports For Leadership',     desc: 'Uptime stats, incidents, and auto-recoveries. Justify the tech budget easily.' },
  { tag: 'MULTI-SITE',      name: 'Built For Multi-Campus',             desc: 'One dashboard for every campus. Andrew supports 20+ churches from his desk.' },
];

export const INTEGRATIONS = [
  { name: 'ATEM Switcher',       tag: 'SWITCHER'  },
  { name: 'OBS Studio',          tag: 'STREAMING' },
  { name: 'vMix',                tag: 'STREAMING' },
  { name: 'Bitfocus Companion',  tag: 'CONTROL'   },
  { name: 'ProPresenter',        tag: 'SLIDES'    },
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
    price: '$49',
    period: '/mo',
    desc: 'Monitoring, alerts, and remote control for one church.',
    featured: false,
    cta: 'Get Early Access →',
    ctaHref: '#early-access',
    features: [
      'ATEM, OBS, Companion monitoring',
      'Pre-service automated check',
      'Stream health + audio silence alerts',
      'Telegram remote control',
      'Auto-recovery playbook',
      'Email support',
    ],
  },
  {
    name: 'Pro',
    price: '$149',
    period: '/mo',
    desc: 'All 14 integrations, Planning Center sync, live preview stream.',
    featured: true,
    cta: 'Get Early Access →',
    ctaHref: '#early-access',
    features: [
      'Everything in Connect',
      'All 14 device integrations',
      'Live video preview stream',
      'Planning Center schedule sync',
      'On-call TD rotation',
      'Monthly health report PDF',
      'Priority support',
    ],
  },
  {
    name: 'Managed',
    price: '$299',
    period: '/mo',
    desc: 'Andrew handles everything. Setup, config, 15-min SLA.',
    featured: false,
    cta: 'Contact Andrew →',
    ctaHref: 'mailto:andrew@atemschool.com',
    features: [
      'Everything in Pro',
      'Andrew handles setup & config',
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
    desc: 'Pre-configured Raspberry Pi encoder. Plug into your ATEM aux HDMI output — streams live video to Andrew automatically.',
    specs: [
      'Raspberry Pi 4 (4GB)',
      'HDMI capture input',
      'Pre-installed Tally software',
      'Tailscale VPN + SSH for remote management',
      '3Mbps H.264 monitoring stream',
      'Remote config via Tally dashboard',
    ],
    cta: 'Add to subscription →',
    ctaHref: '#early-access',
    featured: false,
  },
  {
    name: 'Tally Box Pro',
    price: '$799',
    period: 'one-time',
    badge: 'HARDWARE',
    desc: 'Intel NUC with Blackmagic capture. Supports HDMI and 3G-SDI — plugs directly into your ATEM SDI aux output.',
    specs: [
      'Intel NUC mini PC',
      'HDMI + 3G-SDI capture input',
      'Pre-installed Tally software',
      'Tailscale VPN + SSH for remote management',
      '3Mbps H.264 monitoring stream',
      'OBS, ProPresenter, audio console on same machine',
    ],
    cta: 'Contact Andrew →',
    ctaHref: 'mailto:andrew@atemschool.com',
    featured: true,
  },
];

export const SCROLL_DEVICES = [
  'ATEM', 'OBS', 'vMix', 'Companion', 'ProPresenter',
  'Resolume', 'X32', 'Allen & Heath', 'Yamaha', 'HyperDeck', 'PTZ',
];

export const NAV_LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#the-app', label: 'The App' },
  { href: '#pricing', label: 'Pricing' },
  { href: '/signin', label: 'Sign In' },
];
