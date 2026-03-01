import Link from 'next/link';

export const metadata = {
  title: 'Page Not Found — Tally',
};

export default function NotFound() {
  return (
    <main style={{ minHeight: '100vh', background: '#09090B', color: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ textAlign: 'center', maxWidth: 480, padding: '0 24px' }}>
        <div style={{ fontSize: 72, fontWeight: 700, color: '#22c55e', marginBottom: 8 }}>404</div>
        <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 12 }}>Page not found</h1>
        <p style={{ color: '#94A3B8', fontSize: 16, lineHeight: 1.6, marginBottom: 32 }}>
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link href="/" style={{ display: 'inline-block', padding: '12px 32px', background: '#22c55e', color: '#000', borderRadius: 8, fontSize: 15, fontWeight: 600, textDecoration: 'none' }}>
          Back to Home
        </Link>
      </div>
    </main>
  );
}
