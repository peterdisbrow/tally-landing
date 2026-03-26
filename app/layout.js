export const metadata = {
  manifest: '/manifest.json',
  title: 'Tally | Church Streaming Auto-Recovery & Production Monitoring',
  description:
    'Your stream crashed. Tally already fixed it. Auto-recovery monitoring for church production teams. 23 integrations. Free trial.',
  metadataBase: new URL('https://tallyconnect.app'),
  keywords: [
    'church streaming software',
    'church production monitoring',
    'ATEM monitoring',
    'OBS auto recovery',
    'church livestream',
    'church tech automation',
    'worship stream recovery',
    'church AV monitoring',
    'ProPresenter remote control',
    'church volunteer tech tools',
  ],
  openGraph: {
    title: 'Tally | Church Streaming Auto-Recovery & Production Monitoring',
    description:
      'Your stream crashed. Tally already fixed it. Automatic stream recovery, production monitoring, and AI-powered control for church tech teams. 23 integrations. Free 30-day trial.',
    url: 'https://tallyconnect.app',
    siteName: 'Tally',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@tallyconnect',
    title: 'Tally | Church Streaming Auto-Recovery & Production Monitoring',
    description:
      'Your stream crashed. Tally already fixed it. Auto-recovery monitoring for church production teams. 23 integrations. Free trial.',
    images: ['https://tallyconnect.app/og-image.png'],
  },
  icons: {
    icon: '/favicon.ico',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://tallyconnect.app',
    languages: {
      'en': 'https://tallyconnect.app',
      'es-419': 'https://tallyconnect.app/es',
    },
  },
};

import Analytics from './analytics';
import SkipNav from './components/SkipNav';
import ChatWidget from './components/ChatWidget';
import CookieConsent from './components/CookieConsent';
import GlobalStyles from './components/GlobalStyles';
import PwaInit from './components/PwaInit';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
          background: '#09090B',
          color: '#F8FAFC',
          lineHeight: 1.6,
        }}
      >
        <GlobalStyles />
        <SkipNav />
        {children}
        <Analytics />
        <ChatWidget />
        <CookieConsent />
        <PwaInit />
      </body>
    </html>
  );
}
