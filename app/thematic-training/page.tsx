/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import { useEffect, useRef, useState } from "react";
import {Chess, Color, DEFAULT_POSITION} from "chess.js";
import { Chessboard } from "react-chessboard";
import { Piece, Square } from "react-chessboard/dist/chessboard/types";
import Clock from "../components/Clock";
import Engine from "../engine/Engine";
import Link from "next/link";
import BotsAI, { Behaviour, Move } from "../bots-ai/BotsAI";
import { useSearchParams } from "next/navigation";
import { FaFontAwesomeFlag } from "react-icons/fa";
import { FaCirclePlay } from "react-icons/fa6";


const ThematicTrainingPage = () => {
    const searchParams = useSearchParams();
    const playerColor = searchParams.get('playerColor');
    const startingFen = searchParams.get('startingFen');
    const nextMove = searchParams.get('nextMove');
    const elo: number = eval(searchParams.get('elo') || '2600');
    const gameActive = useRef(true);
    const [game, setGame] = useState(new Chess());
    const engine = useRef<Engine>();
    const botAI = useRef<BotsAI>();
    const [gameStarted, setGameStarted] = useState(false);
    const [currentTimeout, setCurrentTimeout] = useState<NodeJS.Timeout>();
    //const [databaseRating, setDatabaseRating] = useState('Master');
    //const [botBehaviour, setBotBehaviour] = useState<Behaviour>('default');
    const [currentFen, setCurrentFen] = useState(startingFen || DEFAULT_POSITION);
    const [winrate, setWinrate] = useState({
      white: 50,
      draws: 0,
      black: 50
    });
    const [engineEval, setEngineEval] = useState('0.3');
    const [showEval, setShowEval] = useState(true);
    const scoreHistory = useRef(new Array());
    const movesTypeRef = useRef(new Array()); // -1: erreur, 0(blanc): joueur, 1(jaune): lichess, 2(vert clair): stockfish, 3(vert foncé): stockfish forcé, 4(rouge): random
    const [showGameoverWindow, setShowGameoverWindow] = useState(false);
    const [winner, setWinner] = useState(''); // 'w' -> blancs gagnent, 'b' -> noirs gagnent, 'd' -> draw
    const [botTimestamp, setBotTimestamp] = useState({
      startingTime: 60,
      increment: 0,
      timeElapsed: 0,
    });
    const [timeControl, setTimeControl] = useState('infinite');

    useEffect(() => {
        engine.current = new Engine();
        engine.current.init();
        const botColor = playerColor === 'w' ? 'b' : 'w';
        botAI.current = new BotsAI('human', elo, botColor, timeControl, false);
        console.log('Starting Fen: ' + startingFen);
        console.log('Game Fen: ' + game.fen());
        console.log('Current Fen:' + currentFen);
        console.log('Next Move: ' + nextMove);
        console.log("Elo: " + elo);
        console.log("Player Color: " + playerColor);
        game.load(startingFen || DEFAULT_POSITION);

        /* if(!nextMove) return;

        const newTimeout = setTimeout(() => gameMove(nextMove, 1), 500);
        setCurrentTimeout(newTimeout); */
    }, []);

    useEffect(() => {
      const botColor = playerColor === 'w' ? 'b' : 'w';
      //botAI.current = new BotsAI('default', difficulty, botColor, timeControl);
      botAI.current?.changeColor(botColor);
    }, [playerColor]);

    // TODO: Problème lors de la promotion d'un pion (promeut automatiquement en cavalier)
    const gameMove = (moveNotation: string, moveType: number) => {
      game.move(moveNotation);
      setCurrentFen(game.fen());
      movesTypeRef.current.push(moveType);
      checkGameOver();
    }
  
    function checkGameOver() {
      if(!gameActive.current) return false;
      if (game.isGameOver()){
        console.log('Game Over !');
        console.log(game.pgn());
        gameActive.current = false;
        if(game.isDraw() || game.isInsufficientMaterial() || game.isStalemate() || game.isInsufficientMaterial()) {
          setEngineEval('1/2 - 1/2');
          setWinner('d');
        }
        if(game.isCheckmate()){
          if(game.turn() === 'w'){
            setEngineEval('0 - 1');
            setWinner('b');
          }else{
            setEngineEval('1 - 0');
            setWinner('w');
          }
        }
        setShowGameoverWindow(true);
        return true;
      }
      return false;
    }

    function resign() {
      if(playerColor === 'w'){
        setEngineEval('0 - 1');
        setWinner('b');
      }else{
        setEngineEval('1 - 0');
        setWinner('w');
      }
      console.log('Game Over !');
      console.log(game.pgn());
      gameActive.current = false;
      engine.current?.quit();
      botAI.current?.disable();
      setShowGameoverWindow(true);
    }

    function movesHistorySan(gamePGN: string){
      let pgnAfter = gamePGN.replaceAll(/\d*\.\s/gm, (test) => test.trim());

      return pgnAfter.split(' ');
    }

    async function playComputerMove() {
      console.log('Play computer move');
      if(game.pgn().includes('#')) return;
      console.log(game.fen());
      const move: Move | undefined = await botAI.current?.makeMove(game, botTimestamp);

      if(move && move.type >= 0){
        gameMove(move.notation, move.type);
        return;
      } 
      console.log("Erreur lors de la génération d'un coup par l'ordinateur");
    }

    /**
     * Si la pièce de départ est un pion, et qu'à l'arrivée ce n'est plus un pion,
     * celà veut dire qu'il y a eu promotion.
     * On récupère donc la pièce d'arrivée pour déterminer la promotion.
     * @param sourceSquare La case de départ de la pièce
     * @param piece La pièce à l'arrivée
     * @returns 
     */
    function getPromotion(sourceSquare: Square, piece: Piece) {
      if(game.get(sourceSquare).type === 'p' && piece.charAt(1) !== 'P'){
        return piece.charAt(1).toLowerCase();
      }
      return '';
    }
  
    function onDrop(sourceSquare: Square, targetSquare: Square, piece: Piece) {
        if(game.get(sourceSquare).color !== playerColor) return false; 
        const promotion = getPromotion(sourceSquare, piece);
        console.log(sourceSquare + targetSquare + promotion);
        gameMove(sourceSquare + targetSquare + promotion, 0);
    
        //let delay = 500;
        if(gameStarted){
            playComputerMove();
        }
        
        return true;
    }

    const moveColor = (moveType: number, move: string, i: number) => {
      switch (moveType) {
        case 0:
          return <span onClick={() => showMovePosition(i)} key={i} className=" text-white cursor-pointer" >{move}</span>
        case 1:
          return <span onClick={() => showMovePosition(i)} key={i} className=" text-yellow-600 cursor-pointer" >{move}</span>
        case 2:
          return <span onClick={() => showMovePosition(i)} key={i} className=" text-lime-500 cursor-pointer" >{move}</span>
        case 3:
          return <span onClick={() => showMovePosition(i)} key={i} className=" text-green-600 cursor-pointer" >{move}</span>
        case 4:
          return <span onClick={() => showMovePosition(i)} key={i} className=" text-red-600 cursor-pointer" >{move}</span>            
        default:
          return <span onClick={() => showMovePosition(i)} key={i} className=" text-white cursor-pointer" >{move}</span>
      }
    }

    const showMovePosition = (moveIndex: number) =>{
      console.log("Move index: " + moveIndex);
      const newGame = new Chess();
      const positionPGN = movesHistorySan(game.pgn()).slice(0, moveIndex+1).join(' ');
      newGame.loadPgn(positionPGN);
      setCurrentFen(newGame.fen());
    }

    /* const gamePGN = () => {
      const history = movesHistorySan(game.pgn());

      return history.map((move,i) => {
          if(i%2 === 0){
            return (
              <div key={i} className="flex flex-row justify-start items-center gap-2" >
                {moveColor(movesTypeRef.current[i], move, i)}
                {(i+1) < history.length ? moveColor(movesTypeRef.current[i+1], history[i+1], i+1) : null}
              </div>
            )
          } 
        }
      )
    } */

    const analysisMenu =
      <div className=" flex flex-col justify-center items-center gap-5">
        <Link
          className=" m-4 p-1 bg-fuchsia-600 text-white border rounded cursor-pointer"
          href = {{
            pathname: '/game-analysis',
            query: {
              startingFen: game.history().length > 0 ? game.history({verbose: true})[0].before : null,
              pgn: game.pgn(),
              depth: 12
            }
          }}
          target="_blank"
        >
          Analyse rapide
        </Link>
        <Link
          className=" m-4 p-1 bg-fuchsia-600 text-white border rounded cursor-pointer"
          href = {{
            pathname: '/game-analysis',
            query: {
              startingFen: game.history().length > 0 ? game.history({verbose: true})[0].before : null,
              pgn: game.pgn(),
              depth: 16
            }
          }}
          target="_blank"
        >
          Analyse approfondie
        </Link>
      </div>

    const gameOverWindow = showGameoverWindow ? 
      <div className=" flex justify-center items-center w-full h-full absolute top-0 left-0" >
        <div className=" flex flex-col justify-start items-center w-3/4 h-2/3 md:w-1/2 md:h-1/2 bg-gray-200 rounded" >
          <div className=" relative flex justify-center items-center w-full h-1/4 bg-fuchsia-600 text-white rounded-t" >
            <h1 className=" text-white font-bold flex justify-center items-center">
              {
                winner === 'w' ? 'Les blancs gagnent la partie !'
                :
                (
                  winner === 'b' ? 'Les noirs gagnent la partie !'
                  :
                  'Match nul'
                )
              }
            </h1>
            <button className=" text-white font-extrabold absolute top-5 left-5" onClick={() => setShowGameoverWindow(false)}>
              X
            </button>
          </div>
          <div className="flex justify-center items-center h-full w-full">
            {analysisMenu}
          </div>
        </div>
      </div>
      :
      null

    const titleComponent = <h4 className=" text-lg text-white" >
      {"Niveau de l adversaire: " + elo}
    </h4>

    /* const pgnComponentDesktop =
      <div className=" text-white w-1/4 hidden h-full md:flex flex-col flex-wrap">
        {gamePGN()}
      </div>
    
    const pgnComponentSmartphone =
      <div className=" text-white overflow-y-auto w-full md:hidden h-full flex flex-col flex-wrap mt-10">
        {gamePGN()}
      </div> */

    const boardComponent =
      <div className=" flex flex-col justify-center items-center h-[300px] md:h-[500px] w-[95vw] md:w-[500px] my-10" >
          <div className=" relative flex justify-start p-2 w-full h-10 font-medium bg-slate-100 rounded-t-md">
            <div className=" h-full flex justify-start items-center flex-grow-[4]" >
              Stockfish 16 ({elo})
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
              Joueur
            </div>
          </div>
      </div>

    /* const switchButton = <button
      className=" bg-white border rounded cursor-pointer"
      onClick={() => {
        playerColor === 'w' ? setPlayerColor('b') : setPlayerColor('w')
      }}
    >
      Switch
    </button> */

    const startButton = !gameStarted ? 
      <div 
        onClick={() => {
          setGameStarted(true);
          if(!nextMove) return;
          const newTimeout = setTimeout(() => gameMove(nextMove, 1), 500);
          setCurrentTimeout(newTimeout);
        }}
        className=' h-[50px] w-[50px] flex flex-col justify-center items-center cursor-pointer hover:text-cyan-400'>
          <FaCirclePlay size={40} />
      </div>
      :
      <div onClick={() => resign()} className=' h-[50px] w-[50px] flex flex-col justify-center items-center cursor-pointer hover:text-cyan-400'>
        <FaFontAwesomeFlag size={40} />
      </div>

    const analysisButton = 
      <Link
        href = {{
          pathname: '/game-analysis',
          query: {
            pgn: game.pgn(),
            depth: 12
          }
        }}
      >
        Analyse PGN
      </Link>

    const buttonsComponent =
      <div className="flex justify-center mt-10 pt-2 md:mt-0 items-center gap-5 w-full h-fit" >
        {startButton}
      </div>

    const gameComponent = 
      <div className="flex flex-col justify-center items-center h-full">
        {boardComponent}
        {buttonsComponent}
      </div>

    const gameContainer =
      <div className="flex flex-row justify-center items-center w-full h-full md:pl-5" >
        {gameComponent}
      </div>

    return (
      <div className="flex flex-col md:flex-row justify-start md:justify-stretch items-center md:items-start bg-slate-800 h-[95vh] w-full overflow-auto" >
          {gameContainer}
          {gameOverWindow}
      </div>
    )
}

export default ThematicTrainingPage;