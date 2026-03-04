import { NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import { checkRateLimit } from '../../../lib/rate-limit';

const MAILCHIMP_API_KEY = process.env.MAILCHIMP_API_KEY;
const AUDIENCE_ID = '6c052ad3be';
const DC = 'us10';
const BACKUP_PATH = '/tmp/early-access.json';

async function backupToFile(entry) {
  try {
    let entries = [];
    try {
      const raw = await readFile(BACKUP_PATH, 'utf-8');
      entries = JSON.parse(raw);
    } catch {}
    entries.push(entry);
    await writeFile(BACKUP_PATH, JSON.stringify(entries, null, 2));
  } catch {}
}

const VALID_SOURCES = {
  'early-access': 'tally-early-access',
  'healthcheck': 'healthcheck-lead',
  'checklist': 'checklist-lead',
};

async function addTagToMember(email, tag) {
  try {
    const md5 = (await import('crypto')).createHash('md5').update(email.toLowerCase()).digest('hex');
    await fetch(`https://${DC}.api.mailchimp.com/3.0/lists/${AUDIENCE_ID}/members/${md5}/tags`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`anystring:${MAILCHIMP_API_KEY}`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tags: [{ name: tag, status: 'active' }] }),
    });
  } catch {}
}

export async function POST(request) {
  const rateLimitResult = await checkRateLimit('signup', request);
  if (!rateLimitResult.success) {
    return Response.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
  }

  try {
    const { name, church, email, source, role, score } = await request.json();
    if (!name || !email) {
      return NextResponse.json({ success: false, error: 'Name and email required' }, { status: 400 });
    }

    const tag = VALID_SOURCES[source] || VALID_SOURCES['early-access'];
    const entry = { name, church, email, source: source || 'early-access', role, score, date: new Date().toISOString() };
    await backupToFile(entry);

    if (!MAILCHIMP_API_KEY) {
      console.warn('MAILCHIMP_API_KEY not set — skipping Mailchimp, backup only');
      return NextResponse.json({ success: true, message: "You're on the list!" });
    }

    const authHeader = `Basic ${Buffer.from(`anystring:${MAILCHIMP_API_KEY}`).toString('base64')}`;
    const mergeFields = { FNAME: name };
    if (church) mergeFields.CHURCH = church;

    const res = await fetch(`https://${DC}.api.mailchimp.com/3.0/lists/${AUDIENCE_ID}/members`, {
      method: 'POST',
      headers: { 'Authorization': authHeader, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email_address: email,
        status: 'subscribed',
        merge_fields: mergeFields,
        tags: [tag],
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      // Already subscribed — just update tags
      if (data.title === 'Member Exists') {
        await addTagToMember(email, tag);
        return NextResponse.json({ success: true, message: "You're on the list!" });
      }
      // CHURCH merge field might not exist — retry without it
      if (data.detail?.includes('CHURCH') && church) {
        const res2 = await fetch(`https://${DC}.api.mailchimp.com/3.0/lists/${AUDIENCE_ID}/members`, {
          method: 'POST',
          headers: { 'Authorization': authHeader, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email_address: email,
            status: 'subscribed',
            merge_fields: { FNAME: name },
            tags: [tag],
          }),
        });
        if (res2.ok) return NextResponse.json({ success: true, message: "You're on the list!" });
        const d2 = await res2.json();
        if (d2.title === 'Member Exists') {
          await addTagToMember(email, tag);
          return NextResponse.json({ success: true, message: "You're on the list!" });
        }
      }
      console.error('Mailchimp error:', data);
      return NextResponse.json({ success: true, message: "You're on the list!" });
    }

    return NextResponse.json({ success: true, message: "You're on the list!" });
  } catch (err) {
    console.error('Early access error:', err);
    return NextResponse.json({ success: false, error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
