'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface TypewriterCodeProps {
  lines: string[]
  speed?: number
  lineDelay?: number
}

export default function TypewriterCode({
  lines,
  speed = 30,
  lineDelay = 200,
}: TypewriterCodeProps) {
  const [visibleLines, setVisibleLines] = useState<string[]>([])
  const [currentLine, setCurrentLine] = useState(0)
  const [currentChar, setCurrentChar] = useState(0)
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    if (currentLine >= lines.length) {
      setIsComplete(true)
      return
    }

    const line = lines[currentLine]

    if (currentChar < line.length) {
      const timeout = setTimeout(() => {
        setVisibleLines((prev) => {
          const newLines = [...prev]
          newLines[currentLine] = line.slice(0, currentChar + 1)
          return newLines
        })
        setCurrentChar((c) => c + 1)
      }, speed)
      return () => clearTimeout(timeout)
    } else {
      const timeout = setTimeout(() => {
        setCurrentLine((l) => l + 1)
        setCurrentChar(0)
      }, lineDelay)
      return () => clearTimeout(timeout)
    }
  }, [currentLine, currentChar, lines, speed, lineDelay])

  function highlightLine(text: string): string {
    return text
      .replace(/(["'`])(?:(?=(\\?))\2.)*?\1/g, '<span class="text-amber-300">$&</span>')
      .replace(
        /\b(import|export|from|const|async|await|return)\b/g,
        '<span class="text-purple-400">$&</span>'
      )
      .replace(
        /\b(Response|string|number)\b/g,
        '<span class="text-cyan-400">$&</span>'
      )
      .replace(/(\w+)(?=\()/g, '<span class="text-blue-400">$1</span>')
  }

  return (
    <div className="code-block">
      <div className="flex items-center gap-2 px-4 py-2 border-b border-zinc-700 bg-zinc-800/50">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <div className="w-3 h-3 rounded-full bg-green-500/80" />
        </div>
        <span className="text-xs text-zinc-400 ml-2">route.ts</span>
      </div>
      <div className="p-4 text-sm leading-relaxed font-mono min-h-[200px]">
        <AnimatePresence>
          {visibleLines.map((line, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex"
            >
              <span className="code-line-number text-xs select-none shrink-0">
                {i + 1}
              </span>
              <code
                dangerouslySetInnerHTML={{
                  __html: highlightLine(line) || ' ',
                }}
              />
              {i === currentLine && !isComplete && (
                <span className="cursor-blink text-amber-500 ml-0.5">|</span>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        {isComplete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-4 text-xs text-green-500"
          >
            Ready. Your endpoint now accepts USDC payments.
          </motion.div>
        )}
      </div>
    </div>
  )
}
