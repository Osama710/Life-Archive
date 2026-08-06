'use client'

import { useState } from 'react'
import { Input } from '@/components/Input'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'

const MOCK_MEMBERS = [
  { id: '1', email: 'amira@example.com', role: 'owner' },
  { id: '2', email: 'hassan@example.com', role: 'editor' },
  { id: '3', email: 'grandma@example.com', role: 'viewer' },
]

export default function FamilyPage() {
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('editor')
  const [showInvite, setShowInvite] = useState(false)

  const handleInvite = () => {
    console.log('Inviting:', inviteEmail, inviteRole)
    setInviteEmail('')
    setShowInvite(false)
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Family</h1>

      <Card className="mb-8">
        <h2 className="font-bold mb-4">Khan Family</h2>
        <p className="text-gray-600 mb-4">{MOCK_MEMBERS.length} members</p>

        <div className="space-y-3">
          {MOCK_MEMBERS.map((member) => (
            <div key={member.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <div>
                <p className="font-medium">{member.email}</p>
                <p className="text-sm text-gray-600 capitalize">{member.role}</p>
              </div>
              <Button variant="secondary" size="sm">
                Remove
              </Button>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="font-bold mb-4">Invite Member</h2>
        {!showInvite ? (
          <Button onClick={() => setShowInvite(true)}>+ Send Invitation</Button>
        ) : (
          <div className="space-y-4">
            <Input
              type="email"
              label="Email"
              placeholder="member@example.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
            />
            <div>
              <label className="block text-sm font-medium mb-2">Role</label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="input-field"
              >
                <option value="owner">Owner</option>
                <option value="editor">Editor</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleInvite}>Send</Button>
              <Button variant="secondary" onClick={() => setShowInvite(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
