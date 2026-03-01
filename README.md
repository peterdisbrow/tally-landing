# Tally

Remote church production monitoring and control — via Telegram.

**Live at:** [tallyconnect.app](https://tallyconnect.app)

## Deploy to Vercel

1. Push this repo to GitHub
2. Go to [vercel.com/new](https://vercel.com/new) and import the repo
3. Framework: Next.js (auto-detected)
4. Click Deploy

## Custom Domain (CNAME)

Add this DNS record:

```
tallyconnect.app  CNAME  cname.vercel-dns.com
```

Then in Vercel Dashboard → Project Settings → Domains → Add `tallyconnect.app`.

## Local Development

```bash
npm install
npm run dev
```

Set relay target (for signup/login proxy routes):

```bash
RELAY_URL=https://your-relay.up.railway.app
NEXT_PUBLIC_APP_URL=https://tallyconnect.app
```

## Early Access Form

Submissions are sent to Mailchimp (audience `6c052ad3be`, tag `tally-early-access`) via the `/api/early-access` endpoint, with a backup written to `/tmp/early-access.json`.

### Setup

Set the `MAILCHIMP_API_KEY` environment variable in the Vercel dashboard before deploying:

1. Go to Vercel Dashboard → Project Settings → Environment Variables
2. Add `MAILCHIMP_API_KEY` with your Mailchimp API key (datacenter: us10)

If the key is missing, the form still works — submissions are saved to the backup file only.

## Self-Serve Signup

`/signup` creates church accounts and starts Stripe checkout via relay endpoint `/api/church/app/onboard`.
