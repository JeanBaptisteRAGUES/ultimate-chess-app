'use client'

import React, { useState } from 'react';
import Image, { StaticImageData } from 'next/image';
import { Behaviour, botsInfo } from '../bots-ai/BotsAI';
import Link from 'next/link';
import { FaHandFist } from 'react-icons/fa6';
import  { GiBrain } from 'react-icons/gi';
import { SiLichess } from 'react-icons/si';
//import { SiChessdotcom } from 'react-icons/si';
import { FaChessPawn } from 'react-icons/fa';

import stockfishOnly_pp from "@/public/Bots_images/chess3d_stockfish-only.jpg";

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
    const [allyElo, setAllyElo] = useState(2600);
    const [opponentElo, setOpponentElo] = useState(2600);
    const [behaviour, setBehaviour] = useState<Behaviour>('stockfish-only');

    const botInfosComponent = 
        <div className='flex flex-row justify-around items-center flex-wrap gap-2 py-5 w-full bg-slate-800 sticky top-0 left-0 right-0' >
            <p className='w-full md:w-1/2 flex justify-center items-center text-xl font-semibold text-white'>Jouer avec un alié de {allyElo} Élo contre..</p>
            <span className=' w-full md:w-1/2 flex justify-center items-center rounded' >
                <Image
                    src={botsInfo.get(behaviour)?.image || stockfishOnly_pp}
                    alt="Picture of the author"
                    width={150}
                    height={150}
                    // blurDataURL="data:..." automatically provided
                    placeholder="blur" // Optional blur-up while loading
                />
            </span>
            <p className='w-full md:w-1/2 flex justify-center items-center text-lg font-semibold text-white'>{botsInfo.get(behaviour)?.name + ' (' + opponentElo + ')'}</p>
            <p className='w-full md:w-1/2 flex justify-center items-center mx-5 text-md font-normal text-white'>{botsInfo.get(behaviour)?.description}</p>
        </div>

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
            <div onClick={() => setAllyElo(400)} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: allyElo === 400 ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <div className=' h-[90px] w-full text-8xl flex justify-center items-center' >♙</div>
                <span className=' w-full h-[10px] flex justify-center items-center' >Beginner</span>
            </div>
            <div onClick={() => setAllyElo(1000)} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: allyElo === 1000 ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <div className=' h-[90px] w-full text-8xl flex justify-center items-center' >♘</div>
                <span className=' w-full h-[10px] flex justify-center items-center' >Casual</span>
            </div>
            <div onClick={() => setAllyElo(1500)} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: allyElo === 1500 ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <div className=' h-[90px] w-full text-8xl flex justify-center items-center' >♗</div>
                <span className=' w-full h-[10px] flex justify-center items-center' >Intermediate</span>
            </div>
            <div onClick={() => setAllyElo(2000)} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: allyElo === 2000 ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }} >
                <div className=' h-[90px] w-full text-8xl flex justify-center items-center' >♖</div>
                <span className=' w-full h-[10px] flex justify-center items-center' >Advanced</span>
            </div>
            <div onClick={() => setAllyElo(2600)} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: allyElo === 2600 ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }} >
                <div className=' h-[90px] w-full text-8xl flex justify-center items-center' >♕</div>
                <span className=' w-full h-[10px] flex justify-center items-center' >Master</span>
            </div>
            <div onClick={() => setAllyElo(3200)} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: allyElo === 3200 ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <div className=' h-[90px] w-full text-8xl flex justify-center items-center' >♔</div>
                <span className=' w-full h-[10px] flex justify-center items-center' >Maximum</span>
            </div>
        </div>

    const difficultyComponent =
        <div className='flex flex-row justify-around items-center flex-wrap w-full' >
            <div onClick={() => setOpponentElo(400)} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: opponentElo === 400 ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <div className=' h-[90px] w-full text-8xl flex justify-center items-center' >♙</div>
                <span className=' w-full h-[10px] flex justify-center items-center' >Beginner</span>
            </div>
            <div onClick={() => setOpponentElo(1000)} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: opponentElo === 1000 ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <div className=' h-[90px] w-full text-8xl flex justify-center items-center' >♘</div>
                <span className=' w-full h-[10px] flex justify-center items-center' >Casual</span>
            </div>
            <div onClick={() => setOpponentElo(1500)} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: opponentElo === 1500 ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <div className=' h-[90px] w-full text-8xl flex justify-center items-center' >♗</div>
                <span className=' w-full h-[10px] flex justify-center items-center' >Intermediate</span>
            </div>
            <div onClick={() => setOpponentElo(2000)} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: opponentElo === 2000 ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }} >
                <div className=' h-[90px] w-full text-8xl flex justify-center items-center' >♖</div>
                <span className=' w-full h-[10px] flex justify-center items-center' >Advanced</span>
            </div>
            <div onClick={() => setOpponentElo(2600)} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: opponentElo === 2600 ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }} >
                <div className=' h-[90px] w-full text-8xl flex justify-center items-center' >♕</div>
                <span className=' w-full h-[10px] flex justify-center items-center' >Master</span>
            </div>
            <div onClick={() => setOpponentElo(3200)} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: opponentElo === 3200 ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <div className=' h-[90px] w-full text-8xl flex justify-center items-center' >♔</div>
                <span className=' w-full h-[10px] flex justify-center items-center' >Maximum</span>
            </div>
        </div>

    const behaviourComponent = 
        <div className='flex flex-row justify-around items-center flex-wrap w-full mt-2 px-2 gap-2' >
            {
                [...botsInfo.keys()].map(botBehaviour => {
                    return ( 
                        <div key={botBehaviour} onClick={() => setBehaviour(botBehaviour)} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer rounded border-4' style={{borderColor: behaviour === botBehaviour ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                            <span className=' w-full h-full flex justify-center items-center rounded' >
                                <Image
                                    src={botsInfo.get(botBehaviour)?.image || stockfishOnly_pp}
                                    alt="Picture of the author"
                                    width={150}
                                    height={150}
                                    // blurDataURL="data:..." automatically provided
                                    placeholder="blur" // Optional blur-up while loading
                                />
                            </span>
                        </div>
                    )
                })
            }
        </div>


    return (
        <div className="flex flex-col justify-start items-center bg-slate-800 h-[95vh] w-full overflow-auto" >
            {botInfosComponent}
            <div className=' w-full mt-5 mb-2 md:ml-10 flex justify-center md:justify-start items-center text-2xl font-semibold text-white' >Jouer en tant que:</div>
            {playerRoleComponent}
            <div className=' w-full md:ml-10 flex justify-center md:justify-start items-center text-2xl font-semibold text-white' >Niveau de votre équipier:</div>
            {allyRatingComponent}
            <div className=' w-full md:ml-10 flex justify-center md:justify-start items-center text-2xl font-semibold text-white' >Difficulté:</div>
            {difficultyComponent}
            <div className=' w-full mt-20 md:ml-10 flex justify-center md:justify-start items-center text-2xl font-semibold text-white' >Adversaire:</div>
            {behaviourComponent}
            <Link
                className=' text-white hover:text-cyan-400 cursor-pointer text-3xl font-bold my-20 '
                href = {{
                pathname: '/hand-and-brain',
                query: {
                    playerRole: playerRole,
                    allyElo: allyElo,
                    opponentElo: opponentElo,
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