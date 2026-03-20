'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

interface CodeBlockProps {
  code: string
  language?: string
  filename?: string
  showLineNumbers?: boolean
  maxHeight?: string
}

function highlightSyntax(code: string): string {
  return code
    // strings (double and single quotes, template literals)
    .replace(/(["'`])(?:(?=(\\?))\2.)*?\1/g, '<span class="text-amber-300">$&</span>')
    // comments (single-line)
    .replace(/(\/\/.*$)/gm, '<span class="text-zinc-400 italic">$&</span>')
    // keywords
    .replace(
      /\b(import|export|from|const|let|var|function|async|await|return|if|else|try|catch|new|throw|typeof|interface|type|class|extends|implements|default|switch|case|break|continue|for|while|do|of|in|as)\b/g,
      '<span class="text-purple-400">$&</span>'
    )
    // types and capitalized words
    .replace(
      /\b(Response|Request|Map|Promise|Record|string|number|boolean|void|null|undefined|true|false|any)\b/g,
      '<span class="text-cyan-400">$&</span>'
    )
    // numbers
    .replace(/\b(\d+\.?\d*)\b/g, '<span class="text-amber-400">$&</span>')
    // function calls
    .replace(/(\w+)(?=\()/g, '<span class="text-blue-400">$1</span>')
}

export default function CodeBlock({
  code,
  language = 'typescript',
  filename,
  showLineNumbers = true,
  maxHeight = '500px',
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false)
  const lines = code.split('\n')

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="code-block group relative"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-700 bg-zinc-800/50">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          {filename && (
            <span className="text-xs text-zinc-400 ml-2">{filename}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-zinc-400 uppercase">{language}</span>
          <button
            onClick={handleCopy}
            className="text-xs text-zinc-400 hover:text-amber-500 transition-colors px-2 py-1 rounded hover:bg-zinc-700"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Code */}
      <div
        className="overflow-auto p-4 text-sm leading-relaxed"
        style={{ maxHeight }}
      >
        <pre className="font-mono">
          {lines.map((line, i) => (
            <div key={i} className="flex">
              {showLineNumbers && (
                <span className="code-line-number text-xs select-none shrink-0">
                  {i + 1}
                </span>
              )}
              <code
                dangerouslySetInnerHTML={{
                  __html: highlightSyntax(line) || ' ',
                }}
              />
            </div>
          ))}
        </pre>
      </div>
    </motion.div>
  )
}
