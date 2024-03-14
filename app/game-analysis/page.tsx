/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { useEffect, useMemo, useRef, useState } from "react";
import Engine from "../engine/Engine";
import GameToolBox from "../game-toolbox/GameToolbox";
import { AnalysisChart } from "../components/AnalysisChart";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import { Piece, Square } from "react-chessboard/dist/chessboard/types";
import EvalAndWinrate from "../components/EvalAndWinrate";

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

const GameAnalysisPage = ({searchParams}: AnalysisProps) => {
    const engine = useRef<Engine>();
    const toolbox = new GameToolBox();
    const game = new Chess();
    
    const [chartHistoryData, setChartHistoryData] = useState<number[]>([]);
    const [analysisProgress, setAnalysisProgress] = useState(0);
    const [showChartHistory, setShowChartHistory] = useState(false);
    const [currentFen, setCurrentFen] = useState('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    const [formatedResults, setFormatedResults] = useState<JSX.Element[]>([])
    const [playerColor, setPlayerColor] = useState('w');
    const [winrate, setWinrate] = useState({
        white: 50,
        draws: 0,
        black: 50
    });

    const gameActive = useRef(true);
    
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
        const timestampStart = performance.now();
        engine.current.launchGameAnalysis(historyUci, depth, setAnalysisProgress).then((results: EvalResult[]) => {
            console.log(`Durée de l'analyse: ${(performance.now() - timestampStart)/1000}s`);
            console.log(results);
            setChartHistoryData(analysisResultsToHistoryData(results));
            setShowChartHistory(true);
            formatAnalyseResults(searchParams.pgn, results);
        });
    }

    function formatAnalyseResults(pgn: string, analysisResults: EvalResult[]) {
        //console.log(analysisResults);
        const timestampStart = performance.now();
        const pgnArray = toolbox.convertPgnToArray(pgn);
        const history = toolbox.convertPgnToHistory(pgn);

        const results = analysisResults.map((result: EvalResult, i: number) => {
            const bestMoveSan = toolbox.convertMoveUciToSan2(history, i, result.bestMove);
            const movePlayed = pgnArray[i];
            const bestMoveSpan = result.quality !== '' ? 
                <span>
                    {movePlayed + result.quality} <span onClick={(e) => {
                            e.stopPropagation()
                            showMovePosition(bestMoveSan, i)
                        }
                    }>({bestMoveSan} was best)</span>
                </span>
            :
                <span>
                    {movePlayed}
                </span>
            if(result.quality === '??') return <span onClick={() => showMovePosition(movePlayed, i)} key={i} className=" text-red-600 cursor-pointer" >{bestMoveSpan}</span>;
            if(result.quality === '?') return <span onClick={() => showMovePosition(movePlayed, i)} key={i} className=" text-orange-500 cursor-pointer" >{bestMoveSpan}</span>;
            if(result.quality === '?!') return <span onClick={() => showMovePosition(movePlayed, i)} key={i} className=" text-yellow-400 cursor-pointer" >{bestMoveSpan}</span>;
            return <span onClick={() => showMovePosition(movePlayed, i)} key={i} className=" text-white cursor-pointer" >{bestMoveSpan}</span>;
        });
        console.log(`Durée du formatage: ${(performance.now() - timestampStart)/1000}s`);
        setFormatedResults(results);
    }
  
    const showMovePosition = (move: string | undefined, moveIndex: number) =>{
        if(!move) return;
        const newGame = new Chess();
        let positionArray = toolbox.convertPgnToArray(searchParams.pgn).slice(0, moveIndex);
        positionArray.push(move);
        const positionPGN = positionArray.join(' ');
        newGame.loadPgn(positionPGN);
        setCurrentFen(newGame.fen());
        console.log('Changement de position');
    }

    function onDrop(sourceSquare: Square, targetSquare: Square, piece: Piece) {

        game.move(sourceSquare + targetSquare);
        setCurrentFen(game.fen());
    
        return true;
    }

    const chartHistoryComponent = showChartHistory ?
        <div className=" flex justify-center items-center w-full h-full" >
            <div className=" relative flex flex-col justify-start items-center w-11/12 h-full pt-5" >
            <div className=" flex justify-center items-center w-full h-fit" >
                <AnalysisChart historyData={chartHistoryData} className=" " />
            </div>
            <div className="  w-full h-full overflow-y-auto flex flex-row flex-wrap justify-start items-start gap-2" >
                {formatedResults}
            </div>
            </div>
        </div>
    :
        null
    
    // TODO: Utiliser la balise 'progress'
    const chartHistoryContainer = showChartHistory ? 
        <div className=" flex justify-center items-center w-1/2 h-full">
            {chartHistoryComponent}
        </div>
    :
        analysisProgress === 0 ?
            <div className=" flex justify-center items-center w-1/2 h-full">
                <div className=" text-white h-5 w-full flex justify-center items-center rounded" >
                    {"Lancement de l'analyse.."}
                </div>
            </div>
            :
            <div className=" flex justify-center items-center w-1/2 h-full">
                <div className=" bg-fuchsia-600 text-white h-5 flex justify-center items-center rounded" style={{width: `${Math.round(analysisProgress*100)}%`}} >
                    {(analysisProgress*100) > 3 ? Math.round(analysisProgress*100) + '%' : ''}
                </div>
            </div>

    const switchButton = <button
      className=" bg-white border rounded cursor-pointer"
      onClick={() => {
        playerColor === 'w' ? setPlayerColor('b') : setPlayerColor('w')
      }}
    >
      Switch
    </button>

    // TODO: Ajouter un bouton '<' et un bouton '>' pour faire défiler les coups de l'analyse
    const buttonsComponent =
        <div className="flex justify-center items-center gap-2 w-full h-fit" >
            {switchButton}
        </div>

    const boardComponent = 
        <div className=" flex flex-col justify-center items-center h-[500px] w-[500px] my-10" >
            <Chessboard 
            id="PlayVsRandom"
            position={currentFen}
            onPieceDrop={onDrop} 
            boardOrientation={playerColor === 'w' ? 'white' : 'black'}
            />
        </div>

    const gameComponent = 
        <div className="flex flex-col justify-start items-center h-full">
            <EvalAndWinrate 
                game={game} 
                winrate={winrate} 
                winner={''} 
                currentFen={currentFen} 
                showEval={true} 
                gameActive={gameActive}
            />
            {boardComponent}
            {buttonsComponent}
        </div>

    const gameContainer =
        <div className="flex flex-row justify-center items-center w-1/2 h-full pl-5" >
            {gameComponent}
        </div>
    
    return (
        <div className="flex flex-row justify-stretch items-start bg-cyan-900 h-screen w-full overflow-auto" >
            {gameContainer}
            {chartHistoryContainer}
        </div>
    )
}

export default GameAnalysisPage;