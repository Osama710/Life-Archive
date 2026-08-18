'use client'

import Link from 'next/link'
import { useFamily } from '@/context/FamilyContext'
import { useGetMemories } from '@/hooks/useApi'
import { useDisplayName } from '@/hooks/useDisplayName'
import { EmptyState } from '@/components/EmptyState'
import { PageMotion, StaggerItem, StaggerList } from '@/components/PageMotion'
import { EMPTY_HOME } from '@/lib/quotes'

export default function DashboardHomePage() {
  const { displayName } = useDisplayName()
  const { family, familyId, child, children, setChildId } = useFamily()
  const { data } = useGetMemories(familyId || '', 5, 0)
  const recent = data?.memories || []
  const firstName = displayName.split(' ')[0]

  return (
    <PageMotion className="space-y-10">
      <section>
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-primary/80">
          {family?.name || 'Your archive'}
        </p>
        <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
          Hey {firstName}{' '}
          <span className="inline-block animate-[float_3s_ease-in-out_infinite]" aria-hidden="true">
            👋
          </span>
        </h1>
        <p className="mt-3 max-w-2xl text-lg leading-relaxed text-ink/60">
          This is where the random Tuesday wins and chaotic holiday pics live
          forever. No judgment. Just vibes.
        </p>
      </section>

      <div className="flex flex-wrap gap-3">
        <Link href="/dashboard/memory/create" className="btn btn-primary">
          + Add memory
        </Link>
        <Link href="/dashboard/timeline" className="btn btn-secondary">
          Open timeline
        </Link>
      </div>

      {children.length > 0 && (
        <section className="glass-card p-6">
          <h2 className="mb-4 font-display text-xl font-bold">Your crew</h2>
          <div className="flex flex-wrap gap-2">
            {children.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setChildId(c.id)}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition-all ${
                  child?.id === c.id
                    ? 'border-primary/30 bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 text-primary shadow-soft'
                    : 'border-ink/10 bg-white/80 text-ink/70 hover:border-primary/20'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="mb-5 flex items-end justify-between gap-4">
          <h2 className="font-display text-2xl font-bold">Recent drops</h2>
          {recent.length > 0 && (
            <Link
              href="/dashboard/timeline"
              className="text-sm font-semibold text-primary hover:underline"
            >
              See all
            </Link>
          )}
        </div>

        {recent.length === 0 ? (
          <EmptyState
            emoji={EMPTY_HOME.emoji}
            title={EMPTY_HOME.title}
            subtitle={EMPTY_HOME.subtitle}
            cta={EMPTY_HOME.cta}
            href="/dashboard/memory/create"
          />
        ) : (
          <StaggerList className="space-y-3">
            {recent.map((m) => (
              <StaggerItem key={m.id}>
                <Link href={`/dashboard/memory/${m.id}`} className="card block">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl" aria-hidden="true">
                      {m.mood || '📖'}
                    </span>
                    <div>
                      <h3 className="font-bold text-ink">{m.title}</h3>
                      <p className="text-sm text-ink/50">
                        {new Date(m.memoryDate).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </StaggerList>
        )}
      </section>
    </PageMotion>
  )
}
