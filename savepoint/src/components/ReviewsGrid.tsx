'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import GamePreviewModal from './GamePreviewModal'

interface GameLog {
  id: number
  game_title: string
  game_cover: string | null
  game_slug: string | null
  rating: number
  review: string | null
  created_at: string
}

type SortField = 'rating' | 'title' | 'date'
type SortDir = 'asc' | 'desc'

const FIELD_DEFAULTS: Record<SortField, SortDir> = {
  rating: 'desc',
  title: 'asc',
  date: 'desc',
}

const FIELD_LABELS: Record<SortField, string> = {
  rating: 'Rating',
  title: 'Title',
  date: 'Date',
}

export default function ReviewsGrid({ logs }: { logs: GameLog[] }) {
  const [openLog, setOpenLog] = useState<GameLog | null>(null)
  const [sortField, setSortField] = useState<SortField>('rating')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const handleFieldChange = (field: SortField) => {
    if (field === sortField) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDir(FIELD_DEFAULTS[field])
    }
  }

  const sortedLogs = useMemo(() => {
    const copy = [...logs]
    const byTitle = (a: GameLog, b: GameLog) =>
      a.game_title.localeCompare(b.game_title)
    const dir = sortDir === 'desc' ? -1 : 1

    switch (sortField) {
      case 'rating':
        return copy.sort((a, b) => dir * (a.rating - b.rating) || byTitle(a, b))
      case 'title':
        return copy.sort((a, b) => dir * a.game_title.localeCompare(b.game_title))
      case 'date':
        return copy.sort((a, b) =>
          dir * (new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        )
      default:
        return copy
    }
  }, [logs, sortField, sortDir])

  return (
    <>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          {logs.length} {logs.length === 1 ? 'game' : 'games'}
        </p>

        <div className="flex items-center gap-2">
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Sort by</span>

          <div className="flex items-center rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)' }}>
            {(Object.keys(FIELD_LABELS) as SortField[]).map((field) => (
              <button
                key={field}
                onClick={() => handleFieldChange(field)}
                className="px-3 py-1.5 text-sm transition-colors cursor-pointer"
                style={{
                  background: sortField === field ? 'var(--accent)' : 'var(--surface-2)',
                  color: sortField === field ? '#fff' : 'var(--text-muted)',
                  borderRight: field !== 'date' ? '1px solid var(--border)' : 'none',
                }}
              >
                {FIELD_LABELS[field]}
              </button>
            ))}
          </div>

          <button
            onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')}
            className="flex items-center justify-center rounded-lg transition-colors cursor-pointer"
            style={{
              width: 34,
              height: 34,
              background: 'var(--surface-2)',
              border: '1px solid var(--border)',
              color: 'var(--foreground)',
              fontSize: 18,
            }}
            title={sortDir === 'desc' ? 'Descending' : 'Ascending'}
          >
            {sortDir === 'desc' ? '↓' : '↑'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {sortedLogs.map((log) => (
          <div
            key={log.id}
            onClick={() => setOpenLog(log)}
            className="group relative cursor-pointer"
          >
            {log.game_cover ? (
              <Image
                src={log.game_cover}
                alt={log.game_title}
                width={264}
                height={352}
                className="rounded-lg object-cover w-full aspect-[3/4]"
              />
            ) : (
              <div
                className="w-full aspect-[3/4] rounded-lg flex items-center justify-center text-xs text-center p-2"
                style={{ background: 'var(--surface-2)', color: 'var(--text-muted)' }}
              >
                {log.game_title}
              </div>
            )}
            <div
              className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2"
              style={{ background: 'rgba(0,0,0,0.75)' }}
            >
              <p className="text-2xl" style={{ color: '#facc15' }}>{'★'.repeat(log.rating)}</p>
              <p className="text-white text-sm text-center mt-1 line-clamp-2">{log.game_title}</p>
            </div>
          </div>
        ))}
      </div>

      <GamePreviewModal log={openLog} onClose={() => setOpenLog(null)} />
    </>
  )
}
