'use client'

import Link from 'next/link'
import { useFamily } from '@/context/FamilyContext'
import { useGetMemories } from '@/hooks/useApi'
import { Loader } from '@/components/Loader'
import { EmptyState } from '@/components/EmptyState'
import { PageHeader } from '@/components/PageHeader'
import { PageMotion, StaggerItem, StaggerList } from '@/components/PageMotion'
import { EMPTY_TIMELINE } from '@/lib/quotes'

export default function TimelinePage() {
  const { familyId, family, isLoading: familyLoading, hasFamily } = useFamily()
  const {
    data,
    isLoading: memoriesLoading,
    isError,
    refetch,
  } = useGetMemories(familyId || '', 20, 0, hasFamily)
  const memories = data?.memories || []

  if (familyLoading) {
    return <Loader label="Loading timeline" message="Checking your family archive…" />
  }

  if (!hasFamily) {
    return (
      <PageMotion>
        <EmptyState
          emoji="🏡"
          title="Your archive needs a home base"
          subtitle="Set up your family space first — name it, add your people, then the timeline gets spicy."
          cta="Create family archive"
          href="/onboarding"
        />
      </PageMotion>
    )
  }

  if (memoriesLoading && !data) {
    return <Loader label="Loading timeline" message="Fetching your memories…" />
  }

  return (
    <PageMotion>
      <PageHeader
        eyebrow={family?.name}
        title="Timeline"
        subtitle="Every moment, chronologically unbothered."
      />

      {isError && (
        <div className="alert alert-error mb-6 flex flex-wrap items-center justify-between gap-3" role="alert">
          <span>Could not load memories right now.</span>
          <button type="button" className="btn btn-secondary" onClick={() => refetch()}>
            Try again
          </button>
        </div>
      )}

      <div className="mb-8">
        <Link href="/dashboard/memory/create" className="btn btn-primary">
          + New memory
        </Link>
      </div>

      {!isError && memories.length === 0 ? (
        <EmptyState
          emoji={EMPTY_TIMELINE.emoji}
          title={EMPTY_TIMELINE.title}
          subtitle={EMPTY_TIMELINE.subtitle}
          cta={EMPTY_TIMELINE.cta}
          href="/dashboard/memory/create"
        />
      ) : isError ? (
        <EmptyState
          emoji="📡"
          title="Timeline unavailable for a sec"
          subtitle="Your family archive is set up — we just couldn't load memories. Tap try again above."
          cta="Add memory anyway"
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
