'use client'

import { useState } from 'react'
import Image from 'next/image'
import LogGameModal from '@/components/LogGameModal'

interface Game {
  id: number
  name: string
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
  const [loading, setLoading] = useState(false)
  const [selectedGame, setSelectedGame] = useState<Game | null>(null)

  const handleSearch = async () => {
    if (!query.trim()) return
    setLoading(true)

    const res = await fetch(`/api/games/search?q=${encodeURIComponent(query)}`)
    const data = await res.json()
    setResults(data)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Search Games</h1>

        <div className="flex gap-3 mb-8">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search for a game..."
            className="flex-1 px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-lg font-medium transition-colors"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>

        <div className="space-y-4">
          {results.map((game) => (
            <div
              key={game.id}
              onClick={() => setSelectedGame(game)}
              className="flex gap-4 p-4 bg-gray-900 rounded-xl hover:bg-gray-800 transition-colors cursor-pointer"
            >
              {game.cover ? (
                <Image
                  src={getCoverUrl(game.cover.url)}
                  alt={game.name}
                  width={60}
                  height={80}
                  className="rounded-lg object-cover"
                />
              ) : (
                <div className="w-[60px] h-[80px] bg-gray-700 rounded-lg flex items-center justify-center text-gray-500 text-xs">
                  No art
                </div>
              )}
              <div className="flex-1">
                <h2 className="font-semibold text-lg">{game.name}</h2>
                {game.first_release_date && (
                  <p className="text-gray-400 text-sm mb-1">
                    {new Date(game.first_release_date * 1000).getFullYear()}
                  </p>
                )}
                {game.summary && (
                  <p className="text-gray-500 text-sm line-clamp-2">{game.summary}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <LogGameModal
        game={selectedGame}
        onClose={() => setSelectedGame(null)}
        onSuccess={() => console.log('Game logged!')}
      />
    </div>
  )
}