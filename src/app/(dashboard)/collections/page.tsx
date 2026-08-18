'use client'

import Link from 'next/link'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { useFamily } from '@/context/FamilyContext'
import { useCreateCollection, useGetCollections } from '@/hooks/useApi'
import { PageHeader } from '@/components/PageHeader'
import { PageMotion, StaggerItem, StaggerList } from '@/components/PageMotion'
import { Loader } from '@/components/Loader'
import { EmptyState } from '@/components/EmptyState'
import { Input } from '@/components/Input'
import { Button } from '@/components/Button'
import { EMPTY_COLLECTIONS, EMPTY_FAMILY } from '@/lib/quotes'

export default function CollectionsPage() {
  const { user } = useAuth()
  const { familyId } = useFamily()
  const [show, setShow] = useState(false)
  const [name, setName] = useState('')
  const { data: cols = [], isLoading } = useGetCollections(familyId || '')
  const create = useCreateCollection()

  const add = async () => {
    if (!name.trim() || !user || !familyId) return
    await create.mutateAsync({
      familyId,
      name: name.trim(),
      createdBy: user.id,
    })
    setName('')
    setShow(false)
  }

  if (!familyId) {
    return (
      <PageMotion>
        <EmptyState
          emoji={EMPTY_FAMILY.emoji}
          title={EMPTY_FAMILY.title}
          subtitle={EMPTY_FAMILY.subtitle}
          cta={EMPTY_FAMILY.cta}
          href="/onboarding"
        />
      </PageMotion>
    )
  }

  return (
    <PageMotion>
      <PageHeader
        title="Collections"
        subtitle="Themed albums — open one to add memories from your timeline."
        action={
          <Button type="button" onClick={() => setShow(true)}>
            + New
          </Button>
        }
      />

      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8 overflow-hidden"
          >
            <div className="glass-card space-y-4 p-6">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Collection name"
                label="Name"
                autoFocus
              />
              <div className="flex gap-2">
                <Button type="button" onClick={add} className="flex-1" disabled={create.isPending}>
                  Create
                </Button>
                <Button type="button" variant="secondary" onClick={() => setShow(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading ? (
        <Loader label="Loading collections" />
      ) : cols.length === 0 ? (
        <EmptyState
          emoji={EMPTY_COLLECTIONS.emoji}
          title={EMPTY_COLLECTIONS.title}
          subtitle={EMPTY_COLLECTIONS.subtitle}
          cta={EMPTY_COLLECTIONS.cta}
          onAction={() => setShow(true)}
        />
      ) : (
        <StaggerList className="space-y-3">
          {cols.map((c) => (
            <StaggerItem key={c.id}>
              <Link href={`/dashboard/collections/${c.id}`} className="glass-card block p-6 transition hover:shadow-lift">
                <h3 className="font-display text-lg font-bold text-ink">{c.name}</h3>
                <p className="mt-2 text-sm text-ink/55">
                  {c.description || 'Tap to view and add memories'}
                </p>
              </Link>
            </StaggerItem>
          ))}
        </StaggerList>
      )}
    </PageMotion>
  )
}
