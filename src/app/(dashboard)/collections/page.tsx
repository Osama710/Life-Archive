'use client'

import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useFamily } from '@/context/FamilyContext'
import { useCreateCollection, useGetCollections } from '@/hooks/useApi'

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
    return <p className="text-stone-600">Finish family setup to organize collections.</p>
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-serif text-4xl font-bold">Collections</h1>
        <button type="button" onClick={() => setShow(true)} className="btn btn-primary">
          + New
        </button>
      </div>

      {show && (
        <div className="card-elevated mb-8 space-y-4">
          <input
            className="input-field"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Collection name"
            autoFocus
          />
          <div className="flex gap-2">
            <button type="button" onClick={add} className="btn btn-primary flex-1">
              Create
            </button>
            <button type="button" onClick={() => setShow(false)} className="btn btn-secondary flex-1">
              Cancel
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="spinner mx-auto" />
      ) : cols.length === 0 ? (
        <div className="card-elevated py-16 text-center">
          <p>No collections yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {cols.map((c) => (
            <div key={c.id} className="card-elevated">
              <h3 className="text-lg font-bold">{c.name}</h3>
              <p className="mt-2 text-sm text-stone-600">{c.description || 'No description'}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
