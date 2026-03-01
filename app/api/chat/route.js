import Anthropic from '@anthropic-ai/sdk';
import { checkRateLimit } from '../../../lib/rate-limit';
import { SYSTEM_PROMPT } from '../../../lib/chat-knowledge';

const anthropic = new Anthropic(); // reads ANTHROPIC_API_KEY from env

export async function POST(request) {
  /* ── Rate limit ── */
  const rl = await checkRateLimit('chat', request);
  if (!rl.success) {
    return Response.json(
      { error: 'Too many messages. Please wait a moment.' },
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
  const turns = Array.isArray(history) ? history.slice(-20) : [];
  const messages = [
    ...turns.map(m => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: String(m.content).slice(0, 2000),
    })),
    { role: 'user', content: message },
  ];

  /* ── Stream from Claude via SSE ── */
  try {
    const stream = anthropic.messages.stream({
      model: 'claude-haiku-4-5-20251001',
      system: SYSTEM_PROMPT,
      messages,
      max_tokens: 1024,
      temperature: 0.7,
    });

    const encoder = new TextEncoder();
    let closed = false;
    const readable = new ReadableStream({
      async start(controller) {
        const send = (obj) => {
          if (closed) return;
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));
        };
        const finish = () => {
          if (closed) return;
          closed = true;
          controller.close();
        };

        try {
          stream.on('text', (delta) => {
            send({ type: 'delta', text: delta });
          });

          stream.on('end', () => {
            send({ type: 'done' });
            finish();
          });

          stream.on('error', (err) => {
            console.error('Stream error:', err.message);
            send({ type: 'error', message: 'Something went wrong.' });
            finish();
          });
        } catch (err) {
          console.error('Stream setup error:', err.message);
          send({ type: 'error', message: 'Something went wrong.' });
          finish();
        }
      },
    });

    return new Response(readable, {
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
