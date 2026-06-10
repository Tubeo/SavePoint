import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import MarqueeBackground from '@/components/MarqueeBackground'

interface Genre { id: number; name: string }
interface Platform { id: number; name: string }
interface Company { company: { name: string } }

interface Game {
  id: number
  name: string
  slug: string
  summary?: string
  first_release_date?: number
  rating?: number
  cover?: { url: string }
  genres?: Genre[]
  platforms?: Platform[]
  involved_companies?: Company[]
}

interface GameLog {
  id: number
  rating: number
  review: string | null
  created_at: string
}

const getCoverUrl = (url: string) => 'https:' + url.replace('t_thumb', 't_cover_big')

async function getGame(slug: string): Promise<Game | null> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const res = await fetch(`${baseUrl}/api/games/by-slug?slug=${encodeURIComponent(slug)}`, {
    cache: 'no-store',
  })
  if (!res.ok) return null
  return res.json()
}

export default async function GamePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const game = await getGame(slug)

  if (!game) {
    notFound()
  }

  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  let myLog: GameLog | null = null
  if (user) {
    const { data } = await supabase
      .from('game_logs')
      .select('id, rating, review, created_at')
      .eq('user_id', user.id)
      .eq('game_slug', slug)
      .maybeSingle()
    myLog = data
  }

  const year = game.first_release_date
    ? new Date(game.first_release_date * 1000).getFullYear()
    : null
  const igdbRating = game.rating ? Math.round(game.rating) : null
  const studio = game.involved_companies?.[0]?.company?.name

  return (
    <MarqueeBackground>
      <div className="p-8 min-h-screen">
        <div
          className="max-w-5xl mx-auto rounded-2xl p-8"
          style={{
            background: 'color-mix(in srgb, var(--background) 94%, transparent)',
            border: '1px solid var(--border)',
            color: 'var(--foreground)',
          }}
        >
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-shrink-0 mx-auto md:mx-0">
              {game.cover ? (
                <Image
                  src={getCoverUrl(game.cover.url)}
                  alt={game.name}
                  width={264}
                  height={352}
                  className="rounded-xl object-cover"
                />
              ) : (
                <div
                  className="rounded-xl flex items-center justify-center text-sm"
                  style={{ width: 264, height: 352, background: 'var(--surface-2)', color: 'var(--text-muted)' }}
                >
                  No cover
                </div>
              )}
            </div>

            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-2">{game.name}</h1>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
                {year && <span>{year}</span>}
                {studio && <span>{studio}</span>}
                {igdbRating && <span>IGDB {igdbRating}/100</span>}
              </div>

              {game.genres && game.genres.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {game.genres.map((g) => (
                    <span
                      key={g.id}
                      className="px-3 py-1 rounded-full text-xs"
                      style={{ background: 'var(--surface-2)', color: 'var(--text-muted)' }}
                    >
                      {g.name}
                    </span>
                  ))}
                </div>
              )}

              {game.summary && (
                <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--foreground)' }}>
                  {game.summary}
                </p>
              )}
            </div>
          </div>

          <div className="mt-10 pt-8" style={{ borderTop: '1px solid var(--border)' }}>
            <h2 className="text-xl font-semibold mb-4">Your log</h2>
            {myLog ? (
              <div className="rounded-xl p-5" style={{ background: 'var(--surface)' }}>
                <p className="text-2xl mb-2" style={{ color: '#facc15' }}>
                  {'★'.repeat(myLog.rating)}
                  <span style={{ color: 'var(--border)' }}>{'★'.repeat(5 - myLog.rating)}</span>
                </p>
                {myLog.review ? (
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--foreground)' }}>
                    {myLog.review}
                  </p>
                ) : (
                  <p className="text-sm italic" style={{ color: 'var(--text-muted)' }}>
                    No written review.
                  </p>
                )}
              </div>
            ) : (
              <div className="rounded-xl p-5 text-center" style={{ background: 'var(--surface)' }}>
                <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>
                  You haven&apos;t logged this game yet.
                </p>
                <Link
                  href="/search"
                  className="inline-block px-5 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-90"
                  style={{ background: 'var(--accent)', color: '#fff' }}
                >
                  Log it
                </Link>
              </div>
            )}
          </div>

          <div className="mt-10 pt-8" style={{ borderTop: '1px solid var(--border)' }}>
            <h2 className="text-xl font-semibold mb-4">Community reviews</h2>
            <p className="text-sm italic" style={{ color: 'var(--text-muted)' }}>
              Coming soon — once more players are logging games, you&apos;ll see average ratings and reviews from the community here.
            </p>
          </div>
        </div>
      </div>
    </MarqueeBackground>
  )
}
