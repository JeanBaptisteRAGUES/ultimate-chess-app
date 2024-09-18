'use client'

import React from 'react';
import Link from 'next/link';

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
        <div className="flex flex-col justify-center items-center text-3xl font-semibold bg-cyan-900 h-[95vh] w-full flex-wrap overflow-auto gap-10" >
            <Link className=' text-white hover:text-cyan-300 cursor-pointer flex justify-center items-center' href={{pathname: '/select-bot'}} >Classique</Link>
            <Link className=' text-white hover:text-cyan-300 cursor-pointer flex justify-center items-center' href={{pathname: '/select-speedrun'}} >Speedrun</Link>
            <Link className=' text-white hover:text-cyan-300 cursor-pointer flex justify-center items-center' href={{pathname: '/select-hand-and-brain'}} >Hand & Brain</Link>
            <Link className=' text-white hover:text-cyan-300 cursor-pointer flex flex-wrap gap-2 justify-center items-center' href={{pathname: '/select-thematic-training'}} ><span>Entraînement </span> <span>Thématique</span></Link>
            <Link className=' text-white hover:text-cyan-300 cursor-pointer flex justify-center items-center' href={{pathname: '/select-bot-vs-bot'}} >Bot VS Bot</Link>
            <Link className=' text-white hover:text-cyan-300 cursor-pointer flex justify-center items-center' href={{pathname: '/select-test-ai'}} >Tester l'IA des bots</Link>
        </div>
    )
}

export default SelectGameModePage;