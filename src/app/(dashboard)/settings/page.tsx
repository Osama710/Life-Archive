'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useFamily } from '@/context/FamilyContext'
import { useGetDeletedMemories, useRestoreMemory } from '@/hooks/useApi'

export default function SettingsPage() {
  const { user, signOut } = useAuth()
  const { family, familyId } = useFamily()
  const router = useRouter()
  const { data: trash = [] } = useGetDeletedMemories(familyId || '')
  const restore = useRestoreMemory()

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="font-serif text-4xl font-bold">Settings</h1>

      <section className="card-elevated space-y-2">
        <h2 className="text-xl font-bold">Account</h2>
        <p className="text-stone-600">{user?.email}</p>
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
      </section>

      <section className="card-elevated space-y-2">
        <h2 className="text-xl font-bold">Family</h2>
        <p className="text-stone-600">{family?.name || 'No family selected'}</p>
      </section>

      <section className="card-elevated space-y-3">
        <h2 className="text-xl font-bold">Trash</h2>
        <p className="text-sm text-stone-600">Soft-deleted memories can be restored within 30 days.</p>
        {trash.length === 0 ? (
          <p className="text-sm text-stone-500">Trash is empty.</p>
        ) : (
          <ul className="space-y-2">
            {trash.map((m) => (
              <li key={m.id} className="flex items-center justify-between gap-3">
                <span className="truncate">{m.title}</span>
                <button
                  type="button"
                  className="btn btn-secondary"
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

      <section className="card-elevated space-y-3">
        <h2 className="text-xl font-bold">Export</h2>
        <p className="text-sm text-stone-600">
          Download a portable archive of your family’s memories (JSON + media index).
        </p>
        <a href="/api/export" className="btn btn-primary">
          Export my data
        </a>
      </section>

      <section className="card-elevated space-y-2">
        <h2 className="text-xl font-bold">Privacy</h2>
        <p className="text-sm text-stone-600">
          Memories are private by default. No ads. No behavioral tracking.
        </p>
      </section>
    </div>
  )
}
