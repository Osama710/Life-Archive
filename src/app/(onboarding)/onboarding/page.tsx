'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { useAuth } from '@/context/AuthContext'
import { useCreateChild, useCreateFamily } from '@/hooks/useApi'

export default function OnboardingPage() {
  const router = useRouter()
  const { user } = useAuth()
  const createFamily = useCreateFamily()
  const createChild = useCreateChild()
  const [step, setStep] = useState(0)
  const [familyName, setFamilyName] = useState('')
  const [childName, setChildName] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [familyId, setFamilyId] = useState('')
  const [error, setError] = useState('')

  const handleFamily = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      const family = await createFamily.mutateAsync(familyName.trim())
      setFamilyId(family.id)
      localStorage.setItem('life-archive.familyId', family.id)
      setStep(1)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create family')
    }
  }

  const handleChild = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !familyId) return
    setError('')
    try {
      const child = await createChild.mutateAsync({
        familyId,
        name: childName.trim(),
        birthDate: birthDate || undefined,
        conceptionDate: birthDate ? undefined : new Date().toISOString().slice(0, 10),
        journeyType: birthDate ? 'childhood' : 'pregnancy',
        createdBy: user.id,
      })
      localStorage.setItem('life-archive.childId', child.id)
      router.replace('/dashboard/timeline')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create child')
    }
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-stone-50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary">
          Welcome
        </p>
        <h1 className="mb-2 font-serif text-3xl font-bold">
          {step === 0 ? 'Name your family archive' : 'Add your first child'}
        </h1>
        <p className="mb-6 text-stone-600">
          {step === 0
            ? 'This becomes the home for every story you preserve.'
            : 'You can add more children later. Start with one.'}
        </p>

        {step === 0 ? (
          <form onSubmit={handleFamily} className="space-y-4">
            <Input
              label="Family name"
              value={familyName}
              onChange={(e) => setFamilyName(e.target.value)}
              placeholder="The Khan Family"
              required
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full" disabled={createFamily.isPending}>
              {createFamily.isPending ? 'Creating…' : 'Continue'}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleChild} className="space-y-4">
            <Input
              label="Child name"
              value={childName}
              onChange={(e) => setChildName(e.target.value)}
              required
            />
            <Input
              type="date"
              label="Birth date (optional for pregnancy)"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full" disabled={createChild.isPending}>
              {createChild.isPending ? 'Saving…' : 'Enter timeline'}
            </Button>
          </form>
        )}
      </div>
    </main>
  )
}
