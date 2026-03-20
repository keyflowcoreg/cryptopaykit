import { NextRequest, NextResponse } from 'next/server'
import { withX402 } from 'x402-next'
import { ALL_TEMPLATES } from '@/lib/templates'
import { GUIDES } from '@/lib/guides'

const handler = async (_request: NextRequest) => {
  return NextResponse.json({
    product: 'CryptoPayKit',
    version: '1.0.0',
    purchasedAt: new Date().toISOString(),
    templates: ALL_TEMPLATES.map((t) => ({
      id: t.id,
      framework: t.framework,
      title: t.title,
      description: t.description,
      code: t.code,
    })),
    guides: GUIDES.map((g) => ({
      id: g.id,
      title: g.title,
      description: g.description,
      readTime: g.readTime,
      content: g.content,
    })),
    license: {
      type: 'commercial',
      usage: 'Unlimited commercial and personal use. No attribution required.',
    },
  })
}

export const GET = withX402(
  handler,
  '0xCc97e4579eeE0281947F15B027f8Cad022933d7e',
  {
    price: '$49',
    network: 'base',
    config: {
      description: 'CryptoPayKit — Full Developer Toolkit',
    },
  }
)
