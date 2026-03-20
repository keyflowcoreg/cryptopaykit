'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const DEFAULT_CONFIG = `import { withX402 } from 'x402-next'

const handler = async (req) => {
  return Response.json({
    message: "Premium content unlocked!",
    data: { report: "Q1 2026 Analysis..." }
  })
}

export const GET = withX402(handler, '0xYourWallet', {
  price: '$1.00',
  network: 'base',
  description: 'Premium Report Access',
})`

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
  const payToMatch = code.match(/['"]0x[a-fA-F0-9]+['"]/)
  const descMatch = code.match(/description:\s*['"]([^'"]+)['"]/)

  const bodyMatch = code.match(/Response\.json\(\s*(\{[\s\S]*?\})\s*\)/)

  return {
    price: priceMatch?.[1] || '$1.00',
    network: networkMatch?.[1] || 'base',
    payTo: payToMatch?.[0]?.replace(/['"]/g, '') || '0xYourWallet',
    description: descMatch?.[1] || 'Premium Content',
    responseBody: bodyMatch?.[1] || '{ "data": "unlocked" }',
  }
}

function getTimestamp() {
  return new Date().toISOString().split('T')[1].replace('Z', '')
}

function ProtocolExplainer() {
  return (
    <div className="mt-8 space-y-6">
      <div className="text-center">
        <h2 className="text-lg font-bold text-white mb-2">How x402 Works</h2>
        <p className="text-zinc-400 text-sm">The HTTP 402 payment protocol in 6 steps</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {[
          { step: 1, title: 'Client requests resource', desc: 'Normal GET/POST to your API endpoint', color: '#818cf8' },
          { step: 2, title: 'Server returns 402', desc: 'Response includes price, wallet, network info', color: '#f59e0b' },
          { step: 3, title: 'Client sends USDC', desc: 'On-chain payment via Base L2 (~2 seconds)', color: '#22c55e' },
          { step: 4, title: 'Client retries with receipt', desc: 'X-PAYMENT header contains tx proof', color: '#818cf8' },
          { step: 5, title: 'Server verifies on-chain', desc: 'Facilitator confirms the payment', color: '#a78bfa' },
          { step: 6, title: 'Content delivered', desc: '200 OK with the premium response', color: '#22c55e' },
        ].map((item) => (
          <div key={item.step} className="bg-zinc-900 border border-zinc-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-black"
                style={{ backgroundColor: item.color }}
              >
                {item.step}
              </span>
              <span className="text-sm font-medium text-white">{item.title}</span>
            </div>
            <p className="text-xs text-zinc-400">{item.desc}</p>
          </div>
        ))}
      </div>

      <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-4 sm:p-6">
        <h3 className="text-sm font-bold text-white mb-3">Client-side integration example</h3>
        <pre className="text-xs text-zinc-300 overflow-x-auto leading-relaxed">
          <code>{`// Making a paid API request with x402
