'use client'

import { createContext, useContext, useEffect, useState } from 'react'

interface Game {
  id: number
  name: string
  cover?: { url: string }
}

const GamesContext = createContext<Game[]>([])

export function GamesProvider({ children }: { children: React.ReactNode }) {
  const [games, setGames] = useState<Game[]>([])

  useEffect(() => {
    fetch('/api/games/popular')
      .then(res => res.json())
      .then(data => {
        const shuffled = [...data].sort(() => Math.random() - 0.5)
        setGames(shuffled)
        })
  }, [])

  return (
    <GamesContext.Provider value={games}>
      {children}
    </GamesContext.Provider>
  )
}

export function useGames() {
  return useContext(GamesContext)
}