'use client';

import { useEffect } from 'react';

const RELAY_URL = process.env.NEXT_PUBLIC_RELAY_URL || 'https://tally-production-cde2.up.railway.app';

export default function SignInPage() {
  useEffect(() => {
    window.location.href = `${RELAY_URL}/church-login`;
  }, []);

  return (
    <main style={{ minHeight: '100vh', background: '#09090B', color: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#94A3B8' }}>Redirecting to sign in&hellip;</p>
    </main>
  );
}
