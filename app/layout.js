export const metadata = {
  title: 'Tally by ATEM School — Church Production Monitoring & Remote Control',
  description: 'Monitor your ATEM, OBS, vMix, audio consoles, and stream health from anywhere. Real-time alerts, pre-service auto-check, and full remote control via Telegram — so Sunday mornings don\'t require you to be everywhere.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif", background: '#0f172a', color: '#e2e8f0', lineHeight: 1.6 }}>
        {children}
      </body>
    </html>
  );
}
