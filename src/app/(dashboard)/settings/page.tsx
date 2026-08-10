'use client'
import { useAuth } from '@/context/AuthContext'

export default function SettingsPage() {
  const { user, signOut } = useAuth()

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">⚙️ Settings</h1>

      <div className="space-y-6">
        <div className="card-elevated">
          <h2 className="text-xl font-bold mb-4">Account</h2>
          <p className="text-gray-700 mb-4">{user?.email}</p>
          <button className="btn btn-secondary">Change Password</button>
        </div>

        <div className="card-elevated">
          <h2 className="text-xl font-bold mb-4">Display</h2>
          <label className="flex items-center gap-3 cursor-pointer mb-4">
            <input type="checkbox" className="w-5 h-5" />
            <span>Dark Mode (Coming Soon)</span>
          </label>
        </div>

        <div className="card-elevated">
          <h2 className="text-xl font-bold mb-4">Data</h2>
          <p className="text-gray-600 mb-4">Storage: 2.3 GB of 100 GB</p>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div className="bg-blue-600 h-2 rounded-full" style={{width: '23%'}}></div>
          </div>
          <button className="btn btn-secondary">Export Data</button>
        </div>

        <div className="card-elevated border-2 border-red-200">
          <h2 className="text-xl font-bold mb-4 text-red-600">Danger</h2>
          <button onClick={() => signOut()} className="btn btn-danger">Logout</button>
        </div>
      </div>
    </div>
  )
}