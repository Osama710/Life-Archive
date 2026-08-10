'use client'
import { useState } from 'react'

export default function GrowthPage() {
  const [show, setShow] = useState(false)
  const [h, setH] = useState('')
  const [w, setW] = useState('')
  const [recs, setRecs] = useState<any[]>([])

  const add = () => {
    if (h && w) {
      setRecs([...recs, { id: Date.now(), date: new Date().toISOString().split('T')[0], height: h, weight: w }])
      setH('')
      setW('')
      setShow(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">📈 Growth</h1>
        <button onClick={() => setShow(true)} className="btn btn-primary">+ Add</button>
      </div>

      {show && (
        <div className="card-elevated mb-8 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Height (cm)</label>
              <input type="number" value={h} onChange={e => setH(e.target.value)} placeholder="Height" className="input-field" />
            </div>
            <div>
              <label className="form-label">Weight (kg)</label>
              <input type="number" value={w} onChange={e => setW(e.target.value)} placeholder="Weight" className="input-field" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={add} className="btn btn-primary flex-1">Save</button>
            <button onClick={() => setShow(false)} className="btn btn-secondary flex-1">Cancel</button>
          </div>
        </div>
      )}

      {recs.length === 0 ? (
        <div className="card-elevated text-center py-16"><p>No records yet</p></div>
      ) : (
        <div className="space-y-2">
          {recs.map(r => (
            <div key={r.id} className="card-elevated p-4 flex justify-between">
              <div>
                <p className="font-bold">{r.date}</p>
                <p className="text-sm text-gray-600">{r.height}cm | {r.weight}kg</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}