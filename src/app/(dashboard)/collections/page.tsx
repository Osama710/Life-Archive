'use client'

import { useState } from 'react'
import { Card } from '@/components/Card'
import { Button } from '@/components/Button'

const MOCK_COLLECTIONS = [
  { id: '1', name: 'First Year', count: 12 },
  { id: '2', name: 'Hospital Days', count: 5 },
  { id: '3', name: 'Ramadan 2026', count: 8 },
  { id: '4', name: 'Family Visits', count: 15 },
]

export default function CollectionsPage() {
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')

  const handleCreate = () => {
    if (newName.trim()) {
      // TODO: API call
      setNewName('')
      setShowCreate(false)
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Collections</h1>
        <Button onClick={() => setShowCreate(!showCreate)}>+ New Collection</Button>
      </div>

      {showCreate && (
        <Card className="mb-8">
          <input
            type="text"
            placeholder="Collection name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="input-field w-full mb-4"
          />
          <div className="flex gap-2">
            <Button onClick={handleCreate} variant="primary" size="sm">
              Create
            </Button>
            <Button onClick={() => setShowCreate(false)} variant="secondary" size="sm">
              Cancel
            </Button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {MOCK_COLLECTIONS.map((collection) => (
          <Card key={collection.id} className="cursor-pointer hover:shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{collection.name}</h3>
            <p className="text-gray-600">{collection.count} memories</p>
          </Card>
        ))}
      </div>
    </div>
  )
}
