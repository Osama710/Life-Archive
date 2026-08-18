'use client'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useGetMemory, useUpdateMemory } from '@/hooks/useApi'

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
    setMood(memory.mood || '')
    setLocation(memory.location || '')
    setDesc(memory.description || '')
  }, [memory])

  if (isLoading) return <div className="spinner mx-auto mt-8" />
  if (isError || !memory) {
    return (
      <div className="card-elevated py-16 text-center">
        <p className="mb-4">Memory not found.</p>
        <Link href="/dashboard/timeline" className="btn btn-primary">
          Back to timeline
        </Link>
      </div>
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
    <div className="mx-auto max-w-2xl">
      <Link href={`/dashboard/memory/${memory.id}`} className="mb-6 inline-block text-sm text-primary">
        ← Back
      </Link>
      <h1 className="mb-8 font-serif text-4xl font-bold">Edit Memory</h1>
      <div className="card-elevated space-y-6">
        <div>
          <label className="form-label" htmlFor="title">
            Title
          </label>
          <input
            id="title"
            className="input-field"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div>
          <label className="form-label" htmlFor="date">
            Date
          </label>
          <input
            id="date"
            type="date"
            className="input-field"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div>
          <label className="form-label" htmlFor="location">
            Location
          </label>
          <input
            id="location"
            className="input-field"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>
        <div>
          <label className="form-label" htmlFor="desc">
            Story
          </label>
          <textarea
            id="desc"
            className="input-field h-32"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="button"
          className="btn btn-primary w-full"
          disabled={update.isPending}
          onClick={save}
        >
          {update.isPending ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </div>
  )
}
