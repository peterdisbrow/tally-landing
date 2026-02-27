import { NextResponse } from 'next/server';
import { RELAY_URL } from '../../../lib/relay';

export async function GET() {
  try {
    const res = await fetch(`${RELAY_URL}/api/public/reviews`, {
      next: { revalidate: 3600 }, // revalidate every hour
    });
    if (!res.ok) return NextResponse.json({ reviews: [] });
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ reviews: [] });
  }
}
