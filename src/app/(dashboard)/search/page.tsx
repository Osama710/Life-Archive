'use client'
import { useState } from 'react'
import { useSearchMemories } from '@/hooks/useApi'

export default function SearchPage() {
  const [q, setQ] = useState('')
  const { data: res = [] } = useSearchMemories('family-id', q)

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">🔍 Search</h1>
      <input type="search" value={q} onChange={e => setQ(e.target.value)} placeholder="Search memories..." className="input-field text-lg py-3 mb-8" autoFocus />
      
      {q.length === 0 ? (
        <div className="card-elevated text-center py-16 text-gray-600">Start typing to search</div>
      ) : res.length === 0 ? (
        <div className="card-elevated text-center py-16 text-gray-600">No results found</div>
      ) : (
        <div className="space-y-4">
          <p className="text-gray-600">Found {res.length} result(s)</p>
          {res.map(m => (
            <div key={m.id} className="card-elevated">
              <div className="flex gap-4">
                <span className="text-3xl">{m.mood}</span>
                <div>
                  <h3 className="font-bold">{m.title}</h3>
                  <p className="text-sm text-gray-600">{new Date(m.memoryDate).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}