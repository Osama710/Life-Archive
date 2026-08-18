'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useFamily } from '@/context/FamilyContext'
import { createClient } from '@/lib/supabase/client'
import { PageHeader } from '@/components/PageHeader'
import { PageMotion, StaggerItem, StaggerList } from '@/components/PageMotion'
import { EmptyState } from '@/components/EmptyState'
import { Input } from '@/components/Input'
import { TextareaField } from '@/components/TextareaField'
import { Button } from '@/components/Button'
import { EMPTY_LETTERS } from '@/lib/quotes'

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
    <PageMotion className="mx-auto max-w-2xl space-y-8">
      <PageHeader
        title="Letters"
        subtitle="Seal a note for future-you — or someone you love. Unlocks on your date."
      />

      <section className="glass-card space-y-4 p-6">
        <Input
          label="Letter title"
          placeholder="To my 18-year-old self…"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <TextareaField
          label="Your letter"
          placeholder="Dear future you…"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={5}
        />
        <Input
          type="date"
          label="Unlock date"
          value={unlockAt}
          onChange={(e) => setUnlockAt(e.target.value)}
        />
        <Button type="button" onClick={save}>
          Seal letter 🔒
        </Button>
        {error && (
          <p className="alert alert-error text-sm" role="alert">
            {error}
          </p>
        )}
      </section>

      {items.length === 0 ? (
        <EmptyState
          emoji={EMPTY_LETTERS.emoji}
          title={EMPTY_LETTERS.title}
          subtitle={EMPTY_LETTERS.subtitle}
        />
      ) : (
        <StaggerList className="space-y-3">
          {items.map((item) => {
            const unlocked = new Date(item.unlock_at) <= new Date()
            return (
              <StaggerItem key={item.id}>
                <div className="glass-card p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-display text-lg font-bold text-ink">{item.title}</h3>
                    <span
                      className={`badge shrink-0 ${unlocked ? 'badge-success' : 'badge-primary'}`}
                    >
                      {unlocked ? 'Unlocked' : 'Sealed'}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-ink/55">
                    {unlocked ? 'Ready to read' : 'Opens'}{' '}
                    {new Date(item.unlock_at).toLocaleDateString(undefined, {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </StaggerItem>
            )
          })}
        </StaggerList>
      )}
    </PageMotion>
  )
}
