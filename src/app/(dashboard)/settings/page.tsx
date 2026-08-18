'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/Input'
import { Button } from '@/components/Button'
import { useAuth } from '@/context/AuthContext'
import { useFamily } from '@/context/FamilyContext'
import { useDisplayName } from '@/hooks/useDisplayName'
import { useGetDeletedMemories, useRestoreMemory } from '@/hooks/useApi'
import { PageMotion } from '@/components/PageMotion'
import { EMPTY_TRASH } from '@/lib/quotes'

export default function SettingsPage() {
  const { user, signOut } = useAuth()
  const { displayName, initials, loading, updateDisplayName } = useDisplayName()
  const { family, familyId } = useFamily()
  const router = useRouter()
  const { data: trash = [] } = useGetDeletedMemories(familyId || '')
  const restore = useRestoreMemory()

  const [nameDraft, setNameDraft] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  useEffect(() => {
    if (!loading) setNameDraft(displayName)
  }, [displayName, loading])

  const nameChanged =
    nameDraft.trim().length >= 2 && nameDraft.trim() !== displayName

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaveMessage(null)
    setSaving(true)

    try {
      await updateDisplayName(nameDraft)
      setSaveMessage({ type: 'success', text: 'Name updated — looking good.' })
    } catch (err) {
      setSaveMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Could not update name',
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <PageMotion className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-4xl font-bold tracking-tight">Settings</h1>
        <p className="mt-2 text-ink/55">Your account, your rules.</p>
      </div>

      <section className="glass-card space-y-5 p-6">
        <div className="flex items-center gap-4">
          <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-brand text-lg font-bold text-white shadow-soft">
            {initials}
          </span>
          <div>
            <h2 className="font-display text-xl font-bold">Profile</h2>
            <p className="text-sm text-ink/55">
              This is how your name shows up across the app.
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveName} className="space-y-1">
          <Input
            type="text"
            label="Display name"
            placeholder="Your name"
            value={nameDraft}
            onChange={(e) => {
              setNameDraft(e.target.value)
              setSaveMessage(null)
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
            hint="Email can't be changed here — it's tied to your login."
          />

          {saveMessage && (
            <p
              className={`text-sm ${saveMessage.type === 'success' ? 'text-success' : 'text-error'}`}
              role="status"
            >
              {saveMessage.text}
            </p>
          )}

          <Button
            type="submit"
            disabled={loading || saving || !nameChanged}
            className="mt-2"
          >
            {saving ? 'Saving…' : 'Save name'}
          </Button>
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

      <section className="glass-card space-y-2 p-6">
        <h2 className="font-display text-xl font-bold">Family</h2>
        <p className="text-ink/60">{family?.name || 'No family selected yet'}</p>
      </section>

      <section className="glass-card space-y-4 p-6">
        <h2 className="font-display text-xl font-bold">Trash</h2>
        <p className="text-sm text-ink/55">
          Soft-deleted memories chill here for 30 days. Then they ghost forever.
        </p>
        {trash.length === 0 ? (
          <p className="rounded-xl bg-white/50 px-4 py-6 text-center text-sm text-ink/50">
            {EMPTY_TRASH.emoji} {EMPTY_TRASH.title}
          </p>
        ) : (
          <ul className="space-y-2">
            {trash.map((m) => (
              <li
                key={m.id}
                className="flex items-center justify-between gap-3 rounded-xl bg-white/60 px-3 py-2"
              >
                <span className="truncate font-medium">{m.title}</span>
                <button
                  type="button"
                  className="btn btn-secondary shrink-0"
                  disabled={restore.isPending}
                  onClick={() => restore.mutate(m.id)}
                >
                  Restore
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="glass-card space-y-3 p-6">
        <h2 className="font-display text-xl font-bold">Export</h2>
        <p className="text-sm text-ink/55">
          Download a portable archive of your family&apos;s memories (JSON + media index).
        </p>
        <a href="/api/export" className="btn btn-primary">
          Export my data
        </a>
      </section>

      <section className="glass-card space-y-2 p-6">
        <h2 className="font-display text-xl font-bold">Privacy</h2>
        <p className="text-sm text-ink/55">
          Memories are private by default. No ads. No creepy tracking. Just your story.
        </p>
      </section>
    </PageMotion>
  )
}
