import { NextRequest, NextResponse } from 'next/server'

async function getIGDBToken() {
  const res = await fetch(
    `https://id.twitch.tv/oauth2/token?client_id=${process.env.IGDB_CLIENT_ID}&client_secret=${process.env.IGDB_CLIENT_SECRET}&grant_type=client_credentials`,
    { method: 'POST' }
  )
  const data = await res.json()
  return data.access_token
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const slug = searchParams.get('slug')

  if (!slug) {
    return NextResponse.json({ error: 'No slug provided' }, { status: 400 })
  }

  try {
    const token = await getIGDBToken()

    const res = await fetch('https://api.igdb.com/v4/games', {
      method: 'POST',
      headers: {
        'Client-ID': process.env.IGDB_CLIENT_ID!,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'text/plain',
      },
      body: `fields name,slug,summary,first_release_date,rating,rating_count,cover.url,genres.name,platforms.name,screenshots.url,involved_companies.company.name,involved_companies.developer,involved_companies.publisher,game_modes.name,age_ratings.rating,age_ratings.category,similar_games.name,similar_games.slug,similar_games.cover.url; where slug = "${slug}"; limit 1;`,
    })

    const games = await res.json()

    if (!games || games.length === 0) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 })
    }

    return NextResponse.json(games[0])
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch game' }, { status: 500 })
  }
}
