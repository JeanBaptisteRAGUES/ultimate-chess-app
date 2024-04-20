'use client'

import React, { useState } from 'react';
import { Behaviour } from '../bots-ai/BotsAI';
import Link from 'next/link';
import { GiBulletBill } from 'react-icons/gi';
import { SiStackblitz } from 'react-icons/si';
import { LuAlarmClock } from 'react-icons/lu';
import { IoHourglassOutline } from 'react-icons/io5';
import { IoInfiniteSharp } from 'react-icons/io5';
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

const SelectBot = () => {
    const [difficulty, setDifficulty] = useState('Master');
    const [behaviour, setBehaviour] = useState<Behaviour>('default');
    const [timeControl, setTimeControl] = useState('10+0');

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
        </div>

/*     ['1+0', {startingTime: 60, increment: 0}],
    ['3+0', {startingTime: 180, increment: 0}],
    ['3+2', {startingTime: 180, increment: 2}],
    ['10+0', {startingTime: 600, increment: 0}],
    ['15+10', {startingTime: 900, increment: 10}],
    ['30+20', {startingTime: 1800, increment: 20}],
    ['90+30', {startingTime: 5400, increment: 30}], */
    const timeControlComponent =
        <div className='flex mt-10 flex-row justify-around items-center flex-wrap w-full' >
            <div onClick={() => setTimeControl('1+0')} className=' h-[200px] md:h-[110px] w-[200px] md:w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: timeControl === '1+0' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <GiBulletBill size={100} />
                <span className=' w-full h-[10px] flex justify-center items-center' >1+0</span>
            </div>
            <div onClick={() => setTimeControl('3+0')} className=' h-[200px] md:h-[110px] w-[200px] md:w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: timeControl === '3+0' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <SiStackblitz size={100} />
                <span className=' w-full h-[10px] flex justify-center items-center' >3+0</span>
            </div>
            <div onClick={() => setTimeControl('3+2')} className=' h-[200px] md:h-[110px] w-[200px] md:w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: timeControl === '3+2' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <SiStackblitz size={100} />
                <span className=' w-full h-[10px] flex justify-center items-center' >3+2</span>
            </div>
            <div onClick={() => setTimeControl('10+0')} className=' h-[200px] md:h-[110px] w-[200px] md:w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: timeControl === '10+0' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <LuAlarmClock size={100} />
                <span className=' w-full h-[10px] flex justify-center items-center' >10+0</span>
            </div>
            <div onClick={() => setTimeControl('15+10')} className=' h-[200px] md:h-[110px] w-[200px] md:w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: timeControl === '15+10' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <LuAlarmClock size={100} />
                <span className=' w-full h-[10px] flex justify-center items-center' >15+10</span>
            </div>
            <div onClick={() => setTimeControl('30+20')} className=' h-[200px] md:h-[110px] w-[200px] md:w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: timeControl === '30+20' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <LuAlarmClock size={100} />
                <span className=' w-full h-[10px] flex justify-center items-center' >30+20</span>
            </div>
            <div onClick={() => setTimeControl('90+30')} className=' h-[200px] md:h-[110px] w-[200px] md:w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: timeControl === '90+30' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <IoHourglassOutline size={100} />
                <span className=' w-full h-[10px] flex justify-center items-center' >90+30</span>
            </div>
            <div onClick={() => setTimeControl('infinite')} className=' h-[200px] md:h-[110px] w-[200px] md:w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: timeControl === 'infinite' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <IoInfiniteSharp size={100} />
                <span className=' w-full h-[10px] flex justify-center items-center' >Infini</span>
            </div>
        </div>


    return (
        <div className="flex flex-col justify-start items-center bg-cyan-900 h-[95vh] w-full overflow-auto" >
            <div className=' w-full flex justify-center items-center text-2xl font-semibold text-white' >Difficulté:</div>
            {difficultyComponent}
            <div className=' w-full mt-20 flex justify-center items-center text-2xl font-semibold text-white' >Gimmick:</div>
            {behaviourComponent}
            <div className=' w-full mt-20 flex justify-center items-center text-2xl font-semibold text-white' >Cadence:</div>
            {timeControlComponent}
            <Link
                className=' text-white hover:text-cyan-400 cursor-pointer text-3xl font-bold my-20 '
                href = {{
                pathname: '/chess',
                query: {
                    difficulty: difficulty,
                    behaviour: behaviour,
                    timeControl: timeControl,
                }
                }}
            >
                Jouer
            </Link>
        </div>
    )
}

export default SelectBot;