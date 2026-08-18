'use client'

import { useState } from 'react'
import { useFamily } from '@/context/FamilyContext'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

export default function FamilyPage() {
  const { family, familyId, families, setFamilyId } = useFamily()
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'editor' | 'viewer'>('editor')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const invite = async () => {
    if (!familyId || !email.trim()) return
    setError('')
    setMessage('')
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return
    const token = crypto.randomUUID()
    const tokenHash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token))
    const hash = Array.from(new Uint8Array(tokenHash))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
    const expires = new Date()
    expires.setDate(expires.getDate() + 7)
    const { error: inviteError } = await supabase.from('family_invitations').insert({
      family_id: familyId,
      email: email.trim().toLowerCase(),
      role,
      token_hash: hash,
      invited_by: user.id,
      expires_at: expires.toISOString(),
    })
    if (inviteError) {
      setError(inviteError.message)
      return
    }
    const link = `${window.location.origin}/dashboard/invite?token=${token}`
    setMessage(`Invite link (share privately): ${link}`)
    setEmail('')
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="font-serif text-4xl font-bold">Family</h1>
        <p className="text-stone-600">Manage members and switch archives.</p>
      </div>

      {families.length > 1 && (
        <div className="card-elevated">
          <label className="form-label" htmlFor="family">
            Active family
          </label>
          <select
            id="family"
            className="input-field"
            value={familyId || ''}
            onChange={(e) => setFamilyId(e.target.value)}
          >
            {families.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="card-elevated">
        <h2 className="mb-2 text-xl font-bold">{family?.name || 'No family selected'}</h2>
        <p className="text-sm text-stone-600">Invite family with Owner / Editor / Viewer roles.</p>
      </div>

      <div className="card-elevated space-y-4">
        <h3 className="font-bold">Invite member</h3>
        <input
          type="email"
          className="input-field"
          placeholder="email@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <select
          className="input-field"
          value={role}
          onChange={(e) => setRole(e.target.value as 'editor' | 'viewer')}
        >
          <option value="editor">Editor</option>
          <option value="viewer">Viewer</option>
        </select>
        <button type="button" className="btn btn-primary" onClick={invite}>
          Send invite
        </button>
        {message && <p className="text-sm text-green-700">{message}</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    </div>
  )
}
