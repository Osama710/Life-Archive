'use client'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useDeleteMemory, useGetMemory } from '@/hooks/useApi'
import { useFamily } from '@/context/FamilyContext'
import { BackLink } from '@/components/BackLink'
import { PageMotion } from '@/components/PageMotion'
import { Loader } from '@/components/Loader'
import { EmptyState } from '@/components/EmptyState'
import { Button } from '@/components/Button'
import { MemoryMediaGallery } from '@/components/MemoryMediaGallery'
import { MemoryCollectionPicker } from '@/components/MemoryCollectionPicker'
import { parseMemoryDescription } from '@/lib/memory/parseDescription'

function MetaPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-ink/[0.06] px-3 py-1 text-xs font-semibold text-ink/65">
      {children}
    </span>
  )
}

export default function MemoryDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { data: memory, isLoading, isError } = useGetMemory(params.id)
  const { familyId } = useFamily()
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

  const { story, prompts } = parseMemoryDescription(memory.description)
  const formattedDate = new Date(memory.memoryDate).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
  const hasMedia = Boolean(memory.media?.length)
  const hasStory = Boolean(story.trim())
  const hasPrompts = prompts.length > 0

  return (
    <PageMotion className="mx-auto max-w-3xl pb-8">
      <BackLink href="/dashboard/timeline" label="Timeline" />

      <header className="glass-card mb-5 p-6 sm:p-8">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <MetaPill>{formattedDate}</MetaPill>
          {memory.location && <MetaPill>📍 {memory.location}</MetaPill>}
          {memory.isFavorite && <span className="badge badge-primary">Favorite</span>}
        </div>

        <h1 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          {memory.mood ? (
            <span className="mr-2" aria-hidden="true">
              {memory.mood}
            </span>
          ) : null}
          {memory.title}
        </h1>

        {hasMedia && (
          <p className="mt-3 text-sm text-ink/50">
            {memory.media!.length} photo{memory.media!.length === 1 ? '' : 's'} — uniform grid
            below, tap any tile for the full image
          </p>
        )}
      </header>

      {hasStory && (
        <section className="glass-card mb-5 p-6 sm:p-8">
          <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-wide text-ink/45">
            The story
          </h2>
          <p className="whitespace-pre-wrap text-base leading-relaxed text-ink/80 sm:text-lg">
            {story}
          </p>
        </section>
      )}

      {hasPrompts && (
        <section className="mb-5 space-y-3">
          <div className="px-1">
            <h2 className="font-display text-sm font-bold uppercase tracking-wide text-ink/45">
              Captured details
            </h2>
            <p className="mt-1 text-sm text-ink/50">From the guided prompts when this was saved</p>
          </div>
          <div className="space-y-3">
            {prompts.map((item) => (
              <article
                key={item.question}
                className="glass-card border border-ink/6 p-4 sm:p-5"
              >
                <p className="text-sm font-semibold text-primary">{item.question}</p>
                <p className="mt-2 whitespace-pre-wrap text-base leading-relaxed text-ink/75">
                  {item.answer}
                </p>
              </article>
            ))}
          </div>
        </section>
      )}

      {!hasStory && !hasPrompts && !hasMedia && (
        <section className="glass-card mb-5 p-6 text-center text-ink/55">
          <p>No story text yet — tap Edit to add what made this moment special.</p>
        </section>
      )}

      {hasMedia && (
        <MemoryMediaGallery
          media={memory.media!}
          title={memory.title}
          variant="compact"
          previewCount={9}
        />
      )}

      {familyId && (
        <section className="glass-card mb-5 p-5 sm:p-6">
          <MemoryCollectionPicker memoryId={memory.id} familyId={familyId} />
        </section>
      )}

      <section className="glass-card p-5 sm:p-6">
        <h2 className="font-display text-lg font-bold text-ink">Share with family</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink/60">
          Invite your partner to Life Archive so you both see the same timeline and can add memories
          for your kid from each of your phones.
        </p>
        <Link href="/dashboard/family" className="btn btn-secondary mt-4 inline-flex">
          Invite family member
        </Link>
      </section>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link href={`/dashboard/memory/${memory.id}/edit`}>
          <Button variant="secondary">Edit memory</Button>
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
    </PageMotion>
  )
}
