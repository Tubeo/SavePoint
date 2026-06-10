'use client'

import Image from 'next/image'
import { useGames } from '@/lib/GamesContext'

const getCoverUrl = (url: string) => {
  return 'https:' + url.replace('t_thumb', 't_cover_big')
}

function MarqueeRow({ games, reverse = false }: { games: any[], reverse?: boolean }) {
  const doubled = [...games, ...games]
  return (
    <div style={{ overflow: 'hidden', width: '100%', margin: '6px 0' }}>
      <div style={{
        display: 'flex',
        gap: '10px',
        width: 'max-content',
        animation: `${reverse ? 'scrollRight' : 'scrollLeft'} 55s linear infinite`,
      }}>
        {doubled.map((game, i) => (
          game.cover ? (
            <Image
              key={`${game.id}-${i}`}
              src={getCoverUrl(game.cover.url)}
              alt={game.name}
              width={80}
              height={107}
              style={{ borderRadius: '6px', objectFit: 'cover', flexShrink: 0 }}
            />
          ) : null
        ))}
      </div>
    </div>
  )
}

export default function MarqueeBackground({ children }: { children: React.ReactNode }) {
  const games = useGames()

  const row1 = games.slice(0, 20)
  const row2 = games.slice(5, 25)
  const row3 = games.slice(10, 30)
  const row4 = games.slice(15, 35)
  const row5 = games.slice(20, 40)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)', position: 'relative', overflow: 'hidden' }}>
          <style>{`
        @keyframes scrollLeft {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @keyframes scrollRight {
          from { transform: translateX(-50%); }
          to { transform: translateX(0); }
        }
      `}</style>

      <div style={{ position: 'absolute', inset: 0, opacity: 0.2, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <MarqueeRow games={row1} reverse />
        <MarqueeRow games={row2} />
        <MarqueeRow games={row3} reverse />
        <MarqueeRow games={row4} />
        <MarqueeRow games={row5} reverse />
        <MarqueeRow games={row1} />
        <MarqueeRow games={row3} reverse />
      </div>

      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to bottom, var(--background) 0%, transparent 20%, transparent 80%, var(--background) 100%)'      }} />

      <div style={{ position: 'relative', zIndex: 2 }}>
        {children}
      </div>
    </div>
  )
}