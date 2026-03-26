import { checkRateLimit } from '../../../lib/rate-limit';
import { checkChatBudget, trackChatUsage } from '../../../lib/chat-budget';
import { SYSTEM_PROMPT } from '../../../lib/chat-knowledge';
import { RELAY_URL } from '../../../lib/relay';

const CHAT_PROXY_SECRET = process.env.CHAT_PROXY_SECRET || '';

export async function POST(request) {
  /* ── Origin validation ── */
  const origin = request.headers.get('origin');
  if (origin && !['https://tallyconnect.app', 'https://www.tallyconnect.app'].includes(origin)) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  /* ── Rate limit ── */
  const rl = await checkRateLimit('chat', request);
  if (!rl.success) {
    return Response.json(
      { error: 'Too many messages. Please wait a moment.' },
      { status: 429 },
    );
  }

  /* ── Budget guardrails (daily IP cap, monthly budget, abuse detection) ── */
  const budget = await checkChatBudget(request);
  if (!budget.allowed) {
    return Response.json(
      { error: budget.message },
      { status: 429 },
    );
  }

  /* ── Validate input ── */
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON.' }, { status: 400 });
  }

  const { message, history } = body;
  if (!message || typeof message !== 'string' || message.length > 1000) {
    return Response.json({ error: 'Invalid message.' }, { status: 400 });
  }

  /* ── Build messages array ── */
  const turns = Array.isArray(history) ? history.slice(-8) : [];
  const messages = [
    ...turns.map(m => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: String(m.content).slice(0, 2000),
    })),
    { role: 'user', content: message },
  ];

  /* ── Stream from relay server (uses relay's Anthropic API key) ── */
  try {
    const upstream = await fetch(`${RELAY_URL}/api/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-chat-secret': CHAT_PROXY_SECRET,
      },
      body: JSON.stringify({
        system: SYSTEM_PROMPT,
        messages,
        max_tokens: 250,
        temperature: 0.7,
      }),
    });

    if (!upstream.ok) {
      const errBody = await upstream.text().catch(() => '');
      console.error('Chat proxy error:', upstream.status, errBody.slice(0, 200));
      return Response.json(
        { error: 'Something went wrong. Please try again.' },
        { status: 500 },
      );
    }

    // Track usage now — API call is being made
    trackChatUsage(request).catch(() => {});

    // Pass through the SSE stream from relay
    return new Response(upstream.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (err) {
    console.error('Chat API error:', err.message);
    return Response.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 },
    );
  }
}
