'use client'

import { useState } from 'react'

export default function MobileNav() {
  const [open, setOpen] = useState(false)

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-center w-9 h-9 rounded-md text-zinc-400 hover:text-amber-500 transition-colors"
        aria-label="Toggle menu"
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="8" x2="20" y2="8" />
            <line x1="4" y1="16" x2="20" y2="16" />
          </svg>
        )}
      </button>

      {open && (
        <div className="absolute top-14 left-0 right-0 bg-zinc-950/95 backdrop-blur-xl border-b border-zinc-800">
          <div className="flex flex-col px-4 py-4 gap-3">
            <a
              href="/playground"
              onClick={() => setOpen(false)}
              className="text-zinc-300 hover:text-amber-500 transition-colors text-sm py-2"
            >
              Playground
            </a>
            <a
              href="/templates"
              onClick={() => setOpen(false)}
              className="text-zinc-300 hover:text-amber-500 transition-colors text-sm py-2"
            >
              Templates
            </a>
            <a
              href="/#pricing"
              onClick={() => setOpen(false)}
              className="bg-amber-500 hover:bg-amber-600 text-black font-semibold px-4 py-2.5 rounded-md transition-colors text-sm text-center"
            >
              Buy Kit — $49
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
