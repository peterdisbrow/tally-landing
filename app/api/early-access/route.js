import { NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';

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

async function addTagToMember(email) {
  try {
    const md5 = (await import('crypto')).createHash('md5').update(email.toLowerCase()).digest('hex');
    await fetch(`https://${DC}.api.mailchimp.com/3.0/lists/${AUDIENCE_ID}/members/${md5}/tags`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`anystring:${MAILCHIMP_API_KEY}`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tags: [{ name: 'tally-early-access', status: 'active' }] }),
    });
  } catch {}
}

export async function POST(request) {
  try {
    const { name, church, email } = await request.json();
    if (!name || !email) {
      return NextResponse.json({ success: false, error: 'Name and email required' }, { status: 400 });
    }

    const entry = { name, church, email, date: new Date().toISOString() };
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
        tags: ['tally-early-access'],
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      // Already subscribed — just update tags
      if (data.title === 'Member Exists') {
        await addTagToMember(email);
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
            tags: ['tally-early-access'],
          }),
        });
        if (res2.ok) return NextResponse.json({ success: true, message: "You're on the list!" });
        const d2 = await res2.json();
        if (d2.title === 'Member Exists') {
          await addTagToMember(email);
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
