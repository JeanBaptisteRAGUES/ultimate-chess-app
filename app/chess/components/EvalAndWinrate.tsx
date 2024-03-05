import React, { MutableRefObject, useEffect, useRef, useState } from 'react';
import Engine from '../engine/Engine';

interface EvalProps {
    game: any,
    winrate: any,
    winner: string,
    currentFen: string,
    showEval: boolean,
    gameActive: MutableRefObject<boolean>,
}

const EvalAndWinrate: React.FC<EvalProps> = ({game, winrate, winner, currentFen, showEval, gameActive}) => {
    const [engineEval, setEngineEval] = useState('0.3');
    const engine = useRef<Engine>();

    useEffect(() => {
        engine.current = new Engine();
        engine.current.init();
    }, []);


    useEffect(() => {
        if(winner || !engine.current) return;
        
        let coeff = game.history().length %2 === 0 ? 1 : -1;
        engine.current.evalPositionWithFen(game.fen(), 14, coeff).then((res: any) => {
            //console.log(res);
            setEngineEval(JSON.stringify(res.pv).replaceAll("\"", ''));
        }).catch((err: any) => {
            console.log(err);
        });
        /* engine.current.evalPositionWithBestMove(game.fen(), 14, coeff).then((res: any) => {
            console.log(res);
        }).catch((err: any) => {
            console.log(err);
        }) */
    }, [currentFen]);

    return (
        <div className=" h-20 w-full flex flex-col justify-center items-center">
            <div className=" text-white" >
                {showEval ? engineEval : '???'}
            </div>
            <div className=" h-5 w-52 flex flex-row">
                <div className="bg-white h-5 flex justify-center" style={{width: `${winrate.white}%`}} >{
                winrate.white >= 10 ? `${winrate.white}%` : "" 
                }</div>
                <div className=" bg-slate-500 h-5 flex justify-center" style={{width: `${winrate.draws}%`}} >{
                winrate.draws >= 10 ? `${winrate.draws}%` : "" 
                }</div>
                <div className="bg-black text-white h-5 flex justify-center" style={{width: `${winrate.black}%`}} >{
                winrate.black >= 10 ? `${winrate.black}%` : "" 
                }</div>
            </div>
        </div>
    )
};

export default EvalAndWinrate;