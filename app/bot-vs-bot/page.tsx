/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import { useEffect, useRef, useState } from "react";
import {Chess, Color, DEFAULT_POSITION} from "chess.js";
import { Chessboard } from "react-chessboard";
import { Piece, Square } from "react-chessboard/dist/chessboard/types";
import EvalAndWinrate from "../components/EvalAndWinrate";
import Clock from "../components/Clock";
import Engine from "../engine/Engine";
import Link from "next/link";
import BotsAI, { Behaviour, Move } from "../bots-ai/BotsAI";
import { useSearchParams } from "next/navigation";
import GameToolBox from "../game-toolbox/GameToolbox";


const BotVsBotPage = () => {
    const searchParams = useSearchParams();
    //const databaseRating = searchParams.get('difficulty') || 'Master';
    const bot1_Behaviour: Behaviour = searchParams.get('bot1_Behaviour') as Behaviour || 'default';
    const bot2_Behaviour: Behaviour = searchParams.get('bot2_Behaviour') as Behaviour || 'default';
    const bot1_Level = searchParams.get('bot1_Level') || 'Master';
    const bot2_Level = searchParams.get('bot2_Level') || 'Master';
    const moveDelay = eval(searchParams.get('timeControl') || '300');

    const toolbox = new GameToolBox();
    const gameActive = useRef(true);
    const [game, setGame] = useState(new Chess());
    const engine = useRef<Engine>();
    const bot1_AI = useRef<BotsAI>();
    const bot2_AI = useRef<BotsAI>();
    const [playerColor, setPlayerColor] = useState<Color>('w');
    const [gameStarted, setGameStarted] = useState(false);
    const [currentTimeout, setCurrentTimeout] = useState<NodeJS.Timeout>();
    //const [databaseRating, setDatabaseRating] = useState('Master');
    //const [botBehaviour, setBotBehaviour] = useState<Behaviour>('default');
    const [currentFen, setCurrentFen] = useState('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
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
    /* const whiteTimeControl = useRef({
      startingTime: 600,
      increment: 0,
      timeElapsed: 0,
    });
    const blackTimeControl = useRef({
      startingTime: 600,
      increment: 0,
      timeElapsed: 0,
    });
    const timeControls = new Map([
      ['1+0', {startingTime: 60, increment: 0}],
      ['3+0', {startingTime: 180, increment: 0}],
      ['3+2', {startingTime: 180, increment: 2}],
      ['10+0', {startingTime: 600, increment: 0}],
      ['15+10', {startingTime: 900, increment: 10}],
      ['30+20', {startingTime: 1800, increment: 20}],
      ['90+30', {startingTime: 5400, increment: 30}],
    ]);
    const [timeControl, setTimeControl] = useState('infinite'); */

    useEffect(() => {
        engine.current = new Engine();
        engine.current.init();
        bot1_AI.current = new BotsAI(bot1_Behaviour, bot1_Level, 'w');
        bot2_AI.current = new BotsAI(bot2_Behaviour, bot2_Level, 'b');
    }, []);

    // TODO: Supprimer ?
    /* useEffect(() => {
      console.log('New Level : ' + databaseRating);
      const botColor = playerColor === 'w' ? 'b' : 'w';
      botAI.current = new BotsAI(botBehaviour, databaseRating, botColor);
    }, [playerColor]); */

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

    function movesHistorySan(gamePGN: string){
      let pgnAfter = gamePGN.replaceAll(/\d*\.\s/gm, (test) => test.trim());

      return pgnAfter.split(' ');
    }

    async function playComputerMove() {
      console.log('Play computer move');
      if(game.pgn().includes('#')) return;
 
      const move: Move | undefined = game.fen().includes(' w ') ? await bot1_AI.current?.makeMove(game) : await bot2_AI.current?.makeMove(game);

      if(move && move.type >= 0){
        gameMove(move.notation, move.type);
        const newTimeout = setTimeout(playComputerMove, moveDelay);
        setCurrentTimeout(newTimeout);
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
      const promotion = getPromotion(sourceSquare, piece);
      gameMove(sourceSquare + targetSquare + promotion, 0);
  
      if(gameStarted){
        const newTimeout = setTimeout(playComputerMove, 300);
        setCurrentTimeout(newTimeout);
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

    const gamePGN = () => {
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
    }

    const analysisMenu =
      <div className=" flex flex-col justify-center items-center gap-5">
        <Link
          className=" m-4 p-1 bg-fuchsia-600 text-white border rounded cursor-pointer"
          href = {{
            pathname: '/game-analysis',
            query: {
              pgn: game.pgn(),
              depth: 12
            }
          }}
        >
          Analyse rapide
        </Link>
        <Link
          className=" m-4 p-1 bg-fuchsia-600 text-white border rounded cursor-pointer"
          href = {{
            pathname: '/game-analysis',
            query: {
              pgn: game.pgn(),
              depth: 16
            }
          }}
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
      {`${bot1_Behaviour}(${bot1_Level}) VS ${bot2_Behaviour}(${bot2_Level})`}
    </h4>

    const pgnComponentDesktop =
      <div className=" text-white w-1/4 hidden h-full md:flex flex-col flex-wrap">
        {gamePGN()}
      </div>
    
    const pgnComponentSmartphone =
      <div className=" text-white overflow-y-auto w-full md:hidden h-full flex flex-col flex-wrap mt-10">
        {gamePGN()}
      </div>

    // TODO: Problème d'horloge lorsqu'on switch de position, le temps défile pour le mauvais joueur
    const boardComponent =
      <div className=" flex flex-col justify-center items-center h-[300px] md:h-[500px] w-[95vw] md:w-[500px] my-10" >
          <Chessboard 
            id="PlayVsRandom"
            position={currentFen}
            onPieceDrop={onDrop} 
            boardOrientation={playerColor === 'w' ? 'white' : 'black'}
          />
      </div>

    const resetButton = <button
      className=" m-4 p-1 bg-white border rounded cursor-pointer"
      onClick={() => {
        game.reset();
        clearTimeout(currentTimeout);
        setGameStarted(false);
        scoreHistory.current = [];
        setWinner('');
      }}
    >
      reset
    </button>

    const startGameButton = <button
        className=" bg-white border rounded cursor-pointer flex flex-none"
        onClick={() => {
          setGameStarted(true);
          gameActive.current = true;
          playComputerMove();
        }}
      >
        Start Game
      </button>

    const switchButton = <button
      className=" bg-white border rounded cursor-pointer"
      onClick={() => {
        playerColor === 'w' ? setPlayerColor('b') : setPlayerColor('w')
      }}
    >
      Switch
    </button>

    const buttonsComponent =
      <div className="flex justify-center mt-10 md:mt-0 items-center gap-2 w-full h-fit" >
        {startGameButton}
        {switchButton}
      </div>

    const gameComponent = 
      <div className="flex flex-col justify-start items-center h-full">
        {titleComponent}
        <EvalAndWinrate 
          game={game} 
          databaseRating={'Master'} 
          winner={winner} 
          startingFen={DEFAULT_POSITION}
          currentFen={currentFen} 
          movesList={toolbox.convertHistorySanToLan(toolbox.convertPgnToHistory(game.pgn()), DEFAULT_POSITION)}
          showEval={showEval} 
        />
        {boardComponent}
        {buttonsComponent}
      </div>

    const gameContainer =
      <div className="flex flex-row justify-center items-center w-full md:w-1/2 h-full md:pl-5" >
        {gameComponent}
      </div>

    return (
      <div className="flex flex-col md:flex-row justify-start md:justify-stretch items-center md:items-start bg-cyan-900 h-screen w-full overflow-auto" >
          {pgnComponentDesktop}
          {gameContainer}
          {gameOverWindow}
          {pgnComponentSmartphone}
      </div>
    )
}

export default BotVsBotPage;