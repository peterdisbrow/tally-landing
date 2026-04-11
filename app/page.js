import { BG, WHITE } from '../lib/tokens';
import Nav from './components/Nav';
import Hero from './components/Hero';
import Problem from './components/Problem';
import Features from './components/Features';
import IncidentTimeline from './components/IncidentTimeline';
import AppShowcase from './components/AppShowcase';
import BoldStatement from './components/BoldStatement';
import RundownShowcase from './components/RundownShowcase';
import Integrations from './components/Integrations';
import HowItWorks from './components/HowItWorks';
import Pricing from './components/Pricing';
import ROICalculator from './components/ROICalculator';
import Hardware from './components/Hardware';
import FounderQuote from './components/FounderQuote';
import Testimonials from './components/Testimonials';
import FAQ from './components/FAQ';
import Footer from './components/Footer';
import StickyCTA from './components/StickyCTA';

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'Tally',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'macOS, Windows',
      description: 'Church production monitoring, rundown planning, AI control, and auto-recovery. Full service rundown planner with live show mode, 7 output views, and collaborative editing. Monitor ATEM, OBS, vMix, audio consoles, encoders, and stream health from anywhere. 23 integrations.',
      url: 'https://tallyconnect.app',
      offers: {
        '@type': 'AggregateOffer',
        lowPrice: '49',  // Founding Church Rate (monthly). Free trial available but no free tier.
        highPrice: '499',
        priceCurrency: 'USD',
        offerCount: 4,
      },
    },
    {
      '@type': 'Organization',
      name: 'Tally',
      url: 'https://tallyconnect.app',
      logo: 'https://tallyconnect.app/icon.svg',
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What equipment does Tally work with?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'ATEM switchers, OBS Studio, vMix, Ecamm Live, ProPresenter, Bitfocus Companion, audio consoles (Behringer X32, Midas M32, Allen & Heath, Yamaha CL/QL), HyperDeck recorders, PTZ cameras, Resolume Arena, Video Hub routers, Dante audio, hardware encoders (Blackmagic, Teradek, YoloBox, Epiphan, AJA HELO), Planning Center, Slack, Telegram, YouTube Live, Facebook Live, and Vimeo Live. 26 integrations and counting.',
          },
        },
        {
          '@type': 'Question',
          name: 'What happens if our internet goes down?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: "Tally can't monitor remotely without internet, but it detects the disconnection immediately and alerts your TD. Your production gear still works normally — Tally is a monitoring layer, not a dependency. Nothing breaks if Tally goes offline.",
          },
        },
        {
          '@type': 'Question',
          name: 'How long does setup take?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'About 10 minutes. Download the app on your booth computer, sign in with your registration code, and Tally auto-discovers your ATEM, OBS, and other gear on the network. No port forwarding, no complex configuration.',
          },
        },
        {
          '@type': 'Question',
          name: 'What if our stream drops during service?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: "Tally detects it in seconds, verifies it's a real outage (not a momentary blip), and auto-restarts your stream. Most recoveries happen before anyone in the congregation notices. You get a Telegram or Slack alert that says \"handled.\"",
          },
        },
        {
          '@type': 'Question',
          name: 'What is the Rundown Planner?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'A full service planning and live show control tool built into Tally. Build rundowns with drag-and-drop, set hard start times, and go live with cue-by-cue GO/Back navigation. It includes 7 output views — confidence monitor, studio clock, teleprompter, speaker timer, public view, show control, and post-show report — all shareable via link with no login required. Multiple team members can edit simultaneously with real-time presence indicators. You can import existing service plans from PDF, Word, or PowerPoint using AI, or save and reuse templates. Included in all plans.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can volunteers run this?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: "That's the whole point. Tally handles troubleshooting automatically so volunteers can focus on the creative side — camera work, slides, audio levels. Guest TD tokens give temporary access that auto-expires, so volunteers get exactly the access they need.",
          },
        },
        {
          '@type': 'Question',
          name: 'What happens when my trial ends?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Monitoring and auto-recovery stop, but your data and settings are preserved for 30 days. Subscribe anytime to pick up right where you left off — no re-setup needed.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I cancel anytime?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. No contracts, no cancellation fees. Cancel from your Church Portal whenever you want. Your gear keeps working exactly as it did before Tally.',
          },
        },
        {
          '@type': 'Question',
          name: 'How do we justify this cost to leadership?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'One prevented streaming outage during a Sunday service pays for Tally for an entire year. Many churches also spend $200–500 per service paying experienced techs to be on-call "just in case." Tally replaces that safety net at a fraction of the cost — 24/7 monitoring, automatic recovery, and instant alerts so volunteers can run production confidently.',
          },
        },
      ],
    },
  ],
};

export default function Home() {
  return (
    <div style={{ background: BG, color: WHITE, fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif", overflowX: 'hidden' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Nav />
      <StickyCTA />
      <main id="main-content">
      <Hero />
      <div id="problem"><Problem /></div>
      <div id="features"><Features /></div>
      <div id="timeline"><IncidentTimeline /></div>
      <AppShowcase />
      <div id="rundown"><RundownShowcase /></div>
      <BoldStatement />
      <Integrations />
      <HowItWorks />
      <ROICalculator />
      <Pricing />
      <div id="hardware"><Hardware /></div>
      <FounderQuote />
      <Testimonials />
      <FAQ />
      </main>
      <Footer />
    </div>
  );
}
