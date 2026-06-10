import { redirect } from 'next/navigation'
import Image from 'next/image'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import MarqueeBackground from '@/components/MarqueeBackground'

interface GameLog {
  id: number
  game_title: string
  game_cover: string | null
  rating: number
  review: string | null
  created_at: string
}

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

  const { data: logs } = await supabase
    .from('game_logs')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

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
          <div className="mb-10">
            <h1 className="text-3xl font-bold">{profile?.username}</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              {logs?.length ?? 0} games logged
            </p>
          </div>

          <h2 className="text-xl font-semibold mb-4">Games</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {logs?.map((log: GameLog) => (
              <div key={log.id} className="group relative cursor-pointer">
                {log.game_cover ? (
                  <Image
                    src={log.game_cover}
                    alt={log.game_title}
                    width={264}
                    height={352}
                    className="rounded-lg object-cover w-full aspect-[3/4]"
                  />
                ) : (
                  <div
                    className="w-full aspect-[3/4] rounded-lg flex items-center justify-center text-xs text-center p-2"
                    style={{ background: 'var(--surface-2)', color: 'var(--text-muted)' }}
                  >
                    {log.game_title}
                  </div>
                )}
                <div
                  className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2"
                  style={{ background: 'rgba(0,0,0,0.75)' }}
                >
                  <p className="text-2xl" style={{ color: '#facc15' }}>{'★'.repeat(log.rating)}</p>
                  <p className="text-white text-sm text-center mt-1 line-clamp-2">{log.game_title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MarqueeBackground>
  )
}
