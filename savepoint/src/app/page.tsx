import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export default async function HomePage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl text-center">
        <h1 className="text-5xl font-bold mb-4">Savepoint</h1>
        <p className="text-gray-400 text-xl mb-10">
          Track the games you've played. Rate them. Remember them.
        </p>

        {user ? (
          <div className="flex gap-4 justify-center">
            <Link
              href="/search"
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-medium transition-colors"
            >
              Log a Game
            </Link>
            <Link
              href="/profile"
              className="px-8 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg font-medium transition-colors"
            >
              My Profile
            </Link>
          </div>
        ) : (
          <div className="flex gap-4 justify-center">
            <Link
              href="/auth/signup"
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-medium transition-colors"
            >
              Get Started
            </Link>
            <Link
              href="/auth/login"
              className="px-8 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg font-medium transition-colors"
            >
              Sign In
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}