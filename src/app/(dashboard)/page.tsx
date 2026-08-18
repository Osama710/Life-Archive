'use client'

import Link from 'next/link'
import { useFamily } from '@/context/FamilyContext'
import { useGetMemories } from '@/hooks/useApi'
import { useDisplayName } from '@/hooks/useDisplayName'
import { AppComingSoonNote, AppFeatureGrid } from '@/components/AppFeatureGrid'
import { EmptyState } from '@/components/EmptyState'
import { PageHeader } from '@/components/PageHeader'
import { PageMotion, StaggerItem, StaggerList } from '@/components/PageMotion'
import { EMPTY_HOME } from '@/lib/quotes'

export default function DashboardHomePage() {
  const { displayName } = useDisplayName()
  const { family, familyId, child, children, setChildId, hasFamily, isLoading } = useFamily()
  const { data } = useGetMemories(familyId || '', 5, 0, hasFamily)
  const recent = data?.memories || []
  const firstName = displayName.split(' ')[0]

  if (!isLoading && !hasFamily) {
    return (
      <PageMotion className="space-y-6">
        <PageHeader
          showBrand
          title={`Hey ${firstName}`}
          subtitle="Set up your family archive, then everything below unlocks."
        />
        <EmptyState
          emoji="🏡"
          title="Create your family archive"
          subtitle="Name your family, add your child, then invite your partner from Family."
          cta="Get started"
          href="/onboarding"
        />
        <section>
          <h2 className="mb-3 px-1 text-xs font-semibold uppercase tracking-widest text-ink/40">
            What you will get
          </h2>
          <AppFeatureGrid compact />
        </section>
      </PageMotion>
    )
  }

  return (
    <PageMotion className="space-y-8">
      <PageHeader
        eyebrow={family?.name || 'Your archive'}
        title={`Hey ${firstName}`}
        subtitle="Your shortcuts to everything in the app."
      />

      <section>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="font-display text-base font-semibold text-ink">Quick access</h2>
          <Link href="/dashboard/more" className="text-sm font-medium text-primary">
            Explore all
          </Link>
        </div>
        <AppFeatureGrid compact />
      </section>

      {children.length > 0 && (
        <section className="surface-card p-5">
          <h2 className="mb-3 font-display text-base font-semibold text-ink">Active child</h2>
          <div className="flex flex-wrap gap-2">
            {children.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setChildId(c.id)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  child?.id === c.id
                    ? 'bg-ink text-white shadow-soft'
                    : 'border border-ink/8 bg-white text-ink/65 hover:border-ink/15'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <h2 className="font-display text-lg font-bold">Recent memories</h2>
          {recent.length > 0 && (
            <Link href="/dashboard/timeline" className="text-sm font-semibold text-primary">
              Timeline
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

      <AppComingSoonNote />
    </PageMotion>
  )
}
