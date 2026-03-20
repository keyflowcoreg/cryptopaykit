'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const STEPS = [
  {
    id: 1,
    label: 'GET /api/premium',
    from: 'Client',
    to: 'Server',
    color: '#818cf8',
    detail: 'Client requests protected resource',
  },
  {
    id: 2,
    label: '402 Payment Required',
    from: 'Server',
    to: 'Client',
    color: '#f59e0b',
    detail: '{"price": "$1.00", "network": "base", "payTo": "0x..."}',
  },
  {
    id: 3,
    label: 'Send 1.00 USDC',
    from: 'Client',
    to: 'Base',
    color: '#22c55e',
    detail: 'USDC transfer on Base (confirms in ~2s)',
  },
  {
    id: 4,
    label: 'GET + X-PAYMENT',
    from: 'Client',
    to: 'Server',
    color: '#818cf8',
    detail: 'Retry with payment receipt in header',
  },
  {
    id: 5,
    label: 'Verify receipt',
    from: 'Server',
    to: 'Facilitator',
    color: '#a78bfa',
    detail: 'Facilitator checks on-chain payment',
  },
  {
    id: 6,
    label: '200 OK + Content',
    from: 'Server',
    to: 'Client',
    color: '#22c55e',
    detail: '{"data": "Premium content unlocked!"}',
  },
]

export default function PaymentFlowAnimation() {
  const [activeStep, setActiveStep] = useState(-1)
  const [isPlaying, setIsPlaying] = useState(false)

  const play = async () => {
    setIsPlaying(true)
    setActiveStep(-1)

    for (let i = 0; i < STEPS.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 800))
      setActiveStep(i)
    }

    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsPlaying(false)
  }

  return (
    <div className="w-full">
      {/* Actors - hidden on very small screens, simplified */}
      <div className="hidden sm:flex justify-between mb-8 px-2 sm:px-4">
        {['Client', 'Server', 'Base', 'Facilitator'].map((actor) => (
          <div key={actor} className="text-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-base sm:text-lg mb-2">
              {actor === 'Client'
                ? '\u{1F4BB}'
                : actor === 'Server'
                  ? '\u{1F5A5}\u{FE0F}'
                  : actor === 'Base'
                    ? '\u{26D3}\u{FE0F}'
                    : '\u{1F50D}'}
            </div>
            <span className="text-[10px] sm:text-xs text-zinc-400">{actor}</span>
          </div>
        ))}
      </div>

      {/* Steps */}
      <div className="space-y-2 sm:space-y-3 mb-6">
        <AnimatePresence>
          {STEPS.map((step, i) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0.2, x: -20 }}
              animate={{
                opacity: i <= activeStep ? 1 : 0.2,
                x: i <= activeStep ? 0 : -20,
              }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="flex items-center gap-2 sm:gap-3"
            >
              {/* Step number */}
              <div
                className="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold shrink-0 transition-colors"
                style={{
                  backgroundColor:
                    i <= activeStep ? step.color : 'transparent',
                  border: `2px solid ${i <= activeStep ? step.color : '#333'}`,
                  color: i <= activeStep ? '#000' : '#555',
                }}
              >
                {step.id}
              </div>

              {/* Arrow and labels */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                  <span className="text-zinc-400 text-[10px] sm:text-xs whitespace-nowrap">
                    {step.from}
                  </span>
                  <motion.div
                    animate={{
                      scaleX: i <= activeStep ? 1 : 0.5,
                      opacity: i <= activeStep ? 1 : 0.3,
                    }}
                    className="flex-1 h-px origin-left hidden sm:block"
                    style={{ backgroundColor: step.color }}
                  />
                  <span className="text-zinc-400 sm:hidden">{'>'}</span>
                  <span
                    className="font-medium text-[10px] sm:text-xs whitespace-nowrap truncate"
                    style={{ color: i <= activeStep ? step.color : '#555' }}
                  >
                    {step.label}
                  </span>
                  <motion.div
                    animate={{
                      scaleX: i <= activeStep ? 1 : 0.5,
                      opacity: i <= activeStep ? 1 : 0.3,
                    }}
                    className="flex-1 h-px origin-right hidden sm:block"
                    style={{ backgroundColor: step.color }}
                  />
                  <span className="text-zinc-400 sm:hidden">{'>'}</span>
                  <span className="text-zinc-400 text-[10px] sm:text-xs whitespace-nowrap">
                    {step.to}
                  </span>
                </div>
                {i <= activeStep && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="text-[10px] sm:text-xs text-zinc-400 mt-1 ml-0 font-mono truncate sm:whitespace-normal"
                  >
                    {step.detail}
                  </motion.p>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Play button */}
      <div className="text-center">
        <button
          onClick={play}
          disabled={isPlaying}
          className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-500/50 text-black font-semibold rounded-lg transition-colors text-sm"
        >
          {isPlaying
            ? 'Playing...'
            : activeStep >= STEPS.length - 1
              ? 'Replay Flow'
              : 'See Payment Flow'}
        </button>
      </div>
    </div>
  )
}
