'use client'

import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { useFamily } from '@/context/FamilyContext'
import { useGetMemories } from '@/hooks/useApi'

export default function DashboardHomePage() {
  const { user } = useAuth()
  const { family, familyId, child, children, setChildId } = useFamily()
  const { data } = useGetMemories(familyId || '', 5, 0)
  const recent = data?.memories || []

  return (
    <div className="space-y-8">
      <section className="animate-slide-up">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">
          {family?.name || 'Your archive'}
        </p>
        <h1 className="font-serif text-4xl font-bold sm:text-5xl">
          Welcome{user?.email ? `, ${user.email.split('@')[0]}` : ''}
        </h1>
        <p className="mt-2 max-w-2xl text-lg text-stone-600">
          Capture the feeling behind each photo. Your family story lives here.
        </p>
      </section>

      <div className="flex flex-wrap gap-3">
        <Link href="/dashboard/memory/create" className="btn btn-primary">
          + Add Memory
        </Link>
        <Link href="/dashboard/timeline" className="btn btn-secondary">
          Open Timeline
        </Link>
      </div>

      {children.length > 0 && (
        <section className="card-elevated">
          <h2 className="mb-4 text-xl font-bold">Children</h2>
          <div className="flex flex-wrap gap-2">
            {children.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setChildId(c.id)}
                className={`rounded-full border px-4 py-2 text-sm font-semibold ${
                  child?.id === c.id
                    ? 'border-primary bg-blue-50 text-primary'
                    : 'border-stone-200'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-4 text-xl font-bold">Recent memories</h2>
        {recent.length === 0 ? (
          <div className="card-elevated py-12 text-center text-stone-600">
            No memories yet. Start with one story today.
          </div>
        ) : (
          <div className="space-y-3">
            {recent.map((m) => (
              <Link key={m.id} href={`/dashboard/memory/${m.id}`} className="card block">
                <h3 className="font-bold">
                  {m.mood || '📖'} {m.title}
                </h3>
                <p className="text-sm text-stone-500">
                  {new Date(m.memoryDate).toLocaleDateString()}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