async function fetchPremiumData() {
  // Step 1: Try the request
  const res = await fetch('/api/premium')

  if (res.status === 402) {
    // Step 2: Parse payment requirements
    const { accepts } = await res.json()

    // Step 3: Send USDC payment
    const tx = await sendUSDC({
      to: accepts.payTo,
      amount: accepts.maxAmountRequired,
      network: accepts.network,
    })

    // Step 4: Retry with payment proof
    const paid = await fetch('/api/premium', {
      headers: { 'X-PAYMENT': tx.receipt },
    })

    // Step 5: Receive content
    return paid.json()
  }

  return res.json()
}`}</code>
        </pre>
      </div>
    </div>
  )
}

export default function PlaygroundPage() {
  const [code, setCode] = useState(DEFAULT_CONFIG)
  const [steps, setSteps] = useState<FlowStep[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [activeTab, setActiveTab] = useState<'editor' | 'flow'>('editor')

  const runSimulation = useCallback(async () => {
    const config = parseConfig(code)
    setSteps([])
    setIsRunning(true)
    setActiveTab('flow')

    const newSteps: FlowStep[] = []

    const addStep = async (step: FlowStep, delay: number) => {
      await new Promise((r) => setTimeout(r, delay))
      newSteps.push(step)
      setSteps([...newSteps])
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
          'To': config.payTo.slice(0, 8) + '...',
          'Amount': config.price + ' USDC',
          'Network': config.network,
          'Gas': '~$0.001',
        },
        body: `Transaction: ${fakeTxHash.slice(0, 20)}...`,
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
    const fakeReceipt = btoa(JSON.stringify({ tx: fakeTxHash, v: 1 })).slice(0, 40)
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
      <div className="max-w-7xl mx-auto px-4 pt-6 sm:pt-8 pb-16 sm:pb-20">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="text-amber-500 font-mono text-sm mb-2">
            {'>'} playground
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">
            x402 Playground
          </h1>
          <p className="text-zinc-400 text-sm">
            Edit the config below. Hit &quot;Try it&quot; to simulate the full 402 payment flow.
          </p>
        </div>

        {/* Mobile tab switcher */}
        <div className="flex lg:hidden mb-4 gap-2">
          <button
            onClick={() => setActiveTab('editor')}
            className={`flex-1 py-2 rounded-lg text-xs font-mono transition-colors ${
              activeTab === 'editor'
                ? 'bg-amber-500/10 text-amber-500 border border-amber-500/30'
                : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
            }`}
          >
            Editor
          </button>
          <button
            onClick={() => setActiveTab('flow')}
            className={`flex-1 py-2 rounded-lg text-xs font-mono transition-colors ${
              activeTab === 'flow'
                ? 'bg-amber-500/10 text-amber-500 border border-amber-500/30'
                : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
            }`}
          >
            Flow {steps.length > 0 && `(${steps.length})`}
          </button>
        </div>

        {/* Main grid */}
        <div className="grid lg:grid-cols-2 gap-4">
          {/* Left: Code Editor */}
          <div className={`flex flex-col ${activeTab !== 'editor' ? 'hidden lg:flex' : ''}`}>
            <div className="flex items-center justify-between px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-t-lg">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                </div>
                <span className="text-xs text-zinc-400 ml-2">
                  app/api/premium/route.ts
                </span>
              </div>
              <span className="text-[10px] text-zinc-400 uppercase">
                typescript
              </span>
            </div>
            <div className="relative">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                spellCheck={false}
                className="w-full h-[300px] sm:h-[400px] lg:h-[500px] p-4 bg-zinc-900 border border-t-0 border-zinc-700 rounded-b-lg text-xs sm:text-sm font-mono text-zinc-300 leading-relaxed resize-none focus:outline-none focus:border-amber-500/30"
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
                className="px-4 py-2.5 border border-surface-600 text-zinc-400 hover:text-amber-500 hover:border-amber-500/60 rounded-lg transition-colors text-sm"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Right: Response Viewer */}
          <div className={`flex flex-col ${activeTab !== 'flow' ? 'hidden lg:flex' : ''}`}>
            <div className="flex items-center justify-between px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-t-lg">
              <span className="text-xs text-zinc-400">
                Request / Response Flow
              </span>
              {steps.length > 0 && (
                <span className="text-xs text-zinc-400">
                  {steps.length} step{steps.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            <div className="flex-1 bg-zinc-900 border border-t-0 border-zinc-700 rounded-b-lg overflow-auto p-3 sm:p-4 space-y-3 min-h-[300px] sm:min-h-[400px] lg:min-h-[500px]">
              {steps.length === 0 && !isRunning && (
                <div className="h-full flex items-center justify-center text-zinc-400 text-sm min-h-[250px]">
                  <div className="text-center">
                    <div className="text-2xl mb-2">{'{ }'}</div>
                    <p>Click &quot;Try it&quot; to simulate the x402 flow</p>
                  </div>
                </div>
              )}

              <AnimatePresence>
                {steps.map((step) => (
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
                            : 'border-neutral-600/30 bg-zinc-800/50'
                    }`}
                  >
                    {/* Step header */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                            step.type === 'request'
                              ? 'bg-indigo-500/20 text-indigo-400'
                              : step.type === 'response'
                                ? step.status === 200
                                  ? 'bg-green-500/20 text-green-400'
                                  : 'bg-amber-500/20 text-amber-400'
                                : step.type === 'payment'
                                  ? 'bg-green-500/20 text-green-400'
                                  : 'bg-neutral-500/20 text-zinc-400'
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
                        <span className="text-zinc-300 truncate">{step.label}</span>
                      </div>
                      <span className="text-zinc-400 text-[10px] shrink-0 ml-2 hidden sm:inline">
                        {step.timestamp}
                      </span>
                    </div>

                    {/* Headers */}
                    <div className="space-y-0.5 text-[11px]">
                      {Object.entries(step.headers).map(([key, value]) => (
                        <div key={key} className="truncate">
                          <span className="text-zinc-400">{key}: </span>
                          <span
                            className={
                              key === 'X-PAYMENT'
                                ? 'text-amber-400'
                                : key === 'X-PAYMENT-VERIFIED'
                                  ? 'text-green-400'
                                  : 'text-zinc-400'
                            }
                          >
                            {value}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Body */}
                    {step.body && (
                      <div className="mt-2 pt-2 border-t border-zinc-700">
                        <pre className="text-zinc-300 whitespace-pre-wrap text-[11px] leading-relaxed break-all">
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
                  <div className="text-zinc-400 text-xs mt-1">
                    Total flow time: ~3 seconds
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* Protocol explainer */}
        <ProtocolExplainer />

        {/* Bottom info */}
        <div className="mt-8 text-center">
          <p className="text-zinc-400 text-xs">
            This is a simulation. No real payments are made. Get the full kit to implement real x402 payments.
          </p>
          <a
            href="/#pricing"
            className="inline-block mt-3 text-amber-500 hover:text-amber-400 text-sm font-mono transition-colors"
          >
            {'>'} Get full kit for $49 {'->'}
          </a>
        </div>
      </div>
    </div>
  )
}
