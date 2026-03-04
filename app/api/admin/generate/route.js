import { NextResponse } from 'next/server';
import { RELAY_URL } from '../../../../lib/relay';

const CHAT_PROXY_SECRET = process.env.CHAT_PROXY_SECRET || '';

const SYSTEM_PROMPT = `You are a ghostwriter for Andrew, the founder of TallyConnect — a church production monitoring and remote control platform. You write outreach messages to church technical directors, worship leaders, and production volunteers.

RULES:
- Never sound salesy, pitch-like, or corporate. Write like a fellow church tech person talking to a peer.
- Lead with genuine help related to THEIR specific problem or situation.
- Keep it conversational, warm, and practical.
- Be concise. DMs should be 3-5 sentences. Emails should be 1-2 short paragraphs.
- Only mention Tally casually and briefly — "we built something called Tally that handles this" or similar. Never hard-sell.
- When relevant, mention our free tools naturally:
  - Health Check: "we built a free 2-minute production audit" (https://tallyconnect.app/tools/healthcheck/)
  - Checklist Generator: "we made a free pre-service checklist tool" (https://tallyconnect.app/tools/checklist/)
- Use first person ("I" not "we" for DMs, "we" is fine for emails).
- Match the tone of church tech communities — helpful, humble, practical.
- Never use emojis excessively. One is fine if natural.
- Never use exclamation marks more than once.
- Don't over-explain what Tally does. Keep it mysterious enough to spark curiosity.
- Always provide value in the message itself, even if they never click a link.

ABOUT TALLY:
TallyConnect.app monitors church production systems (ATEM switchers, OBS, ProPresenter, audio consoles, encoders) from one dashboard. It auto-recovers stream failures in under 10 seconds, runs pre-service health checks, sends instant alerts via Slack/Telegram, and provides full remote control. Pricing starts at $49/mo with a 30-day free trial.`;

const TYPE_PROMPTS = {
  'cold-dm': 'Write a short, friendly cold DM (3-5 sentences). The goal is to start a conversation, not close a sale. Offer something genuinely helpful — the free health check tool or checklist. Don\'t mention pricing or trials unless asked.',
  'healthcheck-followup': 'Write a personalized follow-up message based on their health check results. Reference their specific score and top risks. Frame Tally as the solution to their specific weak areas. Keep it warm and helpful, not "gotcha, you need us."',
  'group-reply': 'Write a helpful reply to their post/question in a community group. Lead with actually answering their question or solving their problem. Only mention Tally briefly at the end as "something that might help with this long-term." The reply should be valuable even if they ignore the Tally mention.',
  'email': 'Write a short professional email (1-2 paragraphs + brief sign-off). Slightly more formal than a DM but still conversational. Include a clear but soft CTA — either try the free health check or book a quick call. Sign off as "Andrew" from TallyConnect.',
};

const SOURCE_CONTEXT = {
  facebook: 'Found in a Facebook group for church tech/production.',
  youtube: 'Found on YouTube (comment, channel, or video about church production).',
  reddit: 'Found on Reddit (r/churchtechnology, r/churchav, or similar).',
  direct: 'Direct outreach — reaching out proactively.',
  healthcheck: 'They completed our Church Production Health Check.',
};

function isLikelyJwt(token) {
  return /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(token);
}

function getToken(req) {
  const headerToken = (req.headers.get('x-admin-token') || '').trim();
  if (headerToken) return headerToken;
  const cookieToken = req.cookies?.get?.('tally_admin_token')?.value;
  if (cookieToken && cookieToken.trim()) return cookieToken.trim();
  return '';
}

export async function POST(req) {
  if (!RELAY_URL) {
    return NextResponse.json({ error: 'Relay URL not configured' }, { status: 500 });
  }

  const token = getToken(req);
  if (!token || !isLikelyJwt(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { messageType, prospectName, churchName, source, context } = body;

  if (!messageType || !TYPE_PROMPTS[messageType]) {
    return NextResponse.json({ error: 'Invalid messageType' }, { status: 400 });
  }

  // Build user message
  let userMsg = '';
  if (prospectName) userMsg += `Name: ${prospectName}\n`;
  if (churchName) userMsg += `Church: ${churchName}\n`;
  if (source && SOURCE_CONTEXT[source]) userMsg += `Source: ${SOURCE_CONTEXT[source]}\n`;
  userMsg += `\nMessage type: ${messageType.replace(/-/g, ' ')}\n`;
  if (context && context.trim()) {
    userMsg += `\nContext about this person:\n${context.trim()}\n`;
  }
  userMsg += `\nInstructions: ${TYPE_PROMPTS[messageType]}`;
  userMsg += '\n\nWrite the message now. Output ONLY the message text — no subject lines, no labels, no explanation.';

  try {
    // Proxy through relay server's chat endpoint (uses relay's Anthropic API key)
    const upstream = await fetch(`${RELAY_URL}/api/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-chat-secret': CHAT_PROXY_SECRET,
      },
      body: JSON.stringify({
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userMsg }],
        max_tokens: 1024,
        temperature: 0.7,
      }),
    });

    if (!upstream.ok) {
      const errBody = await upstream.text().catch(() => '');
      console.error('Generate proxy error:', upstream.status, errBody.slice(0, 200));
      return NextResponse.json({ error: 'Failed to generate message' }, { status: 500 });
    }

    // Collect SSE stream into full text
    const reader = upstream.body.getReader();
    const decoder = new TextDecoder();
    let message = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      // Parse SSE lines: "data: {...}"
      for (const line of chunk.split('\n')) {
        if (!line.startsWith('data: ')) continue;
        const data = line.slice(6).trim();
        if (data === '[DONE]') continue;
        try {
          const evt = JSON.parse(data);
          if (evt.type === 'content_block_delta' && evt.delta?.text) {
            message += evt.delta.text;
          }
        } catch {
          // skip unparseable lines
        }
      }
    }

    return NextResponse.json({ message });
  } catch (err) {
    console.error('Generate API error:', err.message);
    return NextResponse.json({ error: 'Failed to generate message' }, { status: 500 });
  }
}
