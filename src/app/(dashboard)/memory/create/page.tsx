'use client'
import { useState } from 'react'
import { useCreateMemory } from '@/hooks/useApi'
import { useRouter } from 'next/navigation'

const TEMPLATES = [
  { id: 'smile', icon: '😊', title: 'First Smile' },
  { id: 'milestone', icon: '🎉', title: 'Milestone' },
  { id: 'family', icon: '👨‍👩‍👧', title: 'Family Time' },
  { id: 'holiday', icon: '🎄', title: 'Holiday' },
  { id: 'adventure', icon: '🏔️', title: 'Adventure' },
  { id: 'love', icon: '💛', title: 'Everyday Joy' },
]

export default function MemoryCreatePage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [title, setTitle] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [mood, setMood] = useState('😊')
  const [desc, setDesc] = useState('')
  const create = useCreateMemory()

  const handleSave = async () => {
    await create.mutateAsync({
      familyId: 'default-id',
      childId: 'default-id',
      title,
      description: desc,
      memoryDate: date,
      mood,
      isFavorite: false,
      isPrivate: true,
      createdBy: 'user-id'
    })
    router.push('/dashboard/timeline')
  }

  if (step === 0) return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-4xl font-bold mb-8 text-center">✨ New Memory</h1>
      <p className="text-center text-gray-600 mb-8">Choose a template</p>
      <div className="grid grid-cols-2 gap-4">
        {TEMPLATES.map(t => (
          <button key={t.id} onClick={() => setStep(1)} className="card-elevated p-8 text-center hover:scale-105">
            <div className="text-5xl mb-3">{t.icon}</div>
            <p className="font-bold">{t.title}</p>
          </button>
        ))}
      </div>
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto animate-slide-up">
      <h1 className="text-4xl font-bold mb-8">Create Memory</h1>
      <div className="space-y-6 card-elevated">
        <div>
          <label className="form-label">Title</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Memory title" className="input-field" />
        </div>
        <div>
          <label className="form-label">Date</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className="input-field" />
        </div>
        <div>
          <label className="form-label">How did you feel?</label>
          <div className="grid grid-cols-5 gap-2">
            {['😊', '😄', '😍', '😢', '🤔'].map(e => (
              <button key={e} onClick={() => setMood(e)} className={`p-3 text-3xl rounded-lg border-2 ${mood === e ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>{e}</button>
            ))}
          </div>
        </div>
        <div>
          <label className="form-label">Description</label>
          <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Tell the story..." className="input-field h-32" />
        </div>
        <div className="flex gap-2">
          <button onClick={() => setStep(0)} className="btn btn-secondary flex-1">Back</button>
          <button onClick={handleSave} disabled={create.isPending} className="btn btn-primary flex-1">{create.isPending ? 'Saving...' : 'Save'}</button>
        </div>
      </div>
    </div>
  )
}