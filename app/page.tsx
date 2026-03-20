'use client'

import { motion, useInView, AnimatePresence } from 'framer-motion'
import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import TypewriterCode from './components/TypewriterCode'
import PaymentFlowAnimation from './components/PaymentFlowAnimation'
import { X402Checkout } from '@/components/x402/X402Checkout'

const heroCodeLines = [
  'import { paymentMiddleware } from "x402-next"',
  '',
  'export const GET = paymentMiddleware(',
  '  async () => {',
  '    return Response.json({ data: "unlocked" })',
  '  },',
  '  {',
  '    price: "$1.00",',
  '    network: "base",',
  '    payTo: "0xYourWallet",',
  '  }',
  ')',
]

const features = [
  {
    title: 'One-line middleware',
    description: 'Wrap any handler. That\'s it. x402-next handles the 402 response, receipt verification, and content delivery.',
    code: `export const GET = paymentMiddleware(handler, {
  price: '$1.00',
  network: 'base',
  payTo: '0xYourWallet',
})`,
  },
  {
    title: 'Any framework',
    description: 'Next.js, Express, Fastify, Cloudflare Workers, Deno Deploy, vanilla Node.js. We have templates for all of them.',
    code: `// Express
app.get('/api/data', requirePayment('$0.50'), handler)

// Fastify
fastify.get('/api/data', { preHandler: payGate }, handler)

// Cloudflare Worker
export default { async fetch(req) { /* x402 logic */ } }`,
  },
  {
    title: 'Base mainnet USDC',
    description: 'Instant settlement. ~2 second confirmations. Near-zero gas fees. Real USDC, not wrapped tokens or IOUs.',
    code: `// Payment settles directly to your wallet
// No intermediary. No escrow. No delays.
{
  network: 'base',        // L2 — fast & cheap
  currency: 'USDC',       // Stablecoin — no volatility
  settlement: 'instant',  // ~2 seconds
  gas: '$0.001',          // Negligible
}`,
  },
  {
    title: 'Zero platform fees',
    description: 'No signup. No dashboard. No monthly fees. No percentage cut. The protocol is open. You keep 100% of revenue.',
    code: `// Traditional payment processor:
// Revenue: $1,000
// Platform fee: -$29 (2.9%)
// Per-txn fee: -$30 (100 txns * $0.30)
// You keep: $941

// x402 on Base:
// Revenue: $1,000
// Gas cost: ~$0.10 (100 txns * $0.001)
// You keep: $999.90`,
  },
]

const packageContents = [
  { count: '15', label: 'Code Templates', detail: 'Next.js, Express, Fastify, Workers, Deno' },
  { count: '4', label: 'Integration Guides', detail: 'Getting started, pricing, security, launch' },
  { count: '1', label: 'Live Playground', detail: 'Simulate the full x402 flow in-browser' },
  { count: '~', label: 'Community Access', detail: 'Updates, new templates, peer support' },
]

const faqItems = [
  {
    q: 'What is x402?',
    a: 'x402 is a protocol that uses the HTTP 402 "Payment Required" status code to enable native crypto payments for web content and APIs. It lets any server require payment (USDC on Base) before serving a response.',
  },
  {
    q: 'Why $49 one-time instead of subscription?',
    a: 'Because we eat our own dog food. x402 is about direct payments, not recurring billing. You pay once via USDC, you get everything. No accounts, no logins, no renewal emails.',
  },
  {
    q: 'Can I use these templates commercially?',
    a: 'Yes. Full commercial license. Use them in client projects, SaaS products, side hustles, whatever. No attribution required.',
  },
  {
    q: 'What if x402 protocol changes?',
    a: 'Templates are updated when the protocol evolves. You get access to all future updates. The kit also teaches you the underlying protocol, so you can adapt independently.',
  },
  {
    q: 'Do I need a crypto wallet?',
    a: 'To buy this kit, yes — you need a wallet with USDC on Base. To use the templates, your end users will need wallets too. That is the target market: crypto-native developers building for crypto-native users.',
  },
  {
    q: 'Is there a refund policy?',
    a: 'On-chain payments are final. That is why we offer a free playground and 3 free templates — try before you buy.',
  },
]

