'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ALL_TEMPLATES, type Template } from '@/lib/templates'
import CodeBlock from '../components/CodeBlock'

const FRAMEWORK_META: Record<
  string,
  { label: string; icon: string; count: number }
> = {
  all: { label: 'All', icon: '*', count: ALL_TEMPLATES.length },
  nextjs: {
    label: 'Next.js',
    icon: 'N',
    count: ALL_TEMPLATES.filter((t) => t.framework === 'nextjs').length,
  },
  express: {
    label: 'Express',
    icon: 'E',
    count: ALL_TEMPLATES.filter((t) => t.framework === 'express').length,
  },
  fastify: {
    label: 'Fastify',
    icon: 'F',
    count: ALL_TEMPLATES.filter((t) => t.framework === 'fastify').length,
  },
  generic: {
    label: 'Generic',
    icon: 'G',
    count: ALL_TEMPLATES.filter((t) => t.framework === 'generic').length,
  },
}

function TemplateCard({
  template,
  index,
  onPreview,
}: {
  template: Template
  index: number
  onPreview: (t: Template) => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`relative bg-surface-900 border rounded-xl p-5 transition-colors ${
        template.isFree
          ? 'border-surface-700 hover:border-amber-500/30'
          : 'border-surface-700 hover:border-surface-600'
      }`}
    >
      {/* Locked overlay */}
      {!template.isFree && (
        <div className="absolute inset-0 bg-surface-950/60 backdrop-blur-[1px] rounded-xl z-10 flex flex-col items-center justify-center">
          <div className="text-neutral-500 text-sm mb-2 font-mono">
            Locked
          </div>
          <a
            href="/api/kit"
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black text-xs font-semibold rounded-lg transition-colors"
          >
            Unlock all 15 templates for $49
          </a>
        </div>
      )}

      {/* Framework badge */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-md bg-surface-800 border border-surface-700 flex items-center justify-center text-xs font-bold text-amber-500">
            {FRAMEWORK_META[template.framework]?.icon || '?'}
          </span>
          <span className="text-xs text-neutral-500">
            {FRAMEWORK_META[template.framework]?.label || template.framework}
          </span>
        </div>
        {template.isFree && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
            FREE
          </span>
        )}
      </div>

      {/* Content */}
      <h3 className="text-sm font-semibold text-white mb-2">
        {template.title}
      </h3>
      <p className="text-xs text-neutral-500 leading-relaxed mb-4 line-clamp-2">
        {template.description}
      </p>

      {/* Preview button */}
      {template.isFree && (
        <button
          onClick={() => onPreview(template)}
          className="w-full py-2 border border-surface-600 hover:border-amber-500/50 text-neutral-400 hover:text-amber-500 text-xs rounded-lg transition-colors font-mono"
        >
          {'>'} Preview Code
        </button>
      )}
    </motion.div>
  )
}

export default function TemplatesPage() {
  const [filter, setFilter] = useState<string>('all')
  const [preview, setPreview] = useState<Template | null>(null)

  const filtered =
    filter === 'all'
      ? ALL_TEMPLATES
      : ALL_TEMPLATES.filter((t) => t.framework === filter)

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 pt-8 pb-20">
        {/* Header */}
        <div className="mb-8">
          <div className="text-amber-500 font-mono text-sm mb-2">
            {'>'} templates
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            15 Production-Ready Templates
          </h1>
          <p className="text-neutral-400 text-sm">
            Copy-paste x402 payment integration for every major framework.
            3 free to preview, 12 more with the full kit.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
          {Object.entries(FRAMEWORK_META).map(([key, meta]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono transition-colors whitespace-nowrap ${
                filter === key
                  ? 'bg-amber-500/10 text-amber-500 border border-amber-500/30'
                  : 'bg-surface-800 text-neutral-400 border border-surface-700 hover:border-surface-600'
              }`}
            >
              <span>{meta.icon}</span>
              <span>{meta.label}</span>
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] ${
                  filter === key
                    ? 'bg-amber-500/20'
                    : 'bg-surface-700'
                }`}
              >
                {meta.count}
              </span>
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((template, i) => (
              <TemplateCard
                key={template.id}
                template={template}
                index={i}
                onPreview={setPreview}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* Stats */}
        <div className="mt-12 text-center">
          <p className="text-neutral-500 text-sm">
            <span className="text-amber-500 font-bold">{ALL_TEMPLATES.filter((t) => t.isFree).length}</span> free templates available.{' '}
            <span className="text-neutral-400">
              Get all {ALL_TEMPLATES.length} with the full kit.
            </span>
          </p>
          <a
            href="/api/kit"
            className="inline-block mt-4 px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg transition-colors text-sm"
          >
            Unlock Everything — $49
          </a>
        </div>
      </div>

      {/* Preview Modal */}
      <AnimatePresence>
        {preview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setPreview(null)}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-3xl max-h-[85vh] flex flex-col bg-surface-900 border border-surface-700 rounded-xl overflow-hidden z-10"
            >
              {/* Modal header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-surface-700 bg-surface-800/50 shrink-0">
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    {preview.title}
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {preview.description}
                  </p>
                </div>
                <button
                  onClick={() => setPreview(null)}
                  className="text-neutral-500 hover:text-white transition-colors text-lg px-2"
                >
                  x
                </button>
              </div>

              {/* Code */}
              <div className="flex-1 overflow-auto">
                <CodeBlock
                  code={preview.code}
                  filename={`${preview.id}.ts`}
                  maxHeight="none"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
