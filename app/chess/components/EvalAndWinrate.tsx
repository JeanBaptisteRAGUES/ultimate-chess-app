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
    //const evalRef = useRef();
    const evalRegex = /cp\s-?[0-9]*|mate\s-?[0-9]*/;
    const firstEvalMoveRegex = /pv\s[a-h][1-8]/;
    

    /* useEffect(() => {
        //if(winner) return;
        console.log('Can analyse');
        //if(!gameActive.current) return;
        //@ts-ignore
        evalRef.current = new Worker('stockfish.js#stockfish.wasm');

        //@ts-ignore
        evalRef.current.postMessage('uci');

        //@ts-ignore
        evalRef.current.onmessage = function(event: any) {
            if(event.data === 'uciok'){
                console.log('Eval uci ok');
                //@ts-ignore
                evalRef.current.postMessage('setoption name MultiPV value 1');
            }

            if(gameActive.current && (evalRegex.exec(event.data)) !== null){
                //console.log('Event data');
                //console.log(event.data);
                //@ts-ignore
                let evaluationStr: string = (evalRegex.exec(event.data)).toString();
                //console.log(event.data.match(firstEvalMoveRegex));
                if(!event.data.match(firstEvalMoveRegex)) return;
                let firstMove = (event.data.match(firstEvalMoveRegex))[0].slice(-2);
                let coeff = game.get(firstMove).color === 'w' ? 1 : -1;
                const evaluationArr = evaluationStr.split(' ');
                if(evaluationArr[0] === 'mate') evaluationStr = '#' + coeff*(eval(evaluationArr[1]));
                if(evaluationArr[0] === 'cp') evaluationStr = (coeff*(eval(evaluationArr[1])/100)).toString();
                setEngineEval(evaluationStr);
            }
        }
    }, []); */

    //TODO: Trouver un moyen de déclarer engine de façon définitive
    useEffect(() => {
        if(winner) return;
        const engine = new Engine();
        engine.init().then(() => {
            console.log('Can analyse');
            let coeff = game.pgn().length %2 === 0 ? 1 : -1;
            engine.evalPosition(game.fen(), 18, coeff).then((res) => {
                console.log(res);
                setEngineEval(JSON.stringify(res).replaceAll("\"", ''));
            }).catch((err) => {
                console.log(err);
            });
        })
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