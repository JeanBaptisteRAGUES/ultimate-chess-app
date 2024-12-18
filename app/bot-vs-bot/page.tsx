/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import { useEffect, useRef, useState } from "react";
import Image, { StaticImageData } from 'next/image';
import {Chess, Color, DEFAULT_POSITION} from "chess.js";
import { Chessboard } from "react-chessboard";
import { Piece, Square } from "react-chessboard/dist/chessboard/types";
import EvalAndWinrate from "../components/EvalAndWinrate";
import Clock, { Timestamp } from "../components/Clock";
import Engine from "../engine/Engine";
import Link from "next/link";
import BotsAI, { Behaviour, Move } from "../bots-ai/BotsAI";
import { useSearchParams } from "next/navigation";
import GameToolBox from "../game-toolbox/GameToolbox";
import { ImSwitch } from "react-icons/im"; // TODO: Bouton pour stopper le match
import { FaCirclePlay, FaRotate } from "react-icons/fa6";

import stockfishOnly_pp from "@/public/Bots_images/chess3d_stockfish-only.jpg";

const timestamps = new Map<string,Timestamp>([
  ['1+0', {
    startingTime: 60,
    timeElapsed: 0,
    increment: 0,
  }],
  ['3+0', {
    startingTime: 180,
    timeElapsed: 0,
    increment: 0,
  }],
  ['10+0', {
    startingTime: 600,
    timeElapsed: 0,
    increment: 0,
  }],
  ['90+30', {
    startingTime: 5400,
    timeElapsed: 0,
    increment: 30,
  }],
]);


const BotVsBotPage = () => {
    const searchParams = useSearchParams();
    //const databaseRating = searchParams.get('difficulty') || 'Master';
    const bot1_Behaviour: Behaviour = searchParams.get('bot1_Behaviour') as Behaviour || 'default';
    const bot2_Behaviour: Behaviour = searchParams.get('bot2_Behaviour') as Behaviour || 'default';
    const bot1_Elo: number = eval(searchParams.get('bot1_Elo') || '2600');
    const bot2_Elo: number = eval(searchParams.get('bot2_Elo') || '2600');
    const timeControl = searchParams.get('timeControl') || '3+0';
    const botTimestamp = timestamps.get(timeControl) || {
      startingTime: 180,
      timeElapsed: 0,
      increment: 0,
    };

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
        engine.current.init();
        bot1_AI.current = new BotsAI(bot1_Behaviour, bot1_Elo, 'w', timeControl, false);
        bot2_AI.current = new BotsAI(bot2_Behaviour, bot2_Elo, 'b', timeControl, false);
    }, []);

    const gameMove = (moveNotation: string, moveType: number) => {
      game.move(moveNotation);
      toolbox.countMaterial(game.board(), setWhiteMaterialAdvantage, setBlackMaterialAdvantage);
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
        engine.current?.quit();
        bot1_AI.current?.disable();
        bot2_AI.current?.disable();
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

    function stopMatch() {
      setEngineEval('1/2 - 1/2');
      setWinner('d');
      console.log('Game Over !');
      console.log(game.pgn());
      gameActive.current = false;
      engine.current?.quit();
      bot1_AI.current?.disable();
      bot2_AI.current?.disable();
      setShowGameoverWindow(true);
    }

    function movesHistorySan(gamePGN: string){
      let pgnAfter = gamePGN.replaceAll(/\d*\.\s/gm, (test) => test.trim());

      return pgnAfter.split(' ');
    }

    async function playComputerMove() {
      //console.log('Play computer move');
      if(!gameActive.current || game.pgn().includes('#')) return;
 
      const move: Move | undefined = game.fen().includes(' w ') ? await bot1_AI.current?.makeMove(game, botTimestamp) : await bot2_AI.current?.makeMove(game, botTimestamp);

      if(gameActive.current && move && move.type >= 0){
        gameMove(move.notation, move.type);
        //const newTimeout = setTimeout(playComputerMove, moveDelay);
        //setCurrentTimeout(newTimeout);
        playComputerMove();
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
      if(gameStarted) return false;
      
      const promotion = getPromotion(sourceSquare, piece);
      gameMove(sourceSquare + targetSquare + promotion, 0);
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
        case 5:
          return <span onClick={() => showMovePosition(i)} key={i} className=" text-rose-400 cursor-pointer" >{move}</span>             
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
      {`${bot1_Behaviour}(${bot1_Elo}) VS ${bot2_Behaviour}(${bot2_Elo})`}
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
      <div className=" flex flex-col justify-center items-center h-[300px] md:h-[500px] w-[95vw] md:w-[500px] my-16 md:my-10" >
          <div className=" relative flex justify-start p-2 w-full h-10 font-medium bg-slate-100 rounded-t-md">
            <div className=" h-full flex justify-start items-center flex-grow-[4]" >
              <span className=' w-9 h-9 flex justify-center items-center rounded mr-3' >
                <Image
                    src={playerColor === 'w' ? (bot2_AI.current?.getProfilePicture() || stockfishOnly_pp) : (bot1_AI.current?.getProfilePicture() || stockfishOnly_pp)}
                    alt="Picture of the author"
                    width={50}
                    height={50}
                    // blurDataURL="data:..." automatically provided
                    placeholder="blur" // Optional blur-up while loading
                />
              </span>
              {playerColor === 'w' ?  
                  `${bot2_AI.current?.getUsername()} (${bot2_Elo}) ${showMaterialAdvantage('b')}` 
                : 
                  `${bot1_AI.current?.getUsername()} (${bot1_Elo}) ${showMaterialAdvantage('w')}`
              }
            </div>
          </div>
          <Chessboard 
            id="PlayVsRandom"
            position={currentFen}
            onPieceDrop={onDrop} 
            boardOrientation={playerColor === 'w' ? 'white' : 'black'}
          />
          <div className=" relative flex justify-start p-2 w-full h-10 font-medium bg-slate-100 rounded-b-md">
            <div className=" h-full flex justify-start items-center flex-grow-[4]" >
              <span className=' w-9 h-9 flex justify-center items-center rounded mr-3' >
                <Image
                    src={playerColor === 'b' ? (bot2_AI.current?.getProfilePicture() || stockfishOnly_pp) : (bot1_AI.current?.getProfilePicture() || stockfishOnly_pp)}
                    alt="Picture of the author"
                    width={50}
                    height={50}
                    // blurDataURL="data:..." automatically provided
                    placeholder="blur" // Optional blur-up while loading
                />
              </span>
              {playerColor === 'b' ?  
                  `${bot2_AI.current?.getUsername()} (${bot2_Elo}) ${showMaterialAdvantage('b')}` 
                : 
                  `${bot1_AI.current?.getUsername()} (${bot1_Elo}) ${showMaterialAdvantage('w')}`
              }
            </div>
          </div>
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

    const startGameButton = !gameStarted ? 
      <div 
        onClick={() => {
          setGameStarted(true);
          gameActive.current = true;
          playComputerMove();
        }}
        className=' h-[50px] w-[50px] flex flex-col justify-center items-center cursor-pointer hover:text-cyan-400'>
          <FaCirclePlay size={40} />
      </div>
      :
      <div onClick={() => stopMatch()} className=' h-[50px] w-[50px] flex flex-col justify-center items-center cursor-pointer hover:text-cyan-400'>
        <ImSwitch size={40} />
      </div>

    const switchButton = 
      <div 
        onClick={() => {
          playerColor === 'w' ? setPlayerColor('b') : setPlayerColor('w')
        }} 
        className=' h-[50px] w-[50px] flex flex-col justify-center items-center cursor-pointer hover:text-cyan-400'>
          <FaRotate size={40} />
      </div>

    const buttonsComponent =
      <div className="flex justify-center mt-10 pt-2 md:mt-0 items-center gap-5 w-full h-fit" >
        {startGameButton}
        {switchButton}
      </div>

    const gameComponent = 
      <div className="flex flex-col justify-start items-center h-full">
        <EvalAndWinrate 
            game={game} 
            databaseRating={'Master'} 
            winner={winner} 
            startingFen={DEFAULT_POSITION}
            currentFen={currentFen} 
            fenEvalMap={new Map()}
            movesList={toolbox.convertHistorySanToLan(toolbox.convertPgnToHistory(game.pgn()), DEFAULT_POSITION)}
            showEval={showEval} 
          />
        {boardComponent}
        {buttonsComponent}
      </div>

    const gameContainer =
      <div className="flex flex-row justify-center items-center w-full pt-5 md:mt-0 md:w-1/2 h-full md:pl-5" >
        {gameComponent}
      </div>

    return (
      <div className="flex flex-col md:flex-row justify-start md:justify-stretch items-center md:items-start bg-slate-800 h-[95vh] w-full overflow-auto" >
          {pgnComponentDesktop}
          {gameComponent}
          {gameOverWindow}
          {pgnComponentSmartphone}
      </div>
    )
}

export default BotVsBotPage;