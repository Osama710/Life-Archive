'use client'
import { useState } from 'react'

export default function FamilyPage() {
  const [show, setShow] = useState(false)
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('editor')
  const [members] = useState([
    { id: 1, email: 'osama@example.com', role: 'owner' },
    { id: 2, email: 'wife@example.com', role: 'editor' },
  ])

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">👨‍👩‍👧‍👦 Family</h1>
        <button onClick={() => setShow(true)} className="btn btn-primary">+ Invite</button>
      </div>

      {show && (
        <div className="card-elevated mb-8 space-y-4">
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="input-field" />
          <select value={role} onChange={e => setRole(e.target.value)} className="input-field">
            <option>owner</option>
            <option>editor</option>
            <option>viewer</option>
          </select>
          <div className="flex gap-2">
            <button onClick={() => { setShow(false) }} className="btn btn-primary flex-1">Send</button>
            <button onClick={() => setShow(false)} className="btn btn-secondary flex-1">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {members.map(m => (
          <div key={m.id} className="card-elevated flex justify-between items-center">
            <div>
              <p className="font-bold">{m.email}</p>
              <p className="text-sm text-gray-600 capitalize">{m.role}</p>
            </div>
            <button className="btn btn-secondary">Remove</button>
          </div>
        ))}
      </div>
    </div>
  )
}