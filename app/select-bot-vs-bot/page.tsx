'use client'

import React, { useState } from 'react';
import { Behaviour } from '../bots-ai/BotsAI';
import Link from 'next/link';
import { GiBulletBill } from 'react-icons/gi';
import { SiStackblitz } from 'react-icons/si';
import { LuAlarmClock } from 'react-icons/lu';
import { IoHourglassOutline } from 'react-icons/io5';

/*TODO: Choix difficulté: [
    'Beginner': pawnIcon, 
    'Casual': knightIcon, 
    'Intermediate': bishopIcon,
    'Advanced': rookIcon,
    'Master': queenIcon,
    'Maximum': kingIcon,
    ] */

// TODO: Liste des bots

const SelectBotVsBotPage = () => {
    const [timeControl, setTimeControl] = useState('300');
    const [bot1_Level, setBot1_Level] = useState('Master');
    const [bot1_Behaviour, setBot1_Behaviour] = useState<Behaviour>('default');
    const [bot2_Level, setBot2_Level] = useState('Master');
    const [bot2_Behaviour, setBot2_Behaviour] = useState<Behaviour>('default');

    const timeControlComponent =
        <div className='flex mt-10 flex-row justify-around items-center flex-wrap w-full' >
            <div onClick={() => setTimeControl('300')} className=' h-[200px] md:h-[110px] w-[200px] md:w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: timeControl === '300' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <GiBulletBill size={100} />
                <span className=' w-full h-[10px] flex justify-center items-center' >Bullet</span>
            </div>
            <div onClick={() => setTimeControl('3000')} className=' h-[200px] md:h-[110px] w-[200px] md:w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: timeControl === '3000' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <SiStackblitz size={100} />
                <span className=' w-full h-[10px] flex justify-center items-center' >Blitz</span>
            </div>
            <div onClick={() => setTimeControl('15000')} className=' h-[200px] md:h-[110px] w-[200px] md:w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: timeControl === '15000' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <LuAlarmClock size={100} />
                <span className=' w-full h-[10px] flex justify-center items-center' >Rapid</span>
            </div>
            <div onClick={() => setTimeControl('120000')} className=' h-[200px] md:h-[110px] w-[200px] md:w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: timeControl === '120000' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <IoHourglassOutline size={100} />
                <span className=' w-full h-[10px] flex justify-center items-center' >Classical</span>
            </div>
        </div>

    const bot1_LevelComponent =
        <div className='flex mt-10 flex-row justify-around items-center flex-wrap w-full' >
            <div onClick={() => setBot1_Level('Beginner')} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: bot1_Level === 'Beginner' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <div className=' h-[90px] w-full text-8xl flex justify-center items-center' >♙</div>
                <span className=' w-full h-[10px] flex justify-center items-center' >Beginner</span>
            </div>
            <div onClick={() => setBot1_Level('Casual')} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: bot1_Level === 'Casual' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <div className=' h-[90px] w-full text-8xl flex justify-center items-center' >♘</div>
                <span className=' w-full h-[10px] flex justify-center items-center' >Casual</span>
            </div>
            <div onClick={() => setBot1_Level('Intermediate')} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: bot1_Level === 'Intermediate' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <div className=' h-[90px] w-full text-8xl flex justify-center items-center' >♗</div>
                <span className=' w-full h-[10px] flex justify-center items-center' >Intermediate</span>
            </div>
            <div onClick={() => setBot1_Level('Advanced')} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: bot1_Level === 'Advanced' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }} >
                <div className=' h-[90px] w-full text-8xl flex justify-center items-center' >♖</div>
                <span className=' w-full h-[10px] flex justify-center items-center' >Advanced</span>
            </div>
            <div onClick={() => setBot1_Level('Master')} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: bot1_Level === 'Master' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }} >
                <div className=' h-[90px] w-full text-8xl flex justify-center items-center' >♕</div>
                <span className=' w-full h-[10px] flex justify-center items-center' >Master</span>
            </div>
            <div onClick={() => setBot1_Level('Maximum')} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: bot1_Level === 'Maximum' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <div className=' h-[90px] w-full text-8xl flex justify-center items-center' >♔</div>
                <span className=' w-full h-[10px] flex justify-center items-center' >Maximum</span>
            </div>
        </div>
    
    const bot2_LevelComponent =
        <div className='flex mt-10 flex-row justify-around items-center flex-wrap w-full' >
            <div onClick={() => setBot2_Level('Beginner')} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: bot2_Level === 'Beginner' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <div className=' h-[90px] w-full text-8xl flex justify-center items-center' >♙</div>
                <span className=' w-full h-[10px] flex justify-center items-center' >Beginner</span>
            </div>
            <div onClick={() => setBot2_Level('Casual')} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: bot2_Level === 'Casual' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <div className=' h-[90px] w-full text-8xl flex justify-center items-center' >♘</div>
                <span className=' w-full h-[10px] flex justify-center items-center' >Casual</span>
            </div>
            <div onClick={() => setBot2_Level('Intermediate')} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: bot2_Level === 'Intermediate' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <div className=' h-[90px] w-full text-8xl flex justify-center items-center' >♗</div>
                <span className=' w-full h-[10px] flex justify-center items-center' >Intermediate</span>
            </div>
            <div onClick={() => setBot2_Level('Advanced')} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: bot2_Level === 'Advanced' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }} >
                <div className=' h-[90px] w-full text-8xl flex justify-center items-center' >♖</div>
                <span className=' w-full h-[10px] flex justify-center items-center' >Advanced</span>
            </div>
            <div onClick={() => setBot2_Level('Master')} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: bot2_Level === 'Master' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }} >
                <div className=' h-[90px] w-full text-8xl flex justify-center items-center' >♕</div>
                <span className=' w-full h-[10px] flex justify-center items-center' >Master</span>
            </div>
            <div onClick={() => setBot2_Level('Maximum')} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: bot2_Level === 'Maximum' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <div className=' h-[90px] w-full text-8xl flex justify-center items-center' >♔</div>
                <span className=' w-full h-[10px] flex justify-center items-center' >Maximum</span>
            </div>
        </div>

    const bot1_BehaviourComponent = 
        <div className='flex mt-10 flex-row justify-around items-center flex-wrap w-full mt-2 px-2 gap-2' >
            <div onClick={() => setBot1_Behaviour('default')} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: bot1_Behaviour === 'default' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <span className=' w-full h-full flex justify-center items-center text-2xl font-bold text-center' >Default</span>
            </div>
            <div onClick={() => setBot1_Behaviour('stockfish-only')} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: bot1_Behaviour === 'stockfish-only' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <span className=' w-full h-full flex justify-center items-center text-2xl font-bold text-center' >Stockfish Only</span>
            </div>
            <div onClick={() => setBot1_Behaviour('human')} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: bot1_Behaviour === 'human' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <span className=' w-full h-full flex justify-center items-center text-2xl font-bold text-center' >Human</span>
            </div>
            <div onClick={() => setBot1_Behaviour('pawn-pusher')} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: bot1_Behaviour === 'pawn-pusher' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <span className=' w-full h-full flex justify-center items-center text-2xl font-bold text-center' >Pawn Pusher</span>
            </div>
            <div onClick={() => setBot1_Behaviour('fianchetto-sniper')} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: bot1_Behaviour === 'fianchetto-sniper' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <span className=' w-full h-full flex justify-center items-center text-2xl font-bold text-center' >Fianchetto Sniper</span>
            </div>
            <div onClick={() => setBot1_Behaviour('shy')} className=' h-[110px] w-[110px] flex flex-col justify-start items-center  cursor-pointer' style={{color: bot1_Behaviour === 'shy' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }} >
                <span className=' w-full h-full flex justify-center items-center text-2xl font-bold text-center' >Shy</span>
            </div>
            <div onClick={() => setBot1_Behaviour('blundering')} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: bot1_Behaviour === 'blundering' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }} >
                <span className=' w-full h-full flex justify-center items-center text-2xl font-bold text-center' >Blundering</span>
            </div>
            <div onClick={() => setBot1_Behaviour('drawish')} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: bot1_Behaviour === 'drawish' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <span className=' w-full h-full flex justify-center items-center text-2xl font-bold text-center' >Drawish</span>
            </div>
            <div onClick={() => setBot1_Behaviour('sacrifice-enjoyer')} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: bot1_Behaviour === 'sacrifice-enjoyer' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <span className=' w-full h-full flex justify-center items-center text-2xl font-bold text-center' >Sacrifice Enjoyer</span>
            </div>
            <div onClick={() => setBot1_Behaviour('exchanges-lover')} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: bot1_Behaviour === 'exchanges-lover' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <span className=' w-full h-full flex justify-center items-center text-2xl font-bold text-center' >Exchanges Lover</span>
            </div>
            <div onClick={() => setBot1_Behaviour('exchanges-hater')} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: bot1_Behaviour === 'exchanges-hater' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <span className=' w-full h-full flex justify-center items-center text-2xl font-bold text-center' >Exchanges Hater</span>
            </div>
            <div onClick={() => setBot1_Behaviour('queen-player')} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: bot1_Behaviour === 'queen-player' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }} >
                <span className=' w-full h-full flex justify-center items-center text-2xl font-bold text-center' >Queen Player</span>
            </div>
            <div onClick={() => setBot1_Behaviour('botez-gambit')} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: bot1_Behaviour === 'botez-gambit' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }} >
                <span className=' w-full h-full flex justify-center items-center text-2xl font-bold text-center' >Botez Gambit</span>
            </div>
            <div onClick={() => setBot1_Behaviour('castle-destroyer')} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: bot1_Behaviour === 'castle-destroyer' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <span className=' w-full h-full flex justify-center items-center text-2xl font-bold text-center' >Castle Destroyer</span>
            </div>
            <div onClick={() => setBot1_Behaviour('openings-master')} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: bot1_Behaviour === 'openings-master' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <span className=' w-full h-full flex justify-center items-center text-2xl font-bold text-center' >Openings Master</span>
            </div>
            <div onClick={() => setBot1_Behaviour('openings-beginner')} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: bot1_Behaviour === 'openings-beginner' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <span className=' w-full h-full flex justify-center items-center text-2xl font-bold text-center' >Openings Beginner</span>
            </div>
            <div onClick={() => setBot1_Behaviour('random-player')} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: bot1_Behaviour === 'random-player' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <span className=' w-full h-full flex justify-center items-center text-2xl font-bold text-center' >Random Player</span>
            </div>
            <div onClick={() => setBot1_Behaviour('copycat')} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: bot1_Behaviour === 'copycat' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <span className=' w-full h-full flex justify-center items-center text-2xl font-bold text-center' >Copycat</span>
            </div>
            <div onClick={() => setBot1_Behaviour('bongcloud')} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: bot1_Behaviour === 'bongcloud' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }} >
                <span className=' w-full h-full flex justify-center items-center text-2xl font-bold text-center' >Bongcloud</span>
            </div>
            <div onClick={() => setBot1_Behaviour('gambit-fanatic')} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: bot1_Behaviour === 'gambit-fanatic' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }} >
                <span className=' w-full h-full flex justify-center items-center text-2xl font-bold text-center' >Gambit Fanatic</span>
            </div>
            <div onClick={() => setBot1_Behaviour('cow-lover')} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: bot1_Behaviour === 'cow-lover' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <span className=' w-full h-full flex justify-center items-center text-2xl font-bold text-center' >Cow Lover</span>
            </div>
        </div>

