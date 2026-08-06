'use client'

import { useState } from 'react'
import { Card } from '@/components/Card'

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 2)) // March 2026
  const [selectedDate, setSelectedDate] = useState<number | null>(null)

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()
  const datesWithMemories = [1, 5, 10, 15, 20, 22, 25]

  const days = Array.from({ length: firstDayOfMonth }, () => null).concat(
    Array.from({ length: daysInMonth }, (_, i) => i + 1)
  )

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <button onClick={handlePrevMonth} className="text-primary hover:text-primary-dark">
            ←
          </button>
          <h2 className="text-2xl font-bold">
            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h2>
          <button onClick={handleNextMonth} className="text-primary hover:text-primary-dark">
            →
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center font-semibold text-gray-600 py-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {days.map((day, idx) => (
            <button
              key={idx}
              onClick={() => day && setSelectedDate(day)}
              className={`p-3 rounded text-center ${
                day === null
                  ? ''
                  : datesWithMemories.includes(day)
                  ? 'bg-primary text-white font-bold'
                  : 'bg-gray-100 hover:bg-gray-200'
              } ${selectedDate === day ? 'ring-2 ring-primary' : ''}`}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      {selectedDate && (
        <Card>
          <h3 className="font-bold mb-4">
            {currentDate.toLocaleString('default', { month: 'long', day: 'numeric', year: 'numeric' })}
          </h3>
          {datesWithMemories.includes(selectedDate) ? (
            <div className="space-y-2">
              <p className="text-gray-600">First Smile</p>
              <p className="text-gray-600">Family Visit</p>
            </div>
          ) : (
            <p className="text-gray-600">No memories on this date</p>
          )}
        </Card>
      )}
    </div>
  )
}
