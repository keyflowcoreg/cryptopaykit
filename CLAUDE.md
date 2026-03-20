# CryptoPayKit

Complete x402 integration toolkit — 15 code templates, 4 guides, live playground.

## Stack
- Next.js 16 + React 19 + TypeScript + Tailwind v4
- Payment: x402-next (USDC on Base)
- Animations: Framer Motion
- Wallet: 0xCc97e4579eeE0281947F15B027f8Cad022933d7e

## Commands
```bash
pnpm install    # Install deps
pnpm dev        # Development (localhost:4003)
pnpm build      # Production build
pnpm start      # Start production server
```

## Key Files
- `app/page.tsx` — Landing page (client, code hero animation)
- `app/templates/page.tsx` — Template gallery (15 code templates)
- `app/playground/page.tsx` — Live x402 playground
- `app/api/kit/route.ts` — x402 payment endpoint ($49 USDC)
- `app/success/page.tsx` — Post-purchase page
- `lib/templates.ts` — Code template data (Next.js, Express, etc.)
- `lib/guides.ts` — Integration guide content
- `app/components/CodeBlock.tsx` — Syntax-highlighted code display
- `app/components/TypewriterCode.tsx` — Animated code typing effect
- `app/components/PaymentFlowAnimation.tsx` — Visual payment flow demo
- `components/x402/` — Shared checkout UI (X402Checkout, PaymentSuccess)
- `app/globals.css` — Tailwind v4 theme

## Port Assignment
Production port: 4003 (fleet-manager.sh)

## Payment Flow
1. User browses free templates + playground → clicks "Get Full Kit"
2. X402Checkout modal opens → shows wallet + $49 USDC on Base
3. User sends USDC → enters tx hash → verify
4. API returns full kit (15 templates + 4 guides) → redirect to /success

## Conventions
- Dark theme (bg-zinc-950)
- No icon libraries — use SVG/emoji
- Framer Motion for all animations
- x402 for payments (never Stripe)
- Cross-sell footer links to ecosystem products
