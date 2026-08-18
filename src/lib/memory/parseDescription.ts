export interface MemoryPromptAnswer {
  question: string
  answer: string
}

export function parseMemoryDescription(description?: string) {
  if (!description?.trim()) {
    return { story: '', prompts: [] as MemoryPromptAnswer[] }
  }

  const blocks = description.split(/\n\n+/).filter((block) => block.trim())
  const prompts: MemoryPromptAnswer[] = []
  const storyParts: string[] = []

  for (const block of blocks) {
    const newlineIndex = block.indexOf('\n')
    if (newlineIndex === -1) {
      storyParts.push(block.trim())
      continue
    }

    const question = block.slice(0, newlineIndex).trim()
    const answer = block.slice(newlineIndex + 1).trim()

    if (question.endsWith('?') && answer) {
      prompts.push({ question, answer })
    } else {
      storyParts.push(block.trim())
    }
  }

  return {
    story: storyParts.join('\n\n'),
    prompts,
  }
}
