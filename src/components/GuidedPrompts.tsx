'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface GuidedPromptsProps {
  memoryType: string
  onAnswersChange: (answers: Record<string, string>) => void
}

const PROMPTS_BY_TYPE: Record<string, string[]> = {
  'first-smile': [
    'When did this happen?',
    'Who was there?',
    'How did you feel?',
    'Any funny moments?',
  ],
  'first-ultrasound': [
    'When was the ultrasound?',
    'What did you see?',
    'How did you feel?',
    'Anything surprising?',
  ],
  custom: [
    'When did this happen?',
    'Who was involved?',
    'What made it special?',
  ],
}

export const GuidedPrompts: React.FC<GuidedPromptsProps> = ({
  memoryType,
  onAnswersChange,
}) => {
  const prompts = PROMPTS_BY_TYPE[memoryType] || PROMPTS_BY_TYPE.custom!
  const [answers, setAnswers] = React.useState<Record<string, string>>({})
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>({})

  const handleAnswer = (prompt: string, value: string) => {
    const newAnswers = { ...answers, [prompt]: value }
    setAnswers(newAnswers)
    onAnswersChange(newAnswers)
  }

  return (
    <div className="space-y-2">
      <h3 className="mb-4 font-display text-lg font-bold text-ink">
        Guided prompts
      </h3>
      <p className="mb-4 text-sm text-ink/50">
        Optional — tap to expand and capture the details that matter.
      </p>
      {prompts.map((prompt, idx) => (
        <div
          key={prompt}
          className="overflow-hidden rounded-2xl border border-ink/8 bg-white/50"
        >
          <button
            type="button"
            onClick={() => setExpanded({ ...expanded, [idx]: !expanded[idx] })}
            className="flex w-full items-center justify-between px-4 py-3 text-left font-semibold text-ink transition hover:bg-white/80"
          >
            <span>{prompt}</span>
            <motion.span
              animate={{ rotate: expanded[idx] ? 180 : 0 }}
              className="text-primary"
              aria-hidden
            >
              ▼
            </motion.span>
          </button>
          <AnimatePresence>
            {expanded[idx] && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="border-t border-ink/5 bg-white/40 px-4 pb-4 pt-3">
                  <textarea
                    className="input-field min-h-[80px] text-sm"
                    placeholder="Share your thoughts…"
                    value={answers[prompt] || ''}
                    onChange={(e) => handleAnswer(prompt, e.target.value)}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  )
}
