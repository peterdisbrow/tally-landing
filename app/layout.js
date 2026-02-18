export const metadata = {
  title: 'Tally by ATEM School — Remote Church Production Monitoring',
  description: 'Monitor your ATEM, cameras, and stream health from anywhere. Get alerts before your congregation notices something\'s wrong.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif", color: '#1a1a2e', lineHeight: 1.6 }}>
        {children}
      </body>
    </html>
  );
}
