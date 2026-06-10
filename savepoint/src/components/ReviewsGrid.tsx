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

export default function ReviewsGrid({ logs }: { logs: GameLog[] }) {
  const [openLog, setOpenLog] = useState<GameLog | null>(null)

  const sortedLogs = useMemo(() => {
    return [...logs].sort((a, b) => b.rating - a.rating || a.game_title.localeCompare(b.game_title))
  }, [logs])

  return (
    <>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          {logs.length} {logs.length === 1 ? 'game' : 'games'}
        </p>
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
