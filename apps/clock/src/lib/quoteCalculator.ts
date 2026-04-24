export interface QuoteData {
  serviceType: string;
  cameras: number;
  streaming: boolean;
  streamingPlatform: string;
  recordingFormat: string;
  extras: string[];
  duration: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
  budgetRange: string;
  name: string;
  email: string;
  phone: string;
  company: string;
}

export const defaultQuoteData: QuoteData = {
  serviceType: "",
  cameras: 1,
  streaming: false,
  streamingPlatform: "",
  recordingFormat: "HD",
  extras: [],
  duration: "",
  startDate: undefined,
  endDate: undefined,
  budgetRange: "",
  name: "",
  email: "",
  phone: "",
  company: "",
};

const SERVICE_BASE: Record<string, number> = {
  "live-production": 5000,
  "post-production": 3000,
  "system-integration": 8000,
  consulting: 2000,
  "multi-camera": 6000,
  "streaming-webcasting": 4000,
};

const DURATION_MULTIPLIER: Record<string, number> = {
  "half-day": 0.6,
  "full-day": 1,
  "multi-day": 2.5,
  ongoing: 4,
};

const FORMAT_ADD: Record<string, number> = {
  HD: 0,
  "4K": 1500,
  "8K": 4000,
};

const EXTRA_ADD: Record<string, number> = {
  graphics: 1200,
  replay: 1500,
  "audio-mixing": 1000,
  teleprompter: 800,
  lighting: 1000,
  "led-wall": 3000,
};

export function calculateEstimate(data: QuoteData): { low: number; high: number } {
  const base = SERVICE_BASE[data.serviceType] || 3000;
  const cameraCost = data.cameras * 800;
  const durationMult = DURATION_MULTIPLIER[data.duration] || 1;
  const formatAdd = FORMAT_ADD[data.recordingFormat] || 0;
  const streamingAdd = data.streaming ? 2000 : 0;
  const extrasAdd = data.extras.reduce((sum, e) => sum + (EXTRA_ADD[e] || 0), 0);

  const total = (base + cameraCost + formatAdd + streamingAdd + extrasAdd) * durationMult;
  const low = Math.round(total * 0.85 / 100) * 100;
  const high = Math.round(total * 1.25 / 100) * 100;

  return { low, high };
}

export const SERVICE_OPTIONS = [
  { value: "live-production", label: "Live Production", description: "Full-service live event production with switching and direction" },
  { value: "post-production", label: "Post-Production", description: "Editing, color grading, and finishing for broadcast content" },
  { value: "system-integration", label: "System Integration", description: "Design and install broadcast infrastructure and control rooms" },
  { value: "consulting", label: "Consulting", description: "Technical consulting for broadcast workflows and system design" },
  { value: "multi-camera", label: "Multi-Camera Event", description: "Multi-camera capture for conferences, concerts, and ceremonies" },
  { value: "streaming-webcasting", label: "Streaming / Webcasting", description: "Live streaming to platforms with encoding and CDN management" },
];

export const DURATION_OPTIONS = [
  { value: "half-day", label: "Half Day" },
  { value: "full-day", label: "Full Day" },
  { value: "multi-day", label: "Multi-Day" },
  { value: "ongoing", label: "Ongoing" },
];

export const FORMAT_OPTIONS = [
  { value: "HD", label: "HD (1080p)" },
  { value: "4K", label: "4K (UHD)" },
  { value: "8K", label: "8K" },
];

export const EXTRAS_OPTIONS = [
  { value: "graphics", label: "Graphics / Lower Thirds" },
  { value: "replay", label: "Instant Replay" },
  { value: "audio-mixing", label: "Audio Mixing" },
  { value: "teleprompter", label: "Teleprompter" },
  { value: "lighting", label: "Lighting Package" },
  { value: "led-wall", label: "LED Wall / Display" },
];

export const BUDGET_OPTIONS = [
  { value: "under-5k", label: "Under $5,000" },
  { value: "5k-15k", label: "$5,000 – $15,000" },
  { value: "15k-50k", label: "$15,000 – $50,000" },
  { value: "50k-plus", label: "$50,000+" },
  { value: "not-sure", label: "Not sure yet" },
];
