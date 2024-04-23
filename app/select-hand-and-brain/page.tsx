'use client'

import React, { useState } from 'react';
import { Behaviour } from '../bots-ai/BotsAI';
import Link from 'next/link';
import { FaHandFist } from 'react-icons/fa6';
import  { GiBrain } from 'react-icons/gi';
import { SiLichess } from 'react-icons/si';
//import { SiChessdotcom } from 'react-icons/si';
import { FaChessPawn } from 'react-icons/fa';

/*TODO: Choix difficulté: [
    'Beginner': pawnIcon, 
    'Casual': knightIcon, 
    'Intermediate': bishopIcon,
    'Advanced': rookIcon,
    'Master': queenIcon,
    'Maximum': kingIcon,
    ] */

// TODO: Liste des bots

const SelectHandAndBrainPage = () => {
    const [playerRole, setPlayerRole] = useState('Brain');
    const [allyRating, setAllyRating] = useState('Master');
    const [difficulty, setDifficulty] = useState('Master');
    const [behaviour, setBehaviour] = useState<Behaviour>('default');

    const playerRoleComponent =
        <div className='flex flex-row justify-around items-center flex-wrap w-full mt-5 mb-10 px-2 gap-2' >
                <div onClick={() => setPlayerRole('Brain')} className=' h-[160px] w-[160px] flex flex-col justify-start items-center cursor-pointer' style={{color: playerRole === 'Brain' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                    <GiBrain size={200} />
                    <span className=' w-full h-full flex justify-center items-center text-2xl font-bold text-center' >Brain</span>
                </div>
                <div onClick={() => setPlayerRole('Hand')} className=' h-[160px] w-[160px] flex flex-col justify-start items-center cursor-pointer' style={{color: playerRole === 'Hand' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                    <FaHandFist size={200} />
                    <span className=' w-full h-full flex justify-center items-center text-2xl font-bold text-center' >Hand</span>
                </div>
        </div>

    const allyRatingComponent =
        <div className='flex flex-row justify-around items-center flex-wrap w-full mt-5 mb-10' >
            <div onClick={() => setAllyRating('Beginner')} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: allyRating === 'Beginner' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <div className=' h-[90px] w-full text-8xl flex justify-center items-center' >♙</div>
                <span className=' w-full h-[10px] flex justify-center items-center' >Beginner</span>
            </div>
            <div onClick={() => setAllyRating('Casual')} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: allyRating === 'Casual' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <div className=' h-[90px] w-full text-8xl flex justify-center items-center' >♘</div>
                <span className=' w-full h-[10px] flex justify-center items-center' >Casual</span>
            </div>
            <div onClick={() => setAllyRating('Intermediate')} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: allyRating === 'Intermediate' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <div className=' h-[90px] w-full text-8xl flex justify-center items-center' >♗</div>
                <span className=' w-full h-[10px] flex justify-center items-center' >Intermediate</span>
            </div>
            <div onClick={() => setAllyRating('Advanced')} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: allyRating === 'Advanced' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }} >
                <div className=' h-[90px] w-full text-8xl flex justify-center items-center' >♖</div>
                <span className=' w-full h-[10px] flex justify-center items-center' >Advanced</span>
            </div>
            <div onClick={() => setAllyRating('Master')} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: allyRating === 'Master' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }} >
                <div className=' h-[90px] w-full text-8xl flex justify-center items-center' >♕</div>
                <span className=' w-full h-[10px] flex justify-center items-center' >Master</span>
            </div>
            <div onClick={() => setAllyRating('Maximum')} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: allyRating === 'Maximum' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <div className=' h-[90px] w-full text-8xl flex justify-center items-center' >♔</div>
                <span className=' w-full h-[10px] flex justify-center items-center' >Maximum</span>
            </div>
        </div>

    const difficultyComponent =
        <div className='flex flex-row justify-around items-center flex-wrap w-full mt-5 mb-10' >
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

    const behaviourComponent = 
        <div className='flex flex-row justify-around items-center flex-wrap w-full mt-2 px-2 gap-2' >
            <div onClick={() => setBehaviour('default')} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: behaviour === 'default' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <span className=' w-full h-full flex justify-center items-center text-2xl font-bold text-center' >Default</span>
            </div>
            <div onClick={() => setBehaviour('stockfish-only')} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: behaviour === 'stockfish-only' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <span className=' w-full h-full flex justify-center items-center text-2xl font-bold text-center' >Stockfish Only</span>
            </div>
            <div onClick={() => setBehaviour('human')} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: behaviour === 'human' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <span className=' w-full h-full flex justify-center items-center text-2xl font-bold text-center' >Human</span>
            </div>
            <div onClick={() => setBehaviour('pawn-pusher')} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: behaviour === 'pawn-pusher' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <span className=' w-full h-full flex justify-center items-center text-2xl font-bold text-center' >Pawn Pusher</span>
            </div>
            <div onClick={() => setBehaviour('fianchetto-sniper')} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: behaviour === 'fianchetto-sniper' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <span className=' w-full h-full flex justify-center items-center text-2xl font-bold text-center' >Fianchetto Sniper</span>
            </div>
            <div onClick={() => setBehaviour('shy')} className=' h-[110px] w-[110px] flex flex-col justify-start items-center  cursor-pointer' style={{color: behaviour === 'shy' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }} >
                <span className=' w-full h-full flex justify-center items-center text-2xl font-bold text-center' >Shy</span>
            </div>
            <div onClick={() => setBehaviour('blundering')} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: behaviour === 'blundering' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }} >
                <span className=' w-full h-full flex justify-center items-center text-2xl font-bold text-center' >Blundering</span>
            </div>
            <div onClick={() => setBehaviour('drawish')} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: behaviour === 'drawish' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <span className=' w-full h-full flex justify-center items-center text-2xl font-bold text-center' >Drawish</span>
            </div>
            <div onClick={() => setBehaviour('exchanges-lover')} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: behaviour === 'exchanges-lover' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <span className=' w-full h-full flex justify-center items-center text-2xl font-bold text-center' >Exchanges Lover</span>
            </div>
            <div onClick={() => setBehaviour('exchanges-hater')} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: behaviour === 'exchanges-hater' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <span className=' w-full h-full flex justify-center items-center text-2xl font-bold text-center' >Exchanges Hater</span>
            </div>
            <div onClick={() => setBehaviour('queen-player')} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: behaviour === 'queen-player' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }} >
                <span className=' w-full h-full flex justify-center items-center text-2xl font-bold text-center' >Queen Player</span>
            </div>
            <div onClick={() => setBehaviour('botez-gambit')} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: behaviour === 'botez-gambit' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }} >
                <span className=' w-full h-full flex justify-center items-center text-2xl font-bold text-center' >Botez Gambit</span>
            </div>
            <div onClick={() => setBehaviour('castle-destroyer')} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: behaviour === 'castle-destroyer' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <span className=' w-full h-full flex justify-center items-center text-2xl font-bold text-center' >Castle Destroyer</span>
            </div>
            <div onClick={() => setBehaviour('chessable-master')} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: behaviour === 'chessable-master' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <span className=' w-full h-full flex justify-center items-center text-2xl font-bold text-center' >Chessable Master</span>
            </div>
            <div onClick={() => setBehaviour('auto-didacte')} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: behaviour === 'auto-didacte' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <span className=' w-full h-full flex justify-center items-center text-2xl font-bold text-center' >Autodidacte</span>
            </div>
            <div onClick={() => setBehaviour('random-player')} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: behaviour === 'random-player' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <span className=' w-full h-full flex justify-center items-center text-2xl font-bold text-center' >Random Player</span>
            </div>
            <div onClick={() => setBehaviour('copycat')} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: behaviour === 'copycat' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <span className=' w-full h-full flex justify-center items-center text-2xl font-bold text-center' >Copycat</span>
            </div>
            <div onClick={() => setBehaviour('bongcloud')} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: behaviour === 'bongcloud' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }} >
                <span className=' w-full h-full flex justify-center items-center text-2xl font-bold text-center' >Bongcloud</span>
            </div>
            <div onClick={() => setBehaviour('gambit-fanatic')} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: behaviour === 'gambit-fanatic' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }} >
                <span className=' w-full h-full flex justify-center items-center text-2xl font-bold text-center' >Gambit Fanatic</span>
            </div>
            <div onClick={() => setBehaviour('cow-lover')} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: behaviour === 'cow-lover' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <span className=' w-full h-full flex justify-center items-center text-2xl font-bold text-center' >Cow Lover</span>
            </div>
            <div onClick={() => setBehaviour('indian-king')} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: behaviour === 'indian-king' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <span className=' w-full h-full flex justify-center items-center text-2xl font-bold text-center' >Indian King</span>
            </div>
            <div onClick={() => setBehaviour('stonewall')} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: behaviour === 'stonewall' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <span className=' w-full h-full flex justify-center items-center text-2xl font-bold text-center' >Stonewall</span>
            </div>
            <div onClick={() => setBehaviour('dragon')} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: behaviour === 'dragon' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <span className=' w-full h-full flex justify-center items-center text-2xl font-bold text-center' >Dragon</span>
            </div>
            <div onClick={() => setBehaviour('caro-london')} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: behaviour === 'caro-london' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <span className=' w-full h-full flex justify-center items-center text-2xl font-bold text-center' >Caro London</span>
            </div>
        </div>


    return (
        <div className="flex flex-col justify-start items-center bg-cyan-900 h-[95vh] w-full overflow-auto" >
            <div className=' w-full mt-5 mb-2 md:ml-10 flex justify-center md:justify-start items-center text-2xl font-semibold text-white' >Jouer en tant que:</div>
            {playerRoleComponent}
            <div className=' w-full md:ml-10 flex justify-center md:justify-start items-center text-2xl font-semibold text-white' >Niveau de votre équipier:</div>
            {allyRatingComponent}
            <div className=' w-full md:ml-10 flex justify-center md:justify-start items-center text-2xl font-semibold text-white' >Difficulté:</div>
            {difficultyComponent}
            <div className=' w-full mt-20 md:ml-10 flex justify-center md:justify-start items-center text-2xl font-semibold text-white' >Gimmick:</div>
            {behaviourComponent}
            <Link
                className=' text-white hover:text-cyan-400 cursor-pointer text-3xl font-bold my-20 '
                href = {{
                pathname: '/hand-and-brain',
                query: {
                    playerRole: playerRole,
                    allyRating: allyRating,
                    opponentRating: difficulty,
                    opponentBehaviour: behaviour
                }
                }}
            >
                Jouer
            </Link>
        </div>
    )
}

export default SelectHandAndBrainPage;