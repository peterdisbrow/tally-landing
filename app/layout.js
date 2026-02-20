export const metadata = {
  title: 'Tally by ATEM School — Church Production Monitoring & Remote Control',
  description:
    'Monitor your ATEM, OBS, vMix, audio consoles, and stream health from anywhere. Real-time alerts, pre-service auto-check, and full remote control via Telegram.',
  metadataBase: new URL('https://tally.atemschool.com'),
  openGraph: {
    title: 'Tally by ATEM School',
    description:
      'Monitor your church production system from anywhere. ATEM, OBS, audio, slides — Tally watches everything and fixes problems before anyone notices.',
    url: 'https://tally.atemschool.com',
    siteName: 'Tally by ATEM School',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tally by ATEM School',
    description:
      'Church production monitoring & remote control. ATEM, OBS, audio, slides — all in your pocket.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

import Analytics from './analytics';

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
        {children}
        <Analytics />
      </body>
    </html>
  );
}
