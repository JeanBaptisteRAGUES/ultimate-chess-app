'use client'
import Link from 'next/link'
import { useState } from 'react'

export default function Home() {
  const [pgn, setPgn] = useState('');

  return (
    <main className="flex h-[95vh] flex-col items-center justify-between p-24 w-full">
      <h1 className=' text-3xl font-bold' >Welcome to Lazer Chess</h1>
      <h3 className=' text-xl'>Train your chess with laser precision</h3>
      <textarea
        className=' w-2/3 md:w-1/3 h-52'
        placeholder='Coller le pgn de la partie à analyser..'
        value={pgn}
        onChange={(e) => setPgn(e.target.value)}
      >

      </textarea>
      <Link
        className=' text-cyan-500 cursor-pointer'
        href = {{
          pathname: '/game-analysis',
          query: {
            pgn: pgn,
            depth: 12
          }
        }}
      >
        Analyse PGN
      </Link>
      <Link className=' text-cyan-500 cursor-pointer' href={{pathname: '/select-game-mode'}} >Choisir un mode de jeu</Link>
    </main>
  )
}
