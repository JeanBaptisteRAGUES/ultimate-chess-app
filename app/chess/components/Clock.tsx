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
    gameStarted
}) => {
    const timeControlRef = useRef({
      startingTime: 600,
      increment: 0,
      timeElapsed: 0,
    });
    const [timestamp, setTimestamp] = useState('10:00');

    const updateTimers = () => {
        if(!gameStarted) return;
        //console.log('Update Timers !');
        //console.log("game.turn() : " + game.turn());
        //console.log("turnColor : " + turnColor);
        //console.log(gameActive.current);
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
    const addIncrement = (gameTurn: string) => {
        if(timeControl !== 'infinite'){
            //console.log("Add increment");
            //Le joueur à qui est assigné l'horloge vient de jouer donc ce n'est plus son tour
            if(game.turn() !== clockColor){
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
        //console.log('Test Add increment');
        addIncrement(turnColor)
    }, [turnColor, game]);
  
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

    //TODO: il faut faire en sorte de changer gameActive
    function checkTimeout() {
        //console.log("Check Timeout")
        if(timeControlRef.current.startingTime - timeControlRef.current.timeElapsed <= 0){
            setEngineEval('0 - 1');
            setWinner('b');
            setShowGameoverWindow(true);
            //gameActive.current = false;
            //TODO: modifier gameActive en state
            //setGameActive(false);
            return ;
        }
    }
    return (
        <div className=" flex justify-end items-center w-full" >
            {
                clockColor === 'b' ?
                <div className=" bg-slate-900 text-slate-200">
                    {timestamp}
                </div>
                :
                <div className=" bg-slate-200 text-slate-900">
                    {timestamp}
                </div>
            }
        </div>
    )
}

export default Clock;