import { useState } from 'react'

interface CreateFamilyInput {
  name: string
}

export const useCreateFamily = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createFamily = async (input: CreateFamilyInput) => {
    setLoading(true)
    setError(null)
    try {
      // TODO: Replace with actual API call
      const family = {
        id: Math.random().toString(),
        name: input.name,
        createdAt: new Date().toISOString(),
      }
      return family
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create family')
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { createFamily, loading, error }
}
