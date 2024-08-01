/* eslint-disable react-hooks/exhaustive-deps */
import React, { MutableRefObject, useEffect, useRef, useState } from 'react';
import Engine, { EvalResultSimplified, FenEval } from '../engine/Engine';
import { Winrate, fetchLichessDatabase, getLichessWinrate } from '../libs/fetchLichess';
import GameToolBox from '../game-toolbox/GameToolbox';
import { Chess } from 'chess.js';

interface EvalProps {
    game: Chess,
    databaseRating: string,
    winner: string,
    startingFen: string,
    currentFen: string,
    fenEvalMap: Map<string, FenEval>,
    movesList: string[],
    showEval: boolean,
}

const EvalAndWinrate: React.FC<EvalProps> = ({game, databaseRating, winner, startingFen, currentFen, fenEvalMap, movesList, showEval}) => {
    const engine = useRef<Engine>();
    const engineCreated = useRef<Boolean>(false);
    const toolbox = new GameToolBox();
    const [engineEval, setEngineEval] = useState('0.3');
    const [winrate, setWinrate] = useState<Winrate>({
        white: 50,
        draws: 0,
        black: 50
      });

    useEffect(() => {
        console.log('Is engine already created ? ' + engineCreated.current);
        if(!engineCreated.current){
            console.log('Create Eval New Engine');
            engineCreated.current = true;
            engine.current = new Engine();
            engine.current.init();
            engine.current.showWinDrawLose();
        }
    }, []);

    function estimateWinrate(wdl: string[], fen: string): Winrate {
        console.log('Estimate Winrate');
        let sfWinrate: Winrate = {white: 0, draws: 0, black: 0};
        let isWhiteTurn = fen.includes(' w ') ? 1 : -1;
        let sfWhite = isWhiteTurn > 0 ? Math.round(eval(wdl[0])/10) || 0 : Math.round(eval(wdl[2])/10);
        let sfDraw = Math.round(eval(wdl[1])/10) || 0;
        let sfBlack = isWhiteTurn > 0 ? Math.round(eval(wdl[2])/10) || 0 : Math.round(eval(wdl[0])/10);
        //console.log(`sfWhite: ${sfWhite}, sfDraw: ${sfDraw}, sfBlack: ${sfBlack}`);
        sfDraw = Math.round(sfDraw * 0.55);
        //console.log(`sfWhite: ${sfWhite}, sfDraw: ${sfDraw}, sfBlack: ${sfBlack}`);
        if(sfWhite >= sfBlack) {
            sfWhite = Math.round((100-sfDraw)/2 + sfWhite);
            sfBlack = 100 - (sfWhite + sfDraw);
        }else {
            sfBlack = Math.round((100-sfDraw)/2 + sfBlack);
            sfWhite = 100 - (sfBlack + sfDraw);
        }
        //console.log(`sfWhite: ${sfWhite}, sfDraw: ${sfDraw}, sfBlack: ${sfBlack}`);
        
        sfWhite = Math.max(0, Math.min(100, sfWhite));
        sfBlack = Math.max(0, Math.min(100, sfBlack));
        //console.log(`sfWhite: ${sfWhite}, sfDraw: ${sfDraw}, sfBlack: ${sfBlack}`);
        sfDraw = 100 - (sfWhite + sfBlack);
        //console.log(`sfWhite: ${sfWhite}, sfDraw: ${sfDraw}, sfBlack: ${sfBlack}`);
        sfWinrate = {white: sfWhite, draws: sfDraw, black: sfBlack};
        return sfWinrate;
    }


    useEffect(() => {
        if(winner) return;
        
        getLichessWinrate(movesList, databaseRating, startingFen).then((lichessWinrate) => {
            console.log('getLichessWinrate: ok');
            let lichessWinrateOK = false;
            if(lichessWinrate.white && (lichessWinrate.white + lichessWinrate.draws + lichessWinrate.black) > 0) {
                lichessWinrateOK = true;
                setWinrate(lichessWinrate);
            } 
            if(!engine.current) return;
            console.log('engine.current: ok');
            if(fenEvalMap.has(currentFen)){
                console.log(`La position '${currentFen}' a déjà été analysée.`);
                setEngineEval(fenEvalMap.get(currentFen)?.eval || '0.0');
                let winrateEstimation: Winrate = estimateWinrate(fenEvalMap.get(currentFen)?.wdl || ['0.33', '0.33', '0.33'], currentFen);
                if(!lichessWinrateOK && (winrateEstimation.white + winrateEstimation.black + winrateEstimation.draws > 0)) setWinrate(winrateEstimation);
                console.log(winrateEstimation); 
                console.info(winrateEstimation);
                console.debug(winrateEstimation);
            }else{
                console.log(`La position '${currentFen}' n'a jamais été analysée.`);
                engine.current.evalPositionFromFen(currentFen, 14).then((res: EvalResultSimplified) => {
                    setEngineEval(res.eval);
                    console.log('evalPositionFromFen: ok');
                    console.log(res);
                    if(!res.wdl) return;
                    console.log('res.wdl: ok');
                    let winrateEstimation: Winrate = estimateWinrate(res.wdl || {}, currentFen);
                    if(!lichessWinrateOK && (winrateEstimation.white + winrateEstimation.black + winrateEstimation.draws > 0)) setWinrate(winrateEstimation);
                    console.log(winrateEstimation);
                }).catch((err: any) => {
                    console.log("Erreur lors de l'évaluation de la position: " + err);
                });
            }
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