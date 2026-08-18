'use client'

import Link from 'next/link'
import { useFamily } from '@/context/FamilyContext'
import { useGetMemories } from '@/hooks/useApi'

export default function TimelinePage() {
  const { familyId, family, isLoading: familyLoading } = useFamily()
  const { data, isLoading, isError } = useGetMemories(familyId || '', 20, 0)
  const memories = data?.memories || []

  if (familyLoading || isLoading) {
    return <div className="spinner mx-auto mt-8" aria-label="Loading timeline" />
  }

  if (!familyId) {
    return (
      <div className="card-elevated text-center py-16">
        <h2 className="text-2xl font-bold mb-2">Create your family archive</h2>
        <p className="text-stone-600 mb-6">Start by naming your family and adding a child.</p>
        <Link href="/onboarding" className="btn btn-primary">
          Begin onboarding
        </Link>
      </div>
    )
  }

  if (isError) {
    return <p className="text-red-600">Could not load memories. Please try again.</p>
  }

  return (
    <div>
      <div className="mb-10 animate-slide-up">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">
          {family?.name}
        </p>
        <h1 className="font-serif text-4xl font-bold mb-2">Timeline</h1>
        <p className="text-lg text-stone-600">Your family’s precious moments</p>
      </div>

      <div className="mb-8">
        <Link href="/dashboard/memory/create" className="btn btn-primary">
          Create Memory
        </Link>
      </div>

      {memories.length === 0 ? (
        <div className="card-elevated text-center py-20">
          <h3 className="text-2xl font-bold mb-2">No memories yet</h3>
          <p className="text-stone-600 mb-6">Create your first precious moment</p>
          <Link href="/dashboard/memory/create" className="btn btn-primary">
            Start Now
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {memories.map((m, i) => (
            <Link key={m.id} href={`/dashboard/memory/${m.id}`}>
              <article
                className="card-elevated group cursor-pointer"
                style={{ animationDelay: `${i * 30}ms` }}
              >
                <div className="flex items-start gap-4">
                  <span className="text-3xl" aria-hidden>
                    {m.mood || '📖'}
                  </span>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold group-hover:text-primary">{m.title}</h3>
                    <p className="text-sm text-stone-600">
                      {new Date(m.memoryDate).toLocaleDateString()}
                    </p>
                    {m.location && <p className="text-xs text-stone-500">{m.location}</p>}
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
