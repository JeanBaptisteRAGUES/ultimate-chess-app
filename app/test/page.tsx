'use client'

import { useEffect, useRef, useState } from 'react';
import Engine from '../engine/Engine';
import GameToolBox from '../game-toolbox/GameToolbox';

const TestPage = () => {
    const engine = useRef<Engine>();
    const toolbox = new GameToolBox();
    const [test, setTest] = useState('Test');

    function listSpan() {
        const list = new Array(100);
        list.fill(Math.round(Math.random()*100));
        console.log(list);
        return list.map((el, i) => {
            const elt = <span>{el}</span>
            return <span key={i}> Élément n°{i} {elt} </span>
        })
    }

    const testDelay = () => {
        console.log('Changement de test');
        setTest(Math.round(Math.random()*100).toString());
    }

    const testButton = <button
        className=" bg-white border rounded cursor-pointer"
        onClick={() => testDelay()}
    >
            Test
    </button>
    
    
    return (
        <div className="flex flex-col gap-5 justify-center items-center bg-cyan-900 h-screen w-full overflow-auto" >
            <div className=" text-white font-bold" >{test}</div>
            <div className=' h-52 w-72 overflow-y-auto flex flex-row flex-wrap justify-start items-start gap-2' >{listSpan()}</div>
            {testButton}
        </div>
)
}

export default TestPage;