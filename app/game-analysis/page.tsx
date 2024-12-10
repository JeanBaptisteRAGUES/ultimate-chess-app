/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { useEffect, useRef, useState } from "react";
import Engine, { AnalysisResult, EvalResult, FenEval } from "../engine/Engine";
import GameToolBox from "../game-toolbox/GameToolbox";
import { AnalysisChart } from "../components/AnalysisChart";
import { Chess, Color, DEFAULT_POSITION, Move } from "chess.js";
import { Chessboard } from "react-chessboard";
import { Arrow, Piece, Square } from "react-chessboard/dist/chessboard/types";
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
    const [evalMovesList, setEvalMovesList] = useState<string[]>([]);
    const [currentIndex, setCurrentIndex] = useState(-1);
    //const [formatedResults, setFormatedResults] = useState<JSX.Element[]>([])
    const [formatedResults, setFormatedResults] = useState<EvalResultFormated[]>([]);
    const [playerColor, setPlayerColor] = useState('w');
    const boardOrientationRef = useRef<Color>('w');
    /* const previousMoveKeyRef = useRef(null);
    const nextMoveKeyRef = useRef(HTMLButtonElement); */
    //const documentRef = useRef(window.document);
    const [winrate, setWinrate] = useState({
        white: 50,
        draws: 0,
        black: 50
    });
    const [whiteAccuracy, setWhiteAccuracy] = useState(100);
    const [blackAccuracy, setBlackAccuracy] = useState(100);
    const [whiteMovesQuality, setWhiteMovesQuality] = useState<Map<string, number>>(new Map([['', 0]]));
    const [blackMovesQuality, setBlackMovesQuality] = useState<Map<string, number>>(new Map([['', 0]]));

    const gameActive = useRef(true);
    const board = new Array(64).fill(0);
    const analysisResultsRef = useRef<EvalResult[]>([]);
    const evalMapRef = useRef<Map<string,FenEval>>(new Map());
    const brillantIndexRef = useRef(-1);
    const inaccuracyIndexRef = useRef(-1);
    const errorIndexRef = useRef(-1);
    const blunderIndexRef = useRef(-1);
    const startCaseRef = useRef<Element | null>(null);
    const endCaseRef = useRef<Element | null>(null);
    const [customArrows, setCustomArrows] = useState<Arrow[]>([]);
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
        /* //@ts-expect-error
        if(previousMoveKeyRef.current) previousMoveKeyRef.current.addEventListener('keydown', (e) => {
            console.log(e.key);
        });

        //@ts-expect-error
        if(nextMoveKeyRef.current) nextMoveKeyRef.current.addEventListener('keydown', (e) => {
            console.log(e.key);
        }) */

        function testLeft() {
            console.log(`Test Left: ${currentIndex}`);
            setCurrentIndex((currentIndex) => currentIndex-1);
        }

        function testRight() {
            console.log(`Test Right: ${currentIndex}`);
            setCurrentIndex((currentIndex) => currentIndex+1);
        }

        function testLeft2() {
            console.log(`Test Left 2: ${currentIndex}`);
            previousMove();
        }

        function testRight2() {
            console.log(`Test Right 2: ${currentIndex}`);
            nextMove();
        }

        const onKeyDown = (e: KeyboardEvent) => {
            console.log(e.key);

            if(e.key === 'ArrowLeft') {
                testLeft();
                //testLeft2();
            } 

            if(e.key === 'ArrowRight') {
                testRight();
                //testRight2();
            } 
        }

        window.addEventListener('keydown', onKeyDown);

        return () => {
            window.removeEventListener('keydown', onKeyDown);
        }
    }, []);
    
    useEffect(() => {
        console.log('Use Effect');
        engine.current = new Engine();
        const gameHistoryChess = new Chess();
        gameHistoryChess.load(startingFen);
        console.log(engine.current);
        const movesList = toolbox.convertPgnToHistory(pgn);
        console.log('Conversion PGN vers historique: ok');
        movesList.forEach((move) => {
            gameHistoryChess.move(move);
        })
        gameHistory.current = gameHistoryChess.history({verbose: true});
        console.log(gameHistory.current);
        engine.current.initAnalysis().then(() => {
            console.log(`%c Launch PGN analysis (profondeur: ${depth})`, 'color: green');
            engine.current?.showWinDrawLose();
            launchStockfishAnalysis(pgn, depth);
        });
        //console.log('Launch PGN analysis');
        //launchStockfishAnalysis(pgn, depth);
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
        engine.current.launchGameAnalysis(historyUci, depth, setAnalysisProgress, startingFen).then((results: AnalysisResult) => {
            console.log(`Durée de l'analyse: ${(performance.now() - timestampStart)/1000}s`);
            //console.log("White accuracy: " + getWhiteAccuracy(results));
            setWhiteAccuracy(getWhiteAccuracy(results.results));
            setBlackAccuracy(getBlackAccuracy(results.results));
            setWhiteMovesQuality(results.white);
            setBlackMovesQuality(results.black);
            console.log(results.white);
            console.log(results.black);
            setChartHistoryData(analysisResultsToHistoryData(results.results));
            setShowChartHistory(true);
            analysisResultsRef.current = results.results;
            formatAnalyseResults(pgn, results.results);
            mapAnalyseResults(results.results);
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

    function mapAnalyseResults(analysisResults: EvalResult[]) {
        console.log('Map Analyse Results');
        const testGame = new Chess();
        const pgnHistory = toolbox.convertPgnToHistory(pgn);
        const testMap = new Map<string, FenEval>();
        testGame.load(startingFen);


        analysisResults.map((result: EvalResult, i: number) => {
            /* evalMapRef.current?.set(testGame.fen(), {
                fen: testGame.fen(),
                eval: result.evalBefore,
                wdl: result.wdl,
            }); */
            testMap.set(testGame.fen(), {
                fen: testGame.fen(),
                eval: result.evalBefore,
                wdl: result.wdl,
                bestLines: [result.bestLine || ''],
            });
            console.log(pgnHistory[i]);
            testGame.move(pgnHistory[i]);
        });

        evalMapRef.current = testMap;

        console.log(evalMapRef.current);
        console.log(testMap);
        //TODO: setFormatedResults(results);
    } 

    const getMoveColor = (moveQuality: string, squareColor: string): string => {
        switch (moveQuality) {
            case '!!':
                return squareColor === 'white' ? 'rgb(43,255,255)' : 'rgb(30,225,225)';
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
        brillantIndexRef.current = -1;
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
        if(quality === '!!'){
            brillantIndexRef.current = toolbox.getCaseIndex(toolbox.getMoveDestination(lastMove) || 'a1', boardOrientationRef.current);
        }
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
        const bestMoveLan = formatedResults[moveIndex] ? toolbox.convertMoveSanToLan(gameHistory.current[moveIndex]?.before || DEFAULT_POSITION, formatedResults[moveIndex]?.bestMove) : '';
        const bestMoveOrigin = bestMoveLan !== '' ? toolbox.getMoveOrigin(bestMoveLan) : '';
        const bestMoveDestination = bestMoveLan !== '' ?  toolbox.getMoveDestination(bestMoveLan) : '';
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
        const newEvalMovesList: string[] = JSON.parse(JSON.stringify(newMovesList));
        //newEvalMovesList.push(lastMove);
        setEvalMovesList(newEvalMovesList);
        if(bestMoveOrigin !== '' && bestMoveDestination !== '') setCustomArrows([[bestMoveOrigin, bestMoveDestination]]);
        setCurrentFen(newGame.fen());
        setCurrentIndex(moveIndex);
        setGame(newGame);
        console.log('Changement de position');
        console.log('Best Move: ' + formatedResults[moveIndex].bestMove);
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

    function previousMove(){
        let moveIndex = currentIndex;
        if(moveIndex < 0) {
            console.log('Impossible de revenir plus en arrière !');
            return;
        }
        const newGame = new Chess();
        const bestMoveLan = formatedResults[moveIndex-1] ? toolbox.convertMoveSanToLan(gameHistory.current[moveIndex-1]?.before || DEFAULT_POSITION, formatedResults[moveIndex-1]?.bestMove) : '';
        const bestMoveOrigin = bestMoveLan !== '' ? toolbox.getMoveOrigin(bestMoveLan) : '';
        const bestMoveDestination = bestMoveLan !== '' ?  toolbox.getMoveDestination(bestMoveLan) : '';
        newGame.load(gameHistory.current[moveIndex].before);
        toolbox.countMaterial(newGame.board(), setWhiteMaterialAdvantage, setBlackMaterialAdvantage);

        // Highlight Move
        let lastMove = (moveIndex-1) > 0 ? gameHistory.current[moveIndex-1].lan : undefined;
        highlightMove(lastMove, moveIndex-1, true);

        // Build movesList
        let newMovesList: string[] = gameHistory.current.filter((move, i) => i <= moveIndex).map((move) => move.lan );
        setCurrentMovesList(newMovesList);
        const newEvalMovesList: string[] = JSON.parse(JSON.stringify(newMovesList));
        newEvalMovesList.pop();
        setEvalMovesList(newEvalMovesList);
        if(bestMoveOrigin !== '' && bestMoveDestination !== '') setCustomArrows([[bestMoveOrigin, bestMoveDestination]]);
        setCurrentFen(newGame.fen());
        setCurrentIndex((moveIndex) => moveIndex-1);
        setGame(newGame);
        console.log('Changement de position');
        console.log('Best Move: ' + formatedResults[moveIndex].bestMove);
    }

    function nextMove(){
        let moveIndex = currentIndex;
        if(moveIndex + 2 > formatedResults.length) {
            console.log("Impossible d'avancer plus dans la partie !");
            return;
        }
        const newGame = new Chess();
        const bestMoveLan = formatedResults[moveIndex+1] ? toolbox.convertMoveSanToLan(gameHistory.current[moveIndex+1]?.before || DEFAULT_POSITION, formatedResults[moveIndex+1]?.bestMove) : '';
        const bestMoveOrigin = bestMoveLan !== '' ? toolbox.getMoveOrigin(bestMoveLan) : '';
        const bestMoveDestination = bestMoveLan !== '' ?  toolbox.getMoveDestination(bestMoveLan) : '';
        newGame.load(gameHistory.current[moveIndex+1].after);
        toolbox.countMaterial(newGame.board(), setWhiteMaterialAdvantage, setBlackMaterialAdvantage);

        // Highlight Move
        let lastMove = gameHistory.current[moveIndex+1].lan;
        console.log(lastMove);
        highlightMove(lastMove, moveIndex+1, true);

        // Build movesList
        let newMovesList: string[] = gameHistory.current.filter((move, i) => i <= moveIndex).map((move) => move.lan );
        setCurrentMovesList(newMovesList);
        const newEvalMovesList: string[] = JSON.parse(JSON.stringify(newMovesList));
        newEvalMovesList.push(lastMove);
        setEvalMovesList(newEvalMovesList);
        if(bestMoveOrigin !== '' && bestMoveDestination !== '') setCustomArrows([[bestMoveOrigin, bestMoveDestination]]);
        setCurrentFen(newGame.fen());
        setCurrentIndex((moveIndex) => moveIndex+1);
        setGame(newGame);
        console.log('Changement de position');
        console.log('Best Move: ' + formatedResults[moveIndex+1].bestMove);
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
        <div className="  w-full h-full flex flex-row flex-wrap justify-start items-start gap-2" >
            {
                formatedResults.map((result: EvalResultFormated, i: number) => {
                    const bestMoveSpan = (result.quality !== '' && !result.quality.match(/!!|T|\*/gm)) ? 
                        <span>
                            {result.movePlayed + result.quality} <span onClick={(e) => {
                                    e.stopPropagation()
                                    showMovePosition(result.bestMove, i, false)
                                }
                            }>({result.bestMove} was best)</span>
                        </span>
                    :
                        <span>
                            {result.movePlayed + (result.quality === '!!' ? ' (brillant !!)' : '')}
                        </span>
        
                    // TODO: Prendre en compte les coups théoriques
                    if(result.isTheory) return <span onClick={() => showMovePosition(result.movePlayed, i, true)} key={i} className=" text-amber-700 cursor-pointer select-none" style={{backgroundColor: currentIndex === i ? "rgba(34, 211, 238, 0.3)" : "rgba(0,0,0,0)" }} >{bestMoveSpan}</span>;
                    if(result.quality === '??') return <span onClick={() => showMovePosition(result.movePlayed, i, true)} key={i} className=" text-red-600 cursor-pointer select-none" style={{backgroundColor: currentIndex === i ? "rgba(34, 211, 238, 0.3)" : "rgba(0,0,0,0)" }} >{bestMoveSpan}</span>;
                    if(result.quality === '?') return <span onClick={() => showMovePosition(result.movePlayed, i, true)} key={i} className=" text-orange-500 cursor-pointer select-none" style={{backgroundColor: currentIndex === i ? "rgba(34, 211, 238, 0.3)" : "rgba(0,0,0,0)" }} >{bestMoveSpan}</span>;
                    if(result.quality === '?!') return <span onClick={() => showMovePosition(result.movePlayed, i, true)} key={i} className=" text-yellow-400 cursor-pointer select-none" style={{backgroundColor: currentIndex === i ? "rgba(34, 211, 238, 0.3)" : "rgba(0,0,0,0)" }} >{bestMoveSpan}</span>;
                    if(result.quality === '!!') return <span onClick={() => showMovePosition(result.movePlayed, i, true)} key={i} className=" text-cyan-400 brightness-110 cursor-pointer select-none" style={{backgroundColor: currentIndex === i ? "rgba(43, 255, 255, 0.3)" : "rgba(0,0,0,0)" }} >{bestMoveSpan}</span>;
                    return <span onClick={() => showMovePosition(result.movePlayed, i, true)} key={i} className=" text-white cursor-pointer select-none" style={{backgroundColor: currentIndex === i ? "rgba(34, 211, 238, 0.3)" : "rgba(0,0,0,0)" }} >{bestMoveSpan}</span>;
                })
            }
        </div>
        :
        null

    const chartHistoryComponent = showChartHistory ?
        <div className=" flex justify-center items-center w-full h-full" >
            <div className=" relative flex flex-col justify-start items-center w-11/12 h-full pt-5" >
                <div className=" relative flex justify-center items-center w-full md:w-3/4  h-fit" >
                    <AnalysisChart historyData={chartHistoryData} className=" " />
                    <div className=" absolute w-full h-full pr-1 pl-4 pt-3 pb-7" >
                        <div className=" w-full h-full flex">
                            {
                                analysisResultsRef.current.map((result, i) => {
                                    if(i === analysisResultsRef.current.length - 1){
                                        if(i === currentIndex) return <div key={i} className=" h-full border-l-2 -translate-x-0.5 border-cyan-400"/>
                                        return null;
                                    }
                                    if(i === currentIndex) return <div key={i} className=" h-full flex-grow border-l-2 -translate-x-0.5 border-cyan-400"/>
                                    return <div key={i} className=" h-full flex-grow border-l border-black opacity-0"/>
                                })
                            }
                        </div>
                    </div>
                </div>
                <div className="  w-full h-fit flex flex-col justify-around items-center md:overflow-y-auto">
                    <div className="  w-full h-fit flex justify-around items-center pb-2" >
                        <div className=" w-1/2 h-full flex flex-col justify-start items-center pt-2 gap-2">
                            <div className=" bg-slate-50 text-black text-xl font-medium h-10 w-20 flex justify-center items-center m-5 rounded" title="Score de précision des blancs" >
                                {whiteAccuracy}%
                            </div>
                            <div className=" w-16 flex flex-row justify-start items-center text-white gap-2" title="Coup brillant (le meilleur coup est un sacrifice de qualité)">
                                <div className=" flex justify-center items-center rounded-full font-bold bg-cyan-400 w-6 h-6">!!</div>
                                {whiteMovesQuality.get('!!')}
                            </div>
                            <div className=" w-16 flex flex-row justify-start items-center text-white gap-2" title="Meilleur coup">
                                <div className=" flex justify-center items-center rounded-full font-bold bg-green-400 w-6 h-6" >★</div>
                                {whiteMovesQuality.get('*')}
                            </div>
                            <div className=" w-16 flex flex-row justify-start items-center text-white gap-2" title="Coup correct">
                                <div className=" flex justify-center items-center rounded-full font-bold bg-green-600 w-6 h-6" >✔</div>
                                {whiteMovesQuality.get('')}
                            </div>
                            <div className=" w-16 flex flex-row justify-start items-center text-white gap-2" title="Coup théorique">
                                <div className=" flex justify-center items-center rounded-full font-bold text-sm bg-amber-700 w-6 h-6" >🕮</div>
                                {whiteMovesQuality.get('T')}
                            </div>
                            <div className=" w-16 flex flex-row justify-start items-center text-white gap-2" title="Imprécision">
                                <div className=" flex justify-center items-center rounded-full font-bold bg-yellow-500 w-6 h-6" >?!</div>
                                {whiteMovesQuality.get('?!')}
                            </div>
                            <div className=" w-16 flex flex-row justify-start items-center text-white gap-2" title="Erreur">
                                <div className=" flex justify-center items-center rounded-full font-bold bg-orange-500 w-6 h-6" >?</div>
                                {whiteMovesQuality.get('?')}
                            </div>
                            <div className=" w-16 flex flex-row justify-start items-center text-white gap-2" title="Gaffe">
                                <div className=" flex justify-center items-center rounded-full font-bold bg-red-600 w-6 h-6" >??</div>
                                {whiteMovesQuality.get('??')}
                            </div>
                        </div>
                        <div className=" w-1/2 h-full flex flex-col justify-start items-center pt-2 gap-2">
                            <div className=" bg-slate-950 text-white text-xl font-medium h-10 w-20 flex justify-center items-center m-5 rounded" title="Score de précision des noirs">
                                {blackAccuracy}%
                            </div>
                            <div className=" w-16 flex flex-row justify-start items-center text-white gap-2" title="Coup brillant (le meilleur coup est un sacrifice de qualité)">
                                <div className=" flex justify-center items-center rounded-full font-bold bg-cyan-400 w-6 h-6" >!!</div>
                                {blackMovesQuality.get('!!')}
                            </div>
                            <div className=" w-16 flex flex-row justify-start items-center text-white gap-2" title="Meilleur coup">
                                <div className=" flex justify-center items-center rounded-full font-bold bg-green-400 w-6 h-6" >★</div>
                                {blackMovesQuality.get('*')}
                            </div>
                            <div className=" w-16 flex flex-row justify-start items-center text-white gap-2" title="Coup correct">
                                <div className=" flex justify-center items-center rounded-full font-bold bg-green-600 w-6 h-6" >✔</div>
                                {blackMovesQuality.get('')}
                            </div>
                            <div className=" w-16 flex flex-row justify-start items-center text-white gap-2" title="Coup théorique">
                                <div className=" flex justify-center items-center rounded-full font-bold text-sm bg-amber-700 w-6 h-6" >🕮</div>
                                {blackMovesQuality.get('T')}
                            </div>
                            <div className=" w-16 flex flex-row justify-start items-center text-white gap-2" title="Imprécision">
                                <div className=" flex justify-center items-center rounded-full font-bold bg-yellow-500 w-6 h-6" >?!</div>
                                {blackMovesQuality.get('?!')}
                            </div>
                            <div className=" w-16 flex flex-row justify-start items-center text-white gap-2" title="Erreur">
                                <div className=" flex justify-center items-center rounded-full font-bold bg-orange-500 w-6 h-6" >?</div>
                                {blackMovesQuality.get('?')}
                            </div>
                            <div className=" w-16 flex flex-row justify-start items-center text-white gap-2" title="Gaffe">
                                <div className=" flex justify-center items-center rounded-full font-bold bg-red-600 w-6 h-6" >??</div>
                                {blackMovesQuality.get('??')}
                            </div>
                        </div>
                    </div>
                    {formatedResultsComponent}
                </div>
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
                <div className=" bg-cyan-300 text-white h-5 md:mx-5 flex justify-center items-center rounded" style={{width: `${Math.round(analysisProgress*100)}%`}} >
                    <div className=" w-full h-full flex justify-center items-center rounded animate-pulse border-cyan-400 shadow-[0_0_2px_#fff,inset_0_0_2px_#fff,0_0_5px_#08f,0_0_15px_#08f,0_0_30px_#08f]" >
                        {(analysisProgress*100) > 3 ? Math.round(analysisProgress*100) + '%' : ''}
                    </div>
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
            onClick={() => previousMove()}
        >
            {'<'}
        </button>
        :
        <button
            className=" bg-white border rounded w-10 opacity-50"
            onClick={() => previousMove()}
            disabled
        >
            {'<'}
        </button>

    const nextButton = currentIndex + 2 <= formatedResults.length ?
        <button
            className=" bg-white border rounded cursor-pointer w-10"
            onClick={() => nextMove()}
        >
            {'>'}
        </button>
        :
        <button
            className=" bg-white border rounded w-10 opacity-50"
            onClick={() => nextMove()}
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
                    'Noirs ' + showMaterialAdvantage('b')
                ) : (
                    'Blancs' + showMaterialAdvantage('w')
                )}
                </div>
            </div>
            <Chessboard 
                id="PlayVsRandom"
                position={currentFen}
                onPieceDrop={onDrop} 
                boardOrientation={playerColor === 'w' ? 'white' : 'black'}
                customArrows={customArrows}
            />
            <div className=" relative flex justify-around p-2 w-full h-10 font-medium rounded-b-md bg-slate-100">
                <div className=" h-full flex justify-start items-center flex-grow-[4]" >
                {playerColor === 'w' ? (
                    'Blancs ' + showMaterialAdvantage('w')
                ) : (
                    'Noirs ' + showMaterialAdvantage('b')
                )}
                </div>
            </div>
            <div className=" absolute flex flex-wrap h-[304px] md:h-[512px] w-[304px] md:w-[512px] pointer-events-none" >
                {
                    board.map((e,i) => {
                        const brillantIcon = brillantIndexRef.current === i ? <span className="w-5 h-5 translate-x-1 -translate-y-1 bg-cyan-400 text-white font-bold rounded-full flex justify-center items-center" >!!</span> : null;
                        const inaccuracyIcon = inaccuracyIndexRef.current === i ? <span className="w-5 h-5 translate-x-1 -translate-y-1 bg-yellow-500 text-white font-bold rounded-full flex justify-center items-center" >?!</span> : null;
                        const errorIcon = errorIndexRef.current === i ? <span className="w-5 h-5 translate-x-1 -translate-y-1 bg-orange-600 text-white font-bold rounded-full flex justify-center items-center" >?</span> : null;
                        const blunderIcon = blunderIndexRef.current === i ? <span className="w-5 h-5 translate-x-1 -translate-y-1 bg-red-600 text-white font-bold rounded-full flex justify-center items-center" >??</span>  : null;

                        return <div className=" h-[38px] md:h-[64px] w-[38px] md:w-[64px] flex justify-end" key={i}>
                            {brillantIcon}
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
                fenEvalMap={evalMapRef.current}
                movesList={evalMovesList}
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
        <div className="flex flex-col md:flex-row justify-start md:justify-stretch items-center md:items-start bg-slate-800 h-[95vh] w-full overflow-y-auto md:overflow-y-clip" >
            {gameContainer}
            {chartHistoryContainer}
        </div>
    )
}

export default GameAnalysisPage;