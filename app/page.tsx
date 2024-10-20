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
      <Link className=' w-40 h-20 animate-pulse flex justify-center items-center text-cyan-300 text-3xl font-bold border-2 rounded-lg border-cyan-400 shadow-[0_0_2px_#fff,inset_0_0_2px_#fff,0_0_5px_#08f,0_0_15px_#08f,0_0_30px_#08f]' href={{pathname: '/select-game-mode'}} >Jouer</Link>
    </main>
  )
}
