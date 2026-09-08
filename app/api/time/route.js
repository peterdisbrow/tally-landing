import { NextResponse } from 'next/server';

/**
 * Same-origin time for the Production Clock when it is served from
 * tallyconnect.app. Shape matches live Tally `GET /api/time`.
 */
export async function GET() {
  try {
    const upstream = await fetch('https://api.tallyconnect.app/api/time', {
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    });
    if (upstream.ok) {
      const data = await upstream.json();
      if (typeof data?.serverTime === 'number') {
        return NextResponse.json(
          {
            serverTime: data.serverTime,
            isoTime: typeof data.isoTime === 'string'
              ? data.isoTime
              : new Date(data.serverTime).toISOString(),
          },
          { headers: { 'Cache-Control': 'no-store' } },
        );
      }
    }
  } catch {
    // Prefer a local honest timestamp over failing the booth clock.
  }

  const serverTime = Date.now();
  return NextResponse.json(
    { serverTime, isoTime: new Date(serverTime).toISOString() },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
