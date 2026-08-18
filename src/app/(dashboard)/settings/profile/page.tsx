'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/Input'
import { Button } from '@/components/Button'
import { BackLink } from '@/components/BackLink'
import { PageHeader } from '@/components/PageHeader'
import { PageMotion } from '@/components/PageMotion'
import { useAuth } from '@/context/AuthContext'
import { useDisplayName } from '@/hooks/useDisplayName'

export default function EditProfilePage() {
  const { user, signOut } = useAuth()
  const { displayName, initials, loading, updateDisplayName } = useDisplayName()
  const router = useRouter()

  const [nameDraft, setNameDraft] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  useEffect(() => {
    if (!loading) setNameDraft(displayName)
  }, [displayName, loading])

  const nameChanged =
    nameDraft.trim().length >= 2 && nameDraft.trim() !== displayName

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    setSaving(true)

    try {
      await updateDisplayName(nameDraft)
      setMessage({ type: 'success', text: 'Name updated — you look good.' })
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Could not update name',
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <PageMotion className="mx-auto max-w-lg">
      <BackLink href="/dashboard/settings" label="Settings" />

      <PageHeader
        title="Edit profile"
        subtitle="Change how your name shows up everywhere in the app."
      />

      <section className="glass-card space-y-5 p-6">
        <div className="flex items-center gap-4">
          <span className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-brand text-xl font-bold text-white shadow-soft">
            {initials}
          </span>
          <div>
            <p className="font-display text-lg font-bold text-ink">{displayName}</p>
            <p className="text-sm text-ink/50">{user?.email}</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-1">
          <Input
            type="text"
            label="Display name"
            placeholder="Your name"
            value={nameDraft}
            onChange={(e) => {
              setNameDraft(e.target.value)
              setMessage(null)
            }}
            disabled={loading}
            required
            autoComplete="name"
          />
          <Input
            type="email"
            label="Email"
            value={user?.email ?? ''}
            disabled
            hint="Email can't be changed — it's tied to your login."
          />

          {message && (
            <p
              className={`text-sm ${message.type === 'success' ? 'text-success' : 'text-error'}`}
              role="status"
            >
              {message.text}
            </p>
          )}

          <div className="flex flex-wrap gap-3 pt-2">
            <Button type="submit" disabled={loading || saving || !nameChanged}>
              {saving ? 'Saving…' : 'Save name'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.push('/dashboard/settings')}
            >
              Cancel
            </Button>
          </div>
        </form>

        <div className="border-t border-ink/5 pt-4">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={async () => {
              await signOut()
              router.replace('/login')
            }}
          >
            Sign out
          </button>
        </div>
      </section>
    </PageMotion>
  )
}
