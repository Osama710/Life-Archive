'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { AuthShell } from '@/components/AuthShell'
import { useAuth } from '@/context/AuthContext'
import { useCreateChild, useCreateFamily } from '@/hooks/useApi'
import { getErrorMessage } from '@/lib/errors'

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
      setError(getErrorMessage(err, 'Could not create family'))
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
      setError(getErrorMessage(err, 'Could not create child'))
    }
  }

  return (
    <AuthShell
      title={step === 0 ? 'Name your archive' : 'Add your first child'}
      subtitle={
        step === 0
          ? 'This becomes the home for every story you preserve.'
          : 'You can add more later — start with one.'
      }
    >
      <div className="mb-6 flex gap-2">
        {[0, 1].map((s) => (
          <div
            key={s}
            className={`h-1.5 flex-1 rounded-full transition-all ${
              s <= step ? 'bg-gradient-brand' : 'bg-ink/10'
            }`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 0 ? (
          <motion.form
            key="family"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
            onSubmit={handleFamily}
            className="space-y-4"
          >
            <Input
              label="Family name"
              value={familyName}
              onChange={(e) => setFamilyName(e.target.value)}
              placeholder="The Khan Family"
              required
            />
            {error && (
              <p className="alert alert-error text-sm" role="alert">
                {error}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={createFamily.isPending}>
              {createFamily.isPending ? 'Creating…' : 'Continue'}
            </Button>
          </motion.form>
        ) : (
          <motion.form
            key="child"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            onSubmit={handleChild}
            className="space-y-4"
          >
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
            {error && (
              <p className="alert alert-error text-sm" role="alert">
                {error}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={createChild.isPending}>
              {createChild.isPending ? 'Saving…' : 'Enter timeline ✨'}
            </Button>
          </motion.form>
        )}
      </AnimatePresence>
    </AuthShell>
  )
}
