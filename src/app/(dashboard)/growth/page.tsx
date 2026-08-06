'use client'

import { useState } from 'react'
import { Input } from '@/components/Input'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'

const MOCK_GROWTH = [
  { date: '2026-03-20', height: 55.5, weight: 6.2 },
  { date: '2026-03-15', height: 55.2, weight: 6.1 },
  { date: '2026-03-10', height: 55.0, weight: 6.0 },
]

export default function GrowthPage() {
  const [showForm, setShowForm] = useState(false)
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')

  const handleAdd = () => {
    console.log('Adding growth record:', { date, height, weight })
    setHeight('')
    setWeight('')
    setShowForm(false)
  }

  return (
    <div className="max-w-2xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Growth Tracking</h1>
        <Button onClick={() => setShowForm(!showForm)}>+ Add Record</Button>
      </div>

      {showForm && (
        <Card className="mb-8">
          <h2 className="font-bold mb-4">Add Measurement</h2>
          <Input type="date" label="Date" value={date} onChange={(e) => setDate(e.target.value)} />
          <Input
            label="Height (cm)"
            type="number"
            placeholder="e.g., 55.5"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
          />
          <Input
            label="Weight (kg)"
            type="number"
            placeholder="e.g., 6.2"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
          />
          <div className="flex gap-2">
            <Button onClick={handleAdd}>Save</Button>
            <Button variant="secondary" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </Card>
      )}

      <Card>
        <h2 className="font-bold mb-4">Measurements</h2>
        <div className="space-y-2">
          {MOCK_GROWTH.map((record, idx) => (
            <div key={idx} className="flex justify-between text-gray-700 p-2 bg-gray-50 rounded">
              <span>{new Date(record.date).toLocaleDateString()}</span>
              <span>
                Height: {record.height}cm | Weight: {record.weight}kg
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
