'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

import modeClassicalImg from "@/public/GameModes_icons/gamemode_classical.jpg";
import modeSpeedrunImg from "@/public/GameModes_icons/gamemode_speedrun.jpg";
import modeThematicImg from "@/public/GameModes_icons/gamemode_thematic-training.jpg";
import modeHandBrainImg from "@/public/GameModes_icons/gamemode_hand-and-brain.jpg";
import modeBotVsBotImg from "@/public/GameModes_icons/gamemode_bot-vs-bot.jpg";
import modeTestAiImg from "@/public/GameModes_icons/gamemode_test-ai.jpg";
import modeAnalysisImg from "@/public/GameModes_icons/gamemode_analysis.jpg";

/*TODO: Choix difficulté: [
    'Beginner': pawnIcon, 
    'Casual': knightIcon, 
    'Intermediate': bishopIcon,
    'Advanced': rookIcon,
    'Master': queenIcon,
    'Maximum': kingIcon,
    ] */

// TODO: Liste des bots

const SelectGameModePage = () => {


    return (
        <div className="flex flex-row justify-around items-center text-3xl font-semibold bg-slate-800 h-[95vh] w-full flex-wrap overflow-auto gap-10 p-5" >
            <Link className=' text-white h-24 md:h-40 w-full md:w-2/5 overflow-hidden hover:border-cyan-400 hover:shadow-[0_0_2px_#fff,inset_0_0_2px_#fff,0_0_5px_#08f,0_0_15px_#08f,0_0_30px_#08f] cursor-pointer flex justify-start items-start' href={{pathname: '/select-bot'}} >
                <Image
                    src={modeClassicalImg}
                    alt="Classical chess mode icon"
                    width={160}
                    height={160}
                    // blurDataURL="data:..." automatically provided
                    placeholder="blur" // Optional blur-up while loading
                    className='hidden md:flex rounded'
                />
                <Image
                    src={modeClassicalImg}
                    alt="Classical chess mode icon"
                    width={95}
                    height={95}
                    // blurDataURL="data:..." automatically provided
                    placeholder="blur" // Optional blur-up while loading
                    className='flex md:hidden rounded'
                />
                <div className='flex flex-col justify-start items-start px-3 md:pt-5 gap-2'>
                    <p className=' text-xl md:text-3xl text-cyan-300' >Classique</p>
                    <p className=' text-sm md:text-base overflow-y-auto no-scrollbar' >
                        Jouez une partie contre un bot de votre choix.
                    </p>
                </div>
            </Link>
            <Link className=' text-white h-24 md:h-40 w-full md:w-2/5 overflow-hidden hover:border-cyan-400 hover:shadow-[0_0_2px_#fff,inset_0_0_2px_#fff,0_0_5px_#08f,0_0_15px_#08f,0_0_30px_#08f] cursor-pointer flex justify-start items-start' href={{pathname: '/select-speedrun'}} >
                <Image
                    src={modeSpeedrunImg}
                    alt="Speedrun chess mode icon"
                    width={160}
                    height={160}
                    // blurDataURL="data:..." automatically provided
                    placeholder="blur" // Optional blur-up while loading
                    className='hidden md:flex rounded'
                />
                <Image
                    src={modeSpeedrunImg}
                    alt="Speedrun chess mode icon"
                    width={95}
                    height={95}
                    // blurDataURL="data:..." automatically provided
                    placeholder="blur" // Optional blur-up while loading
                    className='flex md:hidden rounded'
                />
                <div className='flex flex-col justify-start items-start px-3 md:pt-5 gap-2'>
                    <p className=' text-xl md:text-3xl text-cyan-300' >Speedrun</p>
                    <p className=' text-sm md:text-base overflow-y-auto no-scrollbar' >
                        Enchainez les parties contre des bots aléatoires dans un intervalle Élo choisi.
                    </p>
                </div>
            </Link>
            <Link className=' text-white h-24 md:h-40 w-full md:w-2/5 overflow-hidden hover:border-cyan-400 hover:shadow-[0_0_2px_#fff,inset_0_0_2px_#fff,0_0_5px_#08f,0_0_15px_#08f,0_0_30px_#08f] cursor-pointer flex justify-start items-start' href={{pathname: '/select-hand-and-brain'}} >
                <Image
                    src={modeHandBrainImg}
                    alt="Hand & Brain chess mode icon"
                    width={160}
                    height={160}
                    // blurDataURL="data:..." automatically provided
                    placeholder="blur" // Optional blur-up while loading
                    className='hidden md:flex rounded'
                />
                <Image
                    src={modeHandBrainImg}
                    alt="Hand & Brain chess mode icon"
                    width={95}
                    height={95}
                    // blurDataURL="data:..." automatically provided
                    placeholder="blur" // Optional blur-up while loading
                    className='flex md:hidden rounded'
                />
                <div className='flex flex-col justify-start items-start px-3 md:pt-5 gap-2'>
                    <p className=' text-xl md:text-3xl text-cyan-300' >Hand & Brain</p>
                    <p className=' text-sm md:text-base overflow-y-auto no-scrollbar' >
                        Le "cerveau" choisi la pièce et la "main" doit trouver le meilleur coup avec la pièce donnée.
                    </p>
                </div>
            </Link>
            <Link className=' text-white h-24 md:h-40 w-full md:w-2/5 overflow-hidden hover:border-cyan-400 hover:shadow-[0_0_2px_#fff,inset_0_0_2px_#fff,0_0_5px_#08f,0_0_15px_#08f,0_0_30px_#08f] cursor-pointer flex justify-start items-start' href={{pathname: '/select-thematic-training'}} >
                <Image
                    src={modeThematicImg}
                    alt="Thematic Training chess mode icon"
                    width={160}
                    height={160}
                    // blurDataURL="data:..." automatically provided
                    placeholder="blur" // Optional blur-up while loading
                    className='hidden md:flex rounded'
                />
                <Image
                    src={modeThematicImg}
                    alt="Thematic Training chess mode icon"
                    width={95}
                    height={95}
                    // blurDataURL="data:..." automatically provided
                    placeholder="blur" // Optional blur-up while loading
                    className='flex md:hidden rounded'
                />
                <div className='flex flex-col justify-start items-start h-full px-3 md:pt-5 gap-2'>
                    <p className=' text-base md:text-3xl text-cyan-300' >Entraînement Thématique</p>
                    <p className=' text-sm md:text-base overflow-y-auto no-scrollbar' >
                        {`Jouez contre Stockfish 16 des positions prédéfinies selon 3 thèmes:\n\n
                        Attaque, Défense, Finales`}
                    </p>
                </div>
            </Link>
            <Link className=' text-white h-24 md:h-40 w-full md:w-2/5 overflow-hidden hover:border-cyan-400 hover:shadow-[0_0_2px_#fff,inset_0_0_2px_#fff,0_0_5px_#08f,0_0_15px_#08f,0_0_30px_#08f] cursor-pointer flex justify-start items-start' href={{pathname: '/select-bot-vs-bot'}} >
                <Image
                    src={modeBotVsBotImg}
                    alt="Bot VS Bot chess mode icon"
                    width={160}
                    height={160}
                    // blurDataURL="data:..." automatically provided
                    placeholder="blur" // Optional blur-up while loading
                    className='hidden md:flex rounded'
                />
                <Image
                    src={modeBotVsBotImg}
                    alt="Bot VS Bot chess mode icon"
                    width={95}
                    height={95}
                    // blurDataURL="data:..." automatically provided
                    placeholder="blur" // Optional blur-up while loading
                    className='flex md:hidden rounded'
                />
                <div className='flex flex-col justify-start items-start px-3 md:pt-5 gap-2'>
                    <p className=' text-xl md:text-3xl text-cyan-300' >Bot VS Bot</p>
                    <p className=' text-sm md:text-base overflow-y-auto no-scrollbar' >
                        Faites se combattre deux bots de votre choix l'un contre l'autre.
                    </p>
                </div>
            </Link>
            {/* <Link className=' text-white h-24 md:h-40 w-full md:w-2/5 overflow-hidden hover:border-cyan-400 hover:shadow-[0_0_2px_#fff,inset_0_0_2px_#fff,0_0_5px_#08f,0_0_15px_#08f,0_0_30px_#08f] cursor-pointer flex justify-start items-start' href={{pathname: '/select-test-ai'}} >
                <Image
                    src={modeTestAiImg}
                    alt="IA Lab chess mode icon"
                    width={160}
                    height={160}
                    // blurDataURL="data:..." automatically provided
                    placeholder="blur" // Optional blur-up while loading
                    className='hidden md:flex rounded'
                />
                <Image
                    src={modeTestAiImg}
                    alt="IA Lab chess mode icon"
                    width={95}
                    height={95}
                    // blurDataURL="data:..." automatically provided
                    placeholder="blur" // Optional blur-up while loading
                    className='flex md:hidden rounded'
                />
                <div className='flex flex-col justify-start items-start px-3 md:pt-5 gap-2'>
                    <p className=' text-xl md:text-3xl text-cyan-300' >IA Lab</p>
                    <p className=' text-sm md:text-base overflow-y-auto no-scrollbar' >
                        Mode pour comprendre comment l'IA du bot fait pour trouver le prochain coup.
                    </p>
                </div>
            </Link> */}
            <Link className=' text-white h-24 md:h-40 w-full md:w-2/5 overflow-hidden hover:border-cyan-400 hover:shadow-[0_0_2px_#fff,inset_0_0_2px_#fff,0_0_5px_#08f,0_0_15px_#08f,0_0_30px_#08f] cursor-pointer flex justify-start items-start' href={{pathname: '/select-analysis'}} >
                <Image
                    src={modeAnalysisImg}
                    alt="Analysis chess mode icon"
                    width={160}
                    height={160}
                    // blurDataURL="data:..." automatically provided
                    placeholder="blur" // Optional blur-up while loading
                    className='hidden md:flex rounded'
                />
                <Image
                    src={modeAnalysisImg}
                    alt="Analysis chess mode icon"
                    width={95}
                    height={95}
                    // blurDataURL="data:..." automatically provided
                    placeholder="blur" // Optional blur-up while loading
                    className='flex md:hidden rounded'
                />
                <div className='flex flex-col justify-start items-start px-3 md:pt-5 gap-2'>
                    <p className=' text-xl md:text-3xl text-cyan-300' >Analyse de partie</p>
                    <p className=' text-sm md:text-base overflow-y-auto no-scrollbar' >
                        Analysez vos parties, trouvez vos erreurs et regardez quels auraient étés les meilleurs coups.
                    </p>
                </div>
            </Link>
        </div>
    )
}

export default SelectGameModePage;