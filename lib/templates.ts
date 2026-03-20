export interface Template {
  id: string
  framework: 'nextjs' | 'express' | 'fastify' | 'generic'
  title: string
  description: string
  code: string
  isFree: boolean
}

export const ALL_TEMPLATES: Template[] = [
  // ─── Next.js (5) ───────────────────────────────────────────────
  {
    id: 'nextjs-basic',
    framework: 'nextjs',
    title: 'Basic API Route with x402',
    description: 'The simplest way to add crypto payments to a Next.js API route. One import, one wrapper, done.',
    isFree: true,
    code: `import { withX402 } from 'x402-next'

// Define your handler
async function handler() {
  const data = {
    message: 'Welcome! You now have access to premium content.',
    generatedAt: new Date().toISOString(),
    content: {
      title: 'Premium Report: Q1 2026 Market Analysis',
      sections: [
        { heading: 'Overview', body: 'Market cap reached $4.2T...' },
        { heading: 'Top Performers', body: 'BTC +12%, ETH +18%...' },
        { heading: 'Predictions', body: 'DeFi TVL expected to...' },
      ],
    },
  }

  return Response.json(data)
}

// Wrap with x402 payment gate
export const GET = withX402(handler, '0xYourWalletAddress', {
  price: '$1.00',
  network: 'base',
  description: 'Premium Market Report Access',
})`,
  },
  {
    id: 'nextjs-middleware',
    framework: 'nextjs',
    title: 'Middleware-Based Route Protection',
    description: 'Protect multiple API routes at once using Next.js middleware. Define payment rules per path pattern.',
    isFree: true,
    code: `// middleware.ts — place at project root
import { NextRequest, NextResponse } from 'next/server'

const PAYMENT_ROUTES: Record<string, { price: string; description: string }> = {
  '/api/premium/reports': {
    price: '$2.00',
    description: 'Premium Reports Bundle',
  },
  '/api/premium/data': {
    price: '$0.50',
    description: 'Raw Data Export',
  },
  '/api/premium/analytics': {
    price: '$1.50',
    description: 'Analytics Dashboard Access',
  },
}

const FACILITATOR_URL = 'https://x402.org/facilitator'
const PAY_TO = '0xYourWalletAddress'

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  const rule = PAYMENT_ROUTES[path]

  if (!rule) return NextResponse.next()

  // Check for payment receipt in header
  const receipt = request.headers.get('X-PAYMENT')

  if (!receipt) {
    // Return 402 with payment requirements
    return new NextResponse(
      JSON.stringify({
        error: 'Payment Required',
        accepts: {
          scheme: 'exact',
          network: 'base',
          maxAmountRequired: rule.price,
          resource: path,
          description: rule.description,
          payTo: PAY_TO,
          mimeType: 'application/json',
        },
        x402Version: 1,
      }),
      {
        status: 402,
        headers: {
          'Content-Type': 'application/json',
          'X-PAYMENT-REQUIRED': 'true',
        },
      }
    )
  }

  // Verify payment receipt with facilitator
  try {
    const verification = await fetch(\`\${FACILITATOR_URL}/verify\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        receipt,
        payTo: PAY_TO,
        maxAmountRequired: rule.price,
        network: 'base',
        resource: path,
      }),
    })

    if (!verification.ok) {
      return new NextResponse(
        JSON.stringify({ error: 'Payment verification failed' }),
        { status: 402 }
      )
    }

    return NextResponse.next()
  } catch {
    return new NextResponse(
      JSON.stringify({ error: 'Payment verification error' }),
      { status: 500 }
    )
  }
}

export const config = {
  matcher: '/api/premium/:path*',
}`,
  },
  {
    id: 'nextjs-session',
    framework: 'nextjs',
    title: 'Subscription with Session Management',
    description: 'Charge once, grant time-limited access using encrypted session tokens. Perfect for daily/weekly access passes.',
    isFree: false,
    code: `import { withX402 } from 'x402-next'
import { SignJWT, jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-min-32-chars-long!'
)

// Session duration: 24 hours
const SESSION_DURATION = 24 * 60 * 60

async function createSession(walletAddress: string): Promise<string> {
  return new SignJWT({
    wallet: walletAddress,
    tier: 'premium',
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(\`\${SESSION_DURATION}s\`)
    .sign(JWT_SECRET)
}

async function verifySession(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload
  } catch {
    return null
  }
}

// POST /api/subscribe — Pay and get session token
const subscribeHandler = async (request: Request) => {
  const { walletAddress } = await request.json()
  const token = await createSession(walletAddress || 'anonymous')

  return Response.json({
    token,
    expiresIn: SESSION_DURATION,
    message: 'Subscription active for 24 hours',
  })
}

export const POST = withX402(subscribeHandler, '0xYourWalletAddress', {
  price: '$5.00',
  network: 'base',
  description: '24-Hour Premium Access Pass',
})

// GET /api/subscribe — Check session status
export async function GET(request: Request) {
  const authHeader = request.headers.get('Authorization')
  const token = authHeader?.replace('Bearer ', '')

  if (!token) {
    return Response.json(
      { error: 'No session token provided' },
      { status: 401 }
    )
  }

  const session = await verifySession(token)

  if (!session) {
    return Response.json(
      { error: 'Session expired or invalid', action: 'resubscribe' },
      { status: 401 }
    )
  }

  return Response.json({
    active: true,
    wallet: session.wallet,
    tier: session.tier,
    expiresAt: new Date((session.exp as number) * 1000).toISOString(),
  })
}`,
  },
  {
    id: 'nextjs-webhook',
    framework: 'nextjs',
    title: 'Webhook Handler for Payment Confirmations',
    description: 'Process payment confirmation webhooks, verify signatures, store transaction records, and trigger fulfillment.',
    isFree: false,
    code: `import { NextRequest, NextResponse } from 'next/server'
import { createHmac } from 'crypto'

interface PaymentEvent {
  type: 'payment.completed' | 'payment.failed' | 'payment.refunded'
  id: string
  amount: string
  currency: string
  network: string
  from: string
  to: string
  txHash: string
  resource: string
  timestamp: string
}

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'your-webhook-secret'

// In-memory store (replace with your database)
const transactions = new Map<string, PaymentEvent>()

function verifySignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expected = createHmac('sha256', secret)
    .update(payload)
    .digest('hex')
  return signature === \`sha256=\${expected}\`
}

export async function POST(request: NextRequest) {
  const signature = request.headers.get('X-Webhook-Signature')
  const body = await request.text()

  // Step 1: Verify webhook signature
  if (!signature || !verifySignature(body, signature, WEBHOOK_SECRET)) {
    console.error('Invalid webhook signature')
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 401 }
    )
  }

  // Step 2: Parse and validate event
  const event: PaymentEvent = JSON.parse(body)

  // Step 3: Idempotency check
  if (transactions.has(event.id)) {
    return NextResponse.json({ status: 'already_processed' })
  }

  // Step 4: Process by event type
  switch (event.type) {
    case 'payment.completed':
      transactions.set(event.id, event)
      console.log(
        \`Payment received: \${event.amount} \${event.currency} from \${event.from}\`
      )
      console.log(\`Transaction: \${event.txHash}\`)

      // Trigger fulfillment (email, unlock content, etc.)
      await fulfillOrder(event)
      break

    case 'payment.failed':
      console.error(\`Payment failed: \${event.id}\`)
      // Notify admin, retry logic, etc.
      break

    case 'payment.refunded':
      transactions.delete(event.id)
      console.log(\`Payment refunded: \${event.id}\`)
      // Revoke access
      await revokeAccess(event)
      break
  }

  return NextResponse.json({ status: 'processed', eventId: event.id })
}

async function fulfillOrder(event: PaymentEvent) {
  // Replace with your fulfillment logic
  console.log(\`Fulfilling order for \${event.from}: \${event.resource}\`)
}

async function revokeAccess(event: PaymentEvent) {
  // Replace with your access revocation logic
  console.log(\`Revoking access for \${event.from}: \${event.resource}\`)
}`,
  },
  {
    id: 'nextjs-ecommerce',
    framework: 'nextjs',
    title: 'Full E-Commerce Checkout Flow',
    description: 'Complete checkout flow with cart management, order creation, x402 payment, and order confirmation. Ready to customize.',
    isFree: false,
    code: `// app/api/checkout/route.ts
import { withX402 } from 'x402-next'

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
}

interface Order {
  id: string
  items: CartItem[]
  total: number
  status: 'pending' | 'paid' | 'fulfilled'
  createdAt: string
}

// In-memory store (replace with database)
const orders = new Map<string, Order>()

function generateOrderId(): string {
  return \`ord_\${Date.now()}_\${Math.random().toString(36).slice(2, 8)}\`
}

function calculateTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0)
}

// POST /api/checkout — Create order (free, no payment needed)
export async function POST(request: Request) {
  const { items }: { items: CartItem[] } = await request.json()

  if (!items || items.length === 0) {
    return Response.json({ error: 'Cart is empty' }, { status: 400 })
  }

  const total = calculateTotal(items)
  const order: Order = {
    id: generateOrderId(),
    items,
    total,
    status: 'pending',
    createdAt: new Date().toISOString(),
  }

  orders.set(order.id, order)

  return Response.json({
    orderId: order.id,
    total: \`$\${total.toFixed(2)}\`,
    paymentUrl: \`/api/checkout/pay?orderId=\${order.id}\`,
    message: 'Order created. Complete payment at paymentUrl.',
  })
}

// GET /api/checkout — Check order status (free)
export async function GET(request: Request) {
  const url = new URL(request.url)
  const orderId = url.searchParams.get('orderId')

  if (!orderId) {
    return Response.json({ error: 'orderId required' }, { status: 400 })
  }

  const order = orders.get(orderId)
  if (!order) {
    return Response.json({ error: 'Order not found' }, { status: 404 })
  }

  return Response.json(order)
}

// ---
// app/api/checkout/pay/route.ts
// This route is x402-protected — paying completes the order

const payHandler = async (request: Request) => {
  const url = new URL(request.url)
  const orderId = url.searchParams.get('orderId')

  if (!orderId) {
    return Response.json({ error: 'orderId required' }, { status: 400 })
  }

  const order = orders.get(orderId)
  if (!order) {
    return Response.json({ error: 'Order not found' }, { status: 404 })
  }

  // Mark as paid
  order.status = 'paid'
  orders.set(orderId, order)

  // Trigger fulfillment
  order.status = 'fulfilled'
  orders.set(orderId, order)

  return Response.json({
    success: true,
    order,
    message: 'Payment confirmed. Order fulfilled!',
    downloadUrl: \`/api/downloads/\${orderId}\`,
  })
}

// Dynamic pricing based on order total
// Note: In production, fetch the order and set price dynamically
export const GET_PAY = withX402(payHandler, '0xYourWalletAddress', {
  price: '$10.00',
  network: 'base',
  description: 'E-Commerce Order Payment',
})`,
  },

  // ─── Express (4) ──────────────────────────────────────────────
  {
    id: 'express-basic',
    framework: 'express',
    title: 'Basic Middleware Setup',
    description: 'Drop-in Express middleware that adds x402 payment gates to any route. Clean, simple, production-ready.',
    isFree: true,
    code: `import express from 'express'

const app = express()
app.use(express.json())

const FACILITATOR_URL = 'https://x402.org/facilitator'
const PAY_TO = '0xYourWalletAddress'

// x402 middleware factory
function requirePayment(price: string, description: string) {
  return async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    const receipt = req.headers['x-payment'] as string

    if (!receipt) {
      return res.status(402).json({
        error: 'Payment Required',
        accepts: {
          scheme: 'exact',
          network: 'base',
          maxAmountRequired: price,
          resource: req.path,
          description,
          payTo: PAY_TO,
          mimeType: 'application/json',
        },
        x402Version: 1,
      })
    }

    try {
      const verification = await fetch(\`\${FACILITATOR_URL}/verify\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receipt,
          payTo: PAY_TO,
          maxAmountRequired: price,
          network: 'base',
          resource: req.path,
        }),
      })

      if (!verification.ok) {
        return res.status(402).json({ error: 'Payment verification failed' })
      }

      next()
    } catch (err) {
      return res.status(500).json({ error: 'Payment verification error' })
    }
  }
}

// Public route — no payment needed
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Protected route — $1.00 USDC
app.get(
  '/api/premium/report',
  requirePayment('$1.00', 'Premium Market Report'),
  (req, res) => {
    res.json({
      report: 'Full premium market analysis...',
      generatedAt: new Date().toISOString(),
    })
  }
)

// Protected route — $0.25 USDC
app.get(
  '/api/premium/data',
  requirePayment('$0.25', 'Raw Data Export'),
  (req, res) => {
    res.json({
      data: [
        { symbol: 'BTC', price: 98500, change: '+2.3%' },
        { symbol: 'ETH', price: 3850, change: '+4.1%' },
      ],
    })
  }
)

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000')
})`,
  },
  {
    id: 'express-ratelimit',
    framework: 'express',
    title: 'Rate-Limited Paywall',
    description: 'Free tier with rate limits. Once exhausted, require x402 payment to continue. Graceful upgrade path.',
    isFree: false,
    code: `import express from 'express'

const app = express()
app.use(express.json())

const FACILITATOR_URL = 'https://x402.org/facilitator'
const PAY_TO = '0xYourWalletAddress'

// Rate limit store: IP -> { count, resetAt }
const rateLimits = new Map<
  string,
  { count: number; resetAt: number }
>()

const FREE_LIMIT = 10 // requests per window
const WINDOW_MS = 60 * 60 * 1000 // 1 hour

function getRateLimit(ip: string) {
  const now = Date.now()
  const existing = rateLimits.get(ip)

  if (!existing || now > existing.resetAt) {
    const limit = { count: 0, resetAt: now + WINDOW_MS }
    rateLimits.set(ip, limit)
    return limit
  }

  return existing
}

// Middleware: free tier with rate limit, then paywall
function freeTierOrPay(price: string, description: string) {
  return async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown'
    const limit = getRateLimit(ip)

    // Check for payment receipt first (paid users bypass limits)
    const receipt = req.headers['x-payment'] as string
    if (receipt) {
      try {
        const verification = await fetch(
          \`\${FACILITATOR_URL}/verify\`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              receipt,
              payTo: PAY_TO,
              maxAmountRequired: price,
              network: 'base',
              resource: req.path,
            }),
          }
        )

        if (verification.ok) {
          // Reset rate limit for paid users
          limit.count = 0
          return next()
        }
      } catch {
        // Fall through to rate limit check
      }
    }

    // Free tier: check rate limit
    limit.count++

    if (limit.count > FREE_LIMIT) {
      const resetIn = Math.ceil((limit.resetAt - Date.now()) / 1000)

      return res.status(402).json({
        error: 'Free tier limit reached',
        freeUsed: limit.count - 1,
        freeLimit: FREE_LIMIT,
        resetsIn: \`\${resetIn} seconds\`,
        accepts: {
          scheme: 'exact',
          network: 'base',
          maxAmountRequired: price,
          resource: req.path,
          description: \`\${description} (unlimited access)\`,
          payTo: PAY_TO,
          mimeType: 'application/json',
        },
        x402Version: 1,
      })
    }

    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', FREE_LIMIT)
    res.setHeader('X-RateLimit-Remaining', FREE_LIMIT - limit.count)
    res.setHeader('X-RateLimit-Reset', limit.resetAt)

    next()
  }
}

app.get(
  '/api/translate',
  freeTierOrPay('$0.10', 'Translation API'),
  (req, res) => {
    const text = req.query.text as string
    res.json({
      original: text || 'Hello',
      translated: 'Hola',
      tier: 'free/paid',
    })
  }
)

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000')
})`,
  },
  {
    id: 'express-multitier',
    framework: 'express',
    title: 'Multi-Tier Pricing',
    description: 'Different price points for different quality levels. Basic ($0.10), Pro ($0.50), Enterprise ($2.00). Same endpoint, different tiers.',
    isFree: false,
    code: `import express from 'express'

const app = express()
app.use(express.json())

const FACILITATOR_URL = 'https://x402.org/facilitator'
const PAY_TO = '0xYourWalletAddress'

interface Tier {
  name: string
  price: string
  features: string[]
  rateLimit: number
}

const TIERS: Record<string, Tier> = {
  basic: {
    name: 'Basic',
    price: '$0.10',
    features: ['100 API calls', 'Standard quality', 'JSON responses'],
    rateLimit: 100,
  },
  pro: {
    name: 'Pro',
    price: '$0.50',
    features: ['1000 API calls', 'High quality', 'JSON + CSV', 'Priority'],
    rateLimit: 1000,
  },
  enterprise: {
    name: 'Enterprise',
    price: '$2.00',
    features: ['Unlimited calls', 'Highest quality', 'All formats', 'SLA'],
    rateLimit: Infinity,
  },
}

async function verifyPayment(
  receipt: string,
  tier: Tier,
  resource: string
): Promise<boolean> {
  try {
    const res = await fetch(\`\${FACILITATOR_URL}/verify\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        receipt,
        payTo: PAY_TO,
        maxAmountRequired: tier.price,
        network: 'base',
        resource,
      }),
    })
    return res.ok
  } catch {
    return false
  }
}

// GET /api/tiers — Show available tiers (free)
app.get('/api/tiers', (req, res) => {
  res.json({
    tiers: Object.entries(TIERS).map(([id, tier]) => ({
      id,
      ...tier,
      purchaseUrl: \`/api/generate?tier=\${id}\`,
    })),
  })
})

// GET /api/generate?tier=pro — Generate content (paid)
app.get('/api/generate', async (req, res) => {
  const tierName = (req.query.tier as string) || 'basic'
  const tier = TIERS[tierName]

  if (!tier) {
    return res.status(400).json({
      error: 'Invalid tier',
      validTiers: Object.keys(TIERS),
    })
  }

  const receipt = req.headers['x-payment'] as string

  if (!receipt) {
    return res.status(402).json({
      error: 'Payment Required',
      selectedTier: tier,
      allTiers: TIERS,
      accepts: {
        scheme: 'exact',
        network: 'base',
        maxAmountRequired: tier.price,
        resource: req.path,
        description: \`\${tier.name} Tier Access\`,
        payTo: PAY_TO,
        mimeType: 'application/json',
      },
      x402Version: 1,
    })
  }

  const valid = await verifyPayment(receipt, tier, req.path)
  if (!valid) {
    return res.status(402).json({ error: 'Payment verification failed' })
  }

  // Return tier-appropriate content
  const content = {
    basic: { quality: 'standard', data: 'Basic analysis...' },
    pro: { quality: 'high', data: 'Detailed analysis with charts...' },
    enterprise: { quality: 'premium', data: 'Full enterprise report...' },
  }

  res.json({
    tier: tier.name,
    features: tier.features,
    content: content[tierName as keyof typeof content],
    rateLimit: tier.rateLimit,
  })
})

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000')
})`,
  },
  {
    id: 'express-download',
    framework: 'express',
    title: 'File Download Protection',
    description: 'Serve paid file downloads. Verify payment, generate signed download URLs, track downloads.',
    isFree: false,
    code: `import express from 'express'
import { createReadStream, existsSync, statSync } from 'fs'
import { createHmac } from 'crypto'
import path from 'path'

const app = express()
app.use(express.json())

const FACILITATOR_URL = 'https://x402.org/facilitator'
const PAY_TO = '0xYourWalletAddress'
const DOWNLOAD_SECRET = process.env.DOWNLOAD_SECRET || 'your-download-secret'
const FILES_DIR = './protected-files'

interface FileInfo {
  id: string
  name: string
  price: string
  description: string
  size: string
  type: string
}

const FILE_CATALOG: FileInfo[] = [
  {
    id: 'dataset-v1',
    name: 'training-dataset-v1.zip',
    price: '$5.00',
    description: 'ML Training Dataset v1 — 50k labeled samples',
    size: '2.3 GB',
    type: 'application/zip',
  },
  {
    id: 'report-q1',
    name: 'market-report-q1-2026.pdf',
    price: '$2.00',
    description: 'Q1 2026 Comprehensive Market Report',
    size: '15 MB',
    type: 'application/pdf',
  },
]

// Generate signed download URL
function generateDownloadToken(
  fileId: string,
  expiresIn: number = 3600
): string {
  const expires = Date.now() + expiresIn * 1000
  const data = \`\${fileId}:\${expires}\`
  const signature = createHmac('sha256', DOWNLOAD_SECRET)
    .update(data)
    .digest('hex')
  return Buffer.from(\`\${data}:\${signature}\`).toString('base64url')
}

function verifyDownloadToken(
  token: string
): { fileId: string; valid: boolean } {
  try {
    const decoded = Buffer.from(token, 'base64url').toString()
    const [fileId, expiresStr, signature] = decoded.split(':')
    const expires = parseInt(expiresStr)

    if (Date.now() > expires) return { fileId, valid: false }

    const expected = createHmac('sha256', DOWNLOAD_SECRET)
      .update(\`\${fileId}:\${expires}\`)
      .digest('hex')

    return { fileId, valid: signature === expected }
  } catch {
    return { fileId: '', valid: false }
  }
}

// GET /api/files — List available files (free)
app.get('/api/files', (req, res) => {
  res.json({
    files: FILE_CATALOG.map((f) => ({
      ...f,
      purchaseUrl: \`/api/files/\${f.id}/purchase\`,
    })),
  })
})

// GET /api/files/:id/purchase — Buy download access (paid)
app.get('/api/files/:id/purchase', async (req, res) => {
  const file = FILE_CATALOG.find((f) => f.id === req.params.id)
  if (!file) return res.status(404).json({ error: 'File not found' })

  const receipt = req.headers['x-payment'] as string

  if (!receipt) {
    return res.status(402).json({
      error: 'Payment Required',
      file: { id: file.id, name: file.name, size: file.size },
      accepts: {
        scheme: 'exact',
        network: 'base',
        maxAmountRequired: file.price,
        resource: req.path,
        description: file.description,
        payTo: PAY_TO,
        mimeType: 'application/json',
      },
      x402Version: 1,
    })
  }

  // Verify payment
  const verification = await fetch(\`\${FACILITATOR_URL}/verify\`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      receipt,
      payTo: PAY_TO,
      maxAmountRequired: file.price,
      network: 'base',
      resource: req.path,
    }),
  })

  if (!verification.ok) {
    return res.status(402).json({ error: 'Payment verification failed' })
  }

  // Generate signed download URL
  const token = generateDownloadToken(file.id)

  res.json({
    success: true,
    downloadUrl: \`/api/files/download?token=\${token}\`,
    expiresIn: '1 hour',
    file: { name: file.name, size: file.size },
  })
})

// GET /api/files/download?token=xxx — Download file (signed URL)
app.get('/api/files/download', (req, res) => {
  const token = req.query.token as string
  if (!token) return res.status(400).json({ error: 'Token required' })

  const { fileId, valid } = verifyDownloadToken(token)
  if (!valid) return res.status(403).json({ error: 'Invalid or expired token' })

  const file = FILE_CATALOG.find((f) => f.id === fileId)
  if (!file) return res.status(404).json({ error: 'File not found' })

  const filePath = path.join(FILES_DIR, file.name)
  if (!existsSync(filePath)) {
    return res.status(404).json({ error: 'File not available' })
  }

  const stat = statSync(filePath)
  res.setHeader('Content-Disposition', \`attachment; filename="\${file.name}"\`)
  res.setHeader('Content-Type', file.type)
  res.setHeader('Content-Length', stat.size)

  createReadStream(filePath).pipe(res)
})

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000')
})`,
  },

  // ─── Fastify (3) ──────────────────────────────────────────────
  {
    id: 'fastify-plugin',
    framework: 'fastify',
    title: 'Plugin-Based x402',
    description: 'Fastify plugin that adds x402 payment support. Register once, use decorators on any route.',
    isFree: false,
    code: `import Fastify from 'fastify'
import fp from 'fastify-plugin'

const FACILITATOR_URL = 'https://x402.org/facilitator'

// x402 plugin for Fastify
const x402Plugin = fp(async (fastify, opts: { payTo: string }) => {
  // Decorator to mark routes as paid
  fastify.decorate('requirePayment', function (
    price: string,
    description: string
  ) {
    return async (request: any, reply: any) => {
      const receipt = request.headers['x-payment']

      if (!receipt) {
        reply.status(402).send({
          error: 'Payment Required',
          accepts: {
            scheme: 'exact',
            network: 'base',
            maxAmountRequired: price,
            resource: request.url,
            description,
            payTo: opts.payTo,
            mimeType: 'application/json',
          },
          x402Version: 1,
        })
        return
      }

      try {
        const verification = await fetch(
          \`\${FACILITATOR_URL}/verify\`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              receipt,
              payTo: opts.payTo,
              maxAmountRequired: price,
              network: 'base',
              resource: request.url,
            }),
          }
        )

        if (!verification.ok) {
          reply.status(402).send({ error: 'Payment verification failed' })
          return
        }

        // Attach payment info to request
        request.paymentVerified = true
      } catch (err) {
        reply.status(500).send({ error: 'Payment verification error' })
      }
    }
  })
})

// Create app
const app = Fastify({ logger: true })

// Register the x402 plugin
app.register(x402Plugin, {
  payTo: '0xYourWalletAddress',
})

// Free route
app.get('/api/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() }
})

// Paid route — use preHandler hook
app.get(
  '/api/premium',
  {
    preHandler: async (request, reply) => {
      await (app as any).requirePayment(
        '$1.00',
        'Premium Content Access'
      )(request, reply)
    },
  },
  async (request) => {
    return {
      content: 'Premium data unlocked!',
      paymentVerified: (request as any).paymentVerified,
    }
  }
)

// Start server
app.listen({ port: 3000 }, (err) => {
  if (err) {
    app.log.error(err)
    process.exit(1)
  }
})`,
  },
  {
    id: 'fastify-schema',
    framework: 'fastify',
    title: 'Schema-Validated Payments',
    description: 'Combine Fastify JSON Schema validation with x402 payments. Validate input before charging, type-safe responses.',
    isFree: false,
    code: `import Fastify from 'fastify'

const app = Fastify({ logger: true })

const FACILITATOR_URL = 'https://x402.org/facilitator'
const PAY_TO = '0xYourWalletAddress'

// Request/response schemas
const generateSchema = {
  querystring: {
    type: 'object',
    required: ['prompt'],
    properties: {
      prompt: { type: 'string', minLength: 1, maxLength: 1000 },
      model: {
        type: 'string',
        enum: ['fast', 'balanced', 'quality'],
        default: 'balanced',
      },
      maxTokens: {
        type: 'integer',
        minimum: 1,
        maximum: 4096,
        default: 256,
      },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        result: { type: 'string' },
        model: { type: 'string' },
        tokens: { type: 'integer' },
        cost: { type: 'string' },
      },
    },
    402: {
      type: 'object',
      properties: {
        error: { type: 'string' },
        accepts: { type: 'object' },
        x402Version: { type: 'integer' },
      },
    },
  },
}

// Price per model tier
const MODEL_PRICES: Record<string, string> = {
  fast: '$0.01',
  balanced: '$0.05',
  quality: '$0.25',
}

app.get<{
  Querystring: {
    prompt: string
    model?: string
    maxTokens?: number
  }
}>(
  '/api/generate',
  { schema: generateSchema },
  async (request, reply) => {
    const { prompt, model = 'balanced', maxTokens = 256 } = request.query
    const price = MODEL_PRICES[model] || MODEL_PRICES.balanced

    const receipt = request.headers['x-payment'] as string

    if (!receipt) {
      return reply.status(402).send({
        error: 'Payment Required',
        accepts: {
          scheme: 'exact',
          network: 'base',
          maxAmountRequired: price,
          resource: '/api/generate',
          description: \`AI Generation — \${model} model\`,
          payTo: PAY_TO,
          mimeType: 'application/json',
        },
        x402Version: 1,
      })
    }

    // Verify payment
    const verification = await fetch(\`\${FACILITATOR_URL}/verify\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        receipt,
        payTo: PAY_TO,
        maxAmountRequired: price,
        network: 'base',
        resource: '/api/generate',
      }),
    })

    if (!verification.ok) {
      return reply.status(402).send({
        error: 'Payment verification failed',
        accepts: {},
        x402Version: 1,
      })
    }

    // Simulate AI generation
    const result = \`Generated response for: "\${prompt}" using \${model} model (max \${maxTokens} tokens)\`

    return {
      result,
      model,
      tokens: Math.min(prompt.length * 2, maxTokens),
      cost: price,
    }
  }
)

app.listen({ port: 3000 }, (err) => {
  if (err) {
    app.log.error(err)
    process.exit(1)
  }
})`,
  },
  {
    id: 'fastify-websocket',
    framework: 'fastify',
    title: 'WebSocket Premium Access',
    description: 'Pay once via x402, get a session token, use it to connect to a premium WebSocket feed. Real-time data behind a paywall.',
    isFree: false,
    code: `import Fastify from 'fastify'
import websocket from '@fastify/websocket'
import { randomUUID } from 'crypto'

const app = Fastify({ logger: true })
app.register(websocket)

const FACILITATOR_URL = 'https://x402.org/facilitator'
const PAY_TO = '0xYourWalletAddress'

// Active session tokens (replace with Redis in production)
const sessions = new Map<
  string,
  { createdAt: number; expiresAt: number }
>()

const SESSION_DURATION = 60 * 60 * 1000 // 1 hour

// POST /api/ws/auth — Pay for WebSocket access
app.post('/api/ws/auth', async (request, reply) => {
  const receipt = request.headers['x-payment'] as string

  if (!receipt) {
    return reply.status(402).send({
      error: 'Payment Required',
      accepts: {
        scheme: 'exact',
        network: 'base',
        maxAmountRequired: '$1.00',
        resource: '/api/ws/auth',
        description: '1-Hour Premium WebSocket Feed',
        payTo: PAY_TO,
        mimeType: 'application/json',
      },
      x402Version: 1,
    })
  }

  const verification = await fetch(\`\${FACILITATOR_URL}/verify\`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      receipt,
      payTo: PAY_TO,
      maxAmountRequired: '$1.00',
      network: 'base',
      resource: '/api/ws/auth',
    }),
  })

  if (!verification.ok) {
    return reply.status(402).send({ error: 'Payment verification failed' })
  }

  const token = randomUUID()
  const now = Date.now()
  sessions.set(token, {
    createdAt: now,
    expiresAt: now + SESSION_DURATION,
  })

  return {
    token,
    wsUrl: \`ws://localhost:3000/ws/feed?token=\${token}\`,
    expiresIn: '1 hour',
  }
})

// WebSocket route — premium real-time feed
app.register(async function (fastify) {
  fastify.get(
    '/ws/feed',
    { websocket: true },
    (socket, request) => {
      const url = new URL(request.url, 'http://localhost')
      const token = url.searchParams.get('token')

      // Validate session
      if (!token || !sessions.has(token)) {
        socket.send(
          JSON.stringify({ error: 'Invalid or expired token' })
        )
        socket.close()
        return
      }

      const session = sessions.get(token)!
      if (Date.now() > session.expiresAt) {
        socket.send(JSON.stringify({ error: 'Session expired' }))
        socket.close()
        sessions.delete(token)
        return
      }

      socket.send(
        JSON.stringify({
          type: 'connected',
          message: 'Premium feed active',
        })
      )

      // Simulate real-time data feed
      const interval = setInterval(() => {
        if (Date.now() > session.expiresAt) {
          socket.send(JSON.stringify({ type: 'expired' }))
          socket.close()
          clearInterval(interval)
          return
        }

        socket.send(
          JSON.stringify({
            type: 'tick',
            timestamp: new Date().toISOString(),
            data: {
              btc: 98000 + Math.random() * 1000,
              eth: 3800 + Math.random() * 100,
              volume: Math.floor(Math.random() * 1e9),
            },
          })
        )
      }, 1000)

      socket.on('close', () => {
        clearInterval(interval)
      })
    }
  )
})

app.listen({ port: 3000 }, (err) => {
  if (err) {
    app.log.error(err)
    process.exit(1)
  }
})`,
  },

  // ─── Generic (3) ──────────────────────────────────────────────
  {
    id: 'generic-http',
    framework: 'generic',
    title: 'Vanilla HTTP Server',
    description: 'Zero dependencies. Pure Node.js http module with x402 payment handling. Perfect for understanding the protocol.',
    isFree: false,
    code: `import { createServer, IncomingMessage, ServerResponse } from 'http'

const FACILITATOR_URL = 'https://x402.org/facilitator'
const PAY_TO = '0xYourWalletAddress'
const PORT = 3000

interface PaymentConfig {
  price: string
  description: string
}

const PROTECTED_ROUTES: Record<string, PaymentConfig> = {
  '/api/premium': { price: '$1.00', description: 'Premium Content' },
  '/api/data': { price: '$0.50', description: 'Data Export' },
}

function sendJson(
  res: ServerResponse,
  statusCode: number,
  data: unknown
) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(data))
}

async function verifyPayment(
  receipt: string,
  config: PaymentConfig,
  resource: string
): Promise<boolean> {
  try {
    const res = await fetch(\`\${FACILITATOR_URL}/verify\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        receipt,
        payTo: PAY_TO,
        maxAmountRequired: config.price,
        network: 'base',
        resource,
      }),
    })
    return res.ok
  } catch {
    return false
  }
}

const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
  const url = new URL(req.url || '/', \`http://localhost:\${PORT}\`)
  const path = url.pathname

  // Health check
  if (path === '/health') {
    return sendJson(res, 200, { status: 'ok' })
  }

  // Check if route is protected
  const config = PROTECTED_ROUTES[path]
  if (!config) {
    return sendJson(res, 404, { error: 'Not Found' })
  }

  // Check for payment
  const receipt = req.headers['x-payment'] as string

  if (!receipt) {
    return sendJson(res, 402, {
      error: 'Payment Required',
      accepts: {
        scheme: 'exact',
        network: 'base',
        maxAmountRequired: config.price,
        resource: path,
        description: config.description,
        payTo: PAY_TO,
        mimeType: 'application/json',
      },
      x402Version: 1,
    })
  }

  // Verify payment
  const valid = await verifyPayment(receipt, config, path)
  if (!valid) {
    return sendJson(res, 402, { error: 'Payment verification failed' })
  }

  // Serve content
  sendJson(res, 200, {
    content: \`Premium content from \${path}\`,
    paidWith: 'USDC on Base',
    timestamp: new Date().toISOString(),
  })
})

server.listen(PORT, () => {
  console.log(\`x402 server running on http://localhost:\${PORT}\`)
})`,
  },
  {
    id: 'generic-cloudflare',
    framework: 'generic',
    title: 'Cloudflare Worker',
    description: 'Deploy x402 payment gates on the edge with Cloudflare Workers. Sub-millisecond latency, global distribution.',
    isFree: false,
    code: `// wrangler.toml:
// name = "x402-worker"
// main = "src/index.ts"
// compatibility_date = "2025-01-01"
//
// [vars]
// PAY_TO = "0xYourWalletAddress"

interface Env {
  PAY_TO: string
}

const FACILITATOR_URL = 'https://x402.org/facilitator'

interface RouteConfig {
  price: string
  description: string
  handler: (request: Request, env: Env) => Promise<Response>
}

const routes: Record<string, RouteConfig> = {
  '/api/premium': {
    price: '$0.50',
    description: 'Premium Edge Content',
    handler: async () => {
      return Response.json({
        content: 'Premium content served from the edge!',
        location: 'Cloudflare Worker',
        timestamp: new Date().toISOString(),
      })
    },
  },
  '/api/ai': {
    price: '$0.10',
    description: 'Edge AI Inference',
    handler: async (request) => {
      const url = new URL(request.url)
      const prompt = url.searchParams.get('prompt') || 'Hello'
      return Response.json({
        result: \`Processed: \${prompt}\`,
        model: 'edge-fast-v1',
        latency: '2ms',
      })
    },
  },
}

async function verifyPayment(
  receipt: string,
  price: string,
  payTo: string,
  resource: string
): Promise<boolean> {
  const res = await fetch(\`\${FACILITATOR_URL}/verify\`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      receipt,
      payTo,
      maxAmountRequired: price,
      network: 'base',
      resource,
    }),
  })
  return res.ok
}

export default {
  async fetch(
    request: Request,
    env: Env
  ): Promise<Response> {
    const url = new URL(request.url)
    const path = url.pathname

    // Health check
    if (path === '/health') {
      return Response.json({ status: 'ok', runtime: 'cloudflare-workers' })
    }

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, X-PAYMENT',
    }

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders })
    }

    // Check route
    const route = routes[path]
    if (!route) {
      return Response.json({ error: 'Not Found' }, { status: 404 })
    }

    // Check payment
    const receipt = request.headers.get('x-payment')

    if (!receipt) {
      return Response.json(
        {
          error: 'Payment Required',
          accepts: {
            scheme: 'exact',
            network: 'base',
            maxAmountRequired: route.price,
            resource: path,
            description: route.description,
            payTo: env.PAY_TO,
            mimeType: 'application/json',
          },
          x402Version: 1,
        },
        { status: 402, headers: corsHeaders }
      )
    }

    // Verify
    const valid = await verifyPayment(
      receipt,
      route.price,
      env.PAY_TO,
      path
    )

    if (!valid) {
      return Response.json(
        { error: 'Payment verification failed' },
        { status: 402, headers: corsHeaders }
      )
    }

    // Execute handler
    const response = await route.handler(request, env)
    // Add CORS headers to response
    const newHeaders = new Headers(response.headers)
    Object.entries(corsHeaders).forEach(([k, v]) =>
      newHeaders.set(k, v)
    )
    return new Response(response.body, {
      status: response.status,
      headers: newHeaders,
    })
  },
}`,
  },
  {
    id: 'generic-deno',
    framework: 'generic',
    title: 'Deno Deploy',
    description: 'x402 on Deno Deploy. TypeScript-first, secure by default, zero config deployment with built-in fetch.',
    isFree: false,
    code: `// Deploy: deployctl deploy --project=my-x402-app main.ts

const FACILITATOR_URL = 'https://x402.org/facilitator'
const PAY_TO = Deno.env.get('PAY_TO') || '0xYourWalletAddress'
const PORT = parseInt(Deno.env.get('PORT') || '8000')

interface RouteHandler {
  price: string
  description: string
  handle: (request: Request) => Promise<Response> | Response
}

const protectedRoutes = new Map<string, RouteHandler>([
  [
    '/api/premium',
    {
      price: '$1.00',
      description: 'Premium Content Access',
      handle: () =>
        Response.json({
          content: 'Exclusive premium data',
          runtime: 'Deno Deploy',
          region: Deno.env.get('DENO_REGION') || 'local',
        }),
    },
  ],
  [
    '/api/generate',
    {
      price: '$0.25',
      description: 'AI Text Generation',
      handle: (req) => {
        const url = new URL(req.url)
        const prompt = url.searchParams.get('prompt') || 'Hello'
        return Response.json({
          result: \`Generated from: \${prompt}\`,
          model: 'deno-edge-v1',
          timestamp: new Date().toISOString(),
        })
      },
    },
  ],
])

async function verifyReceipt(
  receipt: string,
  price: string,
  resource: string
): Promise<boolean> {
  try {
    const res = await fetch(\`\${FACILITATOR_URL}/verify\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        receipt,
        payTo: PAY_TO,
        maxAmountRequired: price,
        network: 'base',
        resource,
      }),
    })
    return res.ok
  } catch {
    return false
  }
}

Deno.serve({ port: PORT }, async (request: Request) => {
  const url = new URL(request.url)
  const path = url.pathname

  // CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, X-PAYMENT',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      },
    })
  }

  // Health check
  if (path === '/health') {
    return Response.json({
      status: 'ok',
      runtime: \`Deno \${Deno.version.deno}\`,
      typescript: Deno.version.typescript,
    })
  }

  // Check if route requires payment
  const route = protectedRoutes.get(path)
  if (!route) {
    return Response.json({ error: 'Not Found' }, { status: 404 })
  }

  const receipt = request.headers.get('x-payment')

  if (!receipt) {
    return Response.json(
      {
        error: 'Payment Required',
        accepts: {
          scheme: 'exact',
          network: 'base',
          maxAmountRequired: route.price,
          resource: path,
          description: route.description,
          payTo: PAY_TO,
          mimeType: 'application/json',
        },
        x402Version: 1,
      },
      { status: 402 }
    )
  }

  const valid = await verifyReceipt(receipt, route.price, path)
  if (!valid) {
    return Response.json(
      { error: 'Invalid payment receipt' },
      { status: 402 }
    )
  }

  return route.handle(request)
})

console.log(\`x402 server running on http://localhost:\${PORT}\`)`,
  },
]

export const FRAMEWORK_INFO: Record<
  string,
  { name: string; color: string }
> = {
  nextjs: { name: 'Next.js', color: '#000000' },
  express: { name: 'Express', color: '#000000' },
  fastify: { name: 'Fastify', color: '#000000' },
  generic: { name: 'Generic', color: '#000000' },
}
