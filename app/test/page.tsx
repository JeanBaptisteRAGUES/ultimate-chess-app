'use client'

import { useEffect, useRef, useState } from 'react';
import Engine from '../engine/Engine';
import GameToolBox from '../game-toolbox/GameToolbox';
import WorkerClass from '../test-worker-class/WorkerClass';

const TestPage = () => {
    const engine = useRef<Engine>();
    const toolbox = new GameToolBox();
    const [test, setTest] = useState('Test');
    const monWorker = useRef<WorkerClass>();

    useEffect(() => {
        monWorker.current = new WorkerClass();
    }, []);
    

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

    const testWorker = () => {
        if(!monWorker.current) return ;
        monWorker.current.testWorker2().then(answer => {
            console.log(answer);
        })
    }

    const testButton = <button
        className=" bg-white border rounded cursor-pointer"
        onClick={() => testWorker()}
    >
            Test
    </button>
    
    
    return (
        <div className="flex flex-col gap-5 justify-center items-center bg-slate-800 h-screen w-full overflow-auto" >
            <div className=" text-white font-bold" >{test}</div>
            {testButton}
        </div>
)
}

export default TestPage;