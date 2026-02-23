import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Reseller Program — Tally by ATEM School',
  description: 'White-label church AV monitoring under your own brand. Manage all your client churches from one dashboard.',
};

export default function ResellerPage() {
  redirect('https://tally-production-cde2.up.railway.app/reseller');
}
