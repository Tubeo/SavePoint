'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import LogGameModal from '@/components/LogGameModal'
import MarqueeBackground from '@/components/MarqueeBackground'

interface Game {
  id: number
  name: string
  slug?: string
  cover?: { url: string }
  first_release_date?: number
  summary?: string
}

const getCoverUrl = (url: string) => {
  return 'https:' + url.replace('t_thumb', 't_cover_big')
}

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Game[]>([])
  const [suggestions, setSuggestions] = useState<Game[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [selectedGame, setSelectedGame] = useState<Game | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    if (debounceRef.current) clearTimeout(debounceRef.current)

    debounceRef.current = setTimeout(async () => {
      const res = await fetch(`/api/games/search?q=${encodeURIComponent(query)}`)
      const data = await res.json()
      setSuggestions(data.slice(0, 15))
      setShowSuggestions(true)
    }, 150)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node) &&
        !inputRef.current?.contains(e.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = async () => {
    if (!query.trim()) return
    setShowSuggestions(false)
    setLoading(true)
    setHasSearched(true)
    const res = await fetch(`/api/games/search?q=${encodeURIComponent(query)}`)
    const data = await res.json()
    setResults(data)
    setLoading(false)
  }

  const handleSuggestionClick = (game: Game) => {
    setQuery(game.name)
    setShowSuggestions(false)
    setSelectedGame(game)
  }

  return (
    <MarqueeBackground>
      <div className="p-8 min-h-screen">
        <div
          className="max-w-3xl mx-auto rounded-2xl p-8"
          style={{
            background: 'color-mix(in srgb, var(--background) 92%, transparent)',
            border: '1px solid var(--border)',
            color: 'var(--foreground)',
          }}
        >
          <h1 className="text-3xl font-bold mb-8">Search Games</h1>

          <div className="relative mb-6">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSearch()
                    if (e.key === 'Escape') setShowSuggestions(false)
                  }}
                  onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                  placeholder="Search for a game..."
                  className="w-full px-4 py-2.5 rounded-lg border focus:outline-none"
                  style={{
                    background: 'var(--surface)',
                    borderColor: 'var(--border)',
                    color: 'var(--foreground)',
                  }}
                />

                {showSuggestions && suggestions.length > 0 && (
                  <div
                    ref={suggestionsRef}
                    className="absolute left-0 right-0 top-full mt-1 rounded-xl z-50"
                    style={{ border: '1px solid var(--border)', background: 'var(--surface)', maxHeight: '300px', overflowY: 'auto' }}
                  >
                    {suggestions.map((game) => (
                      <div
                        key={game.id}
                        onClick={() => handleSuggestionClick(game)}
                        className="flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-opacity hover:opacity-80"
                        style={{ borderBottom: '1px solid var(--border)' }}
                      >
                        {game.cover ? (
                          <Image
                            src={getCoverUrl(game.cover.url)}
                            alt={game.name}
                            width={28}
                            height={37}
                            className="rounded object-cover flex-shrink-0"
                          />
                        ) : (
                          <div
                            className="rounded flex-shrink-0"
                            style={{ width: 28, height: 37, background: 'var(--surface-2)' }}
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{game.name}</p>
                          {game.first_release_date && (
                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                              {new Date(game.first_release_date * 1000).getFullYear()}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={handleSearch}
                disabled={loading}
                className="px-6 py-2.5 rounded-lg font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ background: 'var(--accent)', color: '#fff' }}
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>

          {results.length > 0 && (
            <div
              style={{
                maxHeight: '480px',
                overflowY: 'auto',
                borderRadius: '12px',
                border: '1px solid var(--border)',
              }}
            >
              {results.map((game, index) => (
                <div
                  key={game.id}
                  onClick={() => setSelectedGame(game)}
                  className="flex gap-4 p-4 cursor-pointer transition-opacity hover:opacity-80"
                  style={{
                    background: 'var(--surface)',
                    borderBottom: index < results.length - 1 ? '1px solid var(--border)' : 'none',
                  }}
                >
                  {game.cover ? (
                    <Image
                      src={getCoverUrl(game.cover.url)}
                      alt={game.name}
                      width={50}
                      height={67}
                      className="rounded-lg object-cover flex-shrink-0"
                    />
                  ) : (
                    <div
                      className="rounded-lg flex items-center justify-center text-xs flex-shrink-0"
                      style={{ width: 50, height: 67, background: 'var(--surface-2)', color: 'var(--text-muted)' }}
                    >
                      No art
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h2 className="font-semibold text-base">{game.name}</h2>
                    {game.first_release_date && (
                      <p className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>
                        {new Date(game.first_release_date * 1000).getFullYear()}
                      </p>
                    )}
                    {game.summary && (
                      <p className="text-sm line-clamp-2" style={{ color: 'var(--text-muted)' }}>
                        {game.summary}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {hasSearched && results.length === 0 && !loading && (
            <p className="text-sm text-center py-8" style={{ color: 'var(--text-muted)' }}>
              No results found for &quot;{query}&quot;
            </p>
          )}
        </div>
      </div>

      <LogGameModal
        game={selectedGame}
        onClose={() => setSelectedGame(null)}
        onSuccess={() => setSelectedGame(null)}
      />
    </MarqueeBackground>
  )
}
