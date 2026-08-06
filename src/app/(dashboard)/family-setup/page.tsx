'use client'

import { useState } from 'react'
import { useCreateFamily } from '@/hooks/useCreateFamily'
import { Input } from '@/components/Input'
import { Button } from '@/components/Button'

export default function FamilySetupPage() {
  const [familyName, setFamilyName] = useState('')
  const { createFamily, loading } = useCreateFamily()

  const handleCreateFamily = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!familyName.trim()) return

    try {
      await createFamily({ name: familyName })
      // Redirect to child setup
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold mb-2 text-center">Create Your Family</h1>
        <p className="text-gray-600 text-center mb-8">Give your family archive a name</p>

        <form onSubmit={handleCreateFamily} className="space-y-4">
          <Input
            label="Family Name"
            placeholder="e.g., The Khan Family"
            value={familyName}
            onChange={(e) => setFamilyName(e.target.value)}
            required
          />
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Creating...' : 'Create Family'}
          </Button>
        </form>
      </div>
    </div>
  )
}
