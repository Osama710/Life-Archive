import { describe, expect, it } from 'vitest'
import { parseMemoryDescription } from './parseDescription'

describe('parseMemoryDescription', () => {
  it('splits freeform story from guided prompt answers', () => {
    const result = parseMemoryDescription(
      'Ammar looked so peaceful during the ceremony.\n\nWho was there?\nFamily and close friends\n\nHow did you feel?\nGrateful and emotional',
    )

    expect(result.story).toBe('Ammar looked so peaceful during the ceremony.')
    expect(result.prompts).toEqual([
      { question: 'Who was there?', answer: 'Family and close friends' },
      { question: 'How did you feel?', answer: 'Grateful and emotional' },
    ])
  })
})
