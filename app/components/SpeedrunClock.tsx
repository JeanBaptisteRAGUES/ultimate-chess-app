/* eslint-disable react-hooks/exhaustive-deps */
import { Chess } from 'chess.js';
import React, { useEffect, useRef, useState } from 'react'

//TODO: gameActive == gameStarted ?
interface SpeedrunClockProps {
    gameActive: boolean,
}

const SpeedrunClock: React.FC<SpeedrunClockProps> = ({
    gameActive
}) => {
    const timeControlRef = useRef({
      startingTime: 0,
      timeElapsed: 0,
    });
    const [timestamp, setTimestamp] = useState('00:00:00');

    const updateTimers = () => {
        if(!gameActive) return;
        
        const newTimeControl = timeControlRef.current;
        newTimeControl.timeElapsed = newTimeControl.timeElapsed+1;
        const date = new Date((newTimeControl.timeElapsed)*1000);
        let minutes = date.getMinutes().toString();
        let seconds = date.getSeconds().toString();
        let hours = date.getUTCHours().toString();
        if(+seconds < 10) seconds = '0' + seconds;
        if(+minutes < 10) minutes = '0' + minutes;
        if(+hours < 10) hours = '0' + hours;
        setTimestamp(`${hours}:${minutes}:${seconds}`);
        timeControlRef.current = newTimeControl;
    }

    /* const addIncrement = () => {
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
    } */

    /* useEffect(() => {
        addIncrement();
        //console.log(`Add Increment (${clockColor === 'w' ? 'white' : 'black'}): ${timeControlRef.current.startingTime} - ${timeControlRef.current.timeElapsed} `);
    }, [turnColor, game]); */
  
    useEffect(() => {
        const newTimeControl = timeControlRef.current;
        newTimeControl.startingTime = 0;
        newTimeControl.timeElapsed = 0;
        const date = new Date((newTimeControl.startingTime - newTimeControl.timeElapsed)*1000);
        let seconds = date.getSeconds().toString();
        let minutes = date.getMinutes().toString();
        let hours = date.getUTCHours().toString();
        if(+seconds < 10) seconds = '0' + seconds;
        if(+minutes < 10) minutes = '0' + minutes;
        if(+hours < 10) hours = '0' + hours;
        setTimestamp(+hours > 0 ? `${hours}:${minutes}:${seconds}` : `${minutes}:${seconds}`);
        timeControlRef.current = newTimeControl;
        //console.log(`Set Time Control (${clockColor === 'w' ? 'white' : 'black'}): ${timeControlRef.current.startingTime} - ${timeControlRef.current.timeElapsed} `);
    }, []);
  
    useEffect(() => {
        //console.log('Check game started');
        if(!gameActive) return;
        //console.log("Set Interval !");
        
        const interval = setInterval(() => updateTimers(), 1000);

        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gameActive]);

    
    return (
        <div className=" flex justify-end items-center flex-grow" >
            <div className=" bg-slate-200 text-slate-900 py-1 px-2 rounded-sm">
                {timestamp}
            </div>
        </div>
    )
}

export default SpeedrunClock;