'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { useFamily } from '@/context/FamilyContext'
import { useGetMemories } from '@/hooks/useApi'

export default function OnThisDayPage() {
  const { familyId } = useFamily()
  const { data, isLoading } = useGetMemories(familyId || '', 200, 0)

  const matches = useMemo(() => {
    const today = new Date()
    const memories = data?.memories || []
    const month = today.getMonth()
    const day = today.getDate()
    return memories.filter((m) => {
      const d = new Date(m.memoryDate)
      return d.getMonth() === month && d.getDate() === day
    })
  }, [data?.memories])

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-2 font-serif text-4xl font-bold">On This Day</h1>
      <p className="mb-8 text-stone-600">Memories from this date in past years.</p>
      {isLoading ? (
        <div className="spinner mx-auto" />
      ) : matches.length === 0 ? (
        <div className="card-elevated py-16 text-center text-stone-600">
          No memories for this date yet.
        </div>
      ) : (
        <div className="space-y-3">
          {matches.map((m) => (
            <Link key={m.id} href={`/dashboard/memory/${m.id}`} className="card-elevated block">
              <p className="text-sm text-stone-500">{new Date(m.memoryDate).getFullYear()}</p>
              <h3 className="font-bold">
                {m.mood || '📖'} {m.title}
              </h3>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
