'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import Image, { StaticImageData } from 'next/image';
import { Behaviour, BotDescription, botsInfo } from '../bots-ai/BotsAI';
import { GiBulletBill } from 'react-icons/gi';
import { SiStackblitz } from 'react-icons/si';
import { LuAlarmClock } from 'react-icons/lu';
import { IoHourglassOutline } from 'react-icons/io5';
import { IoInfiniteSharp } from 'react-icons/io5';
import { SiLichess } from 'react-icons/si';
//import { SiChessdotcom } from 'react-icons/si';
import { FaChessPawn } from 'react-icons/fa';

import human_pp from "@/public/Bots_images/chess3d_human.jpg";
import { DEFAULT_POSITION } from 'chess.js';

const INFINITE_SYMBOL = '∞';

const SelectTestAI = () => {
    const [elo, setElo] = useState<number>(1500);
    const [behaviour, setBehaviour] = useState<Behaviour>('human');
    const [timeControl, setTimeControl] = useState('10+0');
    const [startingFen, setStartingFen] = useState<string>(DEFAULT_POSITION);
    //const [botPP, setBotPP] = useState<StaticImageData>(human_pp);

    const botInfosComponent = 
        <div className='flex flex-row justify-around items-center flex-wrap gap-2 py-5 w-full bg-slate-800 sticky top-0 left-0 right-0' >
            <p className='w-full md:w-1/2 flex justify-center items-center text-xl font-semibold text-white'>Jouer en {timeControl === 'infinite' ? INFINITE_SYMBOL : timeControl} contre..</p>
            <span className=' w-full md:w-1/2 flex justify-center items-center rounded' >
                <Image
                    src={botsInfo.get(behaviour)?.image || human_pp}
                    alt="Picture of the author"
                    width={150}
                    height={150}
                    // blurDataURL="data:..." automatically provided
                    placeholder="blur" // Optional blur-up while loading
                />
            </span>
            <p className='w-full md:w-1/2 flex justify-center items-center text-lg font-semibold text-white'>{botsInfo.get(behaviour)?.name + ' (' + elo + ')'}</p>
            <p className='w-full md:w-1/2 flex justify-center items-center mx-5 text-md font-normal text-white'>{botsInfo.get(behaviour)?.description}</p>
        </div>

    const difficultyComponent =
        <div className='flex flex-row justify-around items-center flex-wrap w-full' >
            <input className=' bg-slate-600 text-white' type='number' placeholder='Bot Élo' onChange={(e) => setElo(e.target.value as any as number)}/>
        </div>

    const botsBehavioursComponent =
        <div className='flex flex-row justify-center items-center flex-wrap w-full mt-5 px-2 gap-5' >
            <div onClick={() => {setBehaviour('human')}} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer rounded border-4' style={{borderColor: behaviour === 'human' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <span className=' w-full h-full flex justify-center items-center rounded' >
                    <Image
                        src={botsInfo.get('human')?.image || human_pp}
                        alt="Picture of the author"
                        width={150}
                        height={150}
                        // blurDataURL="data:..." automatically provided
                        placeholder="blur" // Optional blur-up while loading
                    />
                </span>
            </div>
            <div onClick={() => {setBehaviour('stockfish-only')}} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer rounded border-4' style={{borderColor: behaviour === 'stockfish-only' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <span className=' w-full h-full flex justify-center items-center rounded' >
                    <Image
                        src={botsInfo.get('stockfish-only')?.image || human_pp}
                        alt="Picture of the author"
                        width={150}
                        height={150}
                        // blurDataURL="data:..." automatically provided
                        placeholder="blur" // Optional blur-up while loading
                    />
                </span>
            </div>
            <div onClick={() => {setBehaviour('pawn-pusher')}} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer rounded border-4' style={{borderColor: behaviour === 'pawn-pusher' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <span className=' w-full h-full flex justify-center items-center rounded' >
                    <Image
                        src={botsInfo.get('pawn-pusher')?.image || human_pp}
                        alt="Picture of the author"
                        width={150}
                        height={150}
                        // blurDataURL="data:..." automatically provided
                        placeholder="blur" // Optional blur-up while loading
                        />
                </span>
            </div>
            <div onClick={() => {setBehaviour('shy')}} className=' h-[110px] w-[110px] flex flex-col justify-start items-center  cursor-pointer rounded border-4' style={{borderColor: behaviour === 'shy' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }} >
                <span className=' w-full h-full flex justify-center items-center rounded' >
                    <Image
                        src={botsInfo.get('shy')?.image || human_pp}
                        alt="Picture of the author"
                        width={150}
                        height={150}
                        // blurDataURL="data:..." automatically provided
                        placeholder="blur" // Optional blur-up while loading
                        />
                </span>
            </div>
            <div onClick={() => {setBehaviour('blundering')}} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer rounded border-4' style={{borderColor: behaviour === 'blundering' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }} >
                <span className=' w-full h-full flex justify-center items-center rounded' >
                    <Image
                        src={botsInfo.get('blundering')?.image || human_pp}
                        alt="Picture of the author"
                        width={150}
                        height={150}
                        // blurDataURL="data:..." automatically provided
                        placeholder="blur" // Optional blur-up while loading
                    />
                </span>
            </div>
            <div onClick={() => {setBehaviour('drawish')}} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer rounded border-4' style={{borderColor: behaviour === 'drawish' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <span className=' w-full h-full flex justify-center items-center rounded' >
                    <Image
                        src={botsInfo.get('drawish')?.image || human_pp}
                        alt="Picture of the author"
                        width={150}
                        height={150}
                        // blurDataURL="data:..." automatically provided
                        placeholder="blur" // Optional blur-up while loading
                    />
                </span>
            </div>
            <div onClick={() => {setBehaviour('exchanges-lover')}} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer rounded border-4' style={{borderColor: behaviour === 'exchanges-lover' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <span className=' w-full h-full flex justify-center items-center rounded' >
                    <Image
                        src={botsInfo.get('exchanges-lover')?.image || human_pp}
                        alt="Picture of the author"
                        width={150}
                        height={150}
                        // blurDataURL="data:..." automatically provided
                        placeholder="blur" // Optional blur-up while loading
                    />
                </span>
            </div>
            <div onClick={() => {setBehaviour('exchanges-hater')}} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer rounded border-4' style={{borderColor: behaviour === 'exchanges-hater' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <span className=' w-full h-full flex justify-center items-center rounded' >
                    <Image
                        src={botsInfo.get('exchanges-hater')?.image || human_pp}
                        alt="Picture of the author"
                        width={150}
                        height={150}
                        // blurDataURL="data:..." automatically provided
                        placeholder="blur" // Optional blur-up while loading
                    />
                </span>
            </div>
            <div onClick={() => {setBehaviour('queen-player')}} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer rounded border-4' style={{borderColor: behaviour === 'queen-player' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }} >
                <span className=' w-full h-full flex justify-center items-center rounded' >
                    <Image
                        src={botsInfo.get('queen-player')?.image || human_pp}
                        alt="Picture of the author"
                        width={150}
                        height={150}
                        // blurDataURL="data:..." automatically provided
                        placeholder="blur" // Optional blur-up while loading
                    />
                </span>
            </div>
            <div onClick={() => {setBehaviour('castle-destroyer')}} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer rounded border-4' style={{borderColor: behaviour === 'castle-destroyer' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <span className=' w-full h-full flex justify-center items-center rounded' >
                    <Image
                        src={botsInfo.get('castle-destroyer')?.image || human_pp}
                        alt="Picture of the author"
                        width={150}
                        height={150}
                        // blurDataURL="data:..." automatically provided
                        placeholder="blur" // Optional blur-up while loading
                    />
                </span>
            </div>
            <div onClick={() => {setBehaviour('chessable-master')}} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer rounded border-4' style={{borderColor: behaviour === 'chessable-master' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <span className=' w-full h-full flex justify-center items-center rounded' >
                    <Image
                        src={botsInfo.get('chessable-master')?.image || human_pp}
                        alt="Picture of the author"
                        width={150}
                        height={150}
                        // blurDataURL="data:..." automatically provided
                        placeholder="blur" // Optional blur-up while loading
                    />
                </span>
            </div>
            <div onClick={() => {setBehaviour('auto-didacte')}} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer rounded border-4' style={{borderColor: behaviour === 'auto-didacte' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <span className=' w-full h-full flex justify-center items-center rounded' >
                    <Image
                        src={botsInfo.get('auto-didacte')?.image || human_pp}
                        alt="Picture of the author"
                        width={150}
                        height={150}
                        // blurDataURL="data:..." automatically provided
                        placeholder="blur" // Optional blur-up while loading
                        />
                </span>
            </div>
            <div onClick={() => {setBehaviour('random-player')}} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer rounded border-4' style={{borderColor: behaviour === 'random-player' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <span className=' w-full h-full flex justify-center items-center rounded' >
                    <Image
                        src={botsInfo.get('random-player')?.image || human_pp}
                        alt="Picture of the author"
                        width={150}
                        height={150}
                        // blurDataURL="data:..." automatically provided
                        placeholder="blur" // Optional blur-up while loading
                    />
                </span>
            </div>
            <div onClick={() => {setBehaviour('semi-random')}} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer rounded border-4' style={{borderColor: behaviour === 'semi-random' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <span className=' w-full h-full flex justify-center items-center rounded' >
                    <Image
                        src={botsInfo.get('semi-random')?.image || human_pp}
                        alt="Picture of the author"
                        width={150}
                        height={150}
                        // blurDataURL="data:..." automatically provided
                        placeholder="blur" // Optional blur-up while loading
                        />
                </span>
            </div>
            <div onClick={() => {setBehaviour('fianchetto-sniper')}} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer rounded border-4' style={{borderColor: behaviour === 'fianchetto-sniper' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <span className=' w-full h-full flex justify-center items-center rounded' >
                    <Image
                        src={botsInfo.get('fianchetto-sniper')?.image || human_pp}
                        alt="Picture of the author"
                        width={150}
                        height={150}
                        // blurDataURL="data:..." automatically provided
                        placeholder="blur" // Optional blur-up while loading
                    />
                </span>
            </div>
            <div onClick={() => {setBehaviour('botez-gambit')}} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer rounded border-4' style={{borderColor: behaviour === 'botez-gambit' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }} >
                <span className=' w-full h-full flex justify-center items-center rounded' >
                    <Image
                        src={botsInfo.get('botez-gambit')?.image || human_pp}
                        alt="Picture of the author"
                        width={150}
                        height={150}
                        // blurDataURL="data:..." automatically provided
                        placeholder="blur" // Optional blur-up while loading
                    />
                </span>
            </div>
            <div onClick={() => {setBehaviour('copycat')}} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer rounded border-4' style={{borderColor: behaviour === 'copycat' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <span className=' w-full h-full flex justify-center items-center rounded' >
                    <Image
                        src={botsInfo.get('copycat')?.image || human_pp}
                        alt="Picture of the author"
                        width={150}
                        height={150}
                        // blurDataURL="data:..." automatically provided
                        placeholder="blur" // Optional blur-up while loading
                    />
                </span>
            </div>
            <div onClick={() => {setBehaviour('bongcloud')}} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer rounded border-4' style={{borderColor: behaviour === 'bongcloud' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }} >
                <span className=' w-full h-full flex justify-center items-center rounded' >
                    <Image
                        src={botsInfo.get('bongcloud')?.image || human_pp}
                        alt="Picture of the author"
                        width={150}
                        height={150}
                        // blurDataURL="data:..." automatically provided
                        placeholder="blur" // Optional blur-up while loading
                    />
                </span>
            </div>
            <div onClick={() => {setBehaviour('gambit-fanatic')}} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer rounded border-4' style={{borderColor: behaviour === 'gambit-fanatic' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }} >
                <span className=' w-full h-full flex justify-center items-center rounded' >
                    <Image
                        src={botsInfo.get('gambit-fanatic')?.image || human_pp}
                        alt="Picture of the author"
                        width={150}
                        height={150}
                        // blurDataURL="data:..." automatically provided
                        placeholder="blur" // Optional blur-up while loading
                    />
                </span>
            </div>
            <div onClick={() => {setBehaviour('cow-lover')}} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer rounded border-4' style={{borderColor: behaviour === 'cow-lover' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <span className=' w-full h-full flex justify-center items-center rounded' >
                    <Image
                        src={botsInfo.get('cow-lover')?.image || human_pp}
                        alt="Picture of the author"
                        width={150}
                        height={150}
                        // blurDataURL="data:..." automatically provided
                        placeholder="blur" // Optional blur-up while loading
                    />
                </span>
            </div>
            <div onClick={() => {setBehaviour('indian-king')}} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer rounded border-4' style={{borderColor: behaviour === 'indian-king' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <span className=' w-full h-full flex justify-center items-center rounded' >
                    <Image
                        src={botsInfo.get('indian-king')?.image || human_pp}
                        alt="Picture of the author"
                        width={150}
                        height={150}
                        // blurDataURL="data:..." automatically provided
                        placeholder="blur" // Optional blur-up while loading
                    />
                </span>
            </div>
            <div onClick={() => {setBehaviour('stonewall')}} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer rounded border-4' style={{borderColor: behaviour === 'stonewall' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <span className=' w-full h-full flex justify-center items-center rounded' >
                    <Image
                        src={botsInfo.get('stonewall')?.image || human_pp}
                        alt="Picture of the author"
                        width={150}
                        height={150}
                        // blurDataURL="data:..." automatically provided
                        placeholder="blur" // Optional blur-up while loading
                    />
                </span>
            </div>
            <div onClick={() => {setBehaviour('dragon')}} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer rounded border-4' style={{borderColor: behaviour === 'dragon' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <span className=' w-full h-full flex justify-center items-center rounded' >
                    <Image
                        src={botsInfo.get('dragon')?.image || human_pp}
                        alt="Picture of the author"
                        width={150}
                        height={150}
                        // blurDataURL="data:..." automatically provided
                        placeholder="blur" // Optional blur-up while loading
                    />
                </span>
            </div>
            <div onClick={() => {setBehaviour('caro-london')}} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer rounded border-4' style={{borderColor: behaviour === 'caro-london' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <span className=' w-full h-full flex justify-center items-center rounded' >
                    <Image
                        src={botsInfo.get('caro-london')?.image || human_pp}
                        alt="Picture of the author"
                        width={150}
                        height={150}
                        // blurDataURL="data:..." automatically provided
                        placeholder="blur" // Optional blur-up while loading
                    />
                </span>
            </div>
            <div onClick={() => {setBehaviour('homemade-engine')}} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer rounded border-4' style={{borderColor: behaviour === 'homemade-engine' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <span className=' w-full h-full flex justify-center items-center rounded' >
                    <Image
                        src={botsInfo.get('homemade-engine')?.image || human_pp}
                        alt="homemade engine"
                        width={150}
                        height={150}
                        // blurDataURL="data:..." automatically provided
                        placeholder="blur" // Optional blur-up while loading
                    />
                </span>
            </div>
        </div>

    const timeControlComponent =
        <div className='flex mt-10 flex-row justify-around items-center flex-wrap w-full' >
            <div onClick={() => setTimeControl('1+0')} className=' h-[150px] md:h-[110px] w-[150px] md:w-[110px] flex flex-col justify-center items-center cursor-pointer' style={{color: timeControl === '1+0' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <GiBulletBill size={100} />
                <span className=' w-full h-[10px] flex justify-center items-center' >1+0</span>
            </div>
            <div onClick={() => setTimeControl('3+0')} className=' h-[150px] md:h-[110px] w-[150px] md:w-[110px] flex flex-col justify-center items-center cursor-pointer' style={{color: timeControl === '3+0' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <SiStackblitz size={100} />
                <span className=' w-full h-[10px] flex justify-center items-center' >3+0</span>
            </div>
            <div onClick={() => setTimeControl('3+2')} className=' h-[150px] md:h-[110px] w-[150px] md:w-[110px] flex flex-col justify-center items-center cursor-pointer' style={{color: timeControl === '3+2' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <SiStackblitz size={100} />
                <span className=' w-full h-[10px] flex justify-center items-center' >3+2</span>
            </div>
            <div onClick={() => setTimeControl('10+0')} className=' h-[150px] md:h-[110px] w-[150px] md:w-[110px] flex flex-col justify-center items-center cursor-pointer' style={{color: timeControl === '10+0' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <LuAlarmClock size={100} />
                <span className=' w-full h-[10px] flex justify-center items-center' >10+0</span>
            </div>
            <div onClick={() => setTimeControl('15+10')} className=' h-[150px] md:h-[110px] w-[150px] md:w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: timeControl === '15+10' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <LuAlarmClock size={100} />
                <span className=' w-full h-[10px] flex justify-center items-center' >15+10</span>
            </div>
            <div onClick={() => setTimeControl('30+20')} className=' h-[150px] md:h-[110px] w-[150px] md:w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: timeControl === '30+20' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <LuAlarmClock size={100} />
                <span className=' w-full h-[10px] flex justify-center items-center' >30+20</span>
            </div>
            <div onClick={() => setTimeControl('90+30')} className=' h-[150px] md:h-[110px] w-[150px] md:w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: timeControl === '90+30' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <IoHourglassOutline size={100} />
                <span className=' w-full h-[10px] flex justify-center items-center' >90+30</span>
            </div>
            <div onClick={() => setTimeControl('infinite')} className=' h-[150px] md:h-[110px] w-[150px] md:w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: timeControl === 'infinite' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <IoInfiniteSharp size={100} />
                <span className=' w-full h-[10px] flex justify-center items-center' >Infini</span>
            </div>
        </div>

    const fenComponent =
        <div className='flex mt-10 flex-row justify-around items-center flex-wrap w-full' >
            <input className='w-4/5 md:w-1/2' type='text' placeholder='fen de la position de départ' value={startingFen} onChange={(e) => setStartingFen(e.target.value)} />
        </div>


    return (
        <div className="flex flex-col justify-start items-center bg-slate-800 h-[95vh] w-full overflow-auto" >
            {botInfosComponent}
            {botsBehavioursComponent}
            <div className=' w-full md:pl-10 flex justify-center md:justify-start items-center text-2xl font-semibold text-white mt-5 mb-2' >Difficulté:</div>
            {difficultyComponent}
            <div className=' w-full mt-20 md:pl-10 flex justify-center md:justify-start items-center text-2xl font-semibold text-white' >Cadence:</div>
            {timeControlComponent}
            <div className=' w-full mt-20 md:pl-10 flex justify-center md:justify-start items-center text-2xl font-semibold text-white' >Position de départ:</div>
            {fenComponent}
            <Link
                className=' text-white hover:text-cyan-400 cursor-pointer text-3xl font-bold my-20 '
                href = {{
                pathname: '/test-ai',
                query: {
                    elo: elo,
                    behaviour: behaviour,
                    timeControl: timeControl,
                    startingFen: startingFen,
                }
                }}
            >
                Jouer
            </Link>
        </div>
    )
}

export default SelectTestAI;