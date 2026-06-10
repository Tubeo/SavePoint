import { notFound } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import MarqueeBackground from '@/components/MarqueeBackground'
import GamePageClient from '@/components/GamePageClient'

interface Genre { id: number; name: string }
interface Platform { id: number; name: string }
interface GameMode { id: number; name: string }
interface AgeRating { id: number; rating: number; category: number }
interface Company { company: { name: string }; developer: boolean; publisher: boolean }
interface SimilarGame { id: number; name: string; slug: string; cover?: { url: string } }

interface Game {
  id: number
  name: string
  slug: string
  summary?: string
  first_release_date?: number
  rating?: number
  rating_count?: number
  cover?: { url: string }
  genres?: Genre[]
  platforms?: Platform[]
  screenshots?: { id: number; url: string }[]
  involved_companies?: Company[]
  game_modes?: GameMode[]
  age_ratings?: AgeRating[]
  similar_games?: SimilarGame[]
}

interface GameLog {
  id: number
  rating: number
  review: string | null
  created_at: string
}

async function getGame(slug: string): Promise<Game | null> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const res = await fetch(`${baseUrl}/api/games/by-slug?slug=${encodeURIComponent(slug)}`, {
    cache: 'no-store',
  })
  if (!res.ok) return null
  return res.json()
}

const PEGI: Record<number, string> = { 1: 'PEGI 3', 2: 'PEGI 7', 3: 'PEGI 12', 4: 'PEGI 16', 5: 'PEGI 18' }
const ESRB: Record<number, string> = { 6: 'RP', 7: 'EC', 8: 'E', 9: 'E10+', 10: 'T', 11: 'M', 12: 'AO' }

function getAgeRatingLabel(ar: AgeRating) {
  if (ar.category === 1) return PEGI[ar.rating] ?? null
  if (ar.category === 2) return ESRB[ar.rating] ?? null
  return null
}

export default async function GamePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const game = await getGame(slug)
  if (!game) notFound()

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
  const developer = game.involved_companies?.find(c => c.developer)?.company.name
  const publisher = game.involved_companies?.find(c => c.publisher)?.company.name
  const ageRatingLabel = game.age_ratings
    ?.map(getAgeRatingLabel)
    .find(Boolean) ?? null

  const gameForModal = {
    id: game.id,
    name: game.name,
    slug: game.slug,
    cover: game.cover,
    first_release_date: game.first_release_date,
  }

  return (
    <MarqueeBackground>
      <div className="p-8 min-h-screen">
        <div
          className="max-w-5xl mx-auto rounded-2xl overflow-hidden"
          style={{ background: 'color-mix(in srgb, var(--background) 94%, transparent)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
        >
          <GamePageClient
            game={game}
            myLog={myLog}
            year={year}
            igdbRating={igdbRating}
            developer={developer ?? null}
            publisher={publisher ?? null}
            ageRatingLabel={ageRatingLabel}
            gameForModal={gameForModal}
            isLoggedIn={!!user}
          />
        </div>
      </div>
    </MarqueeBackground>
  )
}
