'use client'

import React, { useState } from 'react';
import { Behaviour } from '../bots-ai/BotsAI';
import Link from 'next/link';
import { Color, DEFAULT_POSITION } from 'chess.js';


const SelectThematicTrainingPage = () => {
    const [difficulty, setDifficulty] = useState('Master');

    const difficultyComponent =
        <div className='flex flex-row justify-around items-center flex-wrap w-full' >
            <div onClick={() => setDifficulty('Beginner')} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: difficulty === 'Beginner' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <div className=' h-[90px] w-full text-8xl flex justify-center items-center' >♙</div>
                <span className=' w-full h-[10px] flex justify-center items-center' >Beginner</span>
            </div>
            <div onClick={() => setDifficulty('Casual')} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: difficulty === 'Casual' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <div className=' h-[90px] w-full text-8xl flex justify-center items-center' >♘</div>
                <span className=' w-full h-[10px] flex justify-center items-center' >Casual</span>
            </div>
            <div onClick={() => setDifficulty('Intermediate')} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: difficulty === 'Intermediate' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <div className=' h-[90px] w-full text-8xl flex justify-center items-center' >♗</div>
                <span className=' w-full h-[10px] flex justify-center items-center' >Intermediate</span>
            </div>
            <div onClick={() => setDifficulty('Advanced')} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: difficulty === 'Advanced' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }} >
                <div className=' h-[90px] w-full text-8xl flex justify-center items-center' >♖</div>
                <span className=' w-full h-[10px] flex justify-center items-center' >Advanced</span>
            </div>
            <div onClick={() => setDifficulty('Master')} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: difficulty === 'Master' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }} >
                <div className=' h-[90px] w-full text-8xl flex justify-center items-center' >♕</div>
                <span className=' w-full h-[10px] flex justify-center items-center' >Master</span>
            </div>
            <div onClick={() => setDifficulty('Maximum')} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: difficulty === 'Maximum' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <div className=' h-[90px] w-full text-8xl flex justify-center items-center' >♔</div>
                <span className=' w-full h-[10px] flex justify-center items-center' >Maximum</span>
            </div>
        </div>

    const attackPositionsComponent = 
        <div className='flex flex-row justify-around items-center flex-wrap w-full mt-2 px-2 gap-2' >
            <Link
                className=' text-white hover:text-cyan-400 cursor-pointer text-xl font-bold my-20 '
                href = {{
                pathname: '/thematic-training',
                query: {
                    difficulty: difficulty,
                    startingFen: 'rnbqkbnr/pppp2pp/5p2/4N3/4P3/8/PPPP1PPP/RNBQKB1R b KQkq - 0 3',
                    nextMove: 'fxe5',
                    playerColor: 'w'
                }
                }}
            >
                Position d'attaque
            </Link>
            
        </div>
    
    const defensePositionsComponent = 
        <div className='flex flex-row justify-around items-center flex-wrap w-full mt-2 px-2 gap-2' >
            <Link
                className=' text-white hover:text-cyan-400 cursor-pointer text-xl font-bold my-20 '
                href = {{
                pathname: '/thematic-training',
                query: {
                    difficulty: difficulty,
                    startingFen: 'rnbq1b1r/pp2pkp1/2p2n1p/8/3P4/8/PPP2PPP/R1BQKBNR w KQ - 0 7',
                    nextMove: 'Bc4+',
                    playerColor: 'b'
                }
                }}
            >
                Position de défense
            </Link>
            
        </div>

    const endgamePositionsComponent = 
        <div className='flex flex-row justify-around items-center flex-wrap w-full mt-2 px-2 gap-2' >
            <Link
                className=' text-white hover:text-cyan-400 cursor-pointer text-xl font-bold my-20 '
                href = {{
                pathname: '/thematic-training',
                query: {
                    difficulty: difficulty,
                    startingFen: '8/8/1p1p1k2/3P4/3K4/P7/8/8 b - - 5 47',
                    nextMove: 'Ke7',
                    playerColor: 'w'
                }
                }}
            >
                Finale de pions n°1
            </Link>

            <Link
                className=' text-white hover:text-cyan-400 cursor-pointer text-xl font-bold my-20 '
                href = {{
                pathname: '/thematic-training',
                query: {
                    difficulty: difficulty,
                    startingFen: '8/p2k4/8/1P6/2PK1p2/7P/8/3b4 w - - 1 46',
                    nextMove: 'c5',
                    playerColor: 'b'
                }
                }}
            >
                Finale fou contre pion
            </Link>

            <Link
                className=' text-white hover:text-cyan-400 cursor-pointer text-xl font-bold my-20 '
                href = {{
                pathname: '/thematic-training',
                query: {
                    difficulty: difficulty,
                    startingFen: '1r6/5p2/6pp/1b2k3/3RP3/4KP1P/6P1/8 w - - 4 37',
                    nextMove: 'Rb4',
                    playerColor: 'b'
                }
                }}
            >
                Finale fou + tour contre tour
            </Link>

            <Link
                className=' text-white hover:text-cyan-400 cursor-pointer text-xl font-bold my-20 '
                href = {{
                pathname: '/thematic-training',
                query: {
                    difficulty: difficulty,
                    startingFen: '3r4/5pkp/4p1p1/1R6/3p1P2/8/P2K1P1P/8 w - - 0 24',
                    nextMove: 'Kd3',
                    playerColor: 'b'
                }
                }}
            >
                Finale de tours n°1
            </Link>

            <Link
                className=' text-white hover:text-cyan-400 cursor-pointer text-xl font-bold my-20 '
                href = {{
                pathname: '/thematic-training',
                query: {
                    difficulty: difficulty,
                    startingFen: '5R2/8/r3k3/5p2/4p1p1/6P1/4K3/8 w - - 1 52',
                    nextMove: 'Ke3',
                    playerColor: 'b'
                }
                }}
            >
                Finale de tours n°2
            </Link>
            
        </div>

    return (
        <div className="flex flex-col justify-start items-center bg-cyan-900 h-screen w-full overflow-auto" >
            <div className=' w-full flex justify-center items-center text-2xl font-semibold text-white' >Difficulté:</div>
            {difficultyComponent}
            <div className=' w-full mt-20 flex justify-center items-center text-3xl font-semibold text-white' >Attaque:</div>
            {attackPositionsComponent}
            <div className=' w-full mt-20 flex justify-center items-center text-3xl font-semibold text-white' >Défense:</div>
            {defensePositionsComponent}
            <div className=' w-full mt-20 flex justify-center items-center text-3xl font-semibold text-white' >Finales:</div>
            {endgamePositionsComponent}
        </div>
    )
}

export default SelectThematicTrainingPage;