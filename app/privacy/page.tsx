import { PrivacyPolicy } from '@/components/PrivacyPolicy';

export const metadata = {
  title: 'Privacy Policy — CryptoPayKit',
  description: 'How CryptoPayKit collects, uses, and protects your personal data.',
};

export default function PrivacyPage() {
  return (
    <PrivacyPolicy
      companyName="AI Business Factory"
      contactEmail="hello@cryptopaykit.com"
      websiteUrl="https://cryptopaykit.vercel.app"
      lastUpdated="2026-03-20"
    />
  );
}
