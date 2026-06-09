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
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
      <div className="w-full max-w-lg p-6 rounded-2xl shadow-xl" style={{ background: 'var(--surface)' }}>
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
            <h2 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>{game.name}</h2>
            {game.first_release_date && (
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                {new Date(game.first_release_date * 1000).getFullYear()}
              </p>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
            {error}
          </div>
        )}

        <div className="mb-6">
          <label className="block text-sm mb-2" style={{ color: 'var(--text-muted)' }}>Rating</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className="text-3xl transition-colors"
                style={{ color: star <= rating ? '#facc15' : 'var(--border)' }}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm mb-2" style={{ color: 'var(--text-muted)' }}>Tags</label>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => toggleTag(tag.id)}
                className="px-3 py-1 rounded-full text-sm transition-opacity hover:opacity-80"
                style={{
                  background: selectedTags.includes(tag.id) ? 'var(--accent)' : 'var(--surface-2)',
                  color: selectedTags.includes(tag.id) ? '#fff' : 'var(--text-muted)',
                }}
              >
                {tag.name}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm mb-2" style={{ color: 'var(--text-muted)' }}>
            Review <span style={{ color: 'var(--border)' }}>(optional)</span>
          </label>
          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="What did you think?"
            rows={3}
            className="w-full px-4 py-2.5 rounded-lg border focus:outline-none resize-none"
            style={{
              background: 'var(--surface-2)',
              borderColor: 'var(--border)',
              color: 'var(--foreground)',
            }}
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg transition-opacity hover:opacity-80"
            style={{ background: 'var(--surface-2)', color: 'var(--foreground)' }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || rating === 0}
            className="flex-1 py-2.5 rounded-lg font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ background: 'var(--accent)', color: '#fff' }}
          >
            {loading ? 'Saving...' : 'Log Game'}
          </button>
        </div>
      </div>
    </div>
  )
}