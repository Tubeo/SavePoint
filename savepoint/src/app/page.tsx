'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'

interface Game {
  id: number
  name: string
  cover?: { url: string }
}

const getCoverUrl = (url: string) => {
  return 'https:' + url.replace('t_thumb', 't_cover_big')
}

function MarqueeRow({ games, reverse = false }: { games: Game[], reverse?: boolean }) {
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

export default function HomePage() {
  const [games, setGames] = useState<Game[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [username, setUsername] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    fetch('/api/games/popular')
      .then(res => res.json())
      .then(data => {
        const shuffled = [...data].sort(() => Math.random() - 0.5)
        setGames(shuffled)
      })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user)
        supabase
          .from('profiles')
          .select('username')
          .eq('id', session.user.id)
          .single()
          .then(({ data }) => setUsername(data?.username ?? null))
      } else {
        setUser(null)
        setUsername(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const row1 = games.slice(0, 20)
  const row2 = games.slice(5, 25)
  const row3 = games.slice(10, 30)
  const row4 = games.slice(15, 35)
  const row5 = games.slice(20, 40)

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>

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

      <div style={{ position: 'absolute', inset: 0, opacity: 0.4, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
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
        background: 'linear-gradient(to bottom, #0a0a0f 0%, transparent 20%, transparent 80%, #0a0a0f 100%)'
      }} />

      <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '2rem' }}>
        {user ? (
          <>
            <p style={{ fontSize: '13px', letterSpacing: '0.15em', color: '#6366f1', textTransform: 'uppercase', marginBottom: '12px', fontWeight: 500 }}>
              Welcome back
            </p>
            <h1 style={{ fontSize: '56px', fontWeight: 700, color: '#f9fafb', margin: '0 0 16px', lineHeight: 1.1 }}>
              {username ?? 'Gamer'}
            </h1>
            <p style={{ color: '#9ca3af', fontSize: '18px', margin: '0 0 32px' }}>
              What are you playing?
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <Link
                href="/search"
                style={{ background: '#6366f1', color: '#fff', padding: '12px 28px', borderRadius: '8px', fontSize: '15px', fontWeight: 500, textDecoration: 'none' }}
              >
                Log a game
              </Link>
              <Link
                href="/profile"
                style={{ background: 'rgba(255,255,255,0.08)', color: '#f9fafb', padding: '12px 28px', borderRadius: '8px', fontSize: '15px', fontWeight: 500, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                My profile
              </Link>
            </div>
          </>
        ) : (
          <>
            <p style={{ fontSize: '13px', letterSpacing: '0.15em', color: '#6366f1', textTransform: 'uppercase', marginBottom: '12px', fontWeight: 500 }}>
              Your gaming history, organised
            </p>
            <h1 style={{ fontSize: '56px', fontWeight: 700, color: '#f9fafb', margin: '0 0 16px', lineHeight: 1.1 }}>
              Savepoint
            </h1>
            <p style={{ color: '#9ca3af', fontSize: '18px', margin: '0 0 32px', maxWidth: '400px' }}>
              Track the games you've played. Rate them. Remember them.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <Link
                href="/auth/signup"
                style={{ background: '#6366f1', color: '#fff', padding: '12px 28px', borderRadius: '8px', fontSize: '15px', fontWeight: 500, textDecoration: 'none' }}
              >
                Get started
              </Link>
              <Link
                href="/auth/login"
                style={{ background: 'rgba(255,255,255,0.08)', color: '#f9fafb', padding: '12px 28px', borderRadius: '8px', fontSize: '15px', fontWeight: 500, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                Sign in
              </Link>
            </div>
          </>
        )}
      </div>

    </div>
  )
}
