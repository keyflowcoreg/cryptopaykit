import { TermsOfService } from '@/components/TermsOfService';

export const metadata = {
  title: 'Terms of Service — CryptoPayKit',
  description: 'Terms and conditions for using CryptoPayKit.',
};

export default function TermsPage() {
  return (
    <TermsOfService
      companyName="AI Business Factory"
      productName="CryptoPayKit"
      contactEmail="hello@cryptopaykit.com"
      websiteUrl="https://cryptopaykit.vercel.app"
      lastUpdated="2026-03-20"
    />
  );
}
