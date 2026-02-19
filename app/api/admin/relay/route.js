import { NextResponse } from 'next/server';

const RELAY_URL   = process.env.RELAY_URL   || 'https://fortunate-gratitude-production.up.railway.app';
const RELAY_KEY   = process.env.RELAY_ADMIN_KEY || process.env.ADMIN_API_KEY || 'tally-admin-0c3f1c318c8a7edddc217faecc410a98c83cecd0';
const SESSION_SECRET = process.env.SESSION_SECRET || 'tally-session-secret';

function verifyToken(req) {
  const auth = req.headers.get('x-admin-token') || '';
  if (!auth) return false;
  try {
    const decoded = Buffer.from(auth, 'base64').toString('utf-8');
    const [, secret] = decoded.split(':');
    return secret === SESSION_SECRET;
  } catch { return false; }
}

async function proxyRequest(req, method) {
  if (!verifyToken(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const path = searchParams.get('path') || '/api/health';

  let body = undefined;
  if (method !== 'GET' && method !== 'DELETE') {
    try { body = await req.text(); } catch {}
  }

  const upstream = await fetch(`${RELAY_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': RELAY_KEY,
    },
    ...(body ? { body } : {}),
  });

  const data = await upstream.text();
  try {
    return NextResponse.json(JSON.parse(data), { status: upstream.status });
  } catch {
    return new NextResponse(data, { status: upstream.status });
  }
}

export async function GET(req)    { return proxyRequest(req, 'GET'); }
export async function POST(req)   { return proxyRequest(req, 'POST'); }
export async function PUT(req)    { return proxyRequest(req, 'PUT'); }
export async function DELETE(req) { return proxyRequest(req, 'DELETE'); }
