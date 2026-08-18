'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
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
import { Loader } from '@/components/Loader'
import { getErrorMessage } from '@/lib/errors'
import { uploadMemoryMediaBatch } from '@/lib/uploads/memoryMedia'

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
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const { familyId, hasFamily, childId, children, setChildId } = useFamily()
  const create = useCreateMemory()
  const [step, setStep] = useState(0)
  const [isFinishing, setIsFinishing] = useState(false)
  const [finishMessage, setFinishMessage] = useState('Saving your memory…')
  const [templateId, setTemplateId] = useState('custom')
  const [title, setTitle] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [mood, setMood] = useState('😊')
  const [desc, setDesc] = useState('')
  const [location, setLocation] = useState('')
  const [prompts, setPrompts] = useState<Record<string, string>>({})
  const [error, setError] = useState('')
  const [files, setFiles] = useState<File[]>([])

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
    setIsFinishing(true)
    setFinishMessage('Saving your memory…')

    try {
      const promptText = Object.entries(prompts)
        .filter(([, answer]) => answer.trim())
        .map(([prompt, answer]) => `${prompt}\n${answer}`)
        .join('\n\n')

      let memory
      try {
        memory = await create.mutateAsync({
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
      } catch (err) {
        setIsFinishing(false)
        setError(`Could not save memory: ${getErrorMessage(err, 'Unknown error')}`)
        return
      }

      queryClient.setQueryData(['memory', memory.id], memory)

      if (files.length > 0) {
        try {
          await uploadMemoryMediaBatch(memory.id, files, (current, total) => {
            setFinishMessage(`Uploading photo ${current} of ${total}…`)
          })
          await queryClient.invalidateQueries({ queryKey: ['memory', memory.id] })
        } catch (err) {
          setIsFinishing(false)
          setError(
            `Memory saved, but some uploads failed: ${getErrorMessage(err, 'Unknown error')}. You can open the memory and add more photos from edit.`,
          )
          router.replace(`/dashboard/memory/${memory.id}`)
          return
        }
      }

      setFinishMessage('Opening your memory…')
      router.replace(`/dashboard/memory/${memory.id}`)
    } catch (err) {
      setIsFinishing(false)
      setError(getErrorMessage(err, 'Could not save memory'))
    }
  }

  if (!hasFamily) {
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

  if (isFinishing) {
    return <Loader fullScreen label="Saving memory" message={finishMessage} />
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
                  Photos or videos (optional)
                </label>
                <input
                  id="media"
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  className="input-field file:mr-4 file:rounded-xl file:border-0 file:bg-primary/10 file:px-4 file:py-2 file:font-semibold file:text-primary"
                  onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
                />
                {files.length > 0 && (
                  <p className="mt-2 text-sm text-ink/55">
                    {files.length} file{files.length === 1 ? '' : 's'} selected — great for events
                    like Aqiqa with many photos.
                  </p>
                )}
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
                  disabled={create.isPending || isFinishing}
                  className="flex-1"
                >
                  Save memory
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageMotion>
  )
}
