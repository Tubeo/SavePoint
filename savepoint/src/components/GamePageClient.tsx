'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import LogGameModal from './LogGameModal'

interface Genre { id: number; name: string }
interface Platform { id: number; name: string }
interface GameMode { id: number; name: string }
interface SimilarGame { id: number; name: string; slug: string; cover?: { url: string } }

interface Game {
  id: number
  name: string
  slug: string
  summary?: string
  rating_count?: number
  cover?: { url: string }
  genres?: Genre[]
  platforms?: Platform[]
  screenshots?: { id: number; url: string }[]
  game_modes?: GameMode[]
  similar_games?: SimilarGame[]
}

interface GameLog {
  id: number
  rating: number
  review: string | null
  created_at: string
}

interface GameForModal {
  id: number
  name: string
  slug?: string
  cover?: { url: string }
  first_release_date?: number
}

interface Props {
  game: Game
  myLog: GameLog | null
  year: number | null
  igdbRating: number | null
  developer: string | null
  publisher: string | null
  ageRatingLabel: string | null
  gameForModal: GameForModal
  isLoggedIn: boolean
}

const getCoverUrl = (url: string) => 'https:' + url.replace('t_thumb', 't_cover_big')
const getScreenshotUrl = (url: string) => 'https:' + url.replace('t_thumb', 't_screenshot_big')

export default function GamePageClient({
  game, myLog, year, igdbRating, developer, publisher, ageRatingLabel, gameForModal, isLoggedIn
}: Props) {
  const [activeShot, setActiveShot] = useState(0)
  const [logOpen, setLogOpen] = useState(false)

  const screenshots = game.screenshots ?? []
  const prevShot = () => setActiveShot(i => (i - 1 + screenshots.length) % screenshots.length)
  const nextShot = () => setActiveShot(i => (i + 1) % screenshots.length)

  return (
    <div className="p-6">
      <div className="flex flex-col lg:flex-row gap-6">

        <div className="flex flex-col gap-4" style={{ minWidth: 0, flex: '0 0 340px' }}>
          <div className="flex gap-4">
            {game.cover && (
              <Image
                src={getCoverUrl(game.cover.url)}
                alt={game.name}
                width={120}
                height={160}
                className="rounded-lg object-cover flex-shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold mb-1 leading-tight">{game.name}</h1>
              <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
                {year && <span>{year}</span>}
                {developer && <span>{developer}</span>}
                {igdbRating && <span>IGDB {igdbRating}/100</span>}
                {ageRatingLabel && <span>{ageRatingLabel}</span>}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {game.genres?.map(g => (
                  <span key={g.id} className="px-2 py-0.5 rounded-full text-xs" style={{ background: 'var(--surface-2)', color: 'var(--text-muted)' }}>
                    {g.name}
                  </span>
                ))}
                {game.game_modes?.map(m => (
                  <span key={m.id} className="px-2 py-0.5 rounded-full text-xs" style={{ background: 'var(--surface-2)', color: 'var(--text-muted)' }}>
                    {m.name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {game.summary && (
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              {game.summary}
            </p>
          )}

          {game.platforms && game.platforms.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {game.platforms.map(p => (
                <span key={p.id} className="px-2 py-0.5 rounded text-xs" style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                  {p.name}
                </span>
              ))}
            </div>
          )}

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
            {myLog ? (
              <div>
                <p className="text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Your log</p>
                <p className="text-xl mb-1" style={{ color: '#facc15' }}>
                  {'★'.repeat(myLog.rating)}
                  <span style={{ color: 'var(--border)' }}>{'★'.repeat(5 - myLog.rating)}</span>
                </p>
                {myLog.review && (
                  <p className="text-sm leading-relaxed">{myLog.review}</p>
                )}
              </div>
            ) : (
              <div className="text-center py-2">
                {isLoggedIn ? (
                  <button
                    onClick={() => setLogOpen(true)}
                    className="cursor-pointer px-5 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-90"
                    style={{ background: 'var(--accent)', color: '#fff' }}
                  >
                    Log this game
                  </button>
                ) : (
                  <Link
                    href="/auth/login"
                    className="inline-block px-5 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-90"
                    style={{ background: 'var(--accent)', color: '#fff' }}
                  >
                    Sign in to log this game
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 min-w-0 flex flex-col gap-3">
          {screenshots.length > 0 && (
            <>
              <div className="flex items-center gap-2">
                <button
                  onClick={prevShot}
                  className="cursor-pointer flex items-center justify-center rounded-full transition-opacity hover:opacity-80 flex-shrink-0"
                  style={{ width: 32, height: 32, background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--foreground)', fontSize: 16 }}
                >
                  ‹
                </button>
                <div className="flex-1 relative rounded-lg overflow-hidden" style={{ aspectRatio: '16/9', background: 'var(--surface-2)' }}>
                  <Image
                    src={getScreenshotUrl(screenshots[activeShot].url)}
                    alt={`Screenshot ${activeShot + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
                <button
                  onClick={nextShot}
                  className="cursor-pointer flex items-center justify-center rounded-full transition-opacity hover:opacity-80 flex-shrink-0"
                  style={{ width: 32, height: 32, background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--foreground)', fontSize: 16 }}
                >
                  ›
                </button>
              </div>

              <div className="flex gap-2 flex-wrap">
                {screenshots.map((s, i) => (
                  <button
                    key={s.id}
                    onClick={() => setActiveShot(i)}
                    className="cursor-pointer transition-opacity hover:opacity-80 relative flex-shrink-0"
                    style={{ width: 64, height: 43, borderRadius: 5, overflow: 'hidden', border: i === activeShot ? '2px solid var(--accent)' : '2px solid transparent' }}
                  >
                    <Image
                      src={getScreenshotUrl(s.url)}
                      alt={`Thumb ${i + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            </>
          )}

          {game.similar_games && game.similar_games.length > 0 && (
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
              <p className="text-xs uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>Similar games</p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {game.similar_games.slice(0, 8).map(sg => (
                  <Link key={sg.id} href={`/game/${sg.slug}`} className="flex-shrink-0 transition-opacity hover:opacity-80">
                    {sg.cover ? (
                      <Image
                        src={getCoverUrl(sg.cover.url)}
                        alt={sg.name}
                        width={60}
                        height={80}
                        className="rounded-lg object-cover"
                      />
                    ) : (
                      <div className="rounded-lg flex items-center justify-center text-xs text-center p-1"
                        style={{ width: 70, height: 93, background: 'var(--surface-2)', color: 'var(--text-muted)' }}>
                        {sg.name}
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
            <p className="text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Community reviews</p>
            <p className="text-sm italic" style={{ color: 'var(--text-muted)' }}>
              Coming soon — once more players are logging games, you&apos;ll see average ratings and reviews from the community here.
            </p>
          </div>
        </div>
      </div>

      <LogGameModal
        game={logOpen ? gameForModal : null}
        onClose={() => setLogOpen(false)}
        onSuccess={() => setLogOpen(false)}
      />
    </div>
  )
}
