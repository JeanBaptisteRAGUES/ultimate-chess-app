import React, { useEffect, useRef, useState } from 'react'

//TODO: gameActive == gameStarted ?
interface ClockProps {
    game: any,
    turnColor: string,
    clockColor: string,
    timeControl: string,
    timeControls: any,
    setEngineEval: (val: string) => void,
    setWinner: (val: string) => void,
    setShowGameoverWindow: (val: boolean) => void,
    setGameActive: (val: boolean) => void,
    gameActive: boolean,
    gameStarted: boolean,
}

const Clock: React.FC<ClockProps> = ({
    game,
    turnColor,
    clockColor,
    timeControl,
    timeControls,
    setEngineEval,
    setWinner,
    setShowGameoverWindow,
    setGameActive,
    gameActive,
    gameStarted
}) => {
    const timeControlRef = useRef({
      startingTime: 600,
      increment: 0,
      timeElapsed: 0,
    });
    const [timestamp, setTimestamp] = useState('10:00');

    const updateTimers = () => {
        if(!gameActive) return;
        //console.log('Update Timers !');
        //console.log(gameActive.current);
        //TODO: Faire une version plus précise en ms si ça marche
        if(turnColor === clockColor){
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
  
    const addIncrement = (gameTurn: string) => {
        if(timeControl !== 'infinite'){
            if(gameTurn === clockColor){
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
    }
  
    useEffect(() => {
        //console.log('Set Time Control !');
        if(timeControl === "infinite") return ;
        //console.log('Time Control : ' + timeControl);
        const newTimeControl = timeControlRef.current;

        //@ts-ignore
        newTimeControl.startingTime = timeControls.get(timeControl).startingTime;
        //@ts-ignore
        newTimeControl.increment = timeControls.get(timeControl)?.increment;
        const dateWhite = new Date((newTimeControl.startingTime - newTimeControl.timeElapsed)*1000);
        let secondsWhite = dateWhite.getSeconds().toString();
        let minutesWhite = dateWhite.getMinutes().toString();
        let hoursWhite = dateWhite.getUTCHours().toString();
        if(+secondsWhite < 10) secondsWhite = '0' + secondsWhite;
        setTimestamp(+hoursWhite > 0 ? `${hoursWhite}:${minutesWhite}:${secondsWhite}` : `${minutesWhite}:${secondsWhite}`);
        timeControlRef.current = newTimeControl;
    }, [timeControl]);
  
    useEffect(() => {
        if(!gameStarted) return;
        if(timeControl === 'infinite') return;
        console.log("Set Interval !");
        
        const interval = setInterval(() => updateTimers(), 1000);

        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gameStarted, timeControl, game]);
  
    useEffect(() => {
        checkTimeout();
    }, [timestamp]);

    function checkTimeout() {
        if(timeControlRef.current.startingTime - timeControlRef.current.timeElapsed <= 0){
            setEngineEval('0 - 1');
            setWinner('b');
            setShowGameoverWindow(true);
            //gameActive.current = false;
            //TODO: modifier gameActive en state
            setGameActive(false);
            return ;
        }
    }
    return (
        <div>Clock</div>
    )
}

export default Clock;