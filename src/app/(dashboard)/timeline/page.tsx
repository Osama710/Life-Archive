'use client'
import { useState } from 'react'
import { useGetMemories } from '@/hooks/useApi'
import Link from 'next/link'

export default function TimelinePage() {
  const [offset, setOffset] = useState(0)
  const { data, isLoading } = useGetMemories('family-id', 20, offset)
  const memories = data?.memories || []

  if (isLoading) return <div className="spinner mx-auto mt-8"></div>

  return (
    <div>
      <div className="mb-12 animate-slide-up">
        <h1 className="text-5xl font-bold mb-2">📖 Timeline</h1>
        <p className="text-xl text-gray-600">Your family's precious moments</p>
      </div>

      <div className="mb-8">
        <Link href="/dashboard/memory/create">
          <button className="btn btn-primary">✨ Create Memory</button>
        </Link>
      </div>

      {memories.length === 0 ? (
        <div className="card-elevated text-center py-20">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-2xl font-bold mb-2">No memories yet</h3>
          <p className="text-gray-600 mb-6">Create your first precious moment</p>
          <Link href="/dashboard/memory/create">
            <button className="btn btn-primary">Start Now</button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {memories.map((m, i) => (
            <Link key={m.id} href={`/dashboard/memory/${m.id}`}>
              <div className="card-elevated group cursor-pointer" style={{animationDelay: `${i*30}ms`}}>
                <div className="flex items-start gap-4">
                  <span className="text-4xl">{m.mood}</span>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold group-hover:text-blue-600">{m.title}</h3>
                    <p className="text-sm text-gray-600">{new Date(m.memoryDate).toLocaleDateString()}</p>
                    {m.location && <p className="text-xs text-gray-500">📍 {m.location}</p>}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}