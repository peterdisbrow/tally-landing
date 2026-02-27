import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete({ name: 'tally_admin_token', path: '/' });
  return response;
}
