/* eslint-disable react-hooks/exhaustive-deps */
import { Chess } from 'chess.js';
import React, { useEffect, useRef, useState } from 'react'

//TODO: gameActive == gameStarted ?
interface ClockProps {
    game: Chess,
    turnColor: string,
    clockColor: string,
    timeControl: string,
    timeControls: any,
    gameOver: (winner: string) => void,
    gameStarted: boolean,
    gameActive: any,
}

const Clock: React.FC<ClockProps> = ({
    game,
    turnColor,
    clockColor,
    timeControl,
    timeControls,
    gameOver,
    gameStarted,
    gameActive
}) => {
    const timeControlRef = useRef({
      startingTime: 600,
      increment: 0,
      timeElapsed: 0,
    });
    const [timestamp, setTimestamp] = useState('10:00');

    const updateTimers = () => {
        if(!gameStarted) return;
        if(!gameActive.current) return;
        
        //TODO: Faire une version plus précise en ms si ça marche
        if(game.turn() === clockColor){
            const newTimeControl = timeControlRef.current;
            //console.log(whiteTimeControl);
            newTimeControl.timeElapsed = newTimeControl.timeElapsed+1;
            const date = new Date((newTimeControl.startingTime - newTimeControl.timeElapsed)*1000);
            let minutes = date.getMinutes().toString();
            let seconds = date.getSeconds().toString();
            let hours = date.getUTCHours().toString();
            if(+seconds < 10) seconds = '0' + seconds;
            setTimestamp(+hours > 0 ? `${hours}:${minutes}:${seconds}` : `${minutes}:${seconds}`);
            timeControlRef.current = newTimeControl;
        }
        //setCount(Math.random()*1000000);
    }
  
    //TODO: ne marche pas
    const addIncrement = () => {
        if(timeControl !== 'infinite'){
            //console.log("Add increment");
            //Le joueur à qui est assigné l'horloge vient de jouer donc ce n'est plus son tour
            if(game.turn() === clockColor || game.history().length < 1) return ;

            const newTimeControl = timeControlRef.current;
            newTimeControl.timeElapsed-= timeControlRef.current.increment;
            const date = new Date((newTimeControl.startingTime - newTimeControl.timeElapsed)*1000);
            let minutes = date.getMinutes().toString();
            let seconds = date.getSeconds().toString();
            let hours = date.getUTCHours().toString();
            if(+seconds < 10) seconds = '0' + seconds;
            setTimestamp(+hours > 0 ? `${hours}:${minutes}:${seconds}` : `${minutes}:${seconds}`);
            timeControlRef.current = newTimeControl;
        }
    }

    useEffect(() => {
        addIncrement();
        //console.log(`Add Increment (${clockColor === 'w' ? 'white' : 'black'}): ${timeControlRef.current.startingTime} - ${timeControlRef.current.timeElapsed} `);
    }, [turnColor, game]);
  
    useEffect(() => {
        //console.log('Set Time Control !');
        if(timeControl === "infinite") return ;
        const newTimeControl = timeControlRef.current;

        //@ts-ignore
        newTimeControl.startingTime = timeControls.get(timeControl).startingTime;
        //@ts-ignore
        newTimeControl.increment = timeControls.get(timeControl)?.increment;
        newTimeControl.timeElapsed = 0;
        const dateWhite = new Date((newTimeControl.startingTime - newTimeControl.timeElapsed)*1000);
        let secondsWhite = dateWhite.getSeconds().toString();
        let minutesWhite = dateWhite.getMinutes().toString();
        let hoursWhite = dateWhite.getUTCHours().toString();
        if(+secondsWhite < 10) secondsWhite = '0' + secondsWhite;
        setTimestamp(+hoursWhite > 0 ? `${hoursWhite}:${minutesWhite}:${secondsWhite}` : `${minutesWhite}:${secondsWhite}`);
        timeControlRef.current = newTimeControl;
        //console.log(`Set Time Control (${clockColor === 'w' ? 'white' : 'black'}): ${timeControlRef.current.startingTime} - ${timeControlRef.current.timeElapsed} `);
    }, [timeControl, gameStarted]);
  
    useEffect(() => {
        //console.log('Check game started');
        if(!gameStarted) return;
        if(timeControl === 'infinite') return;
        //console.log("Set Interval !");
        
        const interval = setInterval(() => updateTimers(), 1000);

        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gameStarted, timeControl, game]);
  
    useEffect(() => {
        checkTimeout();
    }, [timestamp]);

    //TODO: Déclencher une callback qui permet de gérer le résultat directement depuis la page du mode de jeu
    function checkTimeout() {
        //console.log("Check Timeout")
        if(timeControlRef.current.startingTime - timeControlRef.current.timeElapsed <= 0){
            if(clockColor === 'w'){
                gameOver('b');
            } else {
                gameOver('w');
            }
            return ;
        }
    }

    
    return (
        timeControl !== 'infinite' ? <div className=" flex justify-end items-center flex-grow" >
            {
                clockColor === 'b' ?
                <div className=" bg-slate-900 text-slate-200 py-1 px-2 rounded-sm">
                    {timestamp}
                </div>
                :
                <div className=" bg-slate-200 text-slate-900 py-1 px-2 rounded-sm">
                    {timestamp}
                </div>
            }
        </div>
        :
        null
    )
}

export default Clock;