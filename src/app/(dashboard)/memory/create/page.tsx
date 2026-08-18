'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCreateMemory } from '@/hooks/useApi'
import { useAuth } from '@/context/AuthContext'
import { useFamily } from '@/context/FamilyContext'
import { GuidedPrompts } from '@/components/GuidedPrompts'

const TEMPLATES = [
  { id: 'first-smile', icon: '😊', title: 'First Smile' },
  { id: 'milestone', icon: '🎉', title: 'Milestone' },
  { id: 'family', icon: '👨‍👩‍👧', title: 'Family Time' },
  { id: 'holiday', icon: '🎄', title: 'Holiday' },
  { id: 'adventure', icon: '🏔️', title: 'Adventure' },
  { id: 'love', icon: '💛', title: 'Everyday Joy' },
]

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
      <div className="card-elevated text-center py-16">
        <p className="mb-4">Finish onboarding before creating memories.</p>
        <a href="/onboarding" className="btn btn-primary">
          Continue setup
        </a>
      </div>
    )
  }

  if (step === 0) {
    return (
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-8 text-center font-serif text-4xl font-bold">New Memory</h1>
        <p className="mb-8 text-center text-stone-600">Choose a template</p>
        <div className="grid grid-cols-2 gap-4">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setTemplateId(t.id)
                setTitle(t.title)
                setStep(1)
              }}
              className="card-elevated p-8 text-center hover:scale-[1.02]"
            >
              <div className="mb-3 text-5xl" aria-hidden>
                {t.icon}
              </div>
              <p className="font-bold">{t.title}</p>
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl animate-slide-up">
      <h1 className="mb-8 font-serif text-4xl font-bold">Create Memory</h1>
      <div className="card-elevated space-y-6">
        {children.length > 0 && (
          <div>
            <label className="form-label" htmlFor="child">
              Child
            </label>
            <select
              id="child"
              className="input-field"
              value={childId || ''}
              onChange={(e) => setChildId(e.target.value || null)}
            >
              <option value="">Whole family</option>
              {children.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        )}
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
          <p className="form-label">How did you feel?</p>
          <div className="grid grid-cols-5 gap-2">
            {['😊', '😄', '😍', '😢', '🤔'].map((e) => (
              <button
                key={e}
                type="button"
                aria-pressed={mood === e}
                onClick={() => setMood(e)}
                className={`rounded-lg border-2 p-3 text-3xl ${
                  mood === e ? 'border-primary bg-blue-50' : 'border-stone-200'
                }`}
              >
                {e}
              </button>
            ))}
          </div>
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
            placeholder="Home, hospital…"
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
            placeholder="Tell the story…"
          />
        </div>
        <GuidedPrompts memoryType={templateId} onAnswersChange={setPrompts} />
        <div>
          <label className="form-label" htmlFor="media">
            Photo or video (optional)
          </label>
          <input
            id="media"
            type="file"
            accept="image/*,video/*"
            className="input-field"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex gap-2">
          <button type="button" onClick={() => setStep(0)} className="btn btn-secondary flex-1">
            Back
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={create.isPending}
            className="btn btn-primary flex-1"
          >
            {create.isPending ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}
