import { NextResponse } from 'next/server';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(request) {
  try {
    const { name, church, email } = await request.json();
    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email required' }, { status: 400 });
    }

    const dataDir = join(process.cwd(), 'data');
    const filePath = join(dataDir, 'early-access.json');

    let entries = [];
    try {
      const raw = await readFile(filePath, 'utf-8');
      entries = JSON.parse(raw);
    } catch {
      await mkdir(dataDir, { recursive: true });
    }

    entries.push({ name, church, email, date: new Date().toISOString() });
    await writeFile(filePath, JSON.stringify(entries, null, 2));

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
