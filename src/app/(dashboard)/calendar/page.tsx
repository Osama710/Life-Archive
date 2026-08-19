'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useFamily } from '@/context/FamilyContext'
import { useGetMemories } from '@/hooks/useApi'
import { PageHeader } from '@/components/PageHeader'
import { PageMotion, StaggerItem, StaggerList } from '@/components/PageMotion'
import { EmptyState } from '@/components/EmptyState'
import { Loader } from '@/components/Loader'
import { EMPTY_CALENDAR } from '@/lib/quotes'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export default function CalendarPage() {
  const { familyId, family, hasFamily } = useFamily()
  const today = useMemo(() => new Date(), [])
  const [viewMonth, setViewMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1))
  const [selected, setSelected] = useState(() => new Date())

  const year = viewMonth.getFullYear()
  const month = viewMonth.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const startWeekday = new Date(year, month, 1).getDay()

  const { data, isLoading } = useGetMemories(familyId || '', 200, 0, hasFamily)
  const memoryList = data?.memories

  const byDay = useMemo(() => {
    const map = new Map<number, NonNullable<typeof memoryList>>()
    for (const m of memoryList || []) {
      const d = new Date(m.memoryDate)
      if (d.getFullYear() === year && d.getMonth() === month) {
        const day = d.getDate()
        map.set(day, [...(map.get(day) || []), m])
      }
    }
    return map
  }, [memoryList, year, month])

  const cells: (number | null)[] = [
    ...Array.from({ length: startWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  const selectedMemories = useMemo(() => {
    return (memoryList || []).filter((m) => sameDay(new Date(m.memoryDate), selected))
  }, [memoryList, selected])

  const goMonth = (delta: number) => {
    setViewMonth(new Date(year, month + delta, 1))
  }

  const goToday = () => {
    const now = new Date()
    setViewMonth(new Date(now.getFullYear(), now.getMonth(), 1))
    setSelected(now)
  }

  const selectedLabel = selected.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  if (!hasFamily) {
    return (
      <PageMotion className="mx-auto max-w-2xl">
        <PageHeader title="Calendar" subtitle="Set up your family archive to browse memories by date." />
        <EmptyState
          emoji="🏡"
          title="No family archive yet"
          subtitle="Create your family space first, then the calendar fills in with your memories."
          cta="Get started"
          href="/onboarding"
        />
      </PageMotion>
    )
  }

  return (
    <PageMotion className="mx-auto max-w-2xl space-y-5">
      <PageHeader
        eyebrow={family?.name}
        title="Calendar"
        subtitle="Browse memories by date — dots show days with something saved."
      />

      <section className="surface-card overflow-hidden p-4 sm:p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-ink/40">Month</p>
            <p className="font-display text-lg font-bold text-ink">
              {viewMonth.toLocaleString(undefined, { month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={goToday}
              className="rounded-full border border-ink/8 px-3 py-1.5 text-xs font-semibold text-ink/60 transition hover:border-ink/15 hover:text-ink"
            >
              Today
            </button>
            <button
              type="button"
              aria-label="Previous month"
              onClick={() => goMonth(-1)}
              className="flex size-9 items-center justify-center rounded-full border border-ink/8 text-ink/55 transition hover:border-ink/15 hover:text-ink"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              aria-label="Next month"
              onClick={() => goMonth(1)}
              className="flex size-9 items-center justify-center rounded-full border border-ink/8 text-ink/55 transition hover:border-ink/15 hover:text-ink"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1.5">
          {WEEKDAYS.map((d) => (
            <div
              key={d}
              className="pb-1 text-center text-[10px] font-semibold uppercase tracking-wide text-ink/35"
            >
              {d}
            </div>
          ))}

          {cells.map((day, idx) => {
            if (day === null) {
              return <div key={`empty-${idx}`} aria-hidden className="aspect-square" />
            }

            const dayDate = new Date(year, month, day)
            const isSelected = sameDay(dayDate, selected)
            const isToday = sameDay(dayDate, today)
            const count = byDay.get(day)?.length ?? 0

            return (
              <button
                key={day}
                type="button"
                aria-label={`${dayDate.toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}${count ? `, ${count} ${count === 1 ? 'memory' : 'memories'}` : ''}`}
                aria-pressed={isSelected}
                onClick={() => setSelected(dayDate)}
                className={`relative flex aspect-square flex-col items-center justify-center rounded-2xl text-sm font-semibold transition ${
                  isSelected
                    ? 'bg-primary text-white shadow-[0_4px_14px_rgba(124,58,237,0.3)]'
                    : isToday
                      ? 'border-2 border-primary/30 bg-primary/5 text-primary'
                      : 'text-ink hover:bg-ink/[0.04]'
                }`}
              >
                {day}
                {count > 0 && (
                  <span
                    className={`absolute bottom-1.5 flex gap-0.5 ${isSelected ? 'opacity-90' : ''}`}
                    aria-hidden
                  >
                    {Array.from({ length: Math.min(count, 3) }).map((_, i) => (
                      <span
                        key={i}
                        className={`block size-1 rounded-full ${
                          isSelected ? 'bg-white/90' : 'bg-primary'
                        }`}
                      />
                    ))}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-ink/40">Selected</p>
            <h2 className="font-display text-base font-bold text-ink">{selectedLabel}</h2>
          </div>
          <Link href="/dashboard/memory/create" className="text-sm font-medium text-primary">
            + Add
          </Link>
        </div>

        {isLoading ? (
          <Loader label="Loading memories" size="sm" />
        ) : selectedMemories.length === 0 ? (
          <EmptyState
            emoji={EMPTY_CALENDAR.emoji}
            title={EMPTY_CALENDAR.title}
            subtitle={EMPTY_CALENDAR.subtitle}
            cta="Add memory"
            href="/dashboard/memory/create"
          />
        ) : (
          <StaggerList className="space-y-2">
            {selectedMemories.map((m) => (
              <StaggerItem key={m.id}>
                <Link href={`/dashboard/memory/${m.id}`} className="surface-card block p-4 transition active:scale-[0.99]">
                  <div className="flex items-start gap-3">
                    <span className="text-xl" aria-hidden>
                      {m.mood || '📖'}
                    </span>
                    <div className="min-w-0">
                      <h3 className="truncate font-semibold text-ink">{m.title}</h3>
                      {m.location && (
                        <p className="mt-0.5 truncate text-xs text-ink/45">{m.location}</p>
                      )}
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
