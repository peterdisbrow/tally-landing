'use client';

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
import EarlyAccessForm from './components/EarlyAccessForm';
import Footer from './components/Footer';

export default function Home() {
  return (
    <div style={{ background: BG, color: WHITE, fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif", overflowX: 'hidden' }}>
      <GlobalStyles />
      <Nav />
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
      <EarlyAccessForm />
      <Footer />
    </div>
  );
}
