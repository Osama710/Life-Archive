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
  const prompts = PROMPTS_BY_TYPE[memoryType] || PROMPTS_BY_TYPE.custom
  const [answers, setAnswers] = React.useState<Record<string, string>>({})
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>({})

  const handleAnswer = (prompt: string, value: string) => {
    const newAnswers = { ...answers, [prompt]: value }
    setAnswers(newAnswers)
    onAnswersChange(newAnswers)
  }

  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-gray-900 mb-4">Let's capture this moment</h3>
      {prompts.map((prompt, idx) => (
        <div key={idx} className="border border-gray-200 rounded-lg">
          <button
            onClick={() => setExpanded({ ...expanded, [idx]: !expanded[idx] })}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50"
          >
            <span className="text-gray-900">{prompt}</span>
            <span className="text-gray-400">{expanded[idx] ? '▼' : '▶'}</span>
          </button>
          {expanded[idx] && (
            <div className="px-4 pb-3 bg-gray-50">
              <textarea
                className="input-field w-full h-20 text-sm"
                placeholder="Share your thoughts..."
                value={answers[prompt] || ''}
                onChange={(e) => handleAnswer(prompt, e.target.value)}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

import React from 'react'
