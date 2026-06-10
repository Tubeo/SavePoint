'use client'

import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import MarqueeBackground from '@/components/MarqueeBackground'

interface Game {
  id: number
  name: string
  slug: string
  cover?: { url: string }
  rating?: number
  rating_count?: number
  first_release_date?: number
  genres?: { id: number; name: string }[]
}

interface Genre {
  id: number
  name: string
}

const getCoverUrl = (url: string) => 'https:' + url.replace('t_thumb', 't_cover_big')

export default function BrowsePage() {
  const [games, setGames] = useState<Game[]>([])
  const [genres, setGenres] = useState<Genre[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeSearch, setActiveSearch] = useState('')
  const [selectedGenres, setSelectedGenres] = useState<number[]>([])
  const [genreOpen, setGenreOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(50)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    fetch('/api/games/genres')
      .then(res => res.json())
      .then(data => setGenres(data.sort((a: Genre, b: Genre) => a.name.localeCompare(b.name))))
  }, [])

  const fetchGames = useCallback(async (p: number, l: number, genreIds: number[], s: string) => {
    setLoading(true)
    const params = new URLSearchParams({
      page: p.toString(),
      limit: l.toString(),
      ...(genreIds.length > 0 ? { genre: genreIds.join(',') } : {}),
      ...(s ? { search: s } : {}),
    })
    const res = await fetch(`/api/games/catalogue?${params}`)
    const data = await res.json()
    setGames(data)
    setHasMore(data.length === l)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchGames(page, limit, selectedGenres, activeSearch)
  }, [page, limit, selectedGenres, activeSearch, fetchGames])

  const handleSearch = () => {
    setPage(1)
    setActiveSearch(search)
  }

  const toggleGenre = (id: number) => {
    setSelectedGenres(prev =>
      prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
    )
    setPage(1)
  }

  const removeGenre = (id: number) => {
    setSelectedGenres(prev => prev.filter(g => g !== id))
    setPage(1)
  }

  const clearAll = () => {
    setSelectedGenres([])
    setActiveSearch('')
    setSearch('')
    setPage(1)
  }

  const handleLimit = (l: number) => {
    setLimit(l)
    setPage(1)
  }

  const activeGenreNames = selectedGenres.map(id => genres.find(g => g.id === id)).filter(Boolean) as Genre[]

  return (
    <MarqueeBackground>
      <div className="p-8 min-h-screen">
        <div
          className="max-w-5xl mx-auto rounded-2xl p-6"
          style={{
            background: 'color-mix(in srgb, var(--background) 92%, transparent)',
            border: '1px solid var(--border)',
            color: 'var(--foreground)',
          }}
        >
          <h1 className="text-3xl font-bold mb-6">Browse Games</h1>

          <div className="flex flex-col gap-3 mb-6">
            <div className="flex gap-3">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search games..."
                className="flex-1 px-4 py-2.5 rounded-lg border focus:outline-none"
                style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
              />
              <button
                onClick={handleSearch}
                className="px-6 py-2.5 rounded-lg font-medium transition-opacity hover:opacity-90 cursor-pointer"
                style={{ background: 'var(--accent)', color: '#fff' }}
              >
                Search
              </button>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative">
                <button
                  onClick={() => setGenreOpen(o => !o)}
                  className="px-4 py-2 rounded-lg text-sm cursor-pointer transition-opacity hover:opacity-80 flex items-center gap-2"
                  style={{
                    background: selectedGenres.length > 0 ? 'var(--accent)' : 'var(--surface-2)',
                    color: selectedGenres.length > 0 ? '#fff' : 'var(--text-muted)',
                    border: '1px solid var(--border)',
                  }}
                >
                  Genre {selectedGenres.length > 0 ? `(${selectedGenres.length})` : ''} ▾
                </button>

                {genreOpen && (
                  <div
                    className="absolute top-full left-0 mt-1 rounded-xl z-50 p-3"
                    style={{
                      background: 'var(--surface)',
                      border: '1px solid var(--border)',
                      width: '320px',
                      maxHeight: '300px',
                      overflowY: 'auto',
                    }}
                  >
                    <div className="flex flex-wrap gap-2">
                      {genres.map(g => (
                        <button
                          key={g.id}
                          onClick={() => toggleGenre(g.id)}
                          className="px-3 py-1.5 rounded-full text-sm cursor-pointer transition-opacity hover:opacity-80"
                          style={{
                            background: selectedGenres.includes(g.id) ? 'var(--accent)' : 'var(--surface-2)',
                            color: selectedGenres.includes(g.id) ? '#fff' : 'var(--text-muted)',
                          }}
                        >
                          {g.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {activeGenreNames.map(g => (
                <span
                  key={g.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm"
                  style={{ background: 'var(--surface-2)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
                >
                  {g.name}
                  <button
                    onClick={() => removeGenre(g.id)}
                    className="cursor-pointer hover:opacity-60 transition-opacity"
                    style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1 }}
                  >
                    ✕
                  </button>
                </span>
              ))}

              {(selectedGenres.length > 0 || activeSearch) && (
                <button
                  onClick={clearAll}
                  className="px-3 py-1.5 rounded-full text-sm cursor-pointer transition-opacity hover:opacity-80"
                  style={{ color: 'var(--text-muted)', border: '1px solid var(--border)' }}
                >
                  Clear all
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
            </div>
          ) : games.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <p style={{ color: 'var(--text-muted)' }}>No games found.</p>
            </div>
          ) : (
            <div style={{ maxHeight: '60vh', overflowY: 'auto', paddingRight: '4px' }}>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-10 gap-3">
                {games.map(game => (
                  <Link
                    key={game.id}
                    href={`/game/${game.slug}`}
                    className="group relative cursor-pointer transition-opacity hover:opacity-80"
                  >
                    {game.cover ? (
                      <Image
                        src={getCoverUrl(game.cover.url)}
                        alt={game.name}
                        width={120}
                        height={160}
                        className="rounded-lg object-cover w-full aspect-[3/4]"
                      />
                    ) : (
                      <div
                        className="w-full aspect-[3/4] rounded-lg flex items-center justify-center text-xs text-center p-2"
                        style={{ background: 'var(--surface-2)', color: 'var(--text-muted)' }}
                      >
                        {game.name}
                      </div>
                    )}
                    <div
                      className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2"
                      style={{ background: 'rgba(0,0,0,0.75)' }}
                    >
                      <p className="text-white text-xs text-center font-medium line-clamp-2">{game.name}</p>
                      {game.rating && (
                        <p className="text-xs mt-1" style={{ color: '#facc15' }}>
                          IGDB {Math.round(game.rating)}/100
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mt-6 pt-4 flex-wrap gap-4" style={{ borderTop: '1px solid var(--border)' }}>
            <div className="flex items-center gap-2">
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Per page</span>
              {[50, 100].map(l => (
                <button
                  key={l}
                  onClick={() => handleLimit(l)}
                  className="px-3 py-1.5 rounded-lg text-sm cursor-pointer transition-opacity hover:opacity-80"
                  style={{
                    background: limit === l ? 'var(--accent)' : 'var(--surface-2)',
                    color: limit === l ? '#fff' : 'var(--text-muted)',
                  }}
                >
                  {l}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-1.5 rounded-lg text-sm cursor-pointer transition-opacity hover:opacity-80 disabled:opacity-30"
                style={{ background: 'var(--surface-2)', color: 'var(--text-muted)' }}
              >
                ← Prev
              </button>
              <span className="text-sm px-2" style={{ color: 'var(--text-muted)' }}>Page {page}</span>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={!hasMore}
                className="px-4 py-1.5 rounded-lg text-sm cursor-pointer transition-opacity hover:opacity-80 disabled:opacity-30"
                style={{ background: 'var(--surface-2)', color: 'var(--text-muted)' }}
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      </div>
    </MarqueeBackground>
  )
}
