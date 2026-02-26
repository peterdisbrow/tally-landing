import { redirect } from 'next/navigation';

// Server-side redirect — the next.config.js redirect handles this route,
// but if it somehow reaches the page, redirect to the church portal.
// The relay server's auth middleware sends unauthenticated users to /church-login.
export default function PortalPage() {
  redirect('https://api.tallyconnect.app/church-portal');
}
