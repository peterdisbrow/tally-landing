# Tally by ATEM School

Remote church production monitoring and control — via Telegram.

**Live at:** [tally.atemschool.com](https://tally.atemschool.com)

## Deploy to Vercel

1. Push this repo to GitHub
2. Go to [vercel.com/new](https://vercel.com/new) and import the repo
3. Framework: Next.js (auto-detected)
4. Click Deploy

## Custom Domain (CNAME)

Add this DNS record:

```
tally.atemschool.com  CNAME  cname.vercel-dns.com
```

Then in Vercel Dashboard → Project Settings → Domains → Add `tally.atemschool.com`.

## Local Development

```bash
npm install
npm run dev
```

## Early Access Form

Submissions are saved to `data/early-access.json` via the `/api/early-access` endpoint.

> **Note:** On Vercel's serverless environment, filesystem writes are ephemeral. For production, swap the API route to use a database or external service.
