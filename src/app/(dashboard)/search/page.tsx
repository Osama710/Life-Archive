'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useFamily } from '@/context/FamilyContext'
import { useSearchMemories } from '@/hooks/useApi'
import { PageHeader } from '@/components/PageHeader'
import { PageMotion, StaggerItem, StaggerList } from '@/components/PageMotion'
import { Loader } from '@/components/Loader'
import { EmptyState } from '@/components/EmptyState'
import { EMPTY_FAMILY, EMPTY_SEARCH, EMPTY_SEARCH_RESULTS } from '@/lib/quotes'

export default function SearchPage() {
  const { familyId } = useFamily()
  const [q, setQ] = useState('')
  const { data: res = [], isFetching } = useSearchMemories(familyId || '', q)

  return (
    <PageMotion className="mx-auto max-w-3xl">
      <PageHeader
        title="Search"
        subtitle="Find that memory you swear you saved somewhere."
      />

      <div className="relative mb-8">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search memories…"
          className="input-field py-4 pl-12 text-lg shadow-soft"
          autoFocus
        />
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xl" aria-hidden>
          🔍
        </span>
      </div>

      {!familyId ? (
        <EmptyState
          emoji={EMPTY_FAMILY.emoji}
          title={EMPTY_FAMILY.title}
          subtitle={EMPTY_FAMILY.subtitle}
          cta={EMPTY_FAMILY.cta}
          href="/onboarding"
        />
      ) : q.length === 0 ? (
        <EmptyState
          emoji={EMPTY_SEARCH.emoji}
          title={EMPTY_SEARCH.title}
          subtitle={EMPTY_SEARCH.subtitle}
        />
      ) : isFetching ? (
        <Loader label="Searching memories" />
      ) : res.length === 0 ? (
        <EmptyState
          emoji={EMPTY_SEARCH_RESULTS.emoji}
          title={EMPTY_SEARCH_RESULTS.title}
          subtitle={EMPTY_SEARCH_RESULTS.subtitle}
        />
      ) : (
        <div>
          <p className="mb-4 text-sm font-semibold text-ink/50">
            Found {res.length} result{res.length === 1 ? '' : 's'}
          </p>
          <StaggerList className="space-y-4">
            {res.map((m) => (
              <StaggerItem key={m.id}>
                <Link href={`/dashboard/memory/${m.id}`} className="card-elevated block">
                  <div className="flex gap-4">
                    <span className="text-3xl" aria-hidden>
                      {m.mood || '📖'}
                    </span>
                    <div>
                      <h3 className="font-bold text-ink">{m.title}</h3>
                      <p className="text-sm text-ink/55">
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
        </div>
      )}
    </PageMotion>
  )
}
