'use client'

import Link from 'next/link'
import { useFamily } from '@/context/FamilyContext'
import { useGetMemories } from '@/hooks/useApi'
import { Loader } from '@/components/Loader'
import { EmptyState } from '@/components/EmptyState'
import { PageMotion, StaggerItem, StaggerList } from '@/components/PageMotion'
import { EMPTY_TIMELINE } from '@/lib/quotes'

export default function TimelinePage() {
  const { familyId, family, isLoading: familyLoading } = useFamily()
  const { data, isLoading, isError } = useGetMemories(familyId || '', 20, 0)
  const memories = data?.memories || []

  if (familyLoading || isLoading) {
    return <Loader label="Loading timeline" />
  }

  if (!familyId) {
    return (
      <PageMotion>
        <EmptyState
          emoji="🏡"
          title="Your archive needs a home base"
          subtitle="Set up your family space first — name it, add your people, then the timeline gets spicy."
          cta="Start onboarding"
          href="/onboarding"
        />
      </PageMotion>
    )
  }

  if (isError) {
    return (
      <p className="alert alert-error" role="alert">
        Could not load memories. The vibes are off — try again?
      </p>
    )
  }

  return (
    <PageMotion>
      <div className="mb-10">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary/80">
          {family?.name}
        </p>
        <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
          Timeline
        </h1>
        <p className="mt-2 text-lg text-ink/60">
          Every moment, chronologically unbothered.
        </p>
      </div>

      <div className="mb-8">
        <Link href="/dashboard/memory/create" className="btn btn-primary">
          + New memory
        </Link>
      </div>

      {memories.length === 0 ? (
        <EmptyState
          emoji={EMPTY_TIMELINE.emoji}
          title={EMPTY_TIMELINE.title}
          subtitle={EMPTY_TIMELINE.subtitle}
          cta={EMPTY_TIMELINE.cta}
          href="/dashboard/memory/create"
        />
      ) : (
        <StaggerList className="space-y-4">
          {memories.map((m) => (
            <StaggerItem key={m.id}>
              <Link href={`/dashboard/memory/${m.id}`}>
                <article className="card-elevated group cursor-pointer">
                  <div className="flex items-start gap-4">
                    <span className="text-3xl transition group-hover:scale-110" aria-hidden="true">
                      {m.mood || '📖'}
                    </span>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold transition group-hover:text-primary">
                        {m.title}
                      </h3>
                      <p className="text-sm text-ink/55">
                        {new Date(m.memoryDate).toLocaleDateString(undefined, {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                      {m.location && (
                        <p className="mt-1 text-xs text-ink/40">📍 {m.location}</p>
                      )}
                    </div>
                  </div>
                </article>
              </Link>
            </StaggerItem>
          ))}
        </StaggerList>
      )}
    </PageMotion>
  )
}
