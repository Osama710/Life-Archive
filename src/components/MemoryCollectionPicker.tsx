'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  useAddMemoryToCollection,
  useGetCollections,
  useGetMemoryCollectionIds,
  useRemoveMemoryFromCollection,
} from '@/hooks/useApi'
import { getErrorMessage } from '@/lib/errors'

interface MemoryCollectionPickerProps {
  memoryId: string
  familyId: string
}

export function MemoryCollectionPicker({ memoryId, familyId }: MemoryCollectionPickerProps) {
  const { data: collections = [], isLoading } = useGetCollections(familyId)
  const { data: selectedIds = [], isLoading: idsLoading } = useGetMemoryCollectionIds(memoryId)
  const add = useAddMemoryToCollection()
  const remove = useRemoveMemoryFromCollection()
  const [error, setError] = useState('')
  const [pendingId, setPendingId] = useState<string | null>(null)

  const toggle = async (collectionId: string) => {
    setError('')
    setPendingId(collectionId)
    const isSelected = selectedIds.includes(collectionId)

    try {
      if (isSelected) {
        await remove.mutateAsync({ collectionId, memoryId })
      } else {
        await add.mutateAsync({ collectionId, memoryId })
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Could not update collection'))
    } finally {
      setPendingId(null)
    }
  }

  if (isLoading || idsLoading) {
    return <p className="text-sm text-ink/50">Loading collections…</p>
  }

  if (collections.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-ink/15 bg-white/40 p-4 text-sm text-ink/55">
        No collections yet.{' '}
        <Link href="/dashboard/collections" className="font-semibold text-primary">
          Create one
        </Link>{' '}
        (e.g. Ammar&apos;s Aqiqa), then add this memory.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <p className="form-label">Collections</p>
      <p className="text-sm text-ink/50">Tap to add or remove this memory from an album.</p>
      <div className="flex flex-wrap gap-2">
        {collections.map((collection) => {
          const selected = selectedIds.includes(collection.id)
          const pending = pendingId === collection.id

          return (
            <button
              key={collection.id}
              type="button"
              disabled={pending || add.isPending || remove.isPending}
              aria-pressed={selected}
              onClick={() => toggle(collection.id)}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                selected
                  ? 'border-primary/40 bg-linear-to-r from-violet-500/15 to-fuchsia-500/10 text-primary shadow-soft'
                  : 'border-ink/10 bg-white/70 text-ink/70'
              }`}
            >
              {pending ? '…' : selected ? `✓ ${collection.name}` : collection.name}
            </button>
          )
        })}
      </div>
      {error && (
        <p className="alert alert-error text-sm" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
