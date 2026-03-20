export interface Guide {
  id: string
  title: string
  description: string
  readTime: string
  content: string
}

export const GUIDES: Guide[] = [
  {
    id: 'getting-started',
    title: 'Getting Started with x402',
    description: 'From zero to accepting crypto payments in under 5 minutes. The complete beginner guide.',
    readTime: '5 min',
    content: `# Getting Started with x402

## What is x402?

The x402 protocol brings the HTTP 402 "Payment Required" status code to life. Originally reserved in the HTTP spec for "future use," x402 finally gives it purpose: a standardized way to require and verify crypto payments before serving content.

Think of it like putting a paywall on any API endpoint — except instead of credit cards and Stripe dashboards, you accept USDC directly to your wallet. No signups. No KYC. No platform fees.

## How It Works

The flow is simple:

1. **Client requests a resource** — a normal GET or POST request
2. **Server returns 402** — with payment requirements in the response body (price, wallet address, network)
3. **Client pays** — sends USDC on Base to the specified address
4. **Client retries with receipt** — includes the transaction receipt in the \`X-PAYMENT\` header
5. **Server verifies and serves** — validates the payment via the facilitator, then returns the content

The entire flow happens in seconds. No redirect. No checkout page. No OAuth dance.

## Quick Setup (Next.js)

\`\`\`bash
npm install x402-next @coinbase/x402
\`\`\`

\`\`\`typescript
import { withX402 } from 'x402-next'

const handler = async () => {
  return Response.json({ data: 'Premium content here' })
}

export const GET = withX402(handler, '0xYourWalletAddress', {
  price: '$1.00',
  network: 'base',
  description: 'Premium API Access',
})
\`\`\`

That's it. Your endpoint now requires payment.

## The Facilitator

The facilitator is a service that verifies payment receipts. The default facilitator at \`https://x402.org/facilitator\` handles verification for you. It checks:

- The transaction exists on-chain
- The correct amount was sent
- The correct recipient received funds
- The payment hasn't been used before (replay protection)

You can also run your own facilitator for maximum decentralization.

## Supported Networks

Currently, x402 supports USDC payments on:

- **Base** (recommended) — fast, cheap, reliable
- **Ethereum mainnet** — for high-value transactions
- **Arbitrum** — another L2 option

Base is recommended because transactions confirm in ~2 seconds and cost fractions of a cent in gas.

## Testing

For development, use Base Sepolia testnet. Get test USDC from the Base faucet and set \`network: 'base-sepolia'\` in your config.

## What's Next?

Now that you understand the basics, explore the templates in this kit. Each one demonstrates a different pattern — from basic paywalls to multi-tier pricing, subscription sessions, and WebSocket premium access.

The x402 protocol is open. No vendor lock-in. No platform risk. Your keys, your revenue.`,
  },
  {
    id: 'pricing-strategy',
    title: 'Pricing Strategy for Crypto Products',
    description: 'How to price your API, content, or digital product when accepting crypto. Data-driven strategies.',
    readTime: '4 min',
    content: `# Pricing Strategy for Crypto Products

## The Micropayment Advantage

Traditional payment processors have a floor. Stripe charges 2.9% + $0.30 per transaction. That makes anything under $5 economically painful and anything under $1 basically impossible.

x402 on Base changes this. Transaction costs are ~$0.001. You can charge $0.01 for an API call and still be profitable. This unlocks entirely new pricing models.

## Pricing Models

### Per-Request Pricing
Charge for each API call. Best for:
- AI inference endpoints ($0.01-$0.50 per call)
- Data lookups ($0.001-$0.10 per query)
- Image generation ($0.05-$1.00 per image)

**Pro tip**: Price based on compute cost + margin. If an AI call costs you $0.003, charge $0.01-$0.05.

### Access Pass
Charge once for time-limited access. Best for:
- API access (24-hour pass for $5-$20)
- Content libraries (weekly access for $10-$50)
- Premium features (monthly for $20-$100)

### One-Time Purchase
Charge once for permanent access. Best for:
- Code templates and boilerplates ($20-$200)
- Datasets ($50-$500)
- Digital downloads ($5-$100)

### Tiered Pricing
Multiple quality/speed levels. Example:
- Basic: $0.01/call (standard quality)
- Pro: $0.05/call (high quality, priority)
- Enterprise: $0.25/call (best quality, SLA)

## Setting Your Price

### Research
1. Check what competitors charge (even non-crypto ones)
2. Calculate your actual costs (compute, bandwidth, storage)
3. Determine your target margin (3-10x cost for digital goods)

### The Anchoring Trick
Show the "traditional" cost next to your crypto price:
- "Stripe charges 2.9% + $0.30 on every sale. We charge $49 once."
- "OpenAI charges $0.06/1k tokens. We charge $0.01."

### Start Low, Adjust Up
It's easier to raise prices than lower them. Start at a price that feels almost too cheap, then adjust based on demand.

## Currency Considerations

Price in USD, settle in USDC. Users think in dollars. Display prices as "$1.00" not "1 USDC" even though they're equivalent. This reduces cognitive friction.

## Common Mistakes

1. **Pricing too high** — crypto users expect lower prices (no middlemen = savings passed to buyer)
2. **No free tier** — always offer something free to build trust
3. **Complex pricing** — keep it simple. One price, one outcome.
4. **Ignoring gas costs** — on Base, gas is negligible. On Ethereum mainnet, factor $2-5 gas into minimum price.`,
  },
  {
    id: 'security',
    title: 'Security Best Practices',
    description: 'Protect your x402 endpoints from replay attacks, receipt fraud, and common vulnerabilities.',
    readTime: '4 min',
    content: `# Security Best Practices for x402

## Receipt Verification

**Never skip verification.** Always verify payment receipts through the facilitator or your own on-chain verification. A receipt is just a string — anyone can fabricate one.

\`\`\`typescript
// WRONG: Trusting the receipt exists
if (request.headers['x-payment']) {
  return serveContent() // Attacker sends any string!
}

// RIGHT: Verify with facilitator
const verification = await fetch('https://x402.org/facilitator/verify', {
  method: 'POST',
  body: JSON.stringify({ receipt, payTo, maxAmountRequired, network, resource }),
})
if (verification.ok) {
  return serveContent()
}
\`\`\`

## Replay Protection

The facilitator includes replay protection — each receipt can only be used once. But if you're building custom verification:

1. **Store used receipts** in a database with TTL
2. **Check before serving** — reject any receipt you've seen before
3. **Include the resource URL** in verification to prevent cross-endpoint replay

## Amount Verification

Always verify the *exact* amount, not just that *some* payment was made:

\`\`\`typescript
// Verify that they paid at least your required amount
body: JSON.stringify({
  maxAmountRequired: '$1.00', // Don't accept less!
  // ...
})
\`\`\`

## Wallet Security

- **Never expose your private key** in frontend code
- **Use a dedicated receiving wallet** — not your main wallet
- **Monitor your wallet** for incoming transactions
- Consider a **multisig** for high-value applications

## Rate Limiting

Even with payments, implement rate limiting:

\`\`\`typescript
// Prevent someone from hammering your endpoint with valid receipts
const rateLimiter = new Map<string, number>()
const MAX_REQUESTS_PER_MINUTE = 60

function checkRateLimit(identifier: string): boolean {
  const count = rateLimiter.get(identifier) || 0
  if (count >= MAX_REQUESTS_PER_MINUTE) return false
  rateLimiter.set(identifier, count + 1)
  return true
}
\`\`\`

## HTTPS Only

Always serve x402 endpoints over HTTPS. The \`X-PAYMENT\` header contains sensitive receipt data that could be intercepted over HTTP.

## Input Validation

Payment doesn't mean trusted input. Always validate and sanitize:

- Query parameters
- Request bodies
- File uploads
- Any user-provided data

Paying $1 doesn't give someone the right to SQL-inject your database.

## Error Handling

Never expose internal errors to clients:

\`\`\`typescript
// WRONG
catch (err) {
  return Response.json({ error: err.message, stack: err.stack })
}

// RIGHT
catch (err) {
  console.error('Verification error:', err)
  return Response.json({ error: 'Payment verification failed' }, { status: 402 })
}
\`\`\`

## Monitoring

Set up alerts for:
- Failed verification spikes (potential attack)
- Unusual payment amounts
- High error rates on protected endpoints
- Wallet balance changes`,
  },
  {
    id: 'going-live',
    title: 'Going Live Checklist',
    description: 'Everything you need to verify before deploying your x402-powered product to production.',
    readTime: '3 min',
    content: `# Going Live Checklist

Use this checklist before deploying your x402-powered application to production.

## Pre-Launch

### Wallet Setup
- [ ] Dedicated receiving wallet created (not your personal wallet)
- [ ] Wallet address double-checked (send a test transaction first)
- [ ] Wallet monitoring set up (Etherscan alerts, custom webhook, etc.)
- [ ] Backup/recovery phrase stored securely offline

### Network Configuration
- [ ] Switched from testnet to \`network: 'base'\` (mainnet)
- [ ] Removed any test/hardcoded receipt values
- [ ] Verified facilitator URL is production (\`https://x402.org/facilitator\`)

### Pricing
- [ ] Prices are set in production values (not test prices)
- [ ] Pricing is displayed clearly to users before they pay
- [ ] Description field accurately describes what they're paying for

### Security
- [ ] All endpoints use HTTPS
- [ ] Receipt verification is active on every protected route
- [ ] Rate limiting is configured
- [ ] Error messages don't leak internal details
- [ ] Input validation on all user-provided data
- [ ] CORS headers configured (allow \`X-PAYMENT\` header)

### Testing
- [ ] End-to-end payment flow tested with real USDC (even $0.01)
- [ ] 402 response format matches x402 spec
- [ ] Verified content is served after valid payment
- [ ] Invalid/expired receipts are properly rejected
- [ ] Tested with multiple wallets

## Launch Day

### Monitoring
- [ ] Error tracking active (Sentry, LogRocket, etc.)
- [ ] Uptime monitoring on protected endpoints
- [ ] Wallet transaction alerts enabled
- [ ] Server logs accessible and searchable

### Documentation
- [ ] API documentation published
- [ ] Payment flow documented for users
- [ ] Pricing page live
- [ ] Support channel available (Discord, email, etc.)

## Post-Launch

### First Week
- [ ] Monitor payment success rate (should be >95%)
- [ ] Check for failed verifications (potential issues)
- [ ] Review server error logs daily
- [ ] Respond to user feedback quickly

### Ongoing
- [ ] Regularly withdraw funds from receiving wallet
- [ ] Monitor gas costs on Base (should stay near zero)
- [ ] Keep dependencies updated (\`x402-next\`, etc.)
- [ ] Review and adjust pricing based on usage data

## Emergency Procedures

If something goes wrong:
1. **Payment not arriving?** Check wallet address, verify network (Base, not Ethereum)
2. **Verification failing?** Check facilitator status, verify receipt format
3. **Under attack?** Enable aggressive rate limiting, temporarily raise prices
4. **Need to pause?** Return 503 instead of 402 to stop accepting payments

Remember: x402 is permissionless. There's no "support team" to call. You own the infrastructure, you own the uptime.`,
  },
]
