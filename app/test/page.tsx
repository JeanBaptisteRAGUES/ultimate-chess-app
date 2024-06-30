'use client'

import { useEffect, useRef, useState } from 'react';
import Engine from '../engine/Engine';
import GameToolBox from '../game-toolbox/GameToolbox';

const TestPage = () => {
    const engine = useRef<Engine>();
    const toolbox = new GameToolBox();
    const [test, setTest] = useState('Test');
    const monWorker = useRef<Worker>();

    useEffect(() => {
        monWorker.current = new Worker('worker1.js');
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
        let rand = Math.random()*100;

        if(rand < 60){
            console.log('Post message: Salut');
            monWorker.current.postMessage('Salut');
        }else{
            console.log('Post message: Erreur');
            monWorker.current.postMessage('Erreur');
        }

        monWorker.current.onmessage = function (e: any) {
            console.log(e.data);
            console.log('Réponse bien reçue !');
        }

        monWorker.current.onerror = function(e: any) {
            console.log('Le worker a rencontré un problème');
        }
    }

    const testButton = <button
        className=" bg-white border rounded cursor-pointer"
        onClick={() => testWorker()}
    >
            Test
    </button>
    
    
    return (
        <div className="flex flex-col gap-5 justify-center items-center bg-cyan-900 h-screen w-full overflow-auto" >
            <div className=" text-white font-bold" >{test}</div>
            {testButton}
        </div>
)
}

export default TestPage;