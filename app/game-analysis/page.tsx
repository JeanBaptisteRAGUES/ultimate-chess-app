'use client'

import { useEffect, useRef, useState } from "react";
import Engine from "../chess/engine/Engine";
import GameToolBox from "../chess/game-toolbox/GameToolbox";
import { AnalysisChart } from "../chess/components/AnalysisChart";
import { Chess } from "chess.js";

type EvalResult = {
    bestMove: string,
    movePlayed: string,
    evalBefore: string,
    evalAfter: string,
    quality: string,
}

type AnalysisProps = {
    searchParams: {
        pgn: string,
        depth: number,
    }
}

// TODO: Problème d'url trop longue si pgn très grand (beaucoup de coups joués) ? 
const GameAnalysisPage = ({searchParams}: AnalysisProps) => {
    const engine = useRef<Engine>();
    const toolbox = new GameToolBox();
    const game = new Chess();
    
    const [chartHistoryData, setChartHistoryData] = useState<number[]>([]);
    const [analysisResults, setAnalysisResults] = useState<EvalResult[]>([]);
    const [showChartHistory, setShowChartHistory] = useState(false);
    const [currentFen, setCurrentFen] = useState('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    
    useEffect(() => {
        console.log(searchParams);
        engine.current = new Engine();
        engine.current.init().then(() => {
            console.log('Launch PGN analysis');
            launchStockfishAnalysis(searchParams.pgn, searchParams.depth);
        });
    }, []);
    
    function evalToNumber(evalScore: string): number {
        if(evalScore.includes('#')){
            if(evalScore.includes('-')) return -7;
            return 7;
        }
        return Math.min(eval(evalScore), 6.5);
    }

    function analysisResultsToHistoryData(results: EvalResult[]): number[] {
        return results.map((res) => evalToNumber(res.evalAfter));
    }

    function launchStockfishAnalysis(pgn: string, depth: number) {
        if(!engine.current) return;
        // pgn -> history (san) -> history (uci) : 1.e4 e5 -> ['e4', 'e5'] -> ['e2e4', 'e7e5']
        const historyUci = toolbox.convertHistorySanToUci(toolbox.convertPgnToHistory(pgn));
        engine.current.launchGameAnalysis(historyUci, depth).then((results: EvalResult[]) => {
            console.log(results);
            setChartHistoryData(analysisResultsToHistoryData(results));
            setAnalysisResults(results);
            setShowChartHistory(true);
        });
    }

    //TODO: Appliquer showMovePosition() sur le meilleur coup suggéré
    function analyseMoveByMove(pgn: string) {
        //console.log(analysisResults);
        const pgnArray = toolbox.convertPgnToArray(pgn);
        const history = toolbox.convertPgnToHistory(pgn);

        return analysisResults.map((result: EvalResult, i: number) => {
            if(result.quality === '??') return <span onClick={() => showMovePosition(i)} key={i} className=" text-red-600 cursor-pointer" >{pgnArray[i]}?? ({toolbox.convertMoveUciToSan2(history, i,result.bestMove)} was best)</span>;
            if(result.quality === '?') return <span onClick={() => showMovePosition(i)} key={i} className=" text-orange-500 cursor-pointer" >{pgnArray[i]}? ({toolbox.convertMoveUciToSan2(history, i,result.bestMove)} was best)</span>;
            if(result.quality === '?!') return <span onClick={() => showMovePosition(i)} key={i} className=" text-yellow-400 cursor-pointer" >{pgnArray[i]}?! ({toolbox.convertMoveUciToSan2(history, i,result.bestMove)} was best)</span>;
            return <span onClick={() => showMovePosition(i)} key={i} className=" text-white cursor-pointer" >{pgnArray[i]}</span>;
        });

    }
  
    const showMovePosition = (moveIndex: number) =>{
        console.log("Move index: " + moveIndex);
        const newGame = new Chess();
        //console.log(game.pgn());
        //console.log(movesHistorySan(game.pgn()).slice(0, moveIndex+1).join(' '));
        const positionPGN = toolbox.convertPgnToArray(searchParams.pgn).slice(0, moveIndex+1).join(' ');
        newGame.loadPgn(positionPGN);
        setCurrentFen(newGame.fen());
    }

    const chartHistoryComponent = showChartHistory ?
        <div className=" flex justify-center items-center w-full h-full" >
            <div className=" relative flex flex-col justify-start items-center w-11/12 h-full pt-5" >
            <div className=" flex justify-center items-center w-full h-fit" >
                <AnalysisChart historyData={chartHistoryData} className=" " />
            </div>
            <div className="  w-full h-full overflow-y-auto flex flex-row flex-wrap justify-start items-start gap-2" >
                {analyseMoveByMove(searchParams.pgn)}
            </div>
            </div>
        </div>
    :
        null
    
    
    const chartHistoryContainer = showChartHistory ? 
      <div className=" flex justify-center items-center w-1/2 h-full">
        {chartHistoryComponent}
      </div>
    :
      null
    
    return (
        <div className="flex flex-row justify-stretch items-start bg-cyan-900 h-screen w-full overflow-auto" >
            {chartHistoryContainer}
        </div>
    )
}

export default GameAnalysisPage;