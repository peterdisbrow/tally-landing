import { BG, WHITE } from '../lib/tokens';
import GlobalStyles from './components/GlobalStyles';
import Nav from './components/Nav';
import Hero from './components/Hero';
import Problem from './components/Problem';
import Features from './components/Features';
import AppShowcase from './components/AppShowcase';
import BoldStatement from './components/BoldStatement';
import Integrations from './components/Integrations';
import HowItWorks from './components/HowItWorks';
import Pricing from './components/Pricing';
import Hardware from './components/Hardware';
import FounderQuote from './components/FounderQuote';
import Testimonials from './components/Testimonials';
import FAQ from './components/FAQ';
import Footer from './components/Footer';

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'Tally',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'macOS, Windows',
      description: 'Church production monitoring, AI control, and auto-recovery. Monitor ATEM, OBS, vMix, audio consoles, encoders, and stream health from anywhere. 23 integrations.',
      url: 'https://tallyconnect.app',
      offers: {
        '@type': 'AggregateOffer',
        lowPrice: '0',
        highPrice: '499',
        priceCurrency: 'USD',
        offerCount: 5,
      },
    },
    {
      '@type': 'Organization',
      name: 'Tally',
      url: 'https://tallyconnect.app',
      logo: 'https://tallyconnect.app/icon.svg',
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
      <GlobalStyles />
      <Nav />
      <main id="main-content">
      <Hero />
      <Problem />
      <Features />
      <AppShowcase />
      <BoldStatement />
      <Integrations />
      <HowItWorks />
      <Pricing />
      <Hardware />
      <FounderQuote />
      <Testimonials />
      <FAQ />
      </main>
      <Footer />
    </div>
  );
}
