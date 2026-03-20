'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const DEFAULT_CONFIG = `import { paymentMiddleware } from 'x402-next'

export const GET = paymentMiddleware(
  async () => {
    return Response.json({
      message: "Premium content unlocked!",
      data: { report: "Q1 2026 Analysis..." }
    })
  },
  {
    price: '$1.00',
    network: 'base',
    payTo: '0xCc97e4579eeE0281947F15B027f8Cad022933d7e',
    description: 'Premium Report Access',
  }
)`

interface FlowStep {
  id: number
  type: 'request' | 'response' | 'payment' | 'info'
  label: string
  method?: string
  status?: number
  statusText?: string
  headers: Record<string, string>
  body?: string
  timestamp: string
}

function parseConfig(code: string) {
  const priceMatch = code.match(/price:\s*['"]([^'"]+)['"]/)
  const networkMatch = code.match(/network:\s*['"]([^'"]+)['"]/)
  const payToMatch = code.match(/payTo:\s*['"]([^'"]+)['"]/)
  const descMatch = code.match(/description:\s*['"]([^'"]+)['"]/)

  const bodyMatch = code.match(/Response\.json\(\s*(\{[\s\S]*?\})\s*\)/)

  return {
    price: priceMatch?.[1] || '$1.00',
    network: networkMatch?.[1] || 'base',
    payTo: payToMatch?.[1] || '0x...',
    description: descMatch?.[1] || 'Premium Content',
    responseBody: bodyMatch?.[1] || '{ "data": "unlocked" }',
  }
}

function getTimestamp() {
  return new Date().toISOString().split('T')[1].replace('Z', '')
}

export default function PlaygroundPage() {
  const [code, setCode] = useState(DEFAULT_CONFIG)
  const [steps, setSteps] = useState<FlowStep[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [activeStepIndex, setActiveStepIndex] = useState(-1)

  const runSimulation = useCallback(async () => {
    const config = parseConfig(code)
    setSteps([])
    setIsRunning(true)
    setActiveStepIndex(-1)

    const newSteps: FlowStep[] = []

    const addStep = async (step: FlowStep, delay: number) => {
      await new Promise((r) => setTimeout(r, delay))
      newSteps.push(step)
      setSteps([...newSteps])
      setActiveStepIndex(newSteps.length - 1)
    }

    // Step 1: Initial request
    await addStep(
      {
        id: 1,
        type: 'request',
        label: 'Client sends request',
        method: 'GET',
        headers: {
          'Host': 'your-app.vercel.app',
          'Accept': 'application/json',
          'User-Agent': 'x402-client/1.0',
        },
        timestamp: getTimestamp(),
      },
      300,
    )

    // Step 2: 402 response
    await addStep(
      {
        id: 2,
        type: 'response',
        label: 'Server returns 402',
        status: 402,
        statusText: 'Payment Required',
        headers: {
          'Content-Type': 'application/json',
          'X-PAYMENT-REQUIRED': 'true',
        },
        body: JSON.stringify(
          {
            error: 'Payment Required',
            accepts: {
              scheme: 'exact',
              network: config.network,
              maxAmountRequired: config.price,
              resource: '/api/premium',
              description: config.description,
              payTo: config.payTo,
              mimeType: 'application/json',
            },
            x402Version: 1,
          },
          null,
          2,
        ),
        timestamp: getTimestamp(),
      },
      800,
    )

    // Step 3: Payment
    const fakeTxHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
    await addStep(
      {
        id: 3,
        type: 'payment',
        label: `Sending ${config.price} USDC on ${config.network}`,
        headers: {
          'From': '0xUser...abc',
          'To': config.payTo,
          'Amount': config.price + ' USDC',
          'Network': config.network,
          'Gas': '~$0.001',
        },
        body: `Transaction hash: ${fakeTxHash}`,
        timestamp: getTimestamp(),
      },
      1200,
    )

    // Step 4: Info - confirmation
    await addStep(
      {
        id: 4,
        type: 'info',
        label: 'Transaction confirmed (~2s)',
        headers: {
          'Block': '#' + (18000000 + Math.floor(Math.random() * 100000)),
          'Confirmations': '1',
          'Status': 'Success',
        },
        timestamp: getTimestamp(),
      },
      600,
    )

    // Step 5: Retry with receipt
    const fakeReceipt = Buffer.from(JSON.stringify({ tx: fakeTxHash, v: 1 })).toString('base64').slice(0, 40)
    await addStep(
      {
        id: 5,
        type: 'request',
        label: 'Retry with payment receipt',
        method: 'GET',
        headers: {
          'Host': 'your-app.vercel.app',
          'Accept': 'application/json',
          'X-PAYMENT': fakeReceipt + '...',
        },
        timestamp: getTimestamp(),
      },
      800,
    )

    // Step 6: 200 response
    await addStep(
      {
        id: 6,
        type: 'response',
        label: 'Content unlocked!',
        status: 200,
        statusText: 'OK',
        headers: {
          'Content-Type': 'application/json',
          'X-PAYMENT-VERIFIED': 'true',
        },
        body: config.responseBody,
        timestamp: getTimestamp(),
      },
      800,
    )

    setIsRunning(false)
  }, [code])

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 pt-8 pb-20">
        {/* Header */}
        <div className="mb-8">
          <div className="text-amber-500 font-mono text-sm mb-2">
            {'>'} playground
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            x402 Playground
          </h1>
          <p className="text-neutral-400 text-sm">
            Edit the config on the left. Hit &quot;Try it&quot; to simulate the full 402 payment flow on the right.
          </p>
        </div>

        {/* Main grid */}
        <div className="grid lg:grid-cols-2 gap-4 h-[calc(100vh-250px)] min-h-[600px]">
          {/* Left: Code Editor */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between px-4 py-2 bg-surface-800 border border-surface-700 rounded-t-lg">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                </div>
                <span className="text-xs text-neutral-500 ml-2">
                  app/api/premium/route.ts
                </span>
              </div>
              <span className="text-[10px] text-neutral-600 uppercase">
                typescript
              </span>
            </div>
            <div className="flex-1 relative">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                spellCheck={false}
                className="w-full h-full p-4 bg-surface-900 border border-t-0 border-surface-700 rounded-b-lg text-sm font-mono text-neutral-300 leading-relaxed resize-none focus:outline-none focus:border-amber-500/30"
                placeholder="Write your x402 config here..."
              />
            </div>
            <div className="mt-3 flex items-center gap-3">
              <button
                onClick={runSimulation}
                disabled={isRunning}
                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-500/50 disabled:cursor-not-allowed text-black font-semibold rounded-lg transition-colors text-sm flex items-center gap-2"
              >
                {isRunning ? (
                  <>
                    <span className="animate-spin inline-block w-3 h-3 border-2 border-black/30 border-t-black rounded-full" />
                    Simulating...
                  </>
                ) : (
                  <>
                    <span>{'>'}</span> Try it
                  </>
                )}
              </button>
              <button
                onClick={() => setCode(DEFAULT_CONFIG)}
                className="px-4 py-2.5 border border-surface-600 text-neutral-400 hover:text-amber-500 hover:border-amber-500/30 rounded-lg transition-colors text-sm"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Right: Response Viewer */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between px-4 py-2 bg-surface-800 border border-surface-700 rounded-t-lg">
              <span className="text-xs text-neutral-400">
                Request / Response Flow
              </span>
              {steps.length > 0 && (
                <span className="text-xs text-neutral-600">
                  {steps.length} step{steps.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            <div className="flex-1 bg-surface-900 border border-t-0 border-surface-700 rounded-b-lg overflow-auto p-4 space-y-3">
              {steps.length === 0 && !isRunning && (
                <div className="h-full flex items-center justify-center text-neutral-600 text-sm">
                  <div className="text-center">
                    <div className="text-2xl mb-2">{'{ }'}</div>
                    <p>Click &quot;Try it&quot; to simulate the x402 flow</p>
                  </div>
                </div>
              )}

              <AnimatePresence>
                {steps.map((step, i) => (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, y: 15, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className={`rounded-lg border p-3 text-xs font-mono ${
                      step.type === 'request'
                        ? 'border-indigo-500/30 bg-indigo-500/5'
                        : step.type === 'response'
                          ? step.status === 200
                            ? 'border-green-500/30 bg-green-500/5'
                            : 'border-amber-500/30 bg-amber-500/5'
                          : step.type === 'payment'
                            ? 'border-green-500/30 bg-green-500/5'
                            : 'border-neutral-600/30 bg-surface-800/50'
                    }`}
                  >
                    {/* Step header */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            step.type === 'request'
                              ? 'bg-indigo-500/20 text-indigo-400'
                              : step.type === 'response'
                                ? step.status === 200
                                  ? 'bg-green-500/20 text-green-400'
                                  : 'bg-amber-500/20 text-amber-400'
                                : step.type === 'payment'
                                  ? 'bg-green-500/20 text-green-400'
                                  : 'bg-neutral-500/20 text-neutral-400'
                          }`}
                        >
                          {step.type === 'request'
                            ? step.method
                            : step.type === 'response'
                              ? step.status
                              : step.type === 'payment'
                                ? 'PAY'
                                : 'INFO'}
                        </span>
                        <span className="text-neutral-300">{step.label}</span>
                      </div>
                      <span className="text-neutral-600 text-[10px]">
                        {step.timestamp}
                      </span>
                    </div>

                    {/* Headers */}
                    <div className="space-y-0.5 text-[11px]">
                      {Object.entries(step.headers).map(([key, value]) => (
                        <div key={key}>
                          <span className="text-neutral-500">{key}: </span>
                          <span
                            className={
                              key === 'X-PAYMENT'
                                ? 'text-amber-400'
                                : key === 'X-PAYMENT-VERIFIED'
                                  ? 'text-green-400'
                                  : 'text-neutral-400'
                            }
                          >
                            {value}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Body */}
                    {step.body && (
                      <div className="mt-2 pt-2 border-t border-surface-700">
                        <pre className="text-neutral-300 whitespace-pre-wrap text-[11px] leading-relaxed">
                          {step.body}
                        </pre>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Success message */}
              {!isRunning && steps.length > 0 && steps[steps.length - 1]?.status === 200 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-center py-4"
                >
                  <div className="text-green-400 text-sm font-mono">
                    Payment verified. Content delivered.
                  </div>
                  <div className="text-neutral-600 text-xs mt-1">
                    Total flow time: ~3 seconds
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom info */}
        <div className="mt-8 text-center">
          <p className="text-neutral-600 text-xs">
            This is a simulation. No real payments are made. Get the full kit to implement real x402 payments.
          </p>
          <a
            href="/api/kit"
            className="inline-block mt-3 text-amber-500 hover:text-amber-400 text-sm font-mono transition-colors"
          >
            {'>'} Get full kit for $49 {'->'}
          </a>
        </div>
      </div>
    </div>
  )
}
