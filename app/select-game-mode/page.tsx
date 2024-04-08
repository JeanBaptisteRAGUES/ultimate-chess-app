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
        <div className="flex flex-col justify-center items-center text-3xl font-semibold bg-cyan-900 h-screen w-full overflow-auto gap-5" >
            <Link className=' text-cyan-500 hover:text-cyan-300 cursor-pointer' href={{pathname: '/select-bot'}} >Classique</Link>
            <Link className=' text-cyan-500 hover:text-cyan-300 cursor-pointer' href={{pathname: '/select-hand-and-brain'}} >Hand & Brain</Link>
        </div>
    )
}

export default SelectGameModePage;