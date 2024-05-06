/* eslint-disable react-hooks/exhaustive-deps */
import React, { MutableRefObject, useEffect, useRef, useState } from 'react';
import Engine from '../engine/Engine';
import { Winrate, fetchLichessDatabase, getLichessWinrate } from '../libs/fetchLichess';
import GameToolBox from '../game-toolbox/GameToolbox';
import { Chess } from 'chess.js';

interface EvalProps {
    game: Chess,
    databaseRating: string,
    winner: string,
    startingFen: string,
    currentFen: string,
    movesList: string[],
    showEval: boolean,
}

const EvalAndWinrate: React.FC<EvalProps> = ({game, databaseRating, winner, startingFen, currentFen, movesList, showEval}) => {
    const engine = useRef<Engine>();
    const toolbox = new GameToolBox();
    const [engineEval, setEngineEval] = useState('0.3');
    const [winrate, setWinrate] = useState<Winrate>({
        white: 50,
        draws: 0,
        black: 50
      });

    useEffect(() => {
        engine.current = new Engine();
        engine.current.init();
    }, []);


    useEffect(() => {
        if(winner || !engine.current) return;
        //const movesList = toolbox.convertHistorySanToLan(toolbox.convertPgnToHistory(game.pgn()), startingFen);
        
        //let coeff = game.history().length %2 === 0 ? 1 : -1;
        
        engine.current.evalPositionFromFen(currentFen, 14).then((res: any) => {
            //TODO: voir si on peut pas directement retourner un résultat de type string
            setEngineEval(JSON.stringify(res.eval).replaceAll("\"", ''));
        }).catch((err: any) => {
            console.log("Erreur lors de l'évaluation de la position: " + err);
        });
        getLichessWinrate(movesList, databaseRating, startingFen).then((winrate) => {
            if(winrate.white) setWinrate(winrate);
        })
    }, [currentFen]);

    return (
        <div className=" h-20 w-full flex flex-col justify-center items-center my-5 md:my-0">
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