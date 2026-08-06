'use client'

import { useState } from 'react'
import { Input } from '@/components/Input'
import { Button } from '@/components/Button'

export default function MemoryCreatePage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [memoryDate, setMemoryDate] = useState(new Date().toISOString().split('T')[0])
  const [location, setLocation] = useState('')
  const [mood, setMood] = useState('😊')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // TODO: API call
      const memory = {
        id: Math.random().toString(),
        title,
        description,
        memoryDate,
        location,
        mood,
        createdAt: new Date().toISOString(),
      }
      console.log('Memory created:', memory)
      // Redirect to timeline
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">New Memory</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Photo Upload */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <p className="text-gray-600 mb-4">Upload photos or videos</p>
          <input type="file" multiple accept="image/*,video/*" className="hidden" />
          <Button variant="secondary">Choose Files</Button>
        </div>

        <Input
          label="Title"
          placeholder="e.g., First Smile"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <Input
          label="Date"
          type="date"
          value={memoryDate}
          onChange={(e) => setMemoryDate(e.target.value)}
          required
        />

        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            className="input-field w-full h-32"
            placeholder="Share the story..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <Input
          label="Location"
          placeholder="Where was this?"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />

        <div>
          <label className="block text-sm font-medium mb-2">How did you feel?</label>
          <div className="flex gap-2">
            {['😊', '😄', '😍', '😢', '🤔'].map((em) => (
              <button
                key={em}
                type="button"
                onClick={() => setMood(em)}
                className={`text-3xl p-2 rounded ${mood === em ? 'bg-primary' : 'hover:bg-gray-100'}`}
              >
                {em}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-4">
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save Memory'}
          </Button>
          <Button variant="secondary">Cancel</Button>
        </div>
      </form>
    </div>
  )
}
