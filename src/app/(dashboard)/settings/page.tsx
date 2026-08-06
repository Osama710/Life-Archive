'use client'

import { useState } from 'react'
import { Input } from '@/components/Input'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'

export default function SettingsPage() {
  const [darkMode, setDarkMode] = useState(false)
  const [notifications, setNotifications] = useState(true)

  const handleExport = () => {
    console.log('Exporting data...')
    // TODO: Trigger export
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>

      <Card className="mb-6">
        <h2 className="font-bold mb-4">Account</h2>
        <Input label="Email" type="email" value="user@example.com" disabled />
        <Button variant="secondary" size="sm">
          Change Password
        </Button>
      </Card>

      <Card className="mb-6">
        <h2 className="font-bold mb-4">Display</h2>
        <label className="flex items-center gap-3 mb-4 cursor-pointer">
          <input
            type="checkbox"
            checked={darkMode}
            onChange={(e) => setDarkMode(e.target.checked)}
          />
          <span>Dark Mode</span>
        </label>
      </Card>

      <Card className="mb-6">
        <h2 className="font-bold mb-4">Notifications</h2>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={notifications}
            onChange={(e) => setNotifications(e.target.checked)}
          />
          <span>Enable Notifications</span>
        </label>
      </Card>

      <Card className="mb-6">
        <h2 className="font-bold mb-4">Data</h2>
        <p className="text-gray-600 mb-4">Storage: 2.3 GB of 100 GB</p>
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div className="bg-primary h-2 rounded-full" style={{ width: '23%' }}></div>
        </div>
        <Button onClick={handleExport} variant="primary" size="sm">
          Export My Data
        </Button>
      </Card>

      <Card>
        <h2 className="font-bold mb-4 text-error">Danger Zone</h2>
        <Button variant="danger" size="sm">
          Delete Account
        </Button>
      </Card>
    </div>
  )
}
