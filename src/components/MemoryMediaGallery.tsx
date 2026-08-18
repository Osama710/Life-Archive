'use client'

import { useEffect, useMemo, useState } from 'react'
import type { MemoryMedia } from '@/lib/types/db'

interface MemoryMediaGalleryProps {
  media: MemoryMedia[]
  title: string
}

function sortMedia(media: MemoryMedia[]) {
  return [...media].sort(
    (a, b) => a.sortOrder - b.sortOrder || a.createdAt.localeCompare(b.createdAt),
  )
}

export function MemoryMediaGallery({ media, title }: MemoryMediaGalleryProps) {
  const items = useMemo(() => sortMedia(media), [media])
  const [activeIndex, setActiveIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  useEffect(() => {
    setActiveIndex(0)
  }, [items.length])

  useEffect(() => {
    if (!lightboxOpen) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setLightboxOpen(false)
      if (event.key === 'ArrowLeft') {
        setActiveIndex((index) => (index === 0 ? items.length - 1 : index - 1))
      }
      if (event.key === 'ArrowRight') {
        setActiveIndex((index) => (index === items.length - 1 ? 0 : index + 1))
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [lightboxOpen, items.length])

  if (items.length === 0) return null

  const active = items[activeIndex] ?? items[0]!

  const renderItem = (
    item: MemoryMedia,
    {
      className,
      onClick,
      controls = item.mediaType === 'video',
    }: { className: string; onClick?: () => void; controls?: boolean },
  ) => {
    if (item.mediaType === 'video') {
      return (
        <video
          key={item.id}
          src={item.secureUrl}
          controls={controls}
          playsInline
          className={className}
          onClick={onClick}
        />
      )
    }

    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        key={item.id}
        src={item.secureUrl || item.url}
        alt={item.fileName || title}
        className={className}
        onClick={onClick}
      />
    )
  }

  return (
    <>
      <section className="overflow-hidden rounded-3xl border border-ink/8 bg-black/[0.03] shadow-soft">
        <div className="flex min-h-[220px] items-center justify-center bg-ink/[0.04]">
          {renderItem(active, {
            className:
              'max-h-[min(72vh,960px)] w-full cursor-zoom-in object-contain',
            onClick: () => setLightboxOpen(true),
            controls: true,
          })}
        </div>

        {items.length > 1 && (
          <div className="border-t border-ink/8 bg-white/50 p-3 sm:p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink/45">
              {activeIndex + 1} of {items.length} · tap a thumbnail to switch
            </p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {items.map((item, index) => {
                const selected = index === activeIndex
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-label={`View ${item.fileName || `photo ${index + 1}`}`}
                    aria-pressed={selected}
                    onClick={() => setActiveIndex(index)}
                    className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 transition ${
                      selected
                        ? 'border-primary shadow-soft ring-2 ring-primary/20'
                        : 'border-ink/10 opacity-80 hover:border-primary/30 hover:opacity-100'
                    }`}
                  >
                    {item.mediaType === 'video' ? (
                      <>
                        <video
                          src={item.secureUrl}
                          muted
                          playsInline
                          className="h-full w-full object-cover"
                        />
                        <span className="absolute inset-0 flex items-center justify-center bg-black/30 text-lg text-white">
                          ▶
                        </span>
                      </>
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.thumbnailUrl || item.secureUrl || item.url}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </section>

      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-black/95"
          role="dialog"
          aria-modal="true"
          aria-label={`${title} photos`}
        >
          <div className="flex items-center justify-between px-4 py-3 text-white/80">
            <p className="text-sm font-medium">
              {activeIndex + 1} / {items.length}
            </p>
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
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
                    setActiveIndex((index) => (index === 0 ? items.length - 1 : index - 1))
                  }
                  className="absolute left-2 z-10 rounded-full bg-white/10 px-3 py-2 text-2xl text-white hover:bg-white/20 sm:left-4"
                >
                  ‹
                </button>
                <button
                  type="button"
                  aria-label="Next photo"
                  onClick={() =>
                    setActiveIndex((index) => (index === items.length - 1 ? 0 : index + 1))
                  }
                  className="absolute right-2 z-10 rounded-full bg-white/10 px-3 py-2 text-2xl text-white hover:bg-white/20 sm:right-4"
                >
                  ›
                </button>
              </>
            )}

            {renderItem(active, {
              className: 'max-h-[calc(100dvh-8rem)] max-w-full object-contain',
              controls: true,
            })}
          </div>
        </div>
      )}
    </>
  )
}
