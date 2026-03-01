import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { checkRateLimit } from '../../../lib/rate-limit';
import { SYSTEM_PROMPT } from '../../../lib/chat-knowledge';

const anthropic = new Anthropic(); // reads ANTHROPIC_API_KEY from env

export async function POST(request) {
  /* ── Rate limit ── */
  const rl = await checkRateLimit('chat', request);
  if (!rl.success) {
    return NextResponse.json(
      { error: 'Too many messages. Please wait a moment.' },
      { status: 429 },
    );
  }

  /* ── Validate input ── */
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 });
  }

  const { message, history } = body;
  if (!message || typeof message !== 'string' || message.length > 1000) {
    return NextResponse.json({ error: 'Invalid message.' }, { status: 400 });
  }

  /* ── Build messages array ── */
  const turns = Array.isArray(history) ? history.slice(-20) : [];
  const messages = [
    ...turns.map(m => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: String(m.content).slice(0, 2000),
    })),
    { role: 'user', content: message },
  ];

  /* ── Call Claude ── */
  try {
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      system: SYSTEM_PROMPT,
      messages,
      max_tokens: 1024,
      temperature: 0.7,
    });

    const reply = response.content[0]?.text || 'Sorry, I could not generate a response.';
    return NextResponse.json({ reply });
  } catch (err) {
    console.error('Chat API error:', err.message);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 },
    );
  }
}
