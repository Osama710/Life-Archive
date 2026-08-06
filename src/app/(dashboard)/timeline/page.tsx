'use client'

import { useState } from 'react'
import { TimelineItem } from '@/components/TimelineItem'
import { Button } from '@/components/Button'

const MOCK_MEMORIES = [
  { id: '1', date: 'March 20, 2026', title: 'First Smile', thumbnail: 'https://via.placeholder.com/100' },
  { id: '2', date: 'March 15, 2026', title: 'First Ultrasound', thumbnail: 'https://via.placeholder.com/100' },
  { id: '3', date: 'March 1, 2026', title: 'Pregnancy Confirmed', thumbnail: 'https://via.placeholder.com/100' },
]

export default function TimelinePage() {
  const [selectedMemory, setSelectedMemory] = useState<string | null>(null)

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Timeline</h1>
        <Button>+ Add Memory</Button>
      </div>

      <div className="max-w-2xl">
        <h2 className="text-xl font-semibold mb-4">2026</h2>
        {MOCK_MEMORIES.map((memory) => (
          <TimelineItem
            key={memory.id}
            date={memory.date}
            title={memory.title}
            selected={selectedMemory === memory.id}
            onClick={() => setSelectedMemory(memory.id)}
          />
        ))}
      </div>
    </div>
  )
}
