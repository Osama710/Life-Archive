'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useFamily } from '@/context/FamilyContext'
import { useGetMemories } from '@/hooks/useApi'

export default function CalendarPage() {
  const { familyId } = useFamily()
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
    <div className="mx-auto max-w-4xl">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-serif text-4xl font-bold">Calendar</h1>
        <div className="flex gap-2">
          <button
            type="button"
            className="btn btn-secondary"
            aria-label="Previous month"
            onClick={() => setCursor(new Date(year, month - 1, 1))}
          >
            ←
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            aria-label="Next month"
            onClick={() => setCursor(new Date(year, month + 1, 1))}
          >
            →
          </button>
        </div>
      </div>

      <p className="mb-4 text-lg font-semibold">
        {cursor.toLocaleString(undefined, { month: 'long', year: 'numeric' })}
      </p>

      <div className="card-elevated mb-6 grid grid-cols-7 gap-2">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
          <div key={d} className="text-center text-xs font-semibold text-stone-500">
            {d}
          </div>
        ))}
        {cells.map((day, idx) =>
          day === null ? (
            <div key={`e-${idx}`} />
          ) : (
            <button
              key={day}
              type="button"
              aria-label={`${year}-${month + 1}-${day}`}
              onClick={() => setCursor(new Date(year, month, day))}
              className={`min-h-14 rounded-xl border p-2 text-left ${
                day === selectedDay ? 'border-primary bg-blue-50' : 'border-stone-200'
              }`}
            >
              <span className="text-sm font-semibold">{day}</span>
              {byDay.has(day) && (
                <span className="mt-2 block size-2 rounded-full bg-warm" aria-hidden />
              )}
            </button>
          ),
        )}
      </div>

      <div className="space-y-3">
        {selected.length === 0 ? (
          <div className="card-elevated py-10 text-center text-stone-600">
            No memories on this day
          </div>
        ) : (
          selected.map((m) => (
            <Link key={m.id} href={`/dashboard/memory/${m.id}`} className="card-elevated block">
              <h3 className="font-bold">
                {m.mood || '📖'} {m.title}
              </h3>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
