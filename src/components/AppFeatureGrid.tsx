'use client'

import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import type { AppFeature } from '@/lib/appFeatures'
import { APP_FEATURE_SECTIONS, APP_FEATURES, FEATURE_ACCENT_CLASS } from '@/lib/appFeatures'

function FeatureTile({ feature }: { feature: AppFeature }) {
  const Icon = feature.icon
  const accent = FEATURE_ACCENT_CLASS[feature.accent]

  return (
    <Link
      href={feature.href}
      className="surface-card group flex flex-col gap-3 p-4 transition active:scale-[0.98]"
    >
      <div
        className={`flex size-11 items-center justify-center rounded-2xl ${accent} transition group-active:scale-95`}
      >
        <Icon size={22} strokeWidth={2} aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <p className="font-display text-sm font-semibold leading-snug text-ink">{feature.title}</p>
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-ink/45">{feature.description}</p>
      </div>
    </Link>
  )
}

function FeatureRow({ feature }: { feature: AppFeature }) {
  const Icon = feature.icon
  const accent = FEATURE_ACCENT_CLASS[feature.accent]

  return (
    <Link
      href={feature.href}
      className="surface-card group flex items-center gap-3 p-4 transition active:scale-[0.99]"
    >
      <div className={`flex size-11 shrink-0 items-center justify-center rounded-2xl ${accent}`}>
        <Icon size={21} strokeWidth={2} aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="font-display text-base font-semibold text-ink">{feature.title}</h3>
          {feature.status === 'partial' && (
            <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
              Beta
            </span>
          )}
        </div>
        <p className="mt-0.5 text-sm leading-relaxed text-ink/50">{feature.description}</p>
        {feature.statusNote && (
          <p className="mt-1.5 text-xs text-ink/40">{feature.statusNote}</p>
        )}
      </div>
      <ChevronRight
        size={18}
        className="shrink-0 text-ink/25 transition group-hover:text-ink/45"
        aria-hidden="true"
      />
    </Link>
  )
}

export function AppFeatureGrid({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {APP_FEATURES.filter((f) => f.section !== 'account').map((feature) => (
          <FeatureTile key={feature.href} feature={feature} />
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
            <h2 className="mb-3 px-1 text-xs font-semibold uppercase tracking-widest text-ink/40">
              {section.label}
            </h2>
            <div className="space-y-2">
              {items.map((feature) => (
                <FeatureRow key={feature.href} feature={feature} />
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
    <section className="rounded-2xl border border-ink/5 bg-white/80 px-4 py-4">
      <p className="text-xs font-semibold uppercase tracking-widest text-ink/40">Coming soon</p>
      <ul className="mt-2 space-y-1.5 text-sm text-ink/55">
        <li>Push notifications</li>
        <li>Read sealed letters early</li>
        <li>Offline saving</li>
      </ul>
    </section>
  )
}
