import React, { useEffect, useRef, useState } from 'react';

interface EvalProps {
    game: any,
    winrate: any,
    winner: string,
    currentFen: string,
    showEval: boolean,
    isGameOver: boolean
}

const EvalAndWinrate: React.FC<EvalProps> = ({game, winrate, winner, currentFen, showEval, isGameOver}) => {
    const [engineEval, setEngineEval] = useState('0.3');
    const evalRef = useRef();
    const evalRegex = /cp\s-?[0-9]*|mate\s-?[0-9]*/;
    const firstEvalMoveRegex = /pv\s[a-h][1-8]/;

    //TODO: Gros problème lors des game over, ne détecte pas le changement
    useEffect(() => {
        if(winner) return;
        if(isGameOver) return;
        //@ts-ignore
        evalRef.current = new Worker('stockfish.js#stockfish.wasm');

        //@ts-ignore
        evalRef.current.postMessage('uci');

        //@ts-ignore
        evalRef.current.onmessage = function(event: any) {
            console.log(isGameOver);
            if(winner) return;
            if(isGameOver) return;
            if(event.data === 'uciok'){
                //@ts-ignore
                evalRef.current.postMessage('setoption name MultiPV value 1');
            }
        
            if((evalRegex.exec(event.data)) !== null){
                //@ts-ignore
                let evaluationStr: string = (evalRegex.exec(event.data)).toString();
                let firstMove = (event.data.match(firstEvalMoveRegex))[0].slice(-2);
                let coeff = game.get(firstMove).color === 'w' ? 1 : -1;
                const evaluationArr = evaluationStr.split(' ');
                if(evaluationArr[0] === 'mate') evaluationStr = '#' + coeff*(eval(evaluationArr[1]));
                if(evaluationArr[0] === 'cp') evaluationStr = (coeff*(eval(evaluationArr[1])/100)).toString();
                setEngineEval(evaluationStr);
            }
        }
    }, []);

    useEffect(() => {
        if(winner || isGameOver) return;
        //@ts-ignore
        evalRef.current.postMessage('stop');
        //@ts-ignore
        evalRef.current.postMessage(`position fen ${game.fen()}`);
        //@ts-ignore
        evalRef.current.postMessage('go depth 18');
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