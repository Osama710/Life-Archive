'use client'

import { useEffect, useMemo, useState } from 'react'
import type { MemoryMedia } from '@/lib/types/db'
import { Button } from '@/components/Button'

interface MemoryMediaGalleryProps {
  media: MemoryMedia[]
  title: string
  variant?: 'compact' | 'featured'
  previewCount?: number
}

const DEFAULT_PREVIEW = 9

function sortMedia(media: MemoryMedia[]) {
  return [...media].sort(
    (a, b) => a.sortOrder - b.sortOrder || a.createdAt.localeCompare(b.createdAt),
  )
}

function MediaThumb({
  item,
  index,
  total,
  className,
  onClick,
}: {
  item: MemoryMedia
  index: number
  total: number
  className?: string
  onClick?: () => void
}) {
  const label =
    item.mediaType === 'video'
      ? `Play video ${index + 1} of ${total}`
      : `View photo ${index + 1} of ${total} in full size`

  const cellClass =
    className ??
    'aspect-square w-full overflow-hidden rounded-2xl border border-ink/8 bg-ink/5 transition hover:ring-2 hover:ring-primary/25'

  if (item.mediaType === 'video') {
    return (
      <button
        type="button"
        aria-label={label}
        onClick={onClick}
        className={`relative block ${cellClass}`}
      >
        <video src={item.secureUrl} muted playsInline className="h-full w-full object-cover" />
        <span className="absolute inset-0 flex items-center justify-center bg-black/35 text-lg text-white">
          ▶
        </span>
      </button>
    )
  }

  return (
    <button type="button" aria-label={label} onClick={onClick} className={`block ${cellClass}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={item.thumbnailUrl || item.secureUrl || item.url}
        alt=""
        className="h-full w-full object-cover object-center"
      />
    </button>
  )
}

function MediaLightbox({
  items,
  title,
  activeIndex,
  onActiveIndexChange,
  onClose,
}: {
  items: MemoryMedia[]
  title: string
  activeIndex: number
  onActiveIndexChange: (index: number) => void
  onClose: () => void
}) {
  const active = items[activeIndex] ?? items[0]!

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'ArrowLeft') {
        onActiveIndexChange(activeIndex === 0 ? items.length - 1 : activeIndex - 1)
      }
      if (event.key === 'ArrowRight') {
        onActiveIndexChange(activeIndex === items.length - 1 ? 0 : activeIndex + 1)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [activeIndex, items.length, onActiveIndexChange, onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-black/95"
      role="dialog"
      aria-modal="true"
      aria-label={`${title} photos`}
    >
      <div className="flex items-center justify-between px-4 py-3 text-white/80">
        <div>
          <p className="text-sm font-medium">
            {activeIndex + 1} / {items.length}
          </p>
          <p className="text-xs text-white/50">Full size · portrait & landscape supported</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl px-3 py-2 text-sm font-semibold hover:bg-white/10"
        >
          Close
        </button>
      </div>

      <div className="relative flex flex-1 items-center justify-center px-4 pb-4">
        {items.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous photo"
              onClick={() =>
                onActiveIndexChange(activeIndex === 0 ? items.length - 1 : activeIndex - 1)
              }
              className="absolute left-2 z-10 rounded-full bg-white/10 px-3 py-2 text-2xl text-white hover:bg-white/20 sm:left-4"
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="Next photo"
              onClick={() =>
                onActiveIndexChange(activeIndex === items.length - 1 ? 0 : activeIndex + 1)
              }
              className="absolute right-2 z-10 rounded-full bg-white/10 px-3 py-2 text-2xl text-white hover:bg-white/20 sm:right-4"
            >
              ›
            </button>
          </>
        )}

        {active.mediaType === 'video' ? (
          <video
            src={active.secureUrl}
            controls
            playsInline
            className="max-h-[calc(100dvh-8rem)] max-w-full object-contain"
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={active.secureUrl || active.url}
            alt={active.fileName || title}
            className="max-h-[calc(100dvh-8rem)] max-w-full object-contain"
          />
        )}
      </div>

      {items.length > 1 && (
        <div className="border-t border-white/10 px-3 py-3">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {items.map((item, index) => (
              <button
                key={item.id}
                type="button"
                aria-label={`Jump to photo ${index + 1}`}
                aria-pressed={index === activeIndex}
                onClick={() => onActiveIndexChange(index)}
                className={`h-14 w-14 shrink-0 overflow-hidden rounded-xl border-2 ${
                  index === activeIndex ? 'border-white' : 'border-white/20 opacity-70'
                }`}
              >
                {item.mediaType === 'video' ? (
                  <video src={item.secureUrl} muted playsInline className="h-full w-full object-cover" />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.thumbnailUrl || item.secureUrl || item.url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export function MemoryMediaGallery({
  media,
  title,
  variant = 'compact',
  previewCount = DEFAULT_PREVIEW,
}: MemoryMediaGalleryProps) {
  const items = useMemo(() => sortMedia(media), [media])
  const [activeIndex, setActiveIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  useEffect(() => {
    setActiveIndex(0)
  }, [items.length])

  if (items.length === 0) return null

  const openLightbox = (index: number) => {
    setActiveIndex(index)
    setLightboxOpen(true)
  }

  const previewItems = items.slice(0, previewCount)
  const hiddenCount = Math.max(items.length - previewCount, 0)
  const gridClass = 'grid grid-cols-3 gap-2 sm:grid-cols-4'

  if (variant === 'featured') {
    const active = items[activeIndex] ?? items[0]!
    return (
      <>
        <section className="overflow-hidden rounded-3xl border border-ink/8 bg-black/[0.03] shadow-soft">
          <div className="flex min-h-[180px] items-center justify-center bg-ink/[0.04]">
            {active.mediaType === 'video' ? (
              <video
                src={active.secureUrl}
                controls
                playsInline
                className="max-h-64 w-full cursor-pointer object-contain"
                onClick={() => openLightbox(activeIndex)}
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={active.secureUrl || active.url}
                alt={active.fileName || title}
                className="max-h-64 w-full cursor-zoom-in object-contain"
                onClick={() => openLightbox(activeIndex)}
              />
            )}
          </div>
        </section>
        {lightboxOpen && (
          <MediaLightbox
            items={items}
            title={title}
            activeIndex={activeIndex}
            onActiveIndexChange={setActiveIndex}
            onClose={() => setLightboxOpen(false)}
          />
        )}
      </>
    )
  }

  return (
    <>
      <section className="glass-card p-4 sm:p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-bold text-ink">Photos & videos</h2>
            <p className="text-sm text-ink/50">
              {items.length} {items.length === 1 ? 'item' : 'items'} · same-size previews, tap for
              full photo
            </p>
          </div>
          {items.length > 1 && (
            <Button type="button" variant="secondary" size="sm" onClick={() => openLightbox(0)}>
              Open gallery
            </Button>
          )}
        </div>

        <div className={gridClass}>
          {previewItems.map((item, index) => (
            <MediaThumb
              key={item.id}
              item={item}
              index={index}
              total={items.length}
              onClick={() => openLightbox(index)}
            />
          ))}
          {hiddenCount > 0 && (
            <button
              type="button"
              aria-label={`View ${hiddenCount} more photos`}
              onClick={() => openLightbox(previewCount)}
              className="flex aspect-square w-full flex-col items-center justify-center rounded-2xl border border-dashed border-primary/30 bg-linear-to-br from-violet-500/10 to-fuchsia-500/10 text-center transition hover:border-primary/50"
            >
              <span className="font-display text-xl font-bold text-primary">+{hiddenCount}</span>
              <span className="text-xs font-semibold text-ink/55">more</span>
            </button>
          )}
        </div>

        {items.length > previewCount && (
          <Button
            type="button"
            variant="secondary"
            className="mt-4 w-full"
            onClick={() => openLightbox(0)}
          >
            View all {items.length} photos & videos
          </Button>
        )}
      </section>

      {lightboxOpen && (
        <MediaLightbox
          items={items}
          title={title}
          activeIndex={activeIndex}
          onActiveIndexChange={setActiveIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  )
}
