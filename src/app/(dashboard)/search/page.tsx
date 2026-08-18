'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useFamily } from '@/context/FamilyContext'
import { useSearchMemories } from '@/hooks/useApi'

export default function SearchPage() {
  const { familyId } = useFamily()
  const [q, setQ] = useState('')
  const { data: res = [], isFetching } = useSearchMemories(familyId || '', q)

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-8 font-serif text-4xl font-bold">Search</h1>
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search memories…"
        className="input-field mb-8 py-3 text-lg"
        autoFocus
      />

      {!familyId ? (
        <div className="card-elevated py-16 text-center text-stone-600">
          Set up a family to search memories.
        </div>
      ) : q.length === 0 ? (
        <div className="card-elevated py-16 text-center text-stone-600">
          Start typing to search
        </div>
      ) : isFetching ? (
        <div className="spinner mx-auto" />
      ) : res.length === 0 ? (
        <div className="card-elevated py-16 text-center text-stone-600">No results found</div>
      ) : (
        <div className="space-y-4">
          <p className="text-stone-600">Found {res.length} result(s)</p>
          {res.map((m) => (
            <Link key={m.id} href={`/dashboard/memory/${m.id}`} className="card-elevated block">
              <div className="flex gap-4">
                <span className="text-3xl">{m.mood || '📖'}</span>
                <div>
                  <h3 className="font-bold">{m.title}</h3>
                  <p className="text-sm text-stone-600">
                    {new Date(m.memoryDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
