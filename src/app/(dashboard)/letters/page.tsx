'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useFamily } from '@/context/FamilyContext'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

interface Capsule {
  id: string
  title: string
  unlock_at: string
  created_at: string
}

export default function LettersPage() {
  const { user } = useAuth()
  const { familyId, childId } = useFamily()
  const queryClient = useQueryClient()
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [unlockAt, setUnlockAt] = useState('')
  const [error, setError] = useState('')

  const { data: items = [] } = useQuery({
    queryKey: ['time_capsules', familyId],
    enabled: !!familyId,
    queryFn: async () => {
      const { data } = await supabase
        .from('time_capsules')
        .select('id,title,unlock_at,created_at')
        .eq('family_id', familyId!)
        .is('deleted_at', null)
        .order('unlock_at', { ascending: true })
      return (data as Capsule[]) || []
    },
  })

  const save = async () => {
    if (!user || !familyId || !title.trim() || !body.trim() || !unlockAt) return
    setError('')
    const { error: insertError } = await supabase.from('time_capsules').insert({
      family_id: familyId,
      child_id: childId,
      title: title.trim(),
      encrypted_content: btoa(unescape(encodeURIComponent(body))),
      unlock_at: new Date(unlockAt).toISOString(),
      created_by: user.id,
      recipient_user_id: user.id,
    })
    if (insertError) {
      setError(insertError.message)
      return
    }
    setTitle('')
    setBody('')
    setUnlockAt('')
    await queryClient.invalidateQueries({ queryKey: ['time_capsules', familyId] })
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="font-serif text-4xl font-bold">Letters</h1>
        <p className="text-stone-600">Write a note that unlocks later.</p>
      </div>

      <div className="card-elevated space-y-4">
        <input
          className="input-field"
          placeholder="Letter title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className="input-field h-32"
          placeholder="Dear future you…"
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
        <input
          type="date"
          className="input-field"
          value={unlockAt}
          onChange={(e) => setUnlockAt(e.target.value)}
        />
        <button type="button" className="btn btn-primary" onClick={save}>
          Seal letter
        </button>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>

      <div className="space-y-3">
        {items.map((item) => {
          const unlocked = new Date(item.unlock_at) <= new Date()
          return (
            <div key={item.id} className="card-elevated">
              <h3 className="font-bold">{item.title}</h3>
              <p className="text-sm text-stone-600">
                {unlocked ? 'Unlocked' : 'Sealed until'}{' '}
                {new Date(item.unlock_at).toLocaleDateString()}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
