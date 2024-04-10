/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { useEffect, useRef, useState } from "react";
import Engine, { EvalResult } from "../engine/Engine";
import GameToolBox from "../game-toolbox/GameToolbox";
import { AnalysisChart } from "../components/AnalysisChart";
import { Chess, Color, DEFAULT_POSITION } from "chess.js";
import { Chessboard } from "react-chessboard";
import { Piece, Square } from "react-chessboard/dist/chessboard/types";
import EvalAndWinrate from "../components/EvalAndWinrate";
import { useSearchParams } from "next/navigation";
import { createRoot } from "react-dom/client";
import { createPortal } from "react-dom";

/* type EvalResult = {
    bestMove: string,
    movePlayed: string,
    evalBefore: string,
    evalAfter: string,
    quality: string,
} */

const GameAnalysisPage = () => {
    const engine = useRef<Engine>();
    const toolbox = new GameToolBox();
    //const game = new Chess();
    const [game, setGame] = useState<Chess>(new Chess());
    
    const searchParams2 = useSearchParams();
    const pgn = searchParams2.get('pgn') || '';
    const depth: number = eval(searchParams2.get('depth') || '12');
    //const search = searchParams2.get('search');
    const [chartHistoryData, setChartHistoryData] = useState<number[]>([]);
    const [analysisProgress, setAnalysisProgress] = useState(0);
    const [showChartHistory, setShowChartHistory] = useState(false);
    const [currentFen, setCurrentFen] = useState('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    const [currentIndex, setCurrentIndex] = useState(-1);
    const [formatedResults, setFormatedResults] = useState<JSX.Element[]>([])
    const [playerColor, setPlayerColor] = useState('w');
    const [winrate, setWinrate] = useState({
        white: 50,
        draws: 0,
        black: 50
    });
    const [whiteAccuracy, setWhiteAccuracy] = useState(100);
    const [blackAccuracy, setBlackAccuracy] = useState(100);

    const gameActive = useRef(true);
    const board = new Array(64).fill(0);
    const analysisResultsRef = useRef<EvalResult[]>([]);
    const inaccuracyIndexRef = useRef(-1);
    const errorIndexRef = useRef(-1);
    const blunderIndexRef = useRef(-1);
    const startCaseRef = useRef<Element | null>(null);
    const endCaseRef = useRef<Element | null>(null);
    
    useEffect(() => {
        console.log(searchParams2);
        console.log(searchParams2.get('pgn'));
        console.log(searchParams2.get('depth'));
        engine.current = new Engine();
        engine.current.init().then(() => {
            console.log('Launch PGN analysis');
            launchStockfishAnalysis(pgn, depth);
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

    function getWhiteAccuracy(results: EvalResult[]) {
        const whiteAccuracySum = results.reduce((acc, curr, i) => {
            return acc + (i%2 === 0 && curr.accuracy ? 100*curr.accuracy : 0);
        }, 0);
        console.log("White accuracy sum: " + whiteAccuracySum);
        return Math.round(10*whiteAccuracySum/Math.ceil(results.length/2))/10;
    }

    function getBlackAccuracy(results: EvalResult[]) {
        const blackAccuracySum = results.reduce((acc, curr, i) => {
            return acc + (i%2 !== 0 && curr.accuracy ? 100*curr.accuracy : 0);
        }, 0);
        console.log("White accuracy sum: " + blackAccuracySum);
        return Math.round(10*blackAccuracySum/Math.floor(results.length/2))/10;
    }

    function launchStockfishAnalysis(pgn: string, depth: number) {
        if(!engine.current) return;
        // pgn -> history (san) -> history (uci) : 1.e4 e5 -> ['e4', 'e5'] -> ['e2e4', 'e7e5']
        console.log('Pgn: ' + pgn);
        const startingFen = game.history().length > 0 ? game.history({verbose: true})[0].before : DEFAULT_POSITION;
        console.log(startingFen);
        console.log(game.history({verbose: true})); //TODO: renvoie []
        const historyUci = toolbox.convertHistorySanToLan(toolbox.convertPgnToHistory(pgn), startingFen);
        //const historyUci = toolbox.convertHistorySanToLan(game.history(), startingFen);
        const timestampStart = performance.now();
        engine.current.launchGameAnalysis(historyUci, depth, setAnalysisProgress, startingFen).then((results: EvalResult[]) => {
            console.log(`Durée de l'analyse: ${(performance.now() - timestampStart)/1000}s`);
            console.log(results);
            //console.log("White accuracy: " + getWhiteAccuracy(results));
            setWhiteAccuracy(getWhiteAccuracy(results));
            setBlackAccuracy(getBlackAccuracy(results));
            setChartHistoryData(analysisResultsToHistoryData(results));
            setShowChartHistory(true);
            analysisResultsRef.current = results;
            formatAnalyseResults(pgn, results);
        });
    }

    // TODO: Entourer le coup dont l'index = currentIndex
    function formatAnalyseResults(pgn: string, analysisResults: EvalResult[]) {
        //console.log(analysisResults);
        const timestampStart = performance.now();
        const pgnArray = toolbox.convertPgnToArray(pgn);
        const history = toolbox.convertPgnToHistory(pgn);

        const results = analysisResults.map((result: EvalResult, i: number) => {
            const bestMoveSan = toolbox.convertMoveLanToSan2(history, i, result.bestMove);
            const movePlayed = pgnArray[i];
            const bestMoveSpan = result.quality !== '' ? 
                <span>
                    {movePlayed + result.quality} <span onClick={(e) => {
                            e.stopPropagation()
                            showMovePosition(bestMoveSan, i, false)
                        }
                    }>({bestMoveSan} was best)</span>
                </span>
            :
                <span>
                    {movePlayed}
                </span>
            if(result.quality === '??') return <span onClick={() => showMovePosition(movePlayed, i, true)} key={i} className=" text-red-600 cursor-pointer select-none" >{bestMoveSpan}</span>;
            if(result.quality === '?') return <span onClick={() => showMovePosition(movePlayed, i, true)} key={i} className=" text-orange-500 cursor-pointer select-none" >{bestMoveSpan}</span>;
            if(result.quality === '?!') return <span onClick={() => showMovePosition(movePlayed, i, true)} key={i} className=" text-yellow-400 cursor-pointer select-none" >{bestMoveSpan}</span>;
            return <span onClick={() => showMovePosition(movePlayed, i, true)} key={i} className=" text-white cursor-pointer select-none" >{bestMoveSpan}</span>;
        });
        console.log(`Durée du formatage: ${(performance.now() - timestampStart)/1000}s`);
        setFormatedResults(results);
    } 

    const getMoveColor = (moveQuality: string, squareColor: string): string => {
        switch (moveQuality) {
            case '?!':
                return squareColor === 'white' ? 'rgb(240,220,130)' : 'rgb(220,200,80)';
            case '?':
                return squareColor === 'white' ? 'rgb(250,180,40)' : 'rgb(230,140,60)';
            case '??':
                return squareColor === 'white' ? 'rgb(250,130,130)' : 'rgb(240,110,110)';
        
            default:
                return squareColor === 'white' ? 'rgb(170,210,170)' : 'rgb(140,180,140)';
        }
    }

    const highlightMove = (lastMove: string | undefined, moveIndex: number, isMovePlayed: boolean): void => {
        if(!lastMove) return;
        const evalRes = analysisResultsRef.current[moveIndex];
        const quality = isMovePlayed ? evalRes.quality : '';

        // Reset previous highlight
        inaccuracyIndexRef.current = -1;
        errorIndexRef.current = -1;
        blunderIndexRef.current = -1;
        if(startCaseRef.current) startCaseRef.current.getAttribute('data-square-color') === 'white' ? 
            startCaseRef.current.setAttribute('style', 'background-color: rgb(240,217,181)') 
            : 
            startCaseRef.current.setAttribute('style', 'background-color: rgb(181,136,99)');

        if(endCaseRef.current) endCaseRef.current.getAttribute('data-square-color') === 'white' ? 
            endCaseRef.current.setAttribute('style', 'background-color: rgb(240,217,181)') 
            : 
            endCaseRef.current.setAttribute('style', 'background-color: rgb(181,136,99)');

        // Highlight move origin and destination
        startCaseRef.current = document.querySelector(`[data-square=${toolbox.getMoveDestination(lastMove)}]`);
        endCaseRef.current = document.querySelector(`[data-square=${toolbox.getMoveOrigin(lastMove)}]`);
        const startCaseColor = startCaseRef.current?.getAttribute('data-square-color') || 'white';
        const endCaseColor = endCaseRef.current?.getAttribute('data-square-color') || 'white';
        if(startCaseRef.current) startCaseRef.current.setAttribute('style', `background-color: ${getMoveColor(quality, startCaseColor)}`);
        if(endCaseRef.current) endCaseRef.current.setAttribute('style', `background-color: ${getMoveColor(quality, endCaseColor)}`);
        
        // highlight move quality (ok / inaccuracy / error / blunder)
        if(quality === '?!'){
            inaccuracyIndexRef.current = toolbox.getCaseIndex(toolbox.getMoveDestination(lastMove) || 'a1', playerColor as Color);
        }
        if(quality === '?'){
            errorIndexRef.current = toolbox.getCaseIndex(toolbox.getMoveDestination(lastMove) || 'a1', playerColor as Color);
        }
        if(quality === '??'){
            blunderIndexRef.current = toolbox.getCaseIndex(toolbox.getMoveDestination(lastMove) || 'a1', playerColor as Color);
        }
    }
  
    const showMovePosition = (move: string | undefined, moveIndex: number, isMovePlayed: boolean) => {
        if(!move) return;
        // Setup board position
        const newGame = new Chess();
        let positionArray = toolbox.convertPgnToArray(pgn).slice(0, moveIndex);
        positionArray.push(move);
        const positionPGN = positionArray.join(' ');
        newGame.loadPgn(positionPGN);

        // Highlight Move
        let lastMove = newGame.history({verbose: true}).pop()?.lan;
        highlightMove(lastMove, moveIndex, isMovePlayed);

        setCurrentFen(newGame.fen());
        setCurrentIndex(moveIndex);
        setGame(newGame);
        console.log('Changement de position');
    }

    const previousMove = (moveIndex: number) => {
        if(moveIndex < 0) {
            console.log('Impossible de revenir plus en arrière !');
            return;
        }
        const newGame = new Chess();
        console.log(moveIndex);
        console.log(toolbox.convertPgnToArray(pgn));
        let positionArray = toolbox.convertPgnToArray(pgn).slice(0, moveIndex);
        console.log(positionArray);
        const positionPGN = positionArray.join(' ');
        console.log(positionPGN);
        newGame.loadPgn(positionPGN);

        // Highlight Move
        let lastMove = newGame.history({verbose: true}).pop()?.lan;
        highlightMove(lastMove, moveIndex-1, true);

        setCurrentFen(newGame.fen());
        setCurrentIndex(moveIndex-1);
        setGame(newGame);
        console.log('Changement de position');
    }

    const nextMove = (moveIndex: number) => {
        if(moveIndex + 2 > formatedResults.length) {
            console.log("Impossible d'avancer plus dans la partie !");
            return;
        }
        const newGame = new Chess();
        console.log(moveIndex);
        console.log(moveIndex+2);
        console.log(toolbox.convertPgnToArray(pgn));
        let positionArray = toolbox.convertPgnToArray(pgn).slice(0, moveIndex+2);
        console.log(positionArray);
        const positionPGN = positionArray.join(' ');
        console.log(positionPGN);
        newGame.loadPgn(positionPGN);

        // Highlight Move
        let lastMove = newGame.history({verbose: true}).pop()?.lan;
        highlightMove(lastMove, moveIndex+1, true);

        setCurrentFen(newGame.fen());
        setCurrentIndex(moveIndex+1);
        setGame(newGame);
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
                <div className="  w-full h-fit flex justify-around items-center" >
                    <div className=" bg-slate-50 text-black text-xl h-10 w-20 flex justify-center items-center m-5 rounded" >
                        {whiteAccuracy}%
                    </div>
                    <div className=" bg-slate-950 text-white text-xl h-10 w-20 flex justify-center items-center m-5 rounded" >
                        {blackAccuracy}%
                    </div>
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
        <div className=" flex justify-center items-center w-full md:w-1/2 h-full">
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

    const switchButton = 
        <button
            className=" bg-white border rounded cursor-pointer w-10"
            onClick={() => {
                playerColor === 'w' ? setPlayerColor('b') : setPlayerColor('w')
            }}
        >
            ↺
        </button>
    
    const previousButton = currentIndex >= 0 ?
        <button
            className=" bg-white border rounded cursor-pointer w-10"
            onClick={() => previousMove(currentIndex)}
        >
            {'<'}
        </button>
        :
        <button
            className=" bg-white border rounded w-10 opacity-50"
            onClick={() => previousMove(currentIndex)}
            disabled
        >
            {'<'}
        </button>

    const nextButton = currentIndex + 2 <= formatedResults.length ?
        <button
            className=" bg-white border rounded cursor-pointer w-10"
            onClick={() => nextMove(currentIndex)}
        >
            {'>'}
        </button>
        :
        <button
            className=" bg-white border rounded w-10 opacity-50"
            onClick={() => nextMove(currentIndex)}
            disabled
        >
            {'>'}
        </button>

    // TODO: Ajouter un bouton '<' et un bouton '>' pour faire défiler les coups de l'analyse
    const buttonsComponent =
        <div className="flex justify-center items-center gap-5 w-full h-fit" >
            {previousButton}
            {switchButton}
            {nextButton}
        </div>

    const boardComponent = 
        <div className=" relative flex flex-col justify-center items-center h-[304px] md:h-[512px] w-[304px] md:w-[512px] my-10" >
            <Chessboard 
            id="PlayVsRandom"
            position={currentFen}
            onPieceDrop={onDrop} 
            boardOrientation={playerColor === 'w' ? 'white' : 'black'}
            />
            <div className=" absolute flex flex-wrap h-[304px] md:h-[512px] w-[304px] md:w-[512px]" >
                {
                    board.map((e,i) => {
                        const inaccuracyIcon = inaccuracyIndexRef.current === i ? <span className="w-5 h-5 translate-x-1 -translate-y-1 bg-yellow-500 text-white font-bold rounded-full flex justify-center items-center" >?!</span> : null;
                        const errorIcon = errorIndexRef.current === i ? <span className="w-5 h-5 translate-x-1 -translate-y-1 bg-orange-600 text-white font-bold rounded-full flex justify-center items-center" >?</span> : null;
                        const blunderIcon = blunderIndexRef.current === i ? <span className="w-5 h-5 translate-x-1 -translate-y-1 bg-red-600 text-white font-bold rounded-full flex justify-center items-center" >??</span>  : null;

                        return <div className=" h-[38px] md:h-[64px] w-[38px] md:w-[64px] flex justify-end" key={i}>
                            {inaccuracyIcon}
                            {errorIcon}
                            {blunderIcon}
                        </div>
                    })
                }
            </div>
        </div>

    const gameComponent = 
        <div className="flex flex-col justify-start items-center h-full">
            <EvalAndWinrate 
                game={game} 
                databaseRating={'Master'} 
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
        <div className="flex flex-col md:flex-row justify-start md:justify-stretch items-center md:items-start bg-cyan-900 h-screen w-full overflow-auto" >
            {gameContainer}
            {chartHistoryContainer}
        </div>
    )
}

export default GameAnalysisPage;