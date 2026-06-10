import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import MarqueeBackground from '@/components/MarqueeBackground'
import ReviewsGrid from '@/components/ReviewsGrid'

export default async function ReviewsPage() {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: logs } = await supabase
    .from('game_logs')
    .select('*')
    .eq('user_id', user.id)

  return (
    <MarqueeBackground>
      <div className="p-8 min-h-screen">
        <div
          className="max-w-7xl mx-auto rounded-2xl p-8"
          style={{
            background: 'color-mix(in srgb, var(--background) 92%, transparent)',
            border: '1px solid var(--border)',
            color: 'var(--foreground)',
          }}
        >
          <h1 className="text-3xl font-bold mb-8">My Reviews</h1>
          <ReviewsGrid logs={logs ?? []} />
        </div>
      </div>
    </MarqueeBackground>
  )
}
