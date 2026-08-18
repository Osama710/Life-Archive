'use client'

import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useFamily } from '@/context/FamilyContext'
import { useDisplayName } from '@/hooks/useDisplayName'
import { useGetDeletedMemories, useRestoreMemory } from '@/hooks/useApi'
import { PageHeader } from '@/components/PageHeader'
import { AppBrandRow } from '@/components/AppBrandRow'
import { PageMotion } from '@/components/PageMotion'
import { BRAND } from '@/lib/brand'
import { EMPTY_TRASH } from '@/lib/quotes'

export default function SettingsPage() {
  const { user, signOut } = useAuth()
  const { displayName, initials } = useDisplayName()
  const { family, familyId } = useFamily()
  const router = useRouter()
  const { data: trash = [] } = useGetDeletedMemories(familyId || '')
  const restore = useRestoreMemory()

  return (
    <PageMotion className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        showBrand
        title="Settings"
        subtitle="Your account, your rules."
      />

      <section className="glass-card overflow-hidden p-0">
        <Link
          href="/dashboard/settings/profile"
          className="flex items-center gap-4 p-6 transition hover:bg-white/50"
        >
          <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-brand text-lg font-bold text-white shadow-soft">
            {initials}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-lg font-bold text-ink">
              {displayName}
            </p>
            <p className="truncate text-sm text-ink/55">{user?.email}</p>
          </div>
          <span className="flex items-center gap-1 text-sm font-semibold text-primary">
            Edit
            <ChevronRight size={18} aria-hidden="true" />
          </span>
        </Link>
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

      <section className="glass-card p-6">
        <AppBrandRow size={48} showTagline />
        <p className="mt-4 text-sm leading-relaxed text-ink/55">
          {BRAND.name} helps families save photos, stories, and little moments that
          would otherwise live only in camera rolls and group chats.
        </p>
      </section>

      <button
        type="button"
        className="btn btn-secondary w-full sm:w-auto"
        onClick={async () => {
          await signOut()
          router.replace('/login')
        }}
      >
        Sign out
      </button>
    </PageMotion>
  )
}
