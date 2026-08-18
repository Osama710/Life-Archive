'use client'

import Link from 'next/link'
import type { AppFeature } from '@/lib/appFeatures'
import { APP_FEATURE_SECTIONS, APP_FEATURES } from '@/lib/appFeatures'

function StatusBadge({ feature }: { feature: AppFeature }) {
  if (feature.status === 'ready') {
    return <span className="badge badge-success shrink-0">Ready</span>
  }
  return <span className="badge shrink-0">Partial</span>
}

function FeatureCard({ feature, compact = false }: { feature: AppFeature; compact?: boolean }) {
  const Icon = feature.icon

  return (
    <Link
      href={feature.href}
      className={`glass-card genz-cut-corner block transition active:scale-[0.98] ${
        compact ? 'p-4 text-center' : 'flex items-start gap-4 p-4'
      }`}
    >
      <span className="genz-sticker" aria-hidden="true">
        {feature.emoji}
      </span>
      {compact ? (
        <>
          <span className="mb-2 block text-2xl" aria-hidden="true">
            {feature.emoji}
          </span>
          <p className="font-display text-sm font-bold text-ink">{feature.title}</p>
          {feature.status === 'partial' && (
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-ink/40">
              Partial
            </p>
          )}
        </>
      ) : (
        <>
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-violet-500/15 to-fuchsia-500/10 text-primary">
            <Icon size={22} aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-display text-base font-bold text-ink">{feature.title}</h3>
              <StatusBadge feature={feature} />
            </div>
            <p className="mt-1 text-sm leading-relaxed text-ink/55">{feature.description}</p>
            {feature.statusNote && (
              <p className="mt-2 text-xs font-medium text-amber-700/80">{feature.statusNote}</p>
            )}
          </div>
        </>
      )}
    </Link>
  )
}

export function AppFeatureGrid({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="grid grid-cols-2 gap-2">
        {APP_FEATURES.filter((f) => f.section !== 'account').map((feature) => (
          <FeatureCard key={feature.href} feature={feature} compact />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {APP_FEATURE_SECTIONS.map((section) => {
        const items = APP_FEATURES.filter((f) => f.section === section.id)
        if (items.length === 0) return null

        return (
          <section key={section.id}>
            <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-wide text-ink/45">
              {section.label}
            </h2>
            <div className="space-y-2">
              {items.map((feature) => (
                <FeatureCard key={feature.href} feature={feature} />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}

export function AppComingSoonNote() {
  return (
    <section className="glass-card genz-cut-corner border border-dashed border-ink/10 bg-white/50 p-4">
      <h3 className="font-display text-sm font-bold text-ink/70">Not in the app yet</h3>
      <ul className="mt-2 space-y-1 text-sm text-ink/50">
        <li>· Push notifications</li>
        <li>· Read sealed Letters early</li>
        <li>· Offline saving</li>
      </ul>
    </section>
  )
}
