/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { useEffect, useRef, useState } from "react";
import Engine, { EvalResult } from "../engine/Engine";
import GameToolBox from "../game-toolbox/GameToolbox";
import { AnalysisChart } from "../components/AnalysisChart";
import { Chess, Color, DEFAULT_POSITION, Move } from "chess.js";
import { Chessboard } from "react-chessboard";
import { Piece, Square } from "react-chessboard/dist/chessboard/types";
import EvalAndWinrate from "../components/EvalAndWinrate";
import { useSearchParams } from "next/navigation";
import { FaRegCopy } from "react-icons/fa6";

type EvalResultFormated = {
    playerColor: Color,
    bestMove: string,
    movePlayed: string,
    evalBefore: string,
    evalAfter: string,
    quality: string,
    isTheory: boolean,
}

const GameAnalysisPage = () => {
    const engine = useRef<Engine>();
    const toolbox = new GameToolBox();
    //const game = new Chess();
    const [game, setGame] = useState<Chess>(new Chess());
    const gameHistory = useRef<Move[]>([]);
    
    const searchParams = useSearchParams();
    const startingFen = searchParams.get('startingFen') || DEFAULT_POSITION;
    const pgn = searchParams.get('pgn')?.replaceAll(/\[.*\]/g, '').replaceAll(/\.{3,}/g, '..').replaceAll('. ', '.').trim() || '';
    //const history = searchParams.get('history') || [];
    const depth: number = eval(searchParams.get('depth') || '12');
    //const search = searchParams2.get('search');
    const [chartHistoryData, setChartHistoryData] = useState<number[]>([]);
    const [analysisProgress, setAnalysisProgress] = useState(0);
    const [showChartHistory, setShowChartHistory] = useState(false);
    const [currentFen, setCurrentFen] = useState(startingFen);
    const [currentMovesList, setCurrentMovesList] = useState<string[]>([]);
    const [currentIndex, setCurrentIndex] = useState(-1);
    //const [formatedResults, setFormatedResults] = useState<JSX.Element[]>([])
    const [formatedResults, setFormatedResults] = useState<EvalResultFormated[]>([]);
    const [playerColor, setPlayerColor] = useState('w');
    const boardOrientationRef = useRef<Color>('w');
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
    const [whiteMaterialAdvantage, setWhiteMaterialAdvantage] = useState({
        pawn: 0,
        knight: 0,
        bishop: 0,
        rook: 0,
        queen: 0,
        points: 0,
      });
  
      const [blackMaterialAdvantage, setBlackMaterialAdvantage] = useState({
        pawn: 0,
        knight: 0,
        bishop: 0,
        rook: 0,
        queen: 0,
        points: 0,
      });
    
    useEffect(() => {
        engine.current = new Engine();
        const gameHistoryChess = new Chess();
        gameHistoryChess.load(startingFen);
        const movesList = toolbox.convertPgnToHistory(pgn);
        movesList.forEach((move) => {
            gameHistoryChess.move(move);
        })
        gameHistory.current = gameHistoryChess.history({verbose: true});
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
        return Math.max(-6.5, (Math.min(eval(evalScore), 6.5)));
    }

    function analysisResultsToHistoryData(results: EvalResult[]): number[] {
        return results.map((res) => evalToNumber(res.evalAfter));
    }

    function getWhiteAccuracy(results: EvalResult[]) {
        const startColorIndex = startingFen.includes(' w ') ? 0 : 1;

        const whiteAccuracySum = results.reduce((acc, curr, i) => {
            return acc + (i%2 === startColorIndex && curr.accuracy ? 100*curr.accuracy : 0);
        }, 0);

        const whiteMovesNumber = startColorIndex === 0 ?
            Math.ceil(results.length/2)
            :
            Math.floor(results.length/2)
        
        const accuracy = Math.round(10*whiteAccuracySum/whiteMovesNumber)/10;
            
        
        console.log(`White accuracy: ${accuracy} (${whiteAccuracySum}/${whiteMovesNumber})`);

        return Math.max(0, accuracy);
    }

    function getBlackAccuracy(results: EvalResult[]) {
        const startColorIndex = startingFen.includes(' w ') ? 0 : 1;
        
        const blackAccuracySum = results.reduce((acc, curr, i) => {
            return acc + (i%2 !== startColorIndex && curr.accuracy ? 100*curr.accuracy : 0);
        }, 0);

        const blackMovesNumber = startColorIndex === 1 ?
            Math.ceil(results.length/2)
            :
            Math.floor(results.length/2)
        
        const accuracy = Math.round(10*blackAccuracySum/blackMovesNumber)/10;
            
        
        console.log(`Black accuracy: ${accuracy} (${blackAccuracySum}/${blackMovesNumber})`);

        return Math.max(0, accuracy);
    }

    function launchStockfishAnalysis(pgn: string, depth: number) {
        if(!engine.current) return;
        // pgn -> history (san) -> history (uci) : 1.e4 e5 -> ['e4', 'e5'] -> ['e2e4', 'e7e5']
        console.log('Pgn: ' + pgn);
        //const startingFen = game.history().length > 0 ? game.history({verbose: true})[0].before : DEFAULT_POSITION;
        console.log(startingFen);
        console.log(toolbox.convertPgnToHistory(pgn));
        const historyUci = toolbox.convertHistorySanToLan(toolbox.convertPgnToHistory(pgn), startingFen);
        //const historyUci = toolbox.convertHistorySanToLan(game.history(), startingFen);
        const timestampStart = performance.now();
        engine.current.launchGameAnalysis(historyUci, depth, setAnalysisProgress, startingFen).then((results: EvalResult[]) => {
            console.log(`Durée de l'analyse: ${(performance.now() - timestampStart)/1000}s`);
            //console.log("White accuracy: " + getWhiteAccuracy(results));
            setWhiteAccuracy(getWhiteAccuracy(results));
            setBlackAccuracy(getBlackAccuracy(results));
            setChartHistoryData(analysisResultsToHistoryData(results));
            setShowChartHistory(true);
            analysisResultsRef.current = results;
            formatAnalyseResults(pgn, results);
        });
    }

    function formatAnalyseResults(pgn: string, analysisResults: EvalResult[]) {
        //console.log(analysisResults);
        const timestampStart = performance.now();
        console.log(pgn);
        const pgnArray = toolbox.convertPgnToArray(pgn);

        const results = analysisResults.map((result: EvalResult, i: number) => {
            const bestMoveSan = toolbox.convertMoveLanToSan(gameHistory.current[i].before, result.bestMove);
            const movePlayed = pgnArray[i];
            const formatedResult = result as EvalResultFormated;
            formatedResult.bestMove = bestMoveSan || '';
            formatedResult.movePlayed = movePlayed || '';
            return formatedResult;
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
        console.log(lastMove);
        console.log(moveIndex);
        console.log(isMovePlayed);
        console.log(playerColor);

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

        if(!lastMove) return;
        const evalRes = analysisResultsRef.current[moveIndex];
        const quality = isMovePlayed ? evalRes.quality : '';


        // Highlight move origin and destination
        startCaseRef.current = document.querySelector(`[data-square=${toolbox.getMoveOrigin(lastMove)}]`);
        endCaseRef.current = document.querySelector(`[data-square=${toolbox.getMoveDestination(lastMove)}]`);
        const startCaseColor = startCaseRef.current?.getAttribute('data-square-color') || 'white';
        const endCaseColor = endCaseRef.current?.getAttribute('data-square-color') || 'white';
        if(startCaseRef.current) startCaseRef.current.setAttribute('style', `background-color: ${getMoveColor(quality, startCaseColor)}`);
        if(endCaseRef.current) endCaseRef.current.setAttribute('style', `background-color: ${getMoveColor(quality, endCaseColor)}`);
        
        // highlight move quality (ok / inaccuracy / error / blunder)
        if(quality === '?!'){
            inaccuracyIndexRef.current = toolbox.getCaseIndex(toolbox.getMoveDestination(lastMove) || 'a1', boardOrientationRef.current);
        }
        if(quality === '?'){
            errorIndexRef.current = toolbox.getCaseIndex(toolbox.getMoveDestination(lastMove) || 'a1', boardOrientationRef.current);
        }
        if(quality === '??'){
            blunderIndexRef.current = toolbox.getCaseIndex(toolbox.getMoveDestination(lastMove) || 'a1', boardOrientationRef.current);
        }
        console.log("Inaccuracy Index: " + inaccuracyIndexRef.current);
        console.log("Error Index: " + errorIndexRef.current);
        console.log("Blunder Index: " + blunderIndexRef.current);
    }
  
    const showMovePosition = (move: string | undefined, moveIndex: number, isMovePlayed: boolean) => {
        if(!move) return;
        console.log(move.replaceAll(/\d*\./g, ''));
        // Setup board position
        const newGame = new Chess();
        //newGame.load(gameHistory.current[moveIndex].after);
        newGame.load(gameHistory.current[moveIndex].before);
        newGame.move(move.replaceAll(/\d*\./g, ''));
        toolbox.countMaterial(newGame.board(), setWhiteMaterialAdvantage, setBlackMaterialAdvantage);

        // Highlight Move
        let lastMove = isMovePlayed ? gameHistory.current[moveIndex].lan : toolbox.convertMoveSanToLan(gameHistory.current[moveIndex].before, move.replaceAll(/\d*\./g, ''));
        highlightMove(lastMove, moveIndex, isMovePlayed);

        // Build movesList
        let newMovesList: string[] = gameHistory.current.filter((move, i) => i <= moveIndex).map((move) => move.lan );
        setCurrentMovesList(newMovesList);

        setCurrentFen(newGame.fen());
        setCurrentIndex(moveIndex);
        setGame(newGame);
        console.log('Changement de position');
    }

    const showMaterialAdvantage = (piecesColor: Color): string => {
        let materialAdvantage = '';
        if(piecesColor === 'w') {
          for(let i = 0; i < whiteMaterialAdvantage.pawn; i++) {
            materialAdvantage += '♙';
          }
          for(let i = 0; i < whiteMaterialAdvantage.knight; i++) {
            materialAdvantage += '♘';
          }
          for(let i = 0; i < whiteMaterialAdvantage.bishop; i++) {
            materialAdvantage += '♗';
          }
          for(let i = 0; i < whiteMaterialAdvantage.rook; i++) {
            materialAdvantage += '♖';
          }
          for(let i = 0; i < whiteMaterialAdvantage.queen; i++) {
            materialAdvantage += '♕';
          }
  
          if(whiteMaterialAdvantage.points <= 0) return materialAdvantage;
  
          return materialAdvantage + ` +${whiteMaterialAdvantage.points}`;
        }
  
        for(let i = 0; i < blackMaterialAdvantage.pawn; i++) {
          materialAdvantage += '♙';
        }
        for(let i = 0; i < blackMaterialAdvantage.knight; i++) {
          materialAdvantage += '♘';
        }
        for(let i = 0; i < blackMaterialAdvantage.bishop; i++) {
          materialAdvantage += '♗';
        }
        for(let i = 0; i < blackMaterialAdvantage.rook; i++) {
          materialAdvantage += '♖';
        }
        for(let i = 0; i < blackMaterialAdvantage.queen; i++) {
          materialAdvantage += '♕';
        }
  
        if(blackMaterialAdvantage.points <= 0) return materialAdvantage;
        
        return materialAdvantage + ` +${blackMaterialAdvantage.points}`;
      }

    const previousMove = (moveIndex: number) => {
        if(moveIndex < 0) {
            console.log('Impossible de revenir plus en arrière !');
            return;
        }
        const newGame = new Chess();
        newGame.load(gameHistory.current[moveIndex].before);
        toolbox.countMaterial(newGame.board(), setWhiteMaterialAdvantage, setBlackMaterialAdvantage);

        // Highlight Move
        let lastMove = (moveIndex-1) > 0 ? gameHistory.current[moveIndex-1].lan : undefined;
        highlightMove(lastMove, moveIndex-1, true);

        // Build movesList
        let newMovesList: string[] = gameHistory.current.filter((move, i) => i <= moveIndex).map((move) => move.lan );
        setCurrentMovesList(newMovesList);


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
        newGame.load(gameHistory.current[moveIndex+1].after);
        toolbox.countMaterial(newGame.board(), setWhiteMaterialAdvantage, setBlackMaterialAdvantage);

        // Highlight Move
        let lastMove = gameHistory.current[moveIndex+1].lan;
        console.log(lastMove);
        highlightMove(lastMove, moveIndex+1, true);

        // Build movesList
        let newMovesList: string[] = gameHistory.current.filter((move, i) => i <= moveIndex).map((move) => move.lan );
        setCurrentMovesList(newMovesList);

        setCurrentFen(newGame.fen());
        setCurrentIndex(moveIndex+1);
        setGame(newGame);
        console.log('Changement de position');
    }

    /* function onDrop(sourceSquare: Square, targetSquare: Square, piece: Piece) {

        game.move(sourceSquare + targetSquare);
        setCurrentFen(game.fen());
    
        return true;
    } */

    function getPromotion(sourceSquare: Square, piece: Piece) {
        if(game.get(sourceSquare).type === 'p' && piece.charAt(1) !== 'P'){
          return piece.charAt(1).toLowerCase();
        }
        return '';
      }

    function onDrop(sourceSquare: Square, targetSquare: Square, piece: Piece) {
        const promotion = getPromotion(sourceSquare, piece);
  
        game.move(sourceSquare + targetSquare + promotion);
        toolbox.countMaterial(game.board(), setWhiteMaterialAdvantage, setBlackMaterialAdvantage);
    
        setCurrentFen(game.fen());
        
        return true;
      }

    const formatedResultsComponent = formatedResults.length > 0 ?
        <div className="  w-full h-full overflow-y-auto flex flex-row flex-wrap justify-start items-start gap-2" >
            {
                formatedResults.map((result: EvalResultFormated, i: number) => {
                    const bestMoveSpan = result.quality !== '' ? 
                        <span>
                            {result.movePlayed + result.quality} <span onClick={(e) => {
                                    e.stopPropagation()
                                    showMovePosition(result.bestMove, i, false)
                                }
                            }>({result.bestMove} was best)</span>
                        </span>
                    :
                        <span>
                            {result.movePlayed}
                        </span>
        
                    // TODO: Prendre en compte les coups théoriques
                    if(result.isTheory) return <span onClick={() => showMovePosition(result.movePlayed, i, true)} key={i} className=" text-amber-700 cursor-pointer select-none" style={{backgroundColor: currentIndex === i ? "rgba(34, 211, 238, 0.3)" : "rgba(0,0,0,0)" }} >{bestMoveSpan}</span>;
                    if(result.quality === '??') return <span onClick={() => showMovePosition(result.movePlayed, i, true)} key={i} className=" text-red-600 cursor-pointer select-none" style={{backgroundColor: currentIndex === i ? "rgba(34, 211, 238, 0.3)" : "rgba(0,0,0,0)" }} >{bestMoveSpan}</span>;
                    if(result.quality === '?') return <span onClick={() => showMovePosition(result.movePlayed, i, true)} key={i} className=" text-orange-500 cursor-pointer select-none" style={{backgroundColor: currentIndex === i ? "rgba(34, 211, 238, 0.3)" : "rgba(0,0,0,0)" }} >{bestMoveSpan}</span>;
                    if(result.quality === '?!') return <span onClick={() => showMovePosition(result.movePlayed, i, true)} key={i} className=" text-yellow-400 cursor-pointer select-none" style={{backgroundColor: currentIndex === i ? "rgba(34, 211, 238, 0.3)" : "rgba(0,0,0,0)" }} >{bestMoveSpan}</span>;
                    return <span onClick={() => showMovePosition(result.movePlayed, i, true)} key={i} className=" text-white cursor-pointer select-none" style={{backgroundColor: currentIndex === i ? "rgba(34, 211, 238, 0.3)" : "rgba(0,0,0,0)" }} >{bestMoveSpan}</span>;
                })
            }
        </div>
        :
        null

    const chartHistoryComponent = showChartHistory ?
        <div className=" flex justify-center items-center w-full h-full" >
            <div className=" relative flex flex-col justify-start items-center w-11/12 h-full pt-5" >
                <div className=" relative flex justify-center items-center w-full h-fit" >
                    <AnalysisChart historyData={chartHistoryData} className=" " />
                    <div className=" absolute w-full h-full pr-1 pl-4 pt-3 pb-7" >
                        <div className=" w-full h-full flex">
                            {
                                analysisResultsRef.current.map((result, i) => {
                                    if(i === analysisResultsRef.current.length - 1){
                                        if(i === currentIndex) return <div key={i} className=" h-full border-l-2 border-cyan-400"/>
                                        return null;
                                    }
                                    if(i === currentIndex) return <div key={i} className=" h-full flex-grow border-l-2 border-cyan-400"/>
                                    return <div key={i} className=" h-full flex-grow border-l border-black opacity-0"/>
                                })
                            }
                        </div>
                    </div>
                </div>
                <div className="  w-full h-fit flex justify-around items-center" >
                    <div className=" bg-slate-50 text-black text-xl font-medium h-10 w-20 flex justify-center items-center m-5 rounded" >
                        {whiteAccuracy}%
                    </div>
                    <div className=" bg-slate-950 text-white text-xl font-medium h-10 w-20 flex justify-center items-center m-5 rounded" >
                        {blackAccuracy}%
                    </div>
                </div>
                {formatedResultsComponent}
                <div className="flex justify-center items-center w-full mb-5" >
                    <div onClick={() => navigator.clipboard.writeText(pgn)} className=' h-[50px] w-[50px] flex flex-col justify-start items-start cursor-pointer text-white hover:text-cyan-400'>
                        <FaRegCopy size={30} />
                    </div>
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
                const newColor = playerColor === 'w' ? 'b' : 'w';
                setPlayerColor(newColor);
                boardOrientationRef.current = newColor;
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
        <div className="flex justify-center items-center mb-3 gap-5 w-full h-fit" >
            {previousButton}
            {switchButton}
            {nextButton}
        </div>

    const boardComponent = 
        <div className=" relative flex flex-col justify-center items-center h-[304px] md:h-[512px] w-[304px] md:w-[512px] my-12" >
            <div className=" relative flex justify-start p-2 w-full h-10 font-medium bg-slate-100 rounded-t-md">
                <div className=" h-full flex justify-start items-center flex-grow-[4]" >
                {playerColor === 'w' ? (
                    'Blancs ' + showMaterialAdvantage('b')
                ) : (
                    'Noirs' + showMaterialAdvantage('w')
                )}
                </div>
            </div>
            <Chessboard 
            id="PlayVsRandom"
            position={currentFen}
            onPieceDrop={onDrop} 
            boardOrientation={playerColor === 'w' ? 'white' : 'black'}
            />
            <div className=" relative flex justify-around p-2 w-full h-10 font-medium rounded-b-md bg-slate-100">
                <div className=" h-full flex justify-start items-center flex-grow-[4]" >
                {playerColor === 'w' ? (
                    'Noirs ' + showMaterialAdvantage('w')
                ) : (
                    'Blancs ' + showMaterialAdvantage('b')
                )}
                </div>
            </div>
            <div className=" absolute flex flex-wrap h-[304px] md:h-[512px] w-[304px] md:w-[512px] pointer-events-none" >
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
                startingFen={startingFen}
                currentFen={currentFen} 
                movesList={currentMovesList}
                showEval={true} 
            />
            {boardComponent}
            {buttonsComponent}
        </div>
    /* const gameComponent = 
        <div className="flex flex-col justify-start items-center h-full">
            {boardComponent}
            {buttonsComponent}
        </div> */

    const gameContainer =
        <div className="flex flex-row justify-center items-center w-1/2 h-full pl-5" >
            {gameComponent}
        </div>
    
    return (
        <div className="flex flex-col md:flex-row justify-start md:justify-stretch items-center md:items-start bg-cyan-900 h-[95vh] w-full overflow-auto" >
            {gameContainer}
            {chartHistoryContainer}
        </div>
    )
}

export default GameAnalysisPage;