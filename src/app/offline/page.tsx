import type { Metadata } from 'next'
import Link from 'next/link'
import { AppIcon } from '@/components/BrandLogo'

export const metadata: Metadata = {
  title: 'Offline · Life Archive',
}

export default function OfflinePage() {
  return (
    <main className="relative flex min-h-dvh items-center justify-center p-6">
      <div className="glass-card max-w-md px-8 py-12 text-center">
        <div className="mb-4 flex justify-center">
          <AppIcon size={72} />
        </div>
        <h1 className="font-display text-4xl font-bold tracking-tight text-ink">
          You&apos;re offline
        </h1>
        <p className="mb-8 mt-3 text-ink/60">
          Saved pages and queued memories stay on this device. We&apos;ll sync when
          you&apos;re back online.
        </p>
        <Link href="/dashboard" className="btn btn-primary">
          Try again
        </Link>
      </div>
    </main>
  )
}
