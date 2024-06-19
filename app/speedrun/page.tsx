/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import { useEffect, useRef, useState } from "react";
import {Chess, Color, DEFAULT_POSITION, PieceSymbol} from "chess.js";
import { Chessboard } from "react-chessboard";
import { Piece, Square } from "react-chessboard/dist/chessboard/types";
import EvalAndWinrate from "../components/EvalAndWinrate";
import Clock from "../components/Clock";
import Engine, { EvalResultSimplified } from "../engine/Engine";
import Link from "next/link";
import BotsAI, { Behaviour, Move } from "../bots-ai/BotsAI";
import { useSearchParams } from "next/navigation";
import GameToolBox from "../game-toolbox/GameToolbox";
import { PiVirtualReality } from "react-icons/pi";
import { FaCirclePlay } from "react-icons/fa6";
import { FaFontAwesomeFlag } from "react-icons/fa";
import { FaRotate } from "react-icons/fa6";
import { fetchChessDotComDB, safeFetchPlayerLichessDB } from "../libs/fetchLichess";


const SpeedrunPage = () => {
    const searchParams = useSearchParams();
    //const botElo: number = eval(searchParams.get('elo') || '1500');
    //const botBehaviour: Behaviour = searchParams.get('behaviour') as Behaviour || 'default';
    const eloMin: number = eval(searchParams.get('eloMin') || '400');
    const eloMax: number = eval(searchParams.get('eloMax') || '2000');
    const eloStep: number = eval(searchParams.get('eloStep') || '10');
    const timeControl = searchParams.get('timeControl') || 'infinite';
    const playerColorBase = searchParams.get('playerColor') || 'random';
    const [playerColor, setPlayerColor] = useState<Color>('w');
    //const playerElo: number = eval(searchParams.get('playerElo') || '400');
    const [playerElo, setPlayerElo] = useState<number>(eval(searchParams.get('playerElo') || '400'));
    const toolbox = new GameToolBox();
    const gameActive = useRef(false);
    const [game, setGame] = useState(new Chess());
    const virtualGame = useRef(new Chess());
    const engine = useRef<Engine>();
    const botAI = useRef<BotsAI>();
    //const [playerColor, setPlayerColor] = useState<Color>(Math.random() < 0.5 ? 'w' : 'b');
    const [botElo, setBotElo] = useState<number>(playerElo);
    const [botBehaviour, setBotBehaviour] = useState<Behaviour>('default');
    //const [viewColor, setViewColor] = useState<Color>('w');
    const [gameStarted, setGameStarted] = useState(false);
    const [currentTimeout, setCurrentTimeout] = useState<NodeJS.Timeout>();
    //const [databaseRating, setDatabaseRating] = useState('Master');
    //const [botBehaviour, setBotBehaviour] = useState<Behaviour>('default');
    const [currentFen, setCurrentFen] = useState(DEFAULT_POSITION);
    const [virtualFen, setVirtualFen] = useState(DEFAULT_POSITION);
    const [isVirtualMode, setIsVirtualMode] = useState(false);
    const [engineEval, setEngineEval] = useState('0.3');
    const [showEval, setShowEval] = useState(true);
    const scoreHistory = useRef(new Array());
    const movesTypeRef = useRef(new Array()); // -1: erreur, 0(blanc): joueur, 1(jaune): lichess, 2(vert clair): stockfish, 3(vert foncé): stockfish forcé, 4(rouge): random, 5(rose): human
    const [showGameoverWindow, setShowGameoverWindow] = useState(false);
    const [winner, setWinner] = useState(''); // 'w' -> blancs gagnent, 'b' -> noirs gagnent, 'd' -> draw
    const whiteTimeControl = useRef({
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

    const gimmicks: {min: number, max: number, gimmicks: {gimmick: Behaviour, chance: number}[]}[] = [
      {
        min: 0,
        max: 99,
        gimmicks: [
          {
            gimmick: 'random-player',
            chance: 50,
          },
          {
            gimmick: 'shy',
            chance: 60,
          },
          {
            gimmick: 'botez-gambit',
            chance: 80
          },
          {
            gimmick: 'blundering',
            chance: 100
          }
        ]
      },
      {
        min: 100,
        max: 499,
        gimmicks: [
          {
            gimmick: 'human',
            chance: 70,
          },
          {
            gimmick: 'queen-player',
            chance: 90
          },
          {
            gimmick: 'pawn-pusher',
            chance: 100
          }
        ]
      },
      {
        min: 500,
        max: 999,
        gimmicks: [
          {
            gimmick: 'human',
            chance: 70,
          },
          {
            gimmick: 'caro-london',
            chance: 75
          },
          {
            gimmick: 'copycat',
            chance: 80
          },
          {
            gimmick: 'fianchetto-sniper',
            chance: 85
          },
          {
            gimmick: 'bongcloud',
            chance: 90
          },
          {
            gimmick: 'stonewall',
            chance: 100
          },
        ]
      },
      {
        min: 1000,
        max: 1499,
        gimmicks: [
          {
            gimmick: 'human',
            chance: 70,
          },
          {
            gimmick: 'caro-london',
            chance: 80
          },
          {
            gimmick: 'gambit-fanatic',
            chance: 90
          },
          {
            gimmick: 'fianchetto-sniper',
            chance: 95
          },
          {
            gimmick: 'cow-lover',
            chance: 100
          },
        ]
      },
      {
        min: 1500,
        max: 2999,
        gimmicks: [
          {
            gimmick: 'human',
            chance: 75,
          },
          {
            gimmick: 'indian-king',
            chance: 80
          },
          {
            gimmick: 'gambit-fanatic',
            chance: 90
          },
          {
            gimmick: 'dragon',
            chance: 100
          },
        ]
      },
      {
        min: 3000,
        max: 3200,
        gimmicks: [
          {
            gimmick: 'stockfish-only',
            chance: 75,
          },
          {
            gimmick: 'dragon',
            chance: 100,
          },
        ]
      },
    ]

    function pickRandomBehaviour(botElo: number): Behaviour{
        const behaviourRand = Math.random()*100;
        let botBehaviour: Behaviour = 'default';

        gimmicks.forEach(gimmick => {
          if(gimmick.min <= botElo && botElo <= gimmick.max){
            gimmick.gimmicks.forEach(behaviour => {
              if(botBehaviour === 'default' && behaviourRand <= behaviour.chance) botBehaviour = behaviour.gimmick;
            })
          }
        })

        console.log('Selected bot behaviour: ' + botBehaviour);

        return botBehaviour;
    }

    useEffect(() => {
        engine.current = new Engine();
        engine.current.init();
        const newPlayerColor = playerColorBase === 'random' ? (Math.random() < 0.5 ? 'w' : 'b') : playerColorBase;
        const botColor = playerColor === 'w' ? 'b' : 'w';
        const newBotElo = Math.round(Math.min(3200, Math.max(0, playerElo + (Math.random()*100 - 50))));
        //TODO: Génération aléatoire du comportement et de l'élo
        const newBotBehaviour = pickRandomBehaviour(newBotElo);
        botAI.current = new BotsAI(newBotBehaviour, newBotElo, botColor, timeControl);
        setPlayerColor(newPlayerColor as Color);
        setBotElo(newBotElo);
        setBotBehaviour(newBotBehaviour);
        console.log('Player Color: ' + newPlayerColor);
        console.log("Bot Elo: " + newBotElo);
        console.log("Bot Behaviour: " + newBotBehaviour);
        console.log(timeControl);
    }, []);

    useEffect(() => {
      const botColor = playerColor === 'w' ? 'b' : 'w';
      //botAI.current = new BotsAI(botBehaviour, botElo, botColor, timeControl);
      botAI.current?.changeColor(botColor);
    }, [playerColor]);

    const gameMove = (moveNotation: string, moveType: number) => {
      game.move(moveNotation);
      setCurrentFen(game.fen());
      setVirtualFen(game.fen());
      movesTypeRef.current.push(moveType);
      toolbox.countMaterial(game.board(), setWhiteMaterialAdvantage, setBlackMaterialAdvantage);
      checkGameOver();
    }

    const gameVirtualMove = (moveNotation: string) => {
      virtualGame.current.move(moveNotation);
      setVirtualFen(virtualGame.current.fen());
      toolbox.countMaterial(virtualGame.current.board(), setWhiteMaterialAdvantage, setBlackMaterialAdvantage);
    }

    // TODO: Problème de dame noire qui ne peut plus bouger dans la scandinave (cf photo)
    const switchMode = () => {
      virtualGame.current.load(currentFen);
      toolbox.countMaterial(game.board(), setWhiteMaterialAdvantage, setBlackMaterialAdvantage);
      setVirtualFen(currentFen);
      setIsVirtualMode(!isVirtualMode);
    }

    function resetGame() {
        const newBotElo = Math.round(Math.min(3200, Math.max(0, playerElo + (Math.random()*100 - 50))));
        const newPlayerColor = playerColorBase === 'random' ? (Math.random() < 0.5 ? 'w' : 'b') : playerColorBase;
        const newBotColor = playerColor === 'w' ? 'b' : 'w';
        const newBotBehaviour = pickRandomBehaviour(newBotElo);
        game.reset();
        engine.current?.newGame();
        //botAI.current?.reset();
        console.log(newBotElo);
        botAI.current?.new(newBotBehaviour, newBotElo, newBotColor, timeControl);
        gameActive.current = false;
        movesTypeRef.current = [];
        setShowGameoverWindow(false);
        setWinner('');
        setPlayerColor(newPlayerColor as Color);
        setBotBehaviour(newBotBehaviour);
        setBotElo(newBotElo);
        setGameStarted(false);
        setIsVirtualMode(false);
        setCurrentFen(DEFAULT_POSITION);
        setVirtualFen(DEFAULT_POSITION);
        setWhiteMaterialAdvantage({
            pawn: 0,
            knight: 0,
            bishop: 0,
            rook: 0,
            queen: 0,
            points: 0,
        });
        setBlackMaterialAdvantage({
            pawn: 0,
            knight: 0,
            bishop: 0,
            rook: 0,
            queen: 0,
            points: 0,
        });
    }

    function gameOver(winner: string) {
      console.log('Game Over !');
      console.log(game.pgn());
      gameActive.current = false;
      /* engine.current?.quit();
      botAI.current?.disable(); */
      engine.current?.stop();
      botAI.current?.pause();
      setWinner(winner);
      let newPlayerElo = playerElo;
      
      switch (winner) {
        case 'd':
          setEngineEval('1/2 - 1/2');
          if(playerElo >= (botAI.current?.getElo() || botElo)){
            newPlayerElo+= eloStep/2;
          }else{
            newPlayerElo-= eloStep/2;
          }
          setPlayerElo(Math.max(0, newPlayerElo));
          break;
        case 'w':
          setEngineEval('1 - 0');
          if(playerColor === 'w'){
            newPlayerElo+= eloStep;
          }else{
            newPlayerElo-= eloStep;
          }
          setPlayerElo(Math.max(0, newPlayerElo));
          break;
        case 'b':
          setEngineEval('0 - 1');
          if(playerColor === 'b'){
            newPlayerElo+= eloStep;
          }else{
            newPlayerElo-= eloStep;
          }
          setPlayerElo(Math.max(0, newPlayerElo));
          break;
        default:
          break;
      }
      
      setShowGameoverWindow(true);
    }
    
    function checkGameOver() {
      if(!gameActive.current) return false;
      if (game.isGameOver()){
        
        // TODO: Modifier si on veut directement relancer la partie depuis un bouton
        /* delete engine.current;
        delete botAI.current; */
        if(game.isDraw() || game.isInsufficientMaterial() || game.isStalemate() || game.isInsufficientMaterial()) {
          gameOver('d');
        }
        if(game.isCheckmate()){
          
          if(game.turn() === 'w'){
            gameOver('b');
          }else{
            gameOver('w');
          }
        }
        return true;
      }
      return false;
    }

    function resign() {
      if(playerColor === 'w'){
        gameOver('b');
      }else{
        gameOver('w');
      }
    }

    function movesHistorySan(gamePGN: string){
      let pgnAfter = gamePGN.replaceAll(/\d*\.\s/gm, (test) => test.trim());

      return pgnAfter.split(' ');
    }

    function getTimeControlDelay() {
      if(timeControl === 'infinite') return 300;
      //@ts-expect-error
      let rawDelay = (timeControls.get(timeControl)?.startingTime/60);
      if(game.history().length <= 10) rawDelay =  Math.min(5,rawDelay/4); // On joue plus vite dans l'ouverture
      if(game.turn() === 'w'){
        if((whiteTimeControl.current.startingTime - whiteTimeControl.current.timeElapsed) < whiteTimeControl.current.startingTime*0.2){
          rawDelay/=2;
          console.log("Les blancs ont 20% ou moins de leur temps initial !");
        }
        if((whiteTimeControl.current.startingTime - whiteTimeControl.current.timeElapsed) < whiteTimeControl.current.startingTime*0.1){
          rawDelay/=2;
          console.log("Les blancs ont 10% ou moins de leur temps initial !");
        }
      }else{
        if((blackTimeControl.current.startingTime - blackTimeControl.current.timeElapsed) < blackTimeControl.current.startingTime*0.2){
          rawDelay/=2;
          console.log("Les noirs ont 20% ou moins de leur temps initial !");
        }
        if((blackTimeControl.current.startingTime - blackTimeControl.current.timeElapsed) < blackTimeControl.current.startingTime*0.1){
          rawDelay/=2;
          console.log("Les noirs ont 10% ou moins de leur temps initial !");
        }
      }
      let randDelay = Math.max(rawDelay,Math.random()*rawDelay*2)*1000;
      return randDelay;
    }

    async function playComputerMove() {
      console.log('Play computer move, game active ? ' + gameActive.current);
      if(game.pgn().includes('#') || !gameActive.current) return;
      const move: Move | undefined = await botAI.current?.makeMove(game);

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
      if(isVirtualMode){
        if(virtualGame.current.get(sourceSquare).type === 'p' && piece.charAt(1) !== 'P'){
          return piece.charAt(1).toLowerCase();
        }
        return '';
      }

      if(game.get(sourceSquare).type === 'p' && piece.charAt(1) !== 'P'){
        return piece.charAt(1).toLowerCase();
      }
      return '';
    }
  
    function onDrop(sourceSquare: Square, targetSquare: Square, piece: Piece) {
      const promotion = getPromotion(sourceSquare, piece);
      
      if(isVirtualMode) {
        gameVirtualMove(sourceSquare + targetSquare + promotion);
        return true;
      }

      if(gameStarted && game.get(sourceSquare).color !== playerColor) return false;

      gameMove(sourceSquare + targetSquare + promotion, 0);
  
      let delay = getTimeControlDelay();
      if(botElo === 3200) delay = 0;
      if(gameStarted){
        const newTimeout = setTimeout(playComputerMove, delay);
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

    function clearEngines(){
      console.log('Clear engines');
      engine.current?.quit();
      botAI.current?.disable();
    }

    async function fetchPlayerDB() {
      //console.log('Fetch Lichess DB of Hippo31');
      //await safeFetchPlayerLichessDB('Hippo31', 'w', ['e2e4'], 'Intermediate');
      console.log('Fetch Chess.com DB (Hikaru): ');
      await fetchChessDotComDB();
    }

    async function test() {
      console.log('Test engine.findBestMoves()');
      const stockfishBestMoves: EvalResultSimplified[] = await engine.current?.findBestMoves(game.fen(), 10, 20, 3, false) || [];

      console.log(game.fen());
      console.log(stockfishBestMoves);
    }

    const analysisMenu =
      <div className=" flex flex-col justify-center items-center gap-5">
        <Link
          className=" m-4 p-1 bg-fuchsia-600 text-white border rounded cursor-pointer"
          onClick={() => clearEngines()}
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
        <div
          className=" m-4 p-1 bg-fuchsia-600 text-white border rounded cursor-pointer"
          onClick={() => resetGame()}
        >
          Adversaire suivant
        </div>
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

    const titleComponent = <h4 className=" text-xl font-semibold text-white my-5 md:my-2" >
      Entraînement
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
      <div className=" relative flex flex-col justify-center items-center h-fit md:h-[500px] w-[95vw] md:w-[500px] my-10" >
          <div className=" relative flex justify-start p-2 w-full h-10 font-medium bg-slate-100 rounded-t-md">
            <div className=" h-full flex justify-start items-center flex-grow-[4]" >
              {botAI.current?.getUsername()} ({botElo}) {playerColor === 'w' ? (
                showMaterialAdvantage('b')
              ) : (
                showMaterialAdvantage('w')
              )}
            </div>
            <Clock 
              game={game} 
              turnColor={game.turn()} 
              clockColor={playerColor === 'w' ? 'b' : 'w'}
              timeControl={timeControl} 
              timeControls={timeControls}
              gameOver={gameOver}
              gameStarted={gameStarted} 
              gameActive={gameActive}
            />
          </div>
          <Chessboard 
            id="PlayVsRandom"
            position={isVirtualMode ? virtualFen : currentFen}
            onPieceDrop={onDrop} 
            boardOrientation={playerColor === 'w' ? 'white' : 'black'}
          />
          <div className=" relative flex justify-around p-2 w-full h-10 font-medium rounded-b-md bg-slate-100">
            <div className=" h-full flex justify-start items-center flex-grow-[4]" >
              Joueur ({playerElo}) {playerColor === 'w' ? (
                showMaterialAdvantage('w')
              ) : (
                showMaterialAdvantage('b')
              )}
            </div>
            <Clock 
              game={game} 
              turnColor={game.turn()} 
              clockColor={playerColor === 'w' ? 'w' : 'b'}
              timeControl={timeControl} 
              timeControls={timeControls}
              gameOver={gameOver}
              gameStarted={gameStarted} 
              gameActive={gameActive}
            />
          </div>
          {
            isVirtualMode ? <div className=" absolute w-full h-full opacity-20 bg-cyan-400 pointer-events-none" >

            </div>
            :
            null
          }
      </div>

    const testButton =
      <button onClick={() => test()}>
        Stockfish
      </button>

    const startGameButton = !gameStarted ? 
      <div 
        onClick={() => {
          setGameStarted(true);
          gameActive.current = true;
          setShowEval(false);
          if(game.turn() !== playerColor){
            playComputerMove();
          }
        }}
        className=' h-[50px] w-[50px] flex flex-col justify-center items-center cursor-pointer hover:text-cyan-400'>
          <FaCirclePlay size={40} />
      </div>
      :
      <div onClick={() => resign()} className=' h-[50px] w-[50px] flex flex-col justify-center items-center cursor-pointer hover:text-cyan-400'>
        <FaFontAwesomeFlag size={40} />
      </div>

    const buttonsComponent =
      <div className="flex justify-center mt-5 pt-2 md:mt-0 items-center gap-5 w-full h-fit" >
        {startGameButton}
        {testButton}
      </div>

    const gameComponent = 
      <div className="flex flex-col justify-start items-center h-full">
        {titleComponent}
        {boardComponent}
        {buttonsComponent}
      </div>

    const gameContainer =
      <div className="flex flex-row justify-center items-center w-full md:w-1/2 h-full md:pl-5" >
        {gameComponent}
      </div>

    return (
      <div className="flex flex-col md:flex-row justify-start md:justify-stretch items-center md:items-start bg-cyan-900 h-[95vh] w-full overflow-auto" >
          {pgnComponentDesktop}
          {gameContainer}
          {gameOverWindow}
          {pgnComponentSmartphone}
      </div>
    )
}

export default SpeedrunPage;