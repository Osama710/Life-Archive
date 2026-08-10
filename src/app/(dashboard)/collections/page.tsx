'use client'
import { useState } from 'react'
import { useGetCollections, useCreateCollection } from '@/hooks/useApi'

export default function CollectionsPage() {
  const [show, setShow] = useState(false)
  const [name, setName] = useState('')
  const { data: cols = [] } = useGetCollections('family-id')
  const create = useCreateCollection()

  const add = async () => {
    if (name) {
      await create.mutateAsync({ familyId: 'family-id', name, createdBy: 'user-id' })
      setName('')
      setShow(false)
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">📚 Collections</h1>
        <button onClick={() => setShow(true)} className="btn btn-primary">+ New</button>
      </div>

      {show && (
        <div className="card-elevated mb-8 space-y-4">
          <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Collection name" className="input-field" autoFocus />
          <div className="flex gap-2">
            <button onClick={add} className="btn btn-primary flex-1">Create</button>
            <button onClick={() => setShow(false)} className="btn btn-secondary flex-1">Cancel</button>
          </div>
        </div>
      )}

      {cols.length === 0 ? (
        <div className="card-elevated text-center py-16"><p>No collections yet</p></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cols.map(c => (
            <div key={c.id} className="card-elevated hover:scale-105">
              <h3 className="font-bold text-lg">{c.name}</h3>
              <p className="text-sm text-gray-600 mt-2">{c.description || 'No description'}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}