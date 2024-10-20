'use client'

import React, { useRef, useState } from 'react';
import MultiRangeSlider, { ChangeResult } from "multi-range-slider-react";
import Link from 'next/link';
import { GiBulletBill } from 'react-icons/gi';
import { SiStackblitz } from 'react-icons/si';
import { LuAlarmClock } from 'react-icons/lu';
import { IoHourglassOutline, IoInfiniteSharp } from 'react-icons/io5';
import { FaRegTrashAlt } from 'react-icons/fa'
import { Chess, Color, DEFAULT_POSITION } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { Piece, Square } from 'react-chessboard/dist/chessboard/types';

const SelectSpeedrun = () => {
    const gameWhite = useRef<Chess>(new Chess());
    const gameBlack = useRef<Chess>(new Chess());
    const [currentFenWhite, setCurrentFenWhite] = useState(DEFAULT_POSITION);
    const [currentFenBlack, setCurrentFenBlack] = useState(DEFAULT_POSITION);
    const [eloMin, setEloMin] = useState<number>(400);
    const [eloMax, setEloMax] = useState<number>(2000);
    const [eloStep, setEloStep] = useState<number>(10);
    const [timeControl, setTimeControl] = useState<string>('10+0');
    const [playerColor, setPlayerColor] = useState<string>('random');

    const setEloRange = (e: ChangeResult) => {
        setEloMin(e.minValue);
        setEloMax(e.maxValue);
    };

    const eloRangeComponent =
        <div className='flex flex-row justify-around items-center flex-wrap w-full' >
            <MultiRangeSlider
                className='w-full'
                label={true}
                ruler={false}
                min={0}
                max={3200}
                step={100}
                stepOnly={true}
                minValue={eloMin}
                maxValue={eloMax}
                barLeftColor={'black'}
                barRightColor={'black'}
                barInnerColor={'cyan'}
                thumbLeftColor={'cyan'}
                thumbRightColor={'cyan'}
                onInput={(e) => {
                    setEloRange(e);
                }}
            />
        </div>

    const eloStepComponent = 
        <div className='flex flex-row justify-around items-center flex-wrap w-full mt-2 px-2 gap-2' >
            <div onClick={() => setEloStep(10)} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: eloStep === 10 ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <span className=' w-full h-full flex justify-center items-center text-4xl font-bold text-center' >10</span>
            </div>
            <div onClick={() => setEloStep(20)} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: eloStep === 20 ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <span className=' w-full h-full flex justify-center items-center text-4xl font-bold text-center' >20</span>
            </div>
            <div onClick={() => setEloStep(50)} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: eloStep === 50 ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <span className=' w-full h-full flex justify-center items-center text-4xl font-bold text-center' >50</span>
            </div>
            <div onClick={() => setEloStep(100)} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: eloStep === 100 ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <span className=' w-full h-full flex justify-center items-center text-4xl font-bold text-center' >100</span>
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

    const playerColorComponent = 
        <div className='flex flex-row justify-around items-center flex-wrap w-full mt-2 px-2 gap-2' >
            <div onClick={() => setPlayerColor('random')} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: playerColor === 'random' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <span className=' w-full h-full flex justify-center items-center text-4xl font-bold text-center' >Random</span>
            </div>
            <div onClick={() => setPlayerColor('w')} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: playerColor === 'w' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <span className=' w-full h-full flex justify-center items-center text-4xl font-bold text-center' >White</span>
            </div>
            <div onClick={() => setPlayerColor('b')} className=' h-[110px] w-[110px] flex flex-col justify-start items-center cursor-pointer' style={{color: playerColor === 'b' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  >
                <span className=' w-full h-full flex justify-center items-center text-4xl font-bold text-center' >Black</span>
            </div>
        </div>


    function getPromotion(sourceSquare: Square, piece: Piece) {
        
        if(gameWhite.current.get(sourceSquare).type === 'p' && piece.charAt(1) !== 'P'){
            return piece.charAt(1).toLowerCase();
        }
        return '';
    }

    const gameMoveWhite = (moveNotation: string) => {
        gameWhite.current.move(moveNotation);
        setCurrentFenWhite(gameWhite.current.fen());
    }
    function onDropWhite(sourceSquare: Square, targetSquare: Square, piece: Piece) {
        const promotion = getPromotion(sourceSquare, piece);
        console.log(gameWhite.current.fen());
        console.log(currentFenWhite);

        gameMoveWhite(sourceSquare + targetSquare + promotion);
        console.log(gameWhite.current.fen());
        console.log(currentFenWhite);
        
        return true;
    }

    const gameMoveBlack = (moveNotation: string) => {
        gameBlack.current.move(moveNotation);
        setCurrentFenBlack(gameBlack.current.fen());
    }
    function onDropBlack(sourceSquare: Square, targetSquare: Square, piece: Piece) {
        const promotion = getPromotion(sourceSquare, piece);
        console.log(gameBlack.current.fen());

        gameMoveBlack(sourceSquare + targetSquare + promotion);
        
        return true;
    }

    const selectPositionWhite = 
        <div className='flex flex-col justify-around items-center flex-wrap w-full mt-2 px-2 gap-2' >
            <div className=' relative w-72 h-72 flex justify-center items-center'>
                <Chessboard 
                    id='selectPositionWhite'
                    position={currentFenWhite}
                    onPieceDrop={onDropWhite} 
                    boardOrientation='white'
                />
            </div>
            {
                currentFenWhite === DEFAULT_POSITION ?
                <FaRegTrashAlt size={25} className=' text-white' />
                :
                <FaRegTrashAlt size={25} className=' text-cyan-400 cursor-pointer' onClick={() => {setCurrentFenWhite(DEFAULT_POSITION); gameWhite.current.load(DEFAULT_POSITION);}} />
            }
        </div>

    const selectPositionBlack = 
        <div className='flex flex-col justify-around items-center flex-wrap w-full mt-2 px-2 gap-2' >
            <div className=' relative w-72 h-72 flex justify-center items-center'>
                <Chessboard 
                    id='selectPositionBlack'
                    position={currentFenBlack}
                    onPieceDrop={onDropBlack} 
                    boardOrientation='black'
                />
            </div>
            {
                currentFenBlack === DEFAULT_POSITION ?
                <FaRegTrashAlt size={25} className=' text-white' />
                :
                <FaRegTrashAlt size={25} className=' text-cyan-400 cursor-pointer' onClick={() => {setCurrentFenBlack(DEFAULT_POSITION); gameBlack.current.load(DEFAULT_POSITION);}} />
            }
        </div>
    


    return (
        <div className="flex flex-col justify-start items-center bg-slate-800 h-[95vh] w-full overflow-auto" >
            <div className=' w-full md:ml-10 flex justify-center md:justify-start items-center text-2xl font-semibold text-white mt-5 mb-2' >Interval Élo:</div>
            <div className=' w-full md:ml-10 flex justify-center md:justify-start items-center gap-5 text-xl font-semibold text-white mt-2 mb-2' >
                <span>Min: {eloMin}</span>  
                <span>Max: {eloMax}</span>
            </div>
            {eloRangeComponent}
            <div className=' w-full mt-20 md:ml-10 flex justify-center md:justify-start items-center text-2xl font-semibold text-white' >Incrément Élo:</div>
            {eloStepComponent}
            <div className=' w-full mt-20 md:ml-10 flex justify-center md:justify-start items-center text-2xl font-semibold text-white' >Cadence:</div>
            {timeControlComponent}
            <div className=' w-full mt-20 md:ml-10 flex justify-center md:justify-start items-center text-2xl font-semibold text-white' >Couleur:</div>
            {playerColorComponent}
            <div className=' w-full mt-20 md:ml-10 flex justify-center md:justify-start items-center text-2xl font-semibold text-white' >Position de départ (blancs):</div>
            {selectPositionWhite}
            <div className=' w-full mt-20 md:ml-10 flex justify-center md:justify-start items-center text-2xl font-semibold text-white' >Position de départ (noirs):</div>
            {selectPositionBlack}
            <Link
                className=' w-28 p-3 animate-pulse hover:animate-none hover:bg-cyan-200 flex justify-center items-center text-cyan-300 hover:text-cyan-400 text-3xl font-bold border-2 rounded-lg border-cyan-400 shadow-[0_0_2px_#fff,inset_0_0_2px_#fff,0_0_5px_#08f,0_0_15px_#08f,0_0_30px_#08f] cursor-pointer my-20'
                href = {{
                pathname: '/speedrun',
                query: {
                    eloMin: eloMin,
                    eloMax: eloMax,
                    eloStep: eloStep,
                    playerElo: eloMin,
                    timeControl: timeControl,
                    playerColor: playerColor,
                    startingPgnWhite: gameWhite.current.pgn(),
                    startingPgnBlack: gameBlack.current.pgn(),
                }
                }}
            >
                Jouer
            </Link>
        </div>
    )
}

export default SelectSpeedrun;