import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Offline · Life Archive',
}

export default function OfflinePage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-cream p-6">
      <div className="max-w-md text-center">
        <h1 className="mb-3 font-serif text-4xl font-bold">You’re offline</h1>
        <p className="mb-6 text-stone-600">
          Your saved pages and queued memories stay on this device. We’ll sync when you’re back
          online.
        </p>
        <Link href="/dashboard" className="btn btn-primary">
          Try again
        </Link>
      </div>
    </main>
  )
}
