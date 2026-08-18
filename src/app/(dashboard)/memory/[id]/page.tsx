'use client'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useDeleteMemory, useGetMemory } from '@/hooks/useApi'
import { BackLink } from '@/components/BackLink'
import { PageMotion } from '@/components/PageMotion'
import { Loader } from '@/components/Loader'
import { EmptyState } from '@/components/EmptyState'
import { Button } from '@/components/Button'
import { MemoryMediaGallery } from '@/components/MemoryMediaGallery'

export default function MemoryDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { data: memory, isLoading, isError } = useGetMemory(params.id)
  const remove = useDeleteMemory()

  if (isLoading) return <Loader label="Loading memory" />
  if (isError || !memory) {
    return (
      <PageMotion className="mx-auto max-w-lg">
        <EmptyState
          emoji="🔍"
          title="Memory not found"
          subtitle="It might've moved to trash or never existed. Happens to the best of us."
          cta="Back to timeline"
          href="/dashboard/timeline"
        />
      </PageMotion>
    )
  }

  return (
    <PageMotion className="mx-auto max-w-3xl space-y-6">
      <BackLink href="/dashboard/timeline" label="Timeline" />

      {memory.media && memory.media.length > 0 && (
        <MemoryMediaGallery media={memory.media} title={memory.title} />
      )}

      <article className="glass-card p-6 sm:p-8">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-ink/50">
                {new Date(memory.memoryDate).toLocaleDateString(undefined, {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
                {memory.location ? ` · 📍 ${memory.location}` : ''}
              </p>
              <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-ink">
                {memory.mood ? `${memory.mood} ` : ''}
                {memory.title}
              </h1>
            </div>
            {memory.isFavorite && <span className="badge badge-primary">Favorite</span>}
          </div>

          {memory.description && (
            <p className="whitespace-pre-wrap text-lg leading-relaxed text-ink/75">
              {memory.description}
            </p>
          )}

          <div className="mt-8 flex flex-wrap gap-2">
            <Link href={`/dashboard/memory/${memory.id}/edit`}>
              <Button variant="secondary">Edit</Button>
            </Link>
            <Button
              variant="danger"
              disabled={remove.isPending}
              onClick={async () => {
                await remove.mutateAsync(memory.id)
                router.replace('/dashboard/timeline')
              }}
            >
              Move to trash
            </Button>
          </div>
      </article>
    </PageMotion>
  )
}
