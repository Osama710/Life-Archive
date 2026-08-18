'use client'

import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useFamily } from '@/context/FamilyContext'
import { useAddGrowthRecord, useGetGrowthRecords } from '@/hooks/useApi'

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
    <div className="mx-auto max-w-2xl">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-serif text-4xl font-bold">Growth</h1>
        <button type="button" onClick={() => setShow(true)} className="btn btn-primary">
          + Add
        </button>
      </div>

      {children.length > 0 && (
        <select
          className="input-field mb-6"
          value={childId || ''}
          onChange={(e) => setChildId(e.target.value || null)}
        >
          {children.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      )}

      {show && (
        <div className="card-elevated mb-8 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label" htmlFor="height">
                Height (cm)
              </label>
              <input
                id="height"
                type="number"
                value={h}
                onChange={(e) => setH(e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="form-label" htmlFor="weight">
                Weight (kg)
              </label>
              <input
                id="weight"
                type="number"
                value={w}
                onChange={(e) => setW(e.target.value)}
                className="input-field"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={add} className="btn btn-primary flex-1">
              Save
            </button>
            <button type="button" onClick={() => setShow(false)} className="btn btn-secondary flex-1">
              Cancel
            </button>
          </div>
        </div>
      )}

      {!childId ? (
        <div className="card-elevated py-16 text-center">Add a child to track growth.</div>
      ) : isLoading ? (
        <div className="spinner mx-auto" />
      ) : recs.length === 0 ? (
        <div className="card-elevated py-16 text-center">
          <p>No records yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {recs.map((r) => (
            <div key={r.id} className="card-elevated flex justify-between p-4">
              <div>
                <p className="font-bold">{r.measurement_date}</p>
                <p className="text-sm text-stone-600">
                  {r.height_cm}cm | {r.weight_kg}kg
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
