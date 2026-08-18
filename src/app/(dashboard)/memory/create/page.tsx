'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useCreateMemory } from '@/hooks/useApi'
import { useAuth } from '@/context/AuthContext'
import { useFamily } from '@/context/FamilyContext'
import { GuidedPrompts } from '@/components/GuidedPrompts'
import { PageHeader } from '@/components/PageHeader'
import { PageMotion } from '@/components/PageMotion'
import { EmptyState } from '@/components/EmptyState'
import { Input } from '@/components/Input'
import { TextareaField } from '@/components/TextareaField'
import { SelectField } from '@/components/SelectField'
import { Button } from '@/components/Button'

const TEMPLATES = [
  { id: 'first-smile', icon: '😊', title: 'First Smile' },
  { id: 'milestone', icon: '🎉', title: 'Milestone' },
  { id: 'family', icon: '👨‍👩‍👧', title: 'Family Time' },
  { id: 'holiday', icon: '🎄', title: 'Holiday' },
  { id: 'adventure', icon: '🏔️', title: 'Adventure' },
  { id: 'love', icon: '💛', title: 'Everyday Joy' },
]

const MOODS = ['😊', '😄', '😍', '😢', '🤔', '🥹', '🔥', '✨']

export default function MemoryCreatePage() {
  const router = useRouter()
  const { user } = useAuth()
  const { familyId, childId, children, setChildId } = useFamily()
  const create = useCreateMemory()
  const [step, setStep] = useState(0)
  const [templateId, setTemplateId] = useState('custom')
  const [title, setTitle] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [mood, setMood] = useState('😊')
  const [desc, setDesc] = useState('')
  const [location, setLocation] = useState('')
  const [prompts, setPrompts] = useState<Record<string, string>>({})
  const [error, setError] = useState('')
  const [file, setFile] = useState<File | null>(null)

  const uploadMedia = async (memoryId: string, selected: File) => {
    const signRes = await fetch('/api/uploads/sign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        memoryId,
        fileName: selected.name,
        mimeType: selected.type || 'application/octet-stream',
      }),
    })
    const sign = await signRes.json()
    if (!signRes.ok) throw new Error(sign.error || 'Upload sign failed')

    const form = new FormData()
    form.append('file', selected)
    form.append('api_key', sign.apiKey)
    form.append('timestamp', String(sign.timestamp))
    form.append('signature', sign.signature)
    form.append('folder', sign.folder)
    const cloudRes = await fetch(
      `https://api.cloudinary.com/v1_1/${sign.cloudName}/auto/upload`,
      { method: 'POST', body: form },
    )
    const cloud = await cloudRes.json()
    if (!cloudRes.ok) throw new Error(cloud.error?.message || 'Cloudinary upload failed')

    const completeRes = await fetch('/api/uploads/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        memoryId,
        mediaType: selected.type.startsWith('video/') ? 'video' : 'photo',
        providerAssetId: cloud.public_id,
        url: cloud.url,
        secureUrl: cloud.secure_url,
        thumbnailUrl: cloud.secure_url,
        fileName: selected.name,
        mimeType: selected.type,
        bytes: cloud.bytes,
        width: cloud.width,
        height: cloud.height,
      }),
    })
    if (!completeRes.ok) {
      const err = await completeRes.json()
      throw new Error(err.error || 'Could not save media')
    }
  }

  const handleSave = async () => {
    if (!user || !familyId) {
      setError('Choose a family before saving a memory.')
      return
    }
    if (!title.trim()) {
      setError('Add a title for this memory.')
      return
    }
    setError('')
    try {
      const promptText = Object.entries(prompts)
        .filter(([, answer]) => answer.trim())
        .map(([prompt, answer]) => `${prompt}\n${answer}`)
        .join('\n\n')
      const memory = await create.mutateAsync({
        familyId,
        childId: childId || undefined,
        title: title.trim(),
        description: [desc, promptText].filter(Boolean).join('\n\n') || undefined,
        memoryDate: date,
        mood,
        location: location || undefined,
        isFavorite: false,
        isPrivate: true,
        createdBy: user.id,
      })
      if (file) await uploadMedia(memory.id, file)
      router.push(`/dashboard/memory/${memory.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save memory')
    }
  }

  if (!familyId) {
    return (
      <PageMotion className="mx-auto max-w-lg">
        <EmptyState
          emoji="🏡"
          title="Set up your archive first"
          subtitle="Finish onboarding before capturing memories."
          cta="Continue setup"
          href="/onboarding"
        />
      </PageMotion>
    )
  }

  return (
    <PageMotion className="mx-auto max-w-2xl">
      <AnimatePresence mode="wait">
        {step === 0 ? (
          <motion.div
            key="templates"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <PageHeader
              title="New memory"
              subtitle="Pick a vibe — or just start from scratch."
            />
            <div className="grid grid-cols-2 gap-4">
              {TEMPLATES.map((t, i) => (
                <motion.button
                  key={t.id}
                  type="button"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ scale: 1.03, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setTemplateId(t.id)
                    setTitle(t.title)
                    setStep(1)
                  }}
                  className="glass-card p-8 text-center"
                >
                  <div className="mb-3 text-5xl" aria-hidden>
                    {t.icon}
                  </div>
                  <p className="font-display font-bold text-ink">{t.title}</p>
                </motion.button>
              ))}
            </div>
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => {
                  setTemplateId('custom')
                  setStep(1)
                }}
                className="text-sm font-semibold text-primary hover:underline"
              >
                Skip — start blank
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <PageHeader title="Create memory" subtitle="The details that make it yours." />
            <div className="glass-card space-y-2 p-6">
              {children.length > 0 && (
                <SelectField
                  label="Child"
                  id="child"
                  value={childId || ''}
                  onChange={(e) => setChildId(e.target.value || null)}
                >
                  <option value="">Whole family</option>
                  {children.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </SelectField>
              )}
              <Input
                id="title"
                label="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <Input
                id="date"
                type="date"
                label="Date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
              <div className="mb-4">
                <p className="form-label">How did you feel?</p>
                <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
                  {MOODS.map((e) => (
                    <motion.button
                      key={e}
                      type="button"
                      whileTap={{ scale: 0.92 }}
                      aria-pressed={mood === e}
                      onClick={() => setMood(e)}
                      className={`rounded-2xl border-2 p-2 text-2xl transition ${
                        mood === e
                          ? 'border-primary/40 bg-gradient-to-br from-violet-500/15 to-fuchsia-500/10 shadow-soft'
                          : 'border-ink/8 bg-white/60 hover:border-primary/20'
                      }`}
                    >
                      {e}
                    </motion.button>
                  ))}
                </div>
              </div>
              <Input
                id="location"
                label="Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Home, hospital, that one café…"
              />
              <TextareaField
                id="desc"
                label="Story"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Tell the story…"
                rows={4}
              />
              <GuidedPrompts memoryType={templateId} onAnswersChange={setPrompts} />
              <div className="mb-4">
                <label className="form-label" htmlFor="media">
                  Photo or video (optional)
                </label>
                <input
                  id="media"
                  type="file"
                  accept="image/*,video/*"
                  className="input-field file:mr-4 file:rounded-xl file:border-0 file:bg-primary/10 file:px-4 file:py-2 file:font-semibold file:text-primary"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
              </div>
              {error && (
                <p className="alert alert-error text-sm" role="alert">
                  {error}
                </p>
              )}
              <div className="flex gap-2 pt-2">
                <Button type="button" variant="secondary" onClick={() => setStep(0)} className="flex-1">
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={handleSave}
                  disabled={create.isPending}
                  className="flex-1"
                >
                  {create.isPending ? 'Saving…' : 'Save memory'}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageMotion>
  )
}
