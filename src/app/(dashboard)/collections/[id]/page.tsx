'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import { useFamily } from '@/context/FamilyContext'
import {
  useAddMemoryToCollection,
  useGetCollectionMemories,
  useGetCollections,
  useGetMemories,
  useRemoveMemoryFromCollection,
} from '@/hooks/useApi'
import { BackLink } from '@/components/BackLink'
import { PageHeader } from '@/components/PageHeader'
import { PageMotion, StaggerItem, StaggerList } from '@/components/PageMotion'
import { Loader } from '@/components/Loader'
import { EmptyState } from '@/components/EmptyState'
import { Button } from '@/components/Button'
import { getErrorMessage } from '@/lib/errors'

export default function CollectionDetailPage() {
  const params = useParams<{ id: string }>()
  const { familyId } = useFamily()
  const collectionId = params.id
  const { data: collections = [] } = useGetCollections(familyId || '')
  const collection = collections.find((item) => item.id === collectionId)
  const { data: memories = [], isLoading } = useGetCollectionMemories(collectionId)
  const { data: allMemoriesData } = useGetMemories(familyId || '', 100, 0, !!familyId)
  const add = useAddMemoryToCollection()
  const remove = useRemoveMemoryFromCollection()
  const [showAdd, setShowAdd] = useState(false)
  const [error, setError] = useState('')

  const inCollection = new Set(memories.map((memory) => memory.id))
  const availableToAdd = (allMemoriesData?.memories ?? []).filter(
    (memory) => !inCollection.has(memory.id),
  )

  const handleAdd = async (memoryId: string) => {
    setError('')
    try {
      await add.mutateAsync({ collectionId, memoryId })
    } catch (err) {
      setError(getErrorMessage(err, 'Could not add memory'))
    }
  }

  const handleRemove = async (memoryId: string) => {
    setError('')
    try {
      await remove.mutateAsync({ collectionId, memoryId })
    } catch (err) {
      setError(getErrorMessage(err, 'Could not remove memory'))
    }
  }

  if (!collection) {
    return (
      <PageMotion>
        <EmptyState
          emoji="📚"
          title="Collection not found"
          subtitle="It may have been deleted."
          cta="Back to collections"
          href="/dashboard/collections"
        />
      </PageMotion>
    )
  }

  return (
    <PageMotion>
      <BackLink href="/dashboard/collections" label="Collections" />
      <PageHeader
        title={collection.name}
        subtitle={collection.description || 'Memories grouped in this album.'}
        action={
          <Button type="button" variant="secondary" onClick={() => setShowAdd((value) => !value)}>
            {showAdd ? 'Done' : '+ Add memories'}
          </Button>
        }
      />

      {error && (
        <p className="alert alert-error mb-4 text-sm" role="alert">
          {error}
        </p>
      )}

      {showAdd && (
        <section className="glass-card mb-6 p-5">
          <h2 className="mb-3 font-display text-lg font-bold text-ink">Add to this album</h2>
          {availableToAdd.length === 0 ? (
            <p className="text-sm text-ink/55">Every memory is already in this collection.</p>
          ) : (
            <ul className="space-y-2">
              {availableToAdd.map((memory) => (
                <li
                  key={memory.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-ink/8 bg-white/60 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-ink">
                      {memory.mood || '📖'} {memory.title}
                    </p>
                    <p className="text-xs text-ink/45">
                      {new Date(memory.memoryDate).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    disabled={add.isPending}
                    onClick={() => handleAdd(memory.id)}
                  >
                    Add
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {isLoading ? (
        <Loader label="Loading album" />
      ) : memories.length === 0 ? (
        <EmptyState
          emoji="📷"
          title="No memories in this album yet"
          subtitle="Tap + Add memories to pull moments from your timeline."
          cta="Add memories"
          onAction={() => setShowAdd(true)}
        />
      ) : (
        <StaggerList className="space-y-3">
          {memories.map((memory) => (
            <StaggerItem key={memory.id}>
              <div className="card-elevated flex items-start justify-between gap-3">
                <Link href={`/dashboard/memory/${memory.id}`} className="min-w-0 flex-1">
                  <h3 className="font-bold text-ink">
                    {memory.mood || '📖'} {memory.title}
                  </h3>
                  <p className="text-sm text-ink/55">
                    {new Date(memory.memoryDate).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </Link>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={remove.isPending}
                  onClick={() => handleRemove(memory.id)}
                >
                  Remove
                </Button>
              </div>
            </StaggerItem>
          ))}
        </StaggerList>
      )}
    </PageMotion>
  )
}
