'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useGetMemory, useUpdateMemory } from '@/hooks/useApi'
import { BackLink } from '@/components/BackLink'
import { PageHeader } from '@/components/PageHeader'
import { PageMotion } from '@/components/PageMotion'
import { Loader } from '@/components/Loader'
import { EmptyState } from '@/components/EmptyState'
import { Input } from '@/components/Input'
import { TextareaField } from '@/components/TextareaField'
import { Button } from '@/components/Button'

const MOODS = ['😊', '😄', '😍', '😢', '🤔', '🥹', '🔥', '✨']

export default function MemoryEditPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { user } = useAuth()
  const { data: memory, isLoading, isError } = useGetMemory(params.id)
  const update = useUpdateMemory()
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [mood, setMood] = useState('')
  const [location, setLocation] = useState('')
  const [desc, setDesc] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!memory) return
    setTitle(memory.title)
    setDate(memory.memoryDate)
    setMood(memory.mood || '😊')
    setLocation(memory.location || '')
    setDesc(memory.description || '')
  }, [memory])

  if (isLoading) return <Loader label="Loading memory" />
  if (isError || !memory) {
    return (
      <PageMotion className="mx-auto max-w-lg">
        <EmptyState
          emoji="🔍"
          title="Memory not found"
          subtitle="Can't edit what isn't here."
          cta="Back to timeline"
          href="/dashboard/timeline"
        />
      </PageMotion>
    )
  }

  const save = async () => {
    if (!title.trim()) {
      setError('Title is required.')
      return
    }
    setError('')
    try {
      await update.mutateAsync({
        id: memory.id,
        title: title.trim(),
        memoryDate: date,
        mood: mood || undefined,
        location: location || undefined,
        description: desc || undefined,
        updatedBy: user?.id,
      })
      router.push(`/dashboard/memory/${memory.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save')
    }
  }

  return (
    <PageMotion className="mx-auto max-w-2xl">
      <BackLink href={`/dashboard/memory/${memory.id}`} label="Back to memory" />
      <PageHeader title="Edit memory" subtitle="Tweak the details — the story stays yours." />

      <div className="glass-card space-y-2 p-6">
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
          <p className="form-label">Mood</p>
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
            {MOODS.map((e) => (
              <button
                key={e}
                type="button"
                aria-pressed={mood === e}
                onClick={() => setMood(e)}
                className={`rounded-2xl border-2 p-2 text-2xl transition ${
                  mood === e
                    ? 'border-primary/40 bg-gradient-to-br from-violet-500/15 to-fuchsia-500/10'
                    : 'border-ink/8 bg-white/60 hover:border-primary/20'
                }`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>
        <Input
          id="location"
          label="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <TextareaField
          id="desc"
          label="Story"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          rows={5}
        />
        {error && (
          <p className="alert alert-error text-sm" role="alert">
            {error}
          </p>
        )}
        <Button
          type="button"
          className="mt-2 w-full"
          disabled={update.isPending}
          onClick={save}
        >
          {update.isPending ? 'Saving…' : 'Save changes'}
        </Button>
      </div>
    </PageMotion>
  )
}