const bot2_BehaviourComponent = 
    <div className='flex mt-10 flex-row justify-around items-center flex-wrap w-full mt-2 px-2 gap-2' >
        <div onClick={() => setBot2_Behaviour('default')} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: bot2_Behaviour === 'default' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
            <span className=' w-full h-full flex justify-center items-center text-2xl font-bold text-center' >Default</span>
        </div>
        <div onClick={() => setBot2_Behaviour('stockfish-only')} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: bot2_Behaviour === 'stockfish-only' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
            <span className=' w-full h-full flex justify-center items-center text-2xl font-bold text-center' >Stockfish Only</span>
        </div>
        <div onClick={() => setBot2_Behaviour('human')} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: bot2_Behaviour === 'human' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
            <span className=' w-full h-full flex justify-center items-center text-2xl font-bold text-center' >Human</span>
        </div>
        <div onClick={() => setBot2_Behaviour('pawn-pusher')} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: bot2_Behaviour === 'pawn-pusher' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
            <span className=' w-full h-full flex justify-center items-center text-2xl font-bold text-center' >Pawn Pusher</span>
        </div>
        <div onClick={() => setBot2_Behaviour('fianchetto-sniper')} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: bot2_Behaviour === 'fianchetto-sniper' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
            <span className=' w-full h-full flex justify-center items-center text-2xl font-bold text-center' >Fianchetto Sniper</span>
        </div>
        <div onClick={() => setBot2_Behaviour('shy')} className=' h-[110px] w-[110px] flex flex-col justify-start items-center  cursor-pointer' style={{color: bot2_Behaviour === 'shy' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }} >
            <span className=' w-full h-full flex justify-center items-center text-2xl font-bold text-center' >Shy</span>
        </div>
        <div onClick={() => setBot2_Behaviour('blundering')} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: bot2_Behaviour === 'blundering' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }} >
            <span className=' w-full h-full flex justify-center items-center text-2xl font-bold text-center' >Blundering</span>
        </div>
        <div onClick={() => setBot2_Behaviour('drawish')} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: bot2_Behaviour === 'drawish' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
            <span className=' w-full h-full flex justify-center items-center text-2xl font-bold text-center' >Drawish</span>
        </div>
        <div onClick={() => setBot2_Behaviour('sacrifice-enjoyer')} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: bot2_Behaviour === 'sacrifice-enjoyer' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
            <span className=' w-full h-full flex justify-center items-center text-2xl font-bold text-center' >Sacrifice Enjoyer</span>
        </div>
        <div onClick={() => setBot2_Behaviour('exchanges-lover')} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: bot2_Behaviour === 'exchanges-lover' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
            <span className=' w-full h-full flex justify-center items-center text-2xl font-bold text-center' >Exchanges Lover</span>
        </div>
        <div onClick={() => setBot2_Behaviour('exchanges-hater')} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: bot2_Behaviour === 'exchanges-hater' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
            <span className=' w-full h-full flex justify-center items-center text-2xl font-bold text-center' >Exchanges Hater</span>
        </div>
        <div onClick={() => setBot2_Behaviour('queen-player')} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: bot2_Behaviour === 'queen-player' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }} >
            <span className=' w-full h-full flex justify-center items-center text-2xl font-bold text-center' >Queen Player</span>
        </div>
        <div onClick={() => setBot2_Behaviour('botez-gambit')} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: bot2_Behaviour === 'botez-gambit' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }} >
            <span className=' w-full h-full flex justify-center items-center text-2xl font-bold text-center' >Botez Gambit</span>
        </div>
        <div onClick={() => setBot2_Behaviour('castle-destroyer')} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: bot2_Behaviour === 'castle-destroyer' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
            <span className=' w-full h-full flex justify-center items-center text-2xl font-bold text-center' >Castle Destroyer</span>
        </div>
        <div onClick={() => setBot2_Behaviour('openings-master')} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: bot2_Behaviour === 'openings-master' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
            <span className=' w-full h-full flex justify-center items-center text-2xl font-bold text-center' >Openings Master</span>
        </div>
        <div onClick={() => setBot2_Behaviour('openings-beginner')} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: bot2_Behaviour === 'openings-beginner' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
            <span className=' w-full h-full flex justify-center items-center text-2xl font-bold text-center' >Openings Beginner</span>
        </div>
        <div onClick={() => setBot2_Behaviour('random-player')} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: bot2_Behaviour === 'random-player' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
            <span className=' w-full h-full flex justify-center items-center text-2xl font-bold text-center' >Random Player</span>
        </div>
        <div onClick={() => setBot2_Behaviour('copycat')} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: bot2_Behaviour === 'copycat' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
            <span className=' w-full h-full flex justify-center items-center text-2xl font-bold text-center' >Copycat</span>
        </div>
        <div onClick={() => setBot2_Behaviour('bongcloud')} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: bot2_Behaviour === 'bongcloud' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }} >
            <span className=' w-full h-full flex justify-center items-center text-2xl font-bold text-center' >Bongcloud</span>
        </div>
        <div onClick={() => setBot2_Behaviour('gambit-fanatic')} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: bot2_Behaviour === 'gambit-fanatic' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }} >
            <span className=' w-full h-full flex justify-center items-center text-2xl font-bold text-center' >Gambit Fanatic</span>
        </div>
        <div onClick={() => setBot2_Behaviour('cow-lover')} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: bot2_Behaviour === 'cow-lover' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
            <span className=' w-full h-full flex justify-center items-center text-2xl font-bold text-center' >Cow Lover</span>
        </div>
    </div>


    return (
        <div className="flex flex-col justify-start items-center bg-cyan-900 h-screen w-full overflow-auto" >
            <div className=' w-full mt-20 flex justify-center items-center text-2xl font-semibold text-white' >Cadence:</div>
            {timeControlComponent}
            <div className=' w-full mt-20 flex justify-center items-center text-2xl font-semibold text-white' >Niveau Bot n°1:</div>
            {bot1_LevelComponent}
            <div className=' w-full mt-20 flex justify-center items-center text-2xl font-semibold text-white' >Gimmick Bot n°1:</div>
            {bot1_BehaviourComponent}
            <div className=' w-full mt-20 flex justify-center items-center text-2xl font-semibold text-white' >Niveau Bot n°2:</div>
            {bot2_LevelComponent}
            <div className=' w-full mt-20 flex justify-center items-center text-2xl font-semibold text-white' >Gimmick Bot n°2:</div>
            {bot2_BehaviourComponent}
            <Link
                className=' text-white hover:text-cyan-400 cursor-pointer text-3xl font-bold my-20 '
                href = {{
                pathname: '/bot-vs-bot',
                query: {
                    bot1_Level: bot1_Level,
                    bot1_Behaviour: bot1_Behaviour,
                    bot2_Level: bot2_Level,
                    bot2_Behaviour: bot2_Behaviour,
                    timeControl: timeControl,
                }
                }}
            >
                Lancer le match
            </Link>
        </div>
    )
}

export default SelectBotVsBotPage;