'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { useFamily } from '@/context/FamilyContext'
import { useAddGrowthRecord, useGetGrowthRecords } from '@/hooks/useApi'
import { PageHeader } from '@/components/PageHeader'
import { PageMotion, StaggerItem, StaggerList } from '@/components/PageMotion'
import { Loader } from '@/components/Loader'
import { EmptyState } from '@/components/EmptyState'
import { Button } from '@/components/Button'
import { SelectField } from '@/components/SelectField'
import { Input } from '@/components/Input'
import { EMPTY_GROWTH } from '@/lib/quotes'

export default function GrowthPage() {
  const { user } = useAuth()
  const { childId, children, setChildId } = useFamily()
  const [show, setShow] = useState(false)
  const [h, setH] = useState('')
  const [w, setW] = useState('')
  const { data: recs = [], isLoading } = useGetGrowthRecords(childId || '')
  const addRecord = useAddGrowthRecord()

  const add = async () => {
    if (!user || !childId || !h || !w) return
    await addRecord.mutateAsync({
      child_id: childId,
      measurement_date: new Date().toISOString().slice(0, 10),
      height_cm: Number(h),
      weight_kg: Number(w),
      created_by: user.id,
    })
    setH('')
    setW('')
    setShow(false)
  }

  return (
    <PageMotion className="mx-auto max-w-2xl">
      <PageHeader
        title="Growth"
        subtitle="Tiny human, big stats. Track height and weight over time."
        action={
          childId ? (
            <Button type="button" onClick={() => setShow(true)}>
              + Add
            </Button>
          ) : undefined
        }
      />

      {children.length > 0 && (
        <SelectField
          label="Child"
          className="mb-6"
          value={childId || ''}
          onChange={(e) => setChildId(e.target.value || null)}
        >
          {children.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </SelectField>
      )}

      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8 overflow-hidden"
          >
            <div className="glass-card space-y-4 p-6">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  id="height"
                  type="number"
                  label="Height (cm)"
                  value={h}
                  onChange={(e) => setH(e.target.value)}
                />
                <Input
                  id="weight"
                  type="number"
                  label="Weight (kg)"
                  value={w}
                  onChange={(e) => setW(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button type="button" onClick={add} className="flex-1" disabled={addRecord.isPending}>
                  Save
                </Button>
                <Button type="button" variant="secondary" onClick={() => setShow(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!childId ? (
        <EmptyState
          emoji="👶"
          title="Add a child first"
          subtitle="Growth tracking needs someone to track. Set up a child in onboarding."
          cta="Go to onboarding"
          href="/onboarding"
        />
      ) : isLoading ? (
        <Loader label="Loading growth records" />
      ) : recs.length === 0 ? (
        <EmptyState
          emoji={EMPTY_GROWTH.emoji}
          title={EMPTY_GROWTH.title}
          subtitle={EMPTY_GROWTH.subtitle}
          cta={EMPTY_GROWTH.cta}
          onAction={() => setShow(true)}
        />
      ) : (
        <StaggerList className="space-y-2">
          {recs.map((r) => (
            <StaggerItem key={r.id}>
              <div className="glass-card flex items-center justify-between p-5">
                <div>
                  <p className="font-display font-bold text-ink">{r.measurement_date}</p>
                  <p className="text-sm text-ink/55">
                    {r.height_cm} cm · {r.weight_kg} kg
                  </p>
                </div>
                <span className="text-2xl" aria-hidden>
                  📈
                </span>
              </div>
            </StaggerItem>
          ))}
        </StaggerList>
      )}
    </PageMotion>
  )
}
