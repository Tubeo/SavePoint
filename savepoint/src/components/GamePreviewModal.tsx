'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

interface GameLog {
  id: number
  game_title: string
  game_cover: string | null
  game_slug: string | null
  rating: number
  review: string | null
  created_at: string
}

interface GameDetails {
  summary?: string
  genres?: { id: number; name: string }[]
  rating?: number
}

interface Props {
  log: GameLog | null
  onClose: () => void
}

export default function GamePreviewModal({ log, onClose }: Props) {
  const [details, setDetails] = useState<GameDetails | null>(null)
  const [loadingDetails, setLoadingDetails] = useState(false)

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (log) {
      window.addEventListener('keydown', handleKey)
      document.body.style.overflow = 'hidden'
      if (log.game_slug) {
        setDetails(null)
        setLoadingDetails(true)
        fetch(`/api/games/by-slug?slug=${encodeURIComponent(log.game_slug)}`)
          .then(res => res.json())
          .then(data => {
            setDetails(data)
            setLoadingDetails(false)
          })
          .catch(() => setLoadingDetails(false))
      }
    }
    return () => {
      window.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [log, onClose])

  if (!log) return null

  const igdbRating = details?.rating ? Math.round(details.rating) : null

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)' }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg rounded-2xl p-6"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--foreground)', maxHeight: '90vh', overflowY: 'auto' }}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 cursor-pointer transition-opacity hover:opacity-70"
          style={{ color: 'var(--text-muted)', fontSize: '22px', lineHeight: 1 }}
        >
          ✕
        </button>

        <div className="flex gap-5 mb-5">
          <div className="flex-shrink-0">
            {log.game_cover ? (
              <Image
                src={log.game_cover}
                alt={log.game_title}
                width={110}
                height={147}
                className="rounded-lg object-cover"
              />
            ) : (
              <div
                className="rounded-lg flex items-center justify-center text-xs text-center p-2"
                style={{ width: 110, height: 147, background: 'var(--surface-2)', color: 'var(--text-muted)' }}
              >
                {log.game_title}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0 pr-6">
            <h2 className="text-xl font-bold mb-1 leading-tight">{log.game_title}</h2>

            <div className="flex flex-wrap items-center gap-2 mb-3">
              {igdbRating && (
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--surface-2)', color: 'var(--text-muted)' }}>
                  IGDB {igdbRating}/100
                </span>
              )}
              {details?.genres?.slice(0, 2).map(g => (
                <span key={g.id} className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--surface-2)', color: 'var(--text-muted)' }}>
                  {g.name}
                </span>
              ))}
              {loadingDetails && !details && (
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Loading...</span>
              )}
            </div>

            <p className="text-2xl" style={{ color: '#facc15' }}>
              {'★'.repeat(log.rating)}
              <span style={{ color: 'var(--border)' }}>{'★'.repeat(5 - log.rating)}</span>
            </p>
          </div>
        </div>

        {details?.summary && (
          <div className="mb-5">
            <p className="text-sm leading-relaxed line-clamp-3" style={{ color: 'var(--text-muted)' }}>
              {details.summary}
            </p>
            {log.game_slug && (
              <Link
                href={`/game/${log.game_slug}`}
                className="text-xs mt-1 inline-block hover:opacity-80 transition-opacity"
                style={{ color: 'var(--accent)' }}
              >
                read more →
              </Link>
            )}
          </div>
        )}

        {log.review && (
          <div className="mb-5 p-4 rounded-xl" style={{ background: 'var(--surface-2)' }}>
            <p className="text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Your review</p>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--foreground)' }}>
              {log.review}
            </p>
          </div>
        )}

        {!log.review && (
          <p className="text-sm italic mb-5" style={{ color: 'var(--text-muted)' }}>No written review.</p>
        )}

        {log.game_slug && (
          <div className="pt-4" style={{ borderTop: '1px solid var(--border)' }}>
            <Link
              href={`/game/${log.game_slug}`}
              className="flex items-center justify-center w-full py-2.5 rounded-lg text-sm font-medium transition-opacity hover:opacity-90 gap-2"
              style={{ background: 'var(--accent)', color: '#fff' }}
            >
              Full game page →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
