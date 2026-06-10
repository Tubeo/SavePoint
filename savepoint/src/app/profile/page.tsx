import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import MarqueeBackground from '@/components/MarqueeBackground'

export default async function ProfilePage() {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { count } = await supabase
    .from('game_logs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  return (
    <MarqueeBackground>
      <div className="p-8 min-h-screen">
        <div
          className="max-w-5xl mx-auto rounded-2xl p-8"
          style={{
            background: 'color-mix(in srgb, var(--background) 92%, transparent)',
            border: '1px solid var(--border)',
            color: 'var(--foreground)',
          }}
        >
          <div className="mb-10">
            <p className="text-sm uppercase tracking-wider mb-2" style={{ color: 'var(--accent)' }}>
              Welcome back
            </p>
            <h1 className="text-4xl font-bold">{profile?.username}</h1>
            <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
              {count ?? 0} games logged
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/reviews"
              className="rounded-xl p-6 transition-opacity hover:opacity-90"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              <h2 className="text-lg font-semibold mb-1">My Reviews</h2>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                See every game you&apos;ve logged and rated.
              </p>
            </Link>

            <Link
              href="/search"
              className="rounded-xl p-6 transition-opacity hover:opacity-90"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              <h2 className="text-lg font-semibold mb-1">Log a Game</h2>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Search for a game and add it to your collection.
              </p>
            </Link>

            <div
              className="rounded-xl p-6"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', opacity: 0.6 }}
            >
              <h2 className="text-lg font-semibold mb-1">Your Top 4</h2>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Coming soon — showcase your favourite games.
              </p>
            </div>

            <div
              className="rounded-xl p-6"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', opacity: 0.6 }}
            >
              <h2 className="text-lg font-semibold mb-1">Your Stats</h2>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Coming soon — your gaming year at a glance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </MarqueeBackground>
  )
}
