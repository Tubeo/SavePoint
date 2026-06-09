'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase'

interface Game {
  id: number
  name: string
  cover?: { url: string }
  first_release_date?: number
}

interface Tag {
  id: number
  name: string
}

interface Props {
  game: Game | null
  onClose: () => void
  onSuccess: () => void
}

const getCoverUrl = (url: string) => {
  return 'https:' + url.replace('t_thumb', 't_cover_big')
}

export default function LogGameModal({ game, onClose, onSuccess }: Props) {
  const supabase = createClient()
  const [rating, setRating] = useState(0)
  const [review, setReview] = useState('')
  const [tags, setTags] = useState<Tag[]>([])
  const [selectedTags, setSelectedTags] = useState<number[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTags = async () => {
      const { data } = await supabase.from('tags').select('*')
      if (data) setTags(data)
    }
    fetchTags()
  }, [])

  const toggleTag = (tagId: number) => {
    setSelectedTags(prev =>
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    )
  }

  const handleSubmit = async () => {
    if (!game || rating === 0) return
    setLoading(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('You must be logged in to log a game')
      setLoading(false)
      return
    }

    const { data: log, error: logError } = await supabase
      .from('game_logs')
      .insert({
        user_id: user.id,
        game_id: game.id.toString(),
        game_title: game.name,
        game_cover: game.cover ? getCoverUrl(game.cover.url) : null,
        rating,
        review: review.trim() || null,
      })
      .select()
      .single()

    if (logError) {
      setError(logError.message)
      setLoading(false)
      return
    }

    if (selectedTags.length > 0) {
      await supabase.from('game_log_tags').insert(
        selectedTags.map(tagId => ({ log_id: log.id, tag_id: tagId }))
      )
    }

    setLoading(false)
    onSuccess()
    onClose()
  }

  if (!game) return null

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl w-full max-w-lg p-6">
        <div className="flex items-start gap-4 mb-6">
          {game.cover && (
            <Image
              src={getCoverUrl(game.cover.url)}
              alt={game.name}
              width={60}
              height={80}
              className="rounded-lg object-cover"
            />
          )}
          <div>
            <h2 className="text-xl font-bold text-white">{game.name}</h2>
            {game.first_release_date && (
              <p className="text-gray-400 text-sm">
                {new Date(game.first_release_date * 1000).getFullYear()}
              </p>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="mb-6">
          <label className="block text-sm text-gray-400 mb-2">Rating</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className={`text-3xl transition-colors ${
                  star <= rating ? 'text-yellow-400' : 'text-gray-600'
                } hover:text-yellow-400`}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm text-gray-400 mb-2">Tags</label>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => toggleTag(tag.id)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  selectedTags.includes(tag.id)
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {tag.name}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm text-gray-400 mb-2">Review <span className="text-gray-600">(optional)</span></label>
          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="What did you think?"
            rows={3}
            className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 resize-none"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || rating === 0}
            className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium rounded-lg transition-colors"
          >
            {loading ? 'Saving...' : 'Log Game'}
          </button>
        </div>
      </div>
    </div>
  )
}