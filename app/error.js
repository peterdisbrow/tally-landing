'use client';

export default function Error({ error, reset }) {
  return (
    <main style={{ minHeight: '100vh', background: '#09090B', color: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ textAlign: 'center', maxWidth: 480, padding: '0 24px' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>Something went wrong</div>
        <p style={{ color: '#94A3B8', fontSize: 16, lineHeight: 1.6, marginBottom: 32 }}>
          An unexpected error occurred. Please try again or contact support if the issue persists.
        </p>
        <button
          onClick={() => reset()}
          style={{ padding: '12px 32px', background: '#22c55e', color: '#000', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}
        >
          Try Again
        </button>
      </div>
    </main>
  );
}
