'use client'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useDeleteMemory, useGetMemory } from '@/hooks/useApi'

export default function MemoryDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { data: memory, isLoading, isError } = useGetMemory(params.id)
  const remove = useDeleteMemory()

  if (isLoading) return <div className="spinner mx-auto mt-8" />
  if (isError || !memory) {
    return (
      <div className="card-elevated text-center py-16">
        <p className="mb-4">Memory not found.</p>
        <Link href="/dashboard/timeline" className="btn btn-primary">
          Back to timeline
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/dashboard/timeline" className="mb-6 inline-block text-sm text-primary">
        ← Timeline
      </Link>
      <article className="card-elevated">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-stone-500">
              {new Date(memory.memoryDate).toLocaleDateString()}
              {memory.location ? ` · ${memory.location}` : ''}
            </p>
            <h1 className="font-serif text-4xl font-bold">
              {memory.mood ? `${memory.mood} ` : ''}
              {memory.title}
            </h1>
          </div>
          {memory.isFavorite && <span className="badge badge-primary">Favorite</span>}
        </div>
        {memory.description && (
          <p className="whitespace-pre-wrap text-lg leading-relaxed text-stone-700">
            {memory.description}
          </p>
        )}
        {memory.media && memory.media.length > 0 && (
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {memory.media.map((m) =>
              m.mediaType === 'video' ? (
                <video key={m.id} src={m.secureUrl} controls className="w-full rounded-lg" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={m.id}
                  src={m.secureUrl || m.url}
                  alt={m.fileName || memory.title}
                  className="w-full rounded-lg object-cover"
                />
              ),
            )}
          </div>
        )}
        <div className="mt-8 flex gap-2">
          <Link href={`/dashboard/memory/${memory.id}/edit`} className="btn btn-secondary">
            Edit
          </Link>
          <button
            type="button"
            className="btn btn-danger"
            disabled={remove.isPending}
            onClick={async () => {
              await remove.mutateAsync(memory.id)
              router.replace('/dashboard/timeline')
            }}
          >
            Move to trash
          </button>
        </div>
      </article>
    </div>
  )
}
