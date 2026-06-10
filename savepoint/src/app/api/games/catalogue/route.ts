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
  const page = parseInt(searchParams.get('page') ?? '1')
  const limit = parseInt(searchParams.get('limit') ?? '50')
  const genreParam = searchParams.get('genre')
  const search = searchParams.get('search')
  const offset = (page - 1) * limit

  try {
    const token = await getIGDBToken()

    let body = ''

    if (search) {
      body = `search "${search}"; fields name,slug,cover.url,rating,rating_count,first_release_date,genres.name; where cover != null & rating_count > 10; limit ${limit}; offset ${offset};`
    } else {
      const genreFilter = genreParam
        ? `& genres = (${genreParam})`
        : ''
      body = `fields name,slug,cover.url,rating,rating_count,first_release_date,genres.name; where cover != null & rating_count > 50 ${genreFilter}; sort rating_count desc; limit ${limit}; offset ${offset};`
    }

    const res = await fetch('https://api.igdb.com/v4/games', {
      method: 'POST',
      headers: {
        'Client-ID': process.env.IGDB_CLIENT_ID!,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'text/plain',
      },
      body,
    })

    const games = await res.json()
    return NextResponse.json(games)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch games' }, { status: 500 })
  }
}
