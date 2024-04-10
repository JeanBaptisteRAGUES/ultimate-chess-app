'use client'

import React, { useState } from 'react';
import { Behaviour } from '../bots-ai/BotsAI';
import Link from 'next/link';
import { Color, DEFAULT_POSITION } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import {FaChess} from 'react-icons/fa';
import { FaShieldAlt } from 'react-icons/fa';
import { LuSwords } from 'react-icons/lu';

export type Avantage = 'low' | 'medium' | 'high' | 'very high';


const SelectThematicTrainingPage = () => {
    const [difficulty, setDifficulty] = useState('Master');
    const [themeChoice, setThemeChoice] = useState('Attack');

    // TODO: Créer une BDD pour stocker ces données
    // TODO: Peut être avoir une BDD locale avec moins de position si jamais offline
    const attackingPositions = [
        {
            title: 'Damiano Defense',
            startingFen: 'rnbqkbnr/pppp2pp/5p2/4N3/4P3/8/PPPP1PPP/RNBQKB1R b KQkq - 0 3',
            nextMove: 'fxe5',
            playerColor: 'w',
            avantage: 'high'
        },
        {
            title: 'Caro-Kann Tal Variation',
            startingFen: 'rn1qkb1r/pp2p1p1/2p1p2p/3p4/3Pn1PP/3Q1N2/PPPN1P2/R1B1K2R b KQkq - 4 10',
            nextMove: 'Nxd2',
            playerColor: 'w',
            avantage: 'high'
        },
        {
            title: 'London Greek Gift Sacrifice',
            startingFen: 'r4rk1/pbqn1ppB/1pnbp3/2ppN3/3P4/2P1PNB1/PP3PPP/R2Q1RK1 b - - 0 12',
            nextMove: 'Kxh7',
            playerColor: 'w',
            avantage: 'medium'
        },
        {
            title: 'Danish Gambit Accepted',
            startingFen: 'rnbqkb1r/ppp2ppp/3p1n2/8/2B1P3/5N2/PB3PPP/RN1Q1RK1 b kq - 3 7',
            nextMove: 'Bg4',
            playerColor: 'w',
            avantage: 'medium'
        },
    ];

    const defensePositions = [
        {
            title: 'Alien gambit',
            startingFen: 'rnbq1b1r/pp2pkp1/2p2n1p/8/3P4/8/PPP2PPP/R1BQKBNR w KQ - 0 7',
            nextMove: 'Bc4+',
            playerColor: 'b',
            avantage: 'medium'
        },
        {
            title: 'Smith Morra Accepted',
            startingFen: '2r1k2r/1bq1b1p1/p1nppn1p/1p6/4P3/P1N1BQ2/BP3PPP/R3R1K1 w k - 0 16',
            nextMove: 'Bxe6',
            playerColor: 'b',
            avantage: 'low'
        },
        {
            title: 'Danish Gambit Accepted',
            startingFen: 'rnbqkb1r/pppp1ppp/5n2/8/2B1P3/8/PB3PPP/RN1QK1NR w KQkq - 1 6',
            nextMove: 'e5',
            playerColor: 'b',
            avantage: 'low'
        },
    ];

    const endgamePositions = [
        {
            title: 'Finale de pions n°1',
            startingFen: '8/8/1p1p1k2/3P4/3K4/P7/8/8 b - - 5 47',
            nextMove: 'Ke7',
            playerColor: 'w',
            avantage: 'very high'
        },
        {
            title: 'Finale fou contre pion',
            startingFen: '8/p2k4/8/1P6/2PK1p2/7P/8/3b4 w - - 1 46',
            nextMove: 'c5',
            playerColor: 'b',
            avantage: 'high'
        },
        {
            title: 'Finale fou + tour contre tour',
            startingFen: '1r6/5p2/6pp/1b2k3/3RP3/4KP1P/6P1/8 w - - 4 37',
            nextMove: 'Rb4',
            playerColor: 'b',
            avantage: 'medium'
        },
        {
            title: 'Finale de tours n°1',
            startingFen: '3r4/5pkp/4p1p1/1R6/3p1P2/8/P2K1P1P/8 w - - 0 24',
            nextMove: 'Kd3',
            playerColor: 'b',
            avantage: 'medium'
        },
        {
            title: 'Finale de tours n°2',
            startingFen: '5R2/8/r3k3/5p2/4p1p1/6P1/4K3/8 w - - 1 52',
            nextMove: 'Ke3',
            playerColor: 'b',
            avantage: 'high'
        },
    ];

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

    const themeComponent =
        <div className='flex flex-row justify-around items-center flex-wrap w-full' >
            <div onClick={() => setThemeChoice('Attack')} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: themeChoice === 'Attack' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <LuSwords size={100} />
                <span className=' w-full h-[10px] flex justify-center items-center mt-2' >Attaque</span>
            </div>
            <div onClick={() => setThemeChoice('Defense')} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: themeChoice === 'Defense' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <FaShieldAlt size={100} />
                <span className=' w-full h-[10px] flex justify-center items-center  mt-2' >Defense</span>
            </div>
            <div onClick={() => setThemeChoice('Endgames')} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: themeChoice === 'Endgames' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <FaChess size={100} />
                <span className=' w-full h-[10px] flex justify-center items-center  mt-2' >Finales</span>
            </div>
        </div>

    // TODO: Afficher que si le thème choisi correspond (attaque, défense, finales)
    const attackPositionsComponent = themeChoice === 'Attack' ?
        <div className='flex flex-row justify-around items-center flex-wrap w-full mt-2 px-2 gap-2' >
            {
                attackingPositions.map((position, i) => {
                    return <div key={`attack${i}`} className=' relative w-fit h-fit flex flex-col justify-center items-center'>
                        <div className=' relative w-44 h-44 flex justify-center items-center'>
                            <Chessboard 
                                id={`attack${i}`}
                                position={position.startingFen}
                                onPieceDrop={() => false} 
                                boardOrientation={position.playerColor === 'w' ? 'white' : 'black'}
                            />
                            <Link
                                className=' absolute w-full h-full cursor-pointer z-50 '
                                href = {{
                                pathname: '/thematic-training',
                                query: {
                                    difficulty: difficulty,
                                    startingFen: position.startingFen,
                                    nextMove: position.nextMove,
                                    playerColor: position.playerColor,
                                }
                                }}
                            ></Link>
                        </div>
                        <h1 className=' text-white text-lg font-semibold' >{position.title}</h1>
                        <h2 className=' text-white text-base'>Avantage: {position.avantage}</h2>
                    </div>
                })
            }
        </div>
        :
        null
    
    const defensePositionsComponent = themeChoice === 'Defense' ?
        <div className='flex flex-row justify-around items-center flex-wrap w-full mt-2 px-2 gap-2' >
            {
                defensePositions.map((position, i) => {
                    return <div key={`defense${i}`} className=' relative w-fit h-fit flex flex-col justify-center items-center'>
                        <div className=' relative w-44 h-44 flex justify-center items-center'>
                            <Chessboard 
                                id={`defense${i}`}
                                position={position.startingFen}
                                onPieceDrop={() => false} 
                                boardOrientation={position.playerColor === 'w' ? 'white' : 'black'}
                            />
                            <Link
                                className=' absolute w-full h-full cursor-pointer z-50 '
                                href = {{
                                pathname: '/thematic-training',
                                query: {
                                    difficulty: difficulty,
                                    startingFen: position.startingFen,
                                    nextMove: position.nextMove,
                                    playerColor: position.playerColor,
                                }
                                }}
                            ></Link>
                        </div>
                        <h1 className=' text-white text-lg font-semibold' >{position.title}</h1>
                        <h2 className=' text-white text-base'>Avantage: {position.avantage}</h2>
                    </div>
                })
            }
        </div>
        :
        null

    const endgamePositionsComponent = themeChoice === 'Endgames' ?
        <div className='flex flex-row justify-around items-center flex-wrap w-full mt-2 px-2 gap-2' >
            {
                endgamePositions.map((position, i) => {
                    return <div key={`endgame${i}`} className=' relative w-fit h-fit flex flex-col justify-center items-center'>
                        <div className=' relative w-44 h-44 flex justify-center items-center'>
                            <Chessboard 
                                id={`endgame${i}`}
                                position={position.startingFen}
                                onPieceDrop={() => false} 
                                boardOrientation={position.playerColor === 'w' ? 'white' : 'black'}
                            />
                            <Link
                                className=' absolute w-full h-full cursor-pointer z-50 '
                                href = {{
                                pathname: '/thematic-training',
                                query: {
                                    difficulty: difficulty,
                                    startingFen: position.startingFen,
                                    nextMove: position.nextMove,
                                    playerColor: position.playerColor,
                                }
                                }}
                            ></Link>
                        </div>
                        <h1 className=' text-white text-lg font-semibold' >{position.title}</h1>
                        <h2 className=' text-white text-base'>Avantage: {position.avantage}</h2>
                    </div>
                })
            }
            
        </div>
        :
        null

    return (
        <div className="flex flex-col justify-around items-center bg-cyan-900 h-screen w-full overflow-auto" >
            <div className=' w-full flex justify-center items-center text-2xl font-semibold text-white' >Difficulté:</div>
            {difficultyComponent}
            <div className=' w-full flex justify-center items-center text-2xl font-semibold text-white' >Thèmes:</div>
            {themeComponent}
            {attackPositionsComponent}
            {defensePositionsComponent}
            {endgamePositionsComponent}
        </div>
    )
}

export default SelectThematicTrainingPage;