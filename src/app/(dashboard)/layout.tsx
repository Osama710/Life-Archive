'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  const navItems = [
    { label: 'Timeline', href: '/dashboard/timeline', icon: '📅' },
    { label: 'Calendar', href: '/dashboard/calendar', icon: '📆' },
    { label: 'Collections', href: '/dashboard/collections', icon: '📚' },
    { label: 'Settings', href: '/dashboard/settings', icon: '⚙️' },
  ]

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 p-6 overflow-y-auto">
        <h2 className="text-2xl font-bold text-primary mb-8">Life Archive</h2>

        <nav className="space-y-2 mb-8">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition ${
                pathname === item.href
                  ? 'bg-primary text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <button className="w-full px-4 py-2 text-error hover:bg-red-50 rounded-lg transition">
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="h-16 bg-white border-b border-gray-200 flex items-center px-8">
          <div className="flex items-center space-x-2">
            <input
              type="search"
              placeholder="Search memories..."
              className="input-field max-w-xs"
            />
          </div>
          <div className="ml-auto flex items-center space-x-4">
            <button>🔔</button>
            <button>👤</button>
          </div>
        </div>
        <div className="p-8">{children}</div>
      </main>
    </div>
  )
}