function FeatureCard({
  feature,
  index,
}: {
  feature: (typeof features)[0]
  index: number
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.15 }}
      className="grid md:grid-cols-2 gap-6 items-start"
    >
      <div>
        <div className="text-amber-500 font-mono text-sm mb-2">
          0{index + 1}
        </div>
        <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
        <p className="text-neutral-400 text-sm leading-relaxed">
          {feature.description}
        </p>
      </div>
      <div className="code-block">
        <div className="flex items-center gap-2 px-4 py-2 border-b border-surface-700 bg-surface-800/50">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
          </div>
        </div>
        <pre className="p-4 text-xs leading-relaxed text-neutral-300 overflow-x-auto">
          <code>{feature.code}</code>
        </pre>
      </div>
    </motion.div>
  )
}

function Counter({ target, label }: { target: string; label: string }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.4, type: 'spring' }}
      className="text-center"
    >
      <div className="text-3xl font-bold text-amber-500">{target}</div>
      <div className="text-xs text-neutral-500 mt-1">{label}</div>
    </motion.div>
  )
}

function FAQItem({ item, index }: { item: (typeof faqItems)[0]; index: number }) {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -20 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="border border-surface-700 rounded-lg overflow-hidden"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-surface-800/50 transition-colors"
      >
        <span className="text-sm text-neutral-200 flex items-center gap-3">
          <span className="text-amber-500 font-mono text-xs">
            {isOpen ? '[-]' : '[+]'}
          </span>
          {item.q}
        </span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-4 pb-4 text-sm text-neutral-400 leading-relaxed border-t border-surface-700 pt-3 ml-7">
              {item.a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function LandingPage() {
  const router = useRouter()
  const pricingRef = useRef(null)
  const pricingInView = useInView(pricingRef, { once: true })
  const flowRef = useRef(null)
  const flowInView = useInView(flowRef, { once: true, margin: '-100px' })

  return (
    <div className="min-h-screen">
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(245,158,11,0.08)_0%,_transparent_50%)]" />
        <div className="max-w-6xl mx-auto px-4 pt-24 pb-20 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/5 text-amber-500 text-xs font-mono mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              x402 protocol — HTTP 402 meets USDC on Base
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
              You spent weeks
              <br />
              <span className="text-neutral-600 line-through decoration-red-500/40">integrating Stripe.</span>
              <br />
              <span className="text-amber-500">Accept crypto in 5 minutes.</span>
            </h1>
            <p className="text-neutral-400 text-lg max-w-2xl mx-auto leading-relaxed">
              One middleware. One line. USDC hits your wallet in 2 seconds.
              <br />
              <span className="text-neutral-500">
                No API keys. No dashboards. No KYC. No approval process.
              </span>
              <br />
              <span className="text-neutral-600 text-base mt-1 block">
                You write code. The protocol handles the rest.
              </span>
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-xl mx-auto"
          >
            <TypewriterCode lines={heroCodeLines} speed={25} lineDelay={150} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="flex flex-col items-center gap-3 mt-10"
          >
            <div className="flex items-center justify-center gap-4">
              <X402Checkout
                endpoint="/api/kit"
                productName="CryptoPayKit"
                price="$49"
                description="15 production-ready templates, 4 integration guides, live playground. Commercial license included."
                onSuccess={() => router.push('/success')}
                accentColor="#f59e0b"
              >
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-block px-8 py-3.5 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-lg transition-colors text-sm shadow-lg shadow-amber-500/20"
                >
                  Get the Full Kit — $49 USDC
                </motion.span>
              </X402Checkout>
              <motion.a
                href="/playground"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="px-6 py-3.5 border border-surface-600 hover:border-amber-500/50 text-neutral-300 hover:text-amber-500 rounded-lg transition-colors text-sm"
              >
                Try Playground Free
              </motion.a>
            </div>
            <span className="text-xs text-neutral-600">
              15 templates &bull; 4 guides &bull; Commercial license &bull; Lifetime access
            </span>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="flex justify-center gap-12 mt-16"
          >
            <Counter target="15" label="Templates" />
            <Counter target="5" label="Frameworks" />
            <Counter target="$0" label="Platform Fees" />
            <Counter target="~2s" label="Settlement" />
          </motion.div>

          {/* Trust Signals */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.5 }}
            className="flex flex-wrap justify-center gap-x-8 gap-y-3 mt-12"
          >
            {[
              { icon: '\u26D3', label: 'Built on Base L2' },
              { icon: '\uD83D\uDCB2', label: 'USDC stablecoin' },
              { icon: '\uD83D\uDEAB', label: 'No middlemen, no platform fees' },
              { icon: '\uD83D\uDD13', label: 'Open source spirit' },
            ].map((signal) => (
              <div
                key={signal.label}
                className="flex items-center gap-2 text-xs text-neutral-500"
              >
                <span className="text-sm">{signal.icon}</span>
                <span>{signal.label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Code Preview ─────────────────────────────────── */}
      <section className="py-16 border-t border-surface-800">
        <div className="max-w-3xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <h2 className="text-2xl font-bold text-white mb-2">
              This is the entire integration.
            </h2>
            <p className="text-neutral-500 text-sm">
              Three lines between you and crypto payments. Not three files. Three lines.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="code-block"
          >
            <div className="flex items-center gap-2 px-4 py-2 border-b border-surface-700 bg-surface-800/50">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
              </div>
              <span className="text-xs text-neutral-500 ml-2">app/api/premium/route.ts</span>
            </div>
            <pre className="p-5 text-sm leading-[1.8] font-mono overflow-x-auto">
              <code>
                <span className="text-purple-400">import</span>
                <span className="text-neutral-300">{' { '}</span>
                <span className="text-blue-400">paymentMiddleware</span>
                <span className="text-neutral-300">{' } '}</span>
                <span className="text-purple-400">from</span>
                <span className="text-amber-300">{' "x402-next"'}</span>
                {'\n\n'}
                <span className="text-purple-400">export const</span>
                <span className="text-neutral-300"> GET = </span>
                <span className="text-blue-400">paymentMiddleware</span>
                <span className="text-neutral-300">{'(handler, { '}</span>
                {'\n'}
                <span className="text-neutral-300">{'  '}</span>
                <span className="text-cyan-400">price</span>
                <span className="text-neutral-300">{': '}</span>
                <span className="text-amber-300">{'"$1.00"'}</span>
                <span className="text-neutral-300">{', '}</span>
                <span className="text-cyan-400">network</span>
                <span className="text-neutral-300">{': '}</span>
                <span className="text-amber-300">{'"base"'}</span>
                <span className="text-neutral-300">{', '}</span>
                <span className="text-cyan-400">payTo</span>
                <span className="text-neutral-300">{': '}</span>
                <span className="text-amber-300">{'"0xYou"'}</span>
                {'\n'}
                <span className="text-neutral-300">{'}'}</span>
                <span className="text-neutral-300">{')'}</span>
              </code>
            </pre>
            <div className="px-5 pb-4 flex items-center gap-2 text-xs text-green-500/80">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              That&apos;s it. Your endpoint now requires $1.00 USDC to access.
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────── */}
      <section className="py-20 border-t border-surface-800">
        <div className="max-w-5xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-2xl font-bold text-white mb-2">
              Everything you need. Nothing you don&apos;t.
            </h2>
            <p className="text-neutral-500 text-sm">
              Four pillars. Four code examples. Zero fluff.
            </p>
          </motion.div>
          <div className="space-y-16">
            {features.map((feature, i) => (
              <FeatureCard key={i} feature={feature} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Payment Flow ────────────────────────────────── */}
      <section className="py-20 border-t border-surface-800">
        <div className="max-w-3xl mx-auto px-4">
          <motion.div
            ref={flowRef}
            initial={{ opacity: 0, y: 20 }}
            animate={flowInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold text-white mb-2">
                How x402 works
              </h2>
              <p className="text-neutral-500 text-sm">
                Six steps. Two seconds. One protocol.
              </p>
            </div>
            <div className="bg-surface-900 border border-surface-700 rounded-xl p-6 md:p-8">
              <PaymentFlowAnimation />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── What You Get ────────────────────────────────── */}
      <section className="py-20 border-t border-surface-800">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl font-bold text-white mb-2">
              What you get
            </h2>
            <p className="text-neutral-500 text-sm">
              $49 one-time. Everything included. No upsells.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-4">
            {packageContents.map((item, i) => {
              const ref = useRef(null)
              const inView = useInView(ref, { once: true })
              return (
                <motion.div
                  ref={ref}
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  whileHover={{ scale: 1.03 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-surface-900 border border-surface-700 rounded-lg p-5 hover:border-amber-500/30 transition-colors cursor-default"
                >
                  <div className="flex items-start gap-4">
                    <div className="text-2xl font-bold text-amber-500 font-mono">
                      {item.count}
                    </div>
                    <div>
                      <div className="font-semibold text-white text-sm">
                        {item.label}
                      </div>
                      <div className="text-xs text-neutral-500 mt-1">
                        {item.detail}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Pricing ─────────────────────────────────────── */}
      <section className="py-20 border-t border-surface-800">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            ref={pricingRef}
            initial={{ opacity: 0, y: 30 }}
            animate={pricingInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold text-white mb-2">
                One price. No games.
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Traditional */}
              <div className="bg-surface-900 border border-surface-700 rounded-xl p-6 opacity-60">
                <div className="text-sm text-neutral-500 font-mono mb-4">
                  // Traditional payment processor
                </div>
                <div className="text-2xl font-bold text-neutral-400 mb-4">
                  2.9% + $0.30
                  <span className="text-sm font-normal text-neutral-600">
                    {' '}/ per transaction, forever
                  </span>
                </div>
                <ul className="space-y-2 text-sm text-neutral-500">
                  <li className="flex items-center gap-2">
                    <span className="text-red-400">x</span> Monthly fees
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-red-400">x</span> Percentage cut on every sale
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-red-400">x</span> Account approval required
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-red-400">x</span> Chargebacks and disputes
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-red-400">x</span> 7-day settlement
                  </li>
                </ul>
              </div>

              {/* CryptoPayKit */}
              <div className="bg-surface-900 border-2 border-amber-500/50 rounded-xl p-6 relative glow-amber">
                <div className="absolute -top-3 left-6 px-2 py-0.5 bg-amber-500 text-black text-xs font-bold rounded">
                  RECOMMENDED
                </div>
                <div className="text-sm text-amber-500 font-mono mb-4">
                  // CryptoPayKit
                </div>
                <div className="text-4xl font-bold text-white mb-1">
                  $49
                  <span className="text-sm font-normal text-neutral-500">
                    {' '}one-time
                  </span>
                </div>
                <div className="text-xs text-neutral-500 mb-4">
                  Paid via x402 — USDC on Base
                </div>
                <ul className="space-y-2 text-sm text-neutral-300">
                  <li className="flex items-center gap-2">
                    <span className="text-green-400">+</span> 15 production-ready templates
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-400">+</span> 4 comprehensive guides
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-400">+</span> Live playground
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-400">+</span> Zero platform fees
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-400">+</span> Instant settlement (~2s)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-400">+</span> Commercial license included
                  </li>
                </ul>
                <X402Checkout
                  endpoint="/api/kit"
                  productName="CryptoPayKit"
                  price="$49"
                  description="15 production-ready templates, 4 integration guides, live playground. Commercial license included."
                  onSuccess={() => router.push('/success')}
                  accentColor="#f59e0b"
                >
                  <motion.span
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="block mt-6 text-center px-6 py-3 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-lg transition-colors text-sm shadow-lg shadow-amber-500/20"
                  >
                    Get the Full Kit — $49 USDC
                  </motion.span>
                </X402Checkout>
                <p className="text-[10px] text-neutral-600 mt-3 text-center">
                  15 templates &bull; 4 guides &bull; Commercial license &bull; Lifetime access
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────── */}
      <section className="py-20 border-t border-surface-800">
        <div className="max-w-2xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl font-bold text-white mb-2">
              <span className="text-amber-500 font-mono">FAQ()</span>
            </h2>
            <p className="text-neutral-500 text-sm">
              Frequently asked, concisely answered.
            </p>
          </motion.div>
          <div className="space-y-2">
            {faqItems.map((item, i) => (
              <FAQItem key={i} item={item} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ───────────────────────────────────── */}
      <section className="py-24 border-t border-surface-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_rgba(245,158,11,0.06)_0%,_transparent_60%)]" />
        <div className="max-w-2xl mx-auto px-4 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-sm text-amber-500 font-mono mb-4">
              {'>'} ready to ship?
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Stop building payment infrastructure.
              <br />
              <span className="text-amber-500">Start shipping products.</span>
            </h2>
            <p className="text-neutral-400 text-sm mb-8 max-w-lg mx-auto leading-relaxed">
              Your competitors are still filling out Stripe applications.
              <br />
              You could be accepting USDC before they get approved.
            </p>
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center justify-center gap-4">
                <X402Checkout
                  endpoint="/api/kit"
                  productName="CryptoPayKit"
                  price="$49"
                  description="15 production-ready templates, 4 integration guides, live playground. Commercial license included."
                  onSuccess={() => router.push('/success')}
                  accentColor="#f59e0b"
                >
                  <motion.span
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.97 }}
                    className="inline-block px-8 py-3.5 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-lg transition-colors shadow-lg shadow-amber-500/20"
                  >
                    Get the Full Kit — $49 USDC
                  </motion.span>
                </X402Checkout>
                <motion.a
                  href="/playground"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-8 py-3.5 border border-surface-600 hover:border-amber-500/50 text-neutral-300 hover:text-amber-500 rounded-lg transition-colors"
                >
                  Try Free Playground
                </motion.a>
              </div>
              <span className="text-xs text-neutral-600">
                15 templates &bull; 4 guides &bull; Commercial license &bull; Lifetime access
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Ecosystem Cross-sell */}
      <section className="border-t border-surface-800 py-16 mt-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-6xl mx-auto px-4 text-center"
        >
          <p className="text-sm text-neutral-500 uppercase tracking-wider mb-4">From the AI Business Factory</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
            <motion.a href="https://version-absence-fish-kay.trycloudflare.com" target="_blank" rel="noopener" whileHover={{ scale: 1.05 }} className="p-3 rounded-lg border border-surface-700 hover:border-amber-500/30 transition-colors text-left">
              <p className="font-medium text-white text-sm">PromptForge</p>
              <p className="text-xs text-neutral-400">200+ AI Prompts</p>
            </motion.a>
            <motion.a href="https://tip-walking-flavor-seen.trycloudflare.com" target="_blank" rel="noopener" whileHover={{ scale: 1.05 }} className="p-3 rounded-lg border border-surface-700 hover:border-amber-500/30 transition-colors text-left">
              <p className="font-medium text-white text-sm">SiteForge</p>
              <p className="text-xs text-neutral-400">AI Landing Pages in 60s</p>
            </motion.a>
            <motion.a href="https://ebony-eliminate-incentives-deborah.trycloudflare.com" target="_blank" rel="noopener" whileHover={{ scale: 1.05 }} className="p-3 rounded-lg border border-surface-700 hover:border-amber-500/30 transition-colors text-left">
              <p className="font-medium text-white text-sm">AIToolsRadar</p>
              <p className="text-xs text-neutral-400">Compare 40+ AI Tools</p>
            </motion.a>
            <motion.a href="https://simple-star-hrs-developer.trycloudflare.com" target="_blank" rel="noopener" whileHover={{ scale: 1.05 }} className="p-3 rounded-lg border border-surface-700 hover:border-amber-500/30 transition-colors text-left">
              <p className="font-medium text-white text-sm">PageForge</p>
              <p className="text-xs text-neutral-400">AI Page Generator</p>
            </motion.a>
            <motion.a href="https://offered-proposition-neighbors-explosion.trycloudflare.com" target="_blank" rel="noopener" whileHover={{ scale: 1.05 }} className="p-3 rounded-lg border border-surface-700 hover:border-amber-500/30 transition-colors text-left">
              <p className="font-medium text-white text-sm">Agency Site Grader</p>
              <p className="text-xs text-neutral-400">Grade Your Website</p>
            </motion.a>
            <motion.a href="https://ebooks-script-oral-primarily.trycloudflare.com" target="_blank" rel="noopener" whileHover={{ scale: 1.05 }} className="p-3 rounded-lg border border-surface-700 hover:border-amber-500/30 transition-colors text-left">
              <p className="font-medium text-white text-sm">Pricing Calculator</p>
              <p className="text-xs text-neutral-400">Freelance Pricing</p>
            </motion.a>
          </div>
        </motion.div>
      </section>
    </div>
  )
}
