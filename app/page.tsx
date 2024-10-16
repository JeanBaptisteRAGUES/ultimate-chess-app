'use client'
import Link from 'next/link';
import { useState } from 'react';
import Image from 'next/image';

import bg_smartphone from "@/public/LandingPage_BG/landingpage_bg_smartphone.jpg";
import bg_desktop from "@/public/LandingPage_BG/landingpage_bg_desktop.jpg";


export default function Home() {
  const [pgn, setPgn] = useState('');

  return (
    <main className="flex h-[95vh] flex-col items-center justify-center p-2 w-full bg-cover bg-center bg-landing-smartphone md:bg-landing-desktop">
      {/* <div id="bg_desktop" className=' hidden md:flex absolute h-full w-full'>
        <Image
            src={bg_desktop}
            layout='fill'
            alt="Image représentant un humain jouant aux échecs contre un robot dans un style cyberpunk"
            // blurDataURL="data:..." automatically provided
            placeholder="blur" // Optional blur-up while loading
        />
      </div>
      <div id="bg_smartphone" className=' flex md:hidden absolute h-full w-full'>
        <Image
            src={bg_smartphone}
            fill
            alt="Image représentant un humain jouant aux échecs contre un robot dans un style cyberpunk"
            // blurDataURL="data:..." automatically provided
            placeholder="blur" // Optional blur-up while loading
        />
      </div> */}
      {/* <h1 className=' w-full text-3xl font-bold' >Welcome to Lazer Chess</h1>
      <h3 className=' w-full text-xl'>Train your chess with laser precision</h3>
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
      </Link> */}

      <Link className=' w-40 h-20 animate-pulse flex justify-center items-center text-cyan-300 text-3xl font-bold border-2 rounded-lg border-cyan-400 shadow-[0_0_2px_#fff,inset_0_0_2px_#fff,0_0_5px_#08f,0_0_15px_#08f,0_0_30px_#08f]' href={{pathname: '/select-game-mode'}} >Jouer</Link>
    </main>
  )
}
