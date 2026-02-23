import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Reseller Program — Tally by ATEM School',
  description: 'Earn recurring commissions selling Tally to your church clients. Free to join — 50-60% revenue share on every subscription.',
};

export default function ResellerPage() {
  redirect('https://tally-production-cde2.up.railway.app/reseller');
}
