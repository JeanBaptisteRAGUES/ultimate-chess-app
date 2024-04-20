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
        <div className="flex flex-col justify-center items-center text-3xl font-semibold bg-cyan-900 h-[95vh] w-full overflow-auto gap-5" >
            <Link className=' text-white hover:text-cyan-300 cursor-pointer' href={{pathname: '/select-bot'}} >Classique</Link>
            <Link className=' text-white hover:text-cyan-300 cursor-pointer' href={{pathname: '/select-hand-and-brain'}} >Hand & Brain</Link>
            <Link className=' text-white hover:text-cyan-300 cursor-pointer' href={{pathname: '/select-thematic-training'}} >Entraînement Thématique</Link>
            <Link className=' text-white hover:text-cyan-300 cursor-pointer' href={{pathname: '/select-bot-vs-bot'}} >Bot VS Bot</Link>
        </div>
    )
}

export default SelectGameModePage;