import { NextResponse } from 'next/server'

async function getIGDBToken() {
  const res = await fetch(
    `https://id.twitch.tv/oauth2/token?client_id=${process.env.IGDB_CLIENT_ID}&client_secret=${process.env.IGDB_CLIENT_SECRET}&grant_type=client_credentials`,
    { method: 'POST' }
  )
  const data = await res.json()
  return data.access_token
}

export async function GET() {
  try {
    const token = await getIGDBToken()
    const res = await fetch('https://api.igdb.com/v4/genres', {
      method: 'POST',
      headers: {
        'Client-ID': process.env.IGDB_CLIENT_ID!,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'text/plain',
      },
      body: `fields id,name; limit 50;`,
    })
    const genres = await res.json()
    return NextResponse.json(genres)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch genres' }, { status: 500 })
  }
}
