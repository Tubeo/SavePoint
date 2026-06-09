import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export default async function HomePage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
      <div className="max-w-2xl text-center">
        <h1 className="text-5xl font-bold mb-4">Savepoint</h1>
        <p className="text-xl mb-10" style={{ color: 'var(--text-muted)' }}>
          Track the games you've played. Rate them. Remember them.
        </p>

        {user ? (
          <div className="flex gap-4 justify-center">
            <Link
              href="/search"
              className="px-8 py-3 rounded-lg font-medium transition-opacity hover:opacity-90"
              style={{ background: 'var(--accent)', color: '#fff' }}
            >
              Log a Game
            </Link>
            <Link
              href="/profile"
              className="px-8 py-3 rounded-lg font-medium transition-opacity hover:opacity-90"
              style={{ background: 'var(--surface-2)', color: 'var(--foreground)' }}
            >
              My Profile
            </Link>
          </div>
        ) : (
          <div className="flex gap-4 justify-center">
            <Link
              href="/auth/signup"
              className="px-8 py-3 rounded-lg font-medium transition-opacity hover:opacity-90"
              style={{ background: 'var(--accent)', color: '#fff' }}
            >
              Get Started
            </Link>
            <Link
              href="/auth/login"
              className="px-8 py-3 rounded-lg font-medium transition-opacity hover:opacity-90"
              style={{ background: 'var(--surface-2)', color: 'var(--foreground)' }}
            >
              Sign In
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}