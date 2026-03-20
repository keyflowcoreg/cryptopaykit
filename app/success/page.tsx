'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const KIT_CONTENTS = [
  { name: 'Next.js x402 Template', desc: 'Full app with paywall middleware', type: 'template' },
  { name: 'Express.js Template', desc: 'REST API with payment gates', type: 'template' },
  { name: 'Cloudflare Workers Template', desc: 'Edge-first x402 implementation', type: 'template' },
  { name: 'Fastify Template', desc: 'High-performance Node.js setup', type: 'template' },
  { name: 'Integration Guide', desc: 'Step-by-step setup for any framework', type: 'guide' },
  { name: 'Pricing Strategy Guide', desc: 'How to price API calls and content', type: 'guide' },
  { name: 'Testing Toolkit', desc: 'Mock payment receipts and test helpers', type: 'tool' },
  { name: 'Deployment Checklist', desc: 'Production-ready config for Vercel, Fly, Railway', type: 'guide' },
]

const CROSS_SELL = [
  { name: 'PromptForge', href: 'https://promptforge.vercel.app', desc: '200+ production AI prompts', price: '$19' },
  { name: 'SiteForge', href: 'https://siteforge.vercel.app', desc: 'AI landing pages in seconds', price: '$9' },
  { name: 'RulesForge', href: '#', desc: 'AI coding rules for your team', price: '$14' },
  { name: 'OGForge', href: '#', desc: 'Social cards in one click', price: '$9' },
]

export default function SuccessPage() {
  const [showCheck, setShowCheck] = useState(false)
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setShowCheck(true), 300)
    const t2 = setTimeout(() => setShowContent(true), 800)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  const handleDownload = async () => {
    try {
      const res = await fetch('/api/download')
      if (!res.ok) throw new Error('Download failed')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'cryptopaykit-developer-kit.zip'
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert('Download failed. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e5e5e5] relative overflow-hidden">
      <style>{`
        @keyframes confetti-fall {
          0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        @keyframes confetti-fall-2 {
          0% { transform: translateY(-100vh) rotate(0deg) scale(0.8); opacity: 1; }
          100% { transform: translateY(100vh) rotate(-540deg) scale(0.3); opacity: 0; }
        }
        .confetti-piece {
          position: fixed;
          top: -20px;
          z-index: 50;
          pointer-events: none;
        }
        @keyframes check-draw {
          0% { stroke-dashoffset: 50; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes circle-fill {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes fade-up {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-check-draw {
          stroke-dasharray: 50;
          stroke-dashoffset: 50;
          animation: check-draw 0.5s ease-out 0.5s forwards;
        }
        .animate-circle-fill {
          animation: circle-fill 0.5s ease-out forwards;
        }
        .animate-fade-up {
          opacity: 0;
          animation: fade-up 0.5s ease-out forwards;
        }
      `}</style>

      {/* Confetti particles */}
      {showCheck && Array.from({ length: 40 }).map((_, i) => (
        <div
          key={i}
          className="confetti-piece"
          style={{
            left: `${Math.random() * 100}%`,
            width: `${6 + Math.random() * 8}px`,
            height: `${6 + Math.random() * 8}px`,
            backgroundColor: ['#F59E0B', '#FBBF24', '#D97706', '#FDE68A', '#8B5CF6', '#10B981', '#EC4899', '#38BDF8'][i % 8],
            borderRadius: i % 3 === 0 ? '50%' : i % 3 === 1 ? '2px' : '0',
            animation: `${i % 2 === 0 ? 'confetti-fall' : 'confetti-fall-2'} ${2 + Math.random() * 3}s ease-out ${Math.random() * 1.5}s forwards`,
          }}
        />
      ))}

      <div className="max-w-2xl mx-auto px-6 py-16">
        {/* Checkmark */}
        <div className="flex justify-center mb-8">
          <div className={`w-24 h-24 rounded-full bg-emerald-500/10 flex items-center justify-center ${showCheck ? 'animate-circle-fill' : 'opacity-0'}`}>
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="22" stroke="#10B981" strokeWidth="3" opacity="0.3" />
              <path
                d="M14 24L21 31L34 18"
                stroke="#10B981"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                className={showCheck ? 'animate-check-draw' : ''}
              />
            </svg>
          </div>
        </div>

        {/* Title */}
        {showContent && (
          <div className="text-center mb-10 animate-fade-up">
            <h1 className="text-3xl font-bold mb-3">Payment Confirmed!</h1>
            <p className="text-[#a1a1aa] text-lg">Your Developer Kit is ready</p>
          </div>
        )}

        {/* Download button */}
        {showContent && (
          <div className="animate-fade-up" style={{ animationDelay: '0.1s' }}>
            <button
              onClick={handleDownload}
              className="w-full bg-amber-500 hover:bg-amber-600 text-black py-4 rounded-xl font-semibold text-lg transition-colors flex items-center justify-center gap-3 mb-8"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Download ZIP
            </button>
          </div>
        )}

        {/* Kit contents */}
        {showContent && (
          <div className="animate-fade-up" style={{ animationDelay: '0.2s' }}>
            <h2 className="text-lg font-semibold mb-4 text-amber-400">What&apos;s in the kit</h2>
            <div className="space-y-2 mb-10">
              {KIT_CONTENTS.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center gap-3 bg-[#111114] border border-[#262630] rounded-lg px-4 py-3 hover:border-amber-500/30 transition-colors"
                >
                  <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${
                    item.type === 'template' ? 'bg-amber-500/10 text-amber-400' :
                    item.type === 'guide' ? 'bg-blue-500/10 text-blue-400' :
                    'bg-emerald-500/10 text-emerald-400'
                  }`}>
                    {item.type === 'template' ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" /></svg>
                    ) : item.type === 'guide' ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085" /></svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-[#a1a1aa]">{item.desc}</p>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 ${
                    item.type === 'template' ? 'bg-amber-500/10 text-amber-400' :
                    item.type === 'guide' ? 'bg-blue-500/10 text-blue-400' :
                    'bg-emerald-500/10 text-emerald-400'
                  }`}>
                    {item.type}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        {showContent && (
          <div className="animate-fade-up mb-16" style={{ animationDelay: '0.3s' }}>
            <Link
              href="/playground"
              className="block text-center bg-[#111114] border border-[#262630] hover:border-amber-500/40 text-amber-400 py-4 rounded-xl font-semibold transition-colors"
            >
              Start building &rarr;
            </Link>
          </div>
        )}

        {/* Cross-sell */}
        {showContent && (
          <div className="animate-fade-up" style={{ animationDelay: '0.4s' }}>
            <div className="border-t border-[#262630] pt-10">
              <p className="text-sm text-[#a1a1aa] text-center mb-6">More tools from the Forge ecosystem</p>
              <div className="grid grid-cols-2 gap-3">
                {CROSS_SELL.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#111114] border border-[#262630] rounded-lg p-4 hover:border-amber-500/30 transition-colors group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-sm group-hover:text-amber-400 transition-colors">{item.name}</span>
                      <span className="text-xs text-amber-500">{item.price}</span>
                    </div>
                    <p className="text-xs text-[#a1a1aa]">{item.desc}</p>
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
