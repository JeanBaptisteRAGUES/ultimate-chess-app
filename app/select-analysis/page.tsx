'use client'

import React, { useState } from 'react';
import Link from 'next/link';

const SelectAnalysis = () => {
    const [depth, setDepth] = useState<number>(12);
    const [pgn, setPgn] = useState<string>('');

    const analysisDepthComponent = 
        <div className='flex flex-row justify-around items-center flex-wrap w-full mt-2 px-2 gap-1' >
            <div onClick={() => setDepth(10)} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: depth === 10 ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <span className=' w-full h-full flex justify-center items-center text-4xl font-bold text-center' >10</span>
            </div>
            <div onClick={() => setDepth(12)} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: depth === 12 ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <span className=' w-full h-full flex justify-center items-center text-4xl font-bold text-center' >12</span>
            </div>
            <div onClick={() => setDepth(14)} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: depth === 14 ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <span className=' w-full h-full flex justify-center items-center text-4xl font-bold text-center' >14</span>
            </div>
            <div onClick={() => setDepth(16)} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: depth === 16 ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <span className=' w-full h-full flex justify-center items-center text-4xl font-bold text-center' >16</span>
            </div>
            <div onClick={() => setDepth(18)} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: depth === 18 ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <span className=' w-full h-full flex justify-center items-center text-4xl font-bold text-center' >18</span>
            </div>
            <div onClick={() => setDepth(20)} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: depth === 20 ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <span className=' w-full h-full flex justify-center items-center text-4xl font-bold text-center' >20</span>
            </div>
        </div>

    const gamePgnComponent =
        <div className=' w-3/4 md:w-2/3 h-52 md:h-60 flex flex-row justify-center items-center flex-wrap mt-5 gap-5 border border-cyan-300' >
            <textarea
                className=' w-full h-52 md:h-60 bg-transparent text-cyan-200'
                placeholder='Coller le pgn de la partie à analyser..'
                value={pgn}
                onChange={(e) => setPgn(e.target.value)}
            />
        </div>


    return (
        <div className="flex flex-col justify-start items-center bg-slate-800 h-[95vh] w-full overflow-auto" >
            <div className=' w-full md:pl-10 flex justify-center md:justify-start items-center text-2xl font-semibold text-white mt-10 mb-2' >Profondeur de l'analyse:</div>
            {analysisDepthComponent}
            {gamePgnComponent}
            <Link
                className=' w-34 p-3 animate-pulse hover:animate-none hover:bg-cyan-200 flex justify-center items-center text-cyan-300 hover:text-cyan-400 text-3xl font-bold border-2 rounded-lg border-cyan-400 shadow-[0_0_2px_#fff,inset_0_0_2px_#fff,0_0_5px_#08f,0_0_15px_#08f,0_0_30px_#08f] cursor-pointer mt-10 mb-2 md:mt-20 '
                href = {{
                    pathname: '/game-analysis',
                    query: {
                        pgn: pgn,
                        depth: depth,
                    }
                }}
            >
                Analyser
            </Link>
        </div>
    )
}

export default SelectAnalysis;