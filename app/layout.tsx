import type { Metadata } from 'next'
import { Analytics } from '@/components/Analytics'
import { CookieBanner } from '@/components/CookieBanner'
import { AnnouncementBar } from '@/components/AnnouncementBar'
import { NoiseOverlay } from '@/components/NoiseOverlay'
import MobileNav from './components/MobileNav'
import './globals.css'

export const metadata: Metadata = {
  title: 'CryptoPayKit — Accept crypto payments in 5 minutes',
  description: 'The definitive developer toolkit for accepting crypto payments via x402 protocol. Code templates, integration guides, middleware, and a live playground.',
  keywords: ['x402', 'crypto payments', 'USDC', 'Base', 'developer toolkit', 'payment middleware'],
  openGraph: {
    title: 'CryptoPayKit — x402 Developer Toolkit',
    description: 'Accept USDC crypto payments in Next.js with 5 lines of code',
    type: 'website',
    siteName: 'CryptoPayKit',
    images: [{ url: '/api/og', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CryptoPayKit — x402 Developer Toolkit',
    description: 'Accept USDC crypto payments in Next.js with 5 lines of code',
    images: ['/api/og'],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "CryptoPayKit",
          "description": "x402 crypto payment toolkit",
          "applicationCategory": "DeveloperApplication",
          "operatingSystem": "Web",
          "offers": {
            "@type": "Offer",
            "price": "49",
            "priceCurrency": "USD"
          }
        }) }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased min-h-screen">
        <NoiseOverlay />
        <AnnouncementBar items={['LAUNCH WEEK \u2014 Limited time pricing', '15 x402 templates + live playground \u2014 $49 one-time']} />
        <Analytics product="cryptopaykit" />
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-700 bg-zinc-950/80 backdrop-blur-xl">
          <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
            <a href="/" className="flex items-center gap-2">
              <span className="text-amber-500 font-bold text-lg">&gt;_</span>
              <span className="font-bold text-white">CryptoPayKit</span>
            </a>
            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-6 text-sm">
              <a href="/playground" className="text-zinc-400 hover:text-amber-500 transition-colors">
                Playground
              </a>
              <a href="/templates" className="text-zinc-400 hover:text-amber-500 transition-colors">
                Templates
              </a>
              <a href="/#pricing" className="bg-amber-500 hover:bg-amber-600 text-black font-semibold px-4 py-1.5 rounded-md transition-colors">
                Buy Kit -- $49
              </a>
            </div>
            {/* Mobile nav */}
            <MobileNav />
          </div>
        </nav>
        <main className="pt-14">
          {children}
        </main>
        <footer className="border-t border-zinc-700 py-12 mt-20">
          <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-zinc-400">
            <div className="flex items-center gap-2">
              <span className="text-amber-500">&gt;_</span>
              <span>CryptoPayKit</span>
            </div>
            <p className="text-center">Open source spirit, built by AI agents. No middlemen. No platform fees.</p>
            <div className="flex gap-4">
              <a href="/playground" className="hover:text-amber-500 transition-colors">Playground</a>
              <a href="/templates" className="hover:text-amber-500 transition-colors">Templates</a>
              <a href="/privacy" className="hover:text-amber-500 transition-colors">Privacy</a>
              <a href="/terms" className="hover:text-amber-500 transition-colors">Terms</a>
            </div>
          </div>
        </footer>
        <CookieBanner />
      </body>
    </html>
  )
}
