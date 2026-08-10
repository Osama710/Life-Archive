'use client'
import { useState } from 'react'

export default function CalendarPage() {
  const [date, setDate] = useState(new Date(2026, 2))
  const days = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  const first = new Date(date.getFullYear(), date.getMonth(), 1).getDay()

  const prev = () => setDate(new Date(date.getFullYear(), date.getMonth() - 1))
  const next = () => setDate(new Date(date.getFullYear(), date.getMonth() + 1))

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">📅 Calendar</h1>
      
      <div className="card-elevated p-8">
        <div className="flex justify-between items-center mb-8">
          <button onClick={prev} className="btn btn-secondary">←</button>
          <h2 className="text-2xl font-bold">{date.toLocaleString('default', {month:'long', year:'numeric'})}</h2>
          <button onClick={next} className="btn btn-secondary">→</button>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="text-center font-bold text-gray-600 py-2">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {Array(first).fill(null).map((_, i) => <div key={`empty${i}`}></div>)}
          {Array(days).fill(null).map((_, i) => (
            <button key={i + 1} className="p-3 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 font-medium">
              {i + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}