'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useFamily } from '@/context/FamilyContext'
import { useGetMemories } from '@/hooks/useApi'
import { PageHeader } from '@/components/PageHeader'
import { PageMotion, StaggerItem, StaggerList } from '@/components/PageMotion'
import { EmptyState } from '@/components/EmptyState'
import { EMPTY_CALENDAR } from '@/lib/quotes'

export default function CalendarPage() {
  const { familyId, family } = useFamily()
  const [cursor, setCursor] = useState(() => new Date())
  const { data } = useGetMemories(familyId || '', 200, 0)
  const memoryList = data?.memories

  const year = cursor.getFullYear()
  const month = cursor.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const startWeekday = new Date(year, month, 1).getDay()

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

  const selectedDay = cursor.getDate()
  const selected = byDay.get(selectedDay) || []

  return (
    <PageMotion className="mx-auto max-w-4xl">
      <PageHeader
        eyebrow={family?.name}
        title="Calendar"
        subtitle="Tap a day to see what happened — dot means memories live there."
        action={
          <div className="flex gap-2">
            <button
              type="button"
              className="btn btn-secondary size-11 px-0"
              aria-label="Previous month"
              onClick={() => setCursor(new Date(year, month - 1, 1))}
            >
              ←
            </button>
            <button
              type="button"
              className="btn btn-secondary size-11 px-0"
              aria-label="Next month"
              onClick={() => setCursor(new Date(year, month + 1, 1))}
            >
              →
            </button>
          </div>
        }
      />

      <p className="mb-4 font-display text-xl font-bold text-ink">
        {cursor.toLocaleString(undefined, { month: 'long', year: 'numeric' })}
      </p>

      <div className="glass-card mb-6 grid grid-cols-7 gap-2 p-4">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
          <div key={d} className="text-center text-xs font-bold uppercase tracking-wide text-ink/40">
            {d}
          </div>
        ))}
        {cells.map((day, idx) =>
          day === null ? (
            <div key={`e-${idx}`} />
          ) : (
            <motion.button
              key={day}
              type="button"
              whileTap={{ scale: 0.96 }}
              aria-label={`${year}-${month + 1}-${day}`}
              onClick={() => setCursor(new Date(year, month, day))}
              className={`min-h-14 rounded-2xl border p-2 text-left transition-all ${
                day === selectedDay
                  ? 'border-primary/40 bg-gradient-to-br from-violet-500/15 to-fuchsia-500/10 shadow-soft'
                  : 'border-ink/8 bg-white/50 hover:border-primary/20 hover:bg-white/80'
              }`}
            >
              <span className="text-sm font-bold text-ink">{day}</span>
              {byDay.has(day) && (
                <span className="mt-2 block size-2 rounded-full bg-gradient-brand" aria-hidden />
              )}
            </motion.button>
          ),
        )}
      </div>

      <div className="space-y-3">
        {selected.length === 0 ? (
          <EmptyState
            emoji={EMPTY_CALENDAR.emoji}
            title={EMPTY_CALENDAR.title}
            subtitle={EMPTY_CALENDAR.subtitle}
            cta="Add memory"
            href="/dashboard/memory/create"
          />
        ) : (
          <StaggerList className="space-y-3">
            {selected.map((m) => (
              <StaggerItem key={m.id}>
                <Link href={`/dashboard/memory/${m.id}`} className="card-elevated block">
                  <h3 className="font-bold text-ink">
                    {m.mood || '📖'} {m.title}
                  </h3>
                </Link>
              </StaggerItem>
            ))}
          </StaggerList>
        )}
      </div>
    </PageMotion>
  )
}
