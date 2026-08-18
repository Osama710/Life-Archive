'use client'

import { AppComingSoonNote, AppFeatureGrid } from '@/components/AppFeatureGrid'
import { PageHeader } from '@/components/PageHeader'
import { PageMotion } from '@/components/PageMotion'

export default function MorePage() {
  return (
    <PageMotion>
      <PageHeader
        title="Explore"
        subtitle="Every screen in your archive."
      />

      <AppFeatureGrid />
      <div className="mt-8">
        <AppComingSoonNote />
      </div>
    </PageMotion>
  )
}
