'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'

export default function Navbar() {
  const router = useRouter()
  const supabase = createClient()
  const { theme, setTheme } = useTheme()
  const [username, setUsername] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase
          .from('profiles')
          .select('username')
          .eq('id', user.id)
          .single()
          .then(({ data }) => setUsername(data?.username ?? null))
      } else {
        setUsername(null)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        supabase
          .from('profiles')
          .select('username')
          .eq('id', session.user.id)
          .single()
          .then(({ data }) => setUsername(data?.username ?? null))
      } else {
        setUsername(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUsername(null)
    router.push('/')
    router.refresh()
  }

  return (
    <nav className="border-b px-8 py-4 sticky top-0 z-50" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <Link href="/" className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>
          Savepoint
        </Link>

        <div className="flex items-center gap-6">
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="px-3 py-1.5 rounded-lg border text-sm focus:outline-none cursor-pointer"
            style={{
              background: 'var(--surface-2)',
              borderColor: 'var(--border)',
              color: 'var(--foreground)',
            }}
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="oled">OLED</option>
          </select>

          {username ? (
            <>
              <Link href="/browse" style={{ color: 'var(--text-muted)' }} className="hover:opacity-80 transition-opacity">
               Browse Games
              </Link>
              <Link href="/search" style={{ color: 'var(--text-muted)' }} className="hover:opacity-80 transition-opacity">
                Search
              </Link>
              <Link href="/reviews" style={{ color: 'var(--text-muted)' }} className="hover:opacity-80 transition-opacity">
                My Reviews
              </Link>
              <Link href="/profile" style={{ color: 'var(--foreground)', fontWeight: 500 }} className="hover:opacity-80 transition-opacity">
                {username}
              </Link>
              <button
                onClick={handleSignOut}
                style={{ color: 'var(--text-muted)' }}
                className="hover:opacity-80 transition-opacity cursor-pointer"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/browse" style={{ color: 'var(--text-muted)' }} className="hover:opacity-80 transition-opacity">
                Browse
              </Link>
              <Link href="/auth/login" style={{ color: 'var(--text-muted)' }} className="hover:opacity-80 transition-opacity">
                Sign in
              </Link>
              <Link
                href="/auth/signup"
                className="px-4 py-1.5 rounded-lg text-sm font-medium transition-opacity hover:opacity-90"
                style={{ background: 'var(--accent)', color: '#fff' }}
              >
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
