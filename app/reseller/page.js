import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Reseller Program — Tally',
  description: 'Earn recurring commissions selling Tally to your church clients. Free to join — 25-50% revenue share on every subscription.',
  openGraph: {
    title: 'Reseller Program — Tally',
    description: 'Earn recurring commissions selling Tally to your church clients. 25-50% revenue share.',
    url: 'https://tallyconnect.app/reseller',
  },
};

export default function ResellerPage() {
  const relayUrl = process.env.NEXT_PUBLIC_RELAY_URL || process.env.RELAY_URL || '';
  if (!relayUrl) redirect('/');
  redirect(`${relayUrl}/reseller`);
}
