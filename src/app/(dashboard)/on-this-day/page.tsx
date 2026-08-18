'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { useFamily } from '@/context/FamilyContext'
import { useGetMemories } from '@/hooks/useApi'
import { PageHeader } from '@/components/PageHeader'
import { PageMotion, StaggerItem, StaggerList } from '@/components/PageMotion'
import { Loader } from '@/components/Loader'
import { EmptyState } from '@/components/EmptyState'
import { EMPTY_ON_THIS_DAY } from '@/lib/quotes'

export default function OnThisDayPage() {
  const { familyId } = useFamily()
  const { data, isLoading } = useGetMemories(familyId || '', 200, 0)

  const today = new Date()
  const dateLabel = today.toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
  })

  const month = today.getMonth()
  const day = today.getDate()

  const matches = useMemo(() => {
    const memories = data?.memories || []
    return memories.filter((m) => {
      const d = new Date(m.memoryDate)
      return d.getMonth() === month && d.getDate() === day
    })
  }, [data?.memories, month, day])

  return (
    <PageMotion className="mx-auto max-w-2xl">
      <PageHeader
        eyebrow={dateLabel}
        title="On This Day"
        subtitle="Memories from this date in years past — nostalgia unlocked."
      />

      {isLoading ? (
        <Loader label="Loading memories" />
      ) : matches.length === 0 ? (
        <EmptyState
          emoji={EMPTY_ON_THIS_DAY.emoji}
          title={EMPTY_ON_THIS_DAY.title}
          subtitle={EMPTY_ON_THIS_DAY.subtitle}
          cta={EMPTY_ON_THIS_DAY.cta}
          href="/dashboard/memory/create"
        />
      ) : (
        <StaggerList className="space-y-3">
          {matches.map((m) => (
            <StaggerItem key={m.id}>
              <Link href={`/dashboard/memory/${m.id}`} className="card-elevated block">
                <p className="text-sm font-semibold text-primary">
                  {new Date(m.memoryDate).getFullYear()}
                </p>
                <h3 className="mt-1 font-bold text-ink">
                  {m.mood || '📖'} {m.title}
                </h3>
              </Link>
            </StaggerItem>
          ))}
        </StaggerList>
      )}
    </PageMotion>
  )
}
