'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { createClient } from '@/lib/supabase'

export default function Navbar() {
  const router = useRouter()
  const supabase = createClient()
  const { theme, setTheme } = useTheme()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  const themes = [
    { id: 'dark', label: '🌙' },
    { id: 'light', label: '☀️' },
    { id: 'oled', label: '⚫' },
  ]

  return (
    <nav className="border-b px-8 py-4" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <Link href="/" className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>
          Savepoint
        </Link>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1 rounded-lg p-1" style={{ background: 'var(--surface-2)' }}>
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`px-2 py-1 rounded-md text-sm transition-colors ${
                  theme === t.id ? 'bg-white/10' : 'hover:bg-white/5'
                }`}
                title={t.id}
              >
                {t.label}
              </button>
            ))}
          </div>

          <Link href="/search" style={{ color: 'var(--text-muted)' }} className="hover:opacity-80 transition-opacity">
            Search
          </Link>
          <Link href="/profile" style={{ color: 'var(--text-muted)' }} className="hover:opacity-80 transition-opacity">
            Profile
          </Link>
          <button
            onClick={handleSignOut}
            style={{ color: 'var(--text-muted)' }}
            className="hover:opacity-80 transition-opacity"
          >
            Sign out
          </button>
        </div>
      </div>
    </nav>
  )
}