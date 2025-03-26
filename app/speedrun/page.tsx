/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Image, { StaticImageData } from 'next/image';
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
import SpeedrunClock from "../components/SpeedrunClock";

import stockfishOnly_pp from "@/public/Bots_images/chess3d_stockfish-only.jpg";

type GameInfos = {
  title: string,
  pgn: string,
  result: string,
  currentElo: number,
  eloGain: number,
}


const SpeedrunPage = () => {
    const searchParams = useSearchParams();
    const eloMin: number = eval(searchParams.get('eloMin') || '400');
    const eloMax: number = eval(searchParams.get('eloMax') || '2000');
    const eloStep: number = eval(searchParams.get('eloStep') || '10');
    const timeControl = searchParams.get('timeControl') || 'infinite';
    const playerColorBase = searchParams.get('playerColor') || 'random';
    const startingPgnWhite: string = searchParams.get('startingPgnWhite') || '';
    const startingPgnBlack: string = searchParams.get('startingPgnBlack') || '';
    const [playerColor, setPlayerColor] = useState<Color>('w');
    const [playerElo, setPlayerElo] = useState<number>(eval(searchParams.get('playerElo') || '400'));
    const toolbox = new GameToolBox();
    const gameActive = useRef(false);
    const [game, setGame] = useState(new Chess());
    const virtualGame = useRef(new Chess());
    const engine = useRef<Engine>();
    const botAI = useRef<BotsAI>();
    const [botElo, setBotElo] = useState<number>(playerElo);
    const [botBehaviour, setBotBehaviour] = useState<Behaviour>('default');
    const [gameStarted, setGameStarted] = useState(false);
    const [currentTimeout, setCurrentTimeout] = useState<NodeJS.Timeout>();
    const [currentFen, setCurrentFen] = useState(DEFAULT_POSITION);
    const [virtualFen, setVirtualFen] = useState(DEFAULT_POSITION);
    const [isVirtualMode, setIsVirtualMode] = useState(false);
    const [moveInfos, setMoveInfos] = useState('Description des étapes de réflexion du bot pour trouver le coup suivant.');
    const [engineEval, setEngineEval] = useState('0.3');
    const [showEval, setShowEval] = useState(true);
    const gamesHistory = useRef<GameInfos[]>(new Array());
    /* const gamesHistory = useRef<GameInfos[]>([
      {
        title: "Joueur VS Adversaire_1",
        pgn: "1.e4 e5 2.Nf3 Nc6",
        result: "1 - 0",
        currentElo: 0,
        eloGain: 100
      },
      {
        title: "Adversaire_2 VS Joueur",
        pgn: "1.e4 c5 2.Nf3 e6",
        result: "0 - 1",
        currentElo: 100,
        eloGain: 200
      },
      {
        title: "Joueur VS Adversaire_3",
        pgn: "1.e4 e5 2.Nf3 Nf6",
        result: "1/2 - 1/2",
        currentElo: 200,
        eloGain: 0
      },
    ]); */
    const movesTypeRef = useRef(new Array()); // -1: erreur, 0(blanc): joueur, 1(jaune): lichess, 2(vert clair): stockfish, 3(vert foncé): stockfish forcé, 4(rouge): random, 5(rose): human
    const [showGameoverWindow, setShowGameoverWindow] = useState(0); // 0: Rien, 1: Adversaire suivant, 2: Bilan Speedrun
    const [winner, setWinner] = useState(''); // 'w' -> blancs gagnent, 'b' -> noirs gagnent, 'd' -> draw
    const [speedrunTime, setSpeedrunTime] = useState('00:00:00');
    const [botTimestamp, setBotTimestamp] = useState({
      startingTime: 600,
      increment: 0,
      timeElapsed: 0,
    });
    /* const whiteTimeControl = useRef({
      startingTime: 600,
      increment: 0,
      timeElapsed: 0,
    });
    const blackTimeControl = useRef({
      startingTime: 600,
      increment: 0,
      timeElapsed: 0,
    }); */
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
            gimmick: 'semi-random',
            chance: 60,
          },
          {
            gimmick: 'botez-gambit',
            chance: 90
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
            chance: 90,
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
            chance: 80,
          },
          {
            gimmick: 'homemade-engine',
            chance: 90
          },
          {
            gimmick: 'copycat',
            chance: 94
          },
          {
            gimmick: 'fianchetto-sniper',
            chance: 97
          },
          {
            gimmick: 'bongcloud',
            chance: 98
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
            chance: 85,
          },
          {
            gimmick: 'gambit-fanatic',
            chance: 95
          },
          {
            gimmick: 'fianchetto-sniper',
            chance: 97
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
            chance: 85,
          },
          {
            gimmick: 'indian-king',
            chance: 87
          },
          {
            gimmick: 'gambit-fanatic',
            chance: 95
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
            gimmick: 'gambit-fanatic',
            chance: 100,
          },
        ]
      },
    ];

    function pickRandomBehaviour(botElo: number): Behaviour{
        const behaviourRand = Math.random()*100;
        let botBehaviour: Behaviour = 'human';
        //console.log(behaviourRand);

        if(startingPgnWhite === '' && startingPgnBlack === '') {
          gimmicks.forEach(gimmick => {
            if(gimmick.min <= botElo && botElo <= gimmick.max){
              gimmick.gimmicks.forEach(behaviour => {
                if(botBehaviour === 'default' && behaviourRand <= behaviour.chance) botBehaviour = behaviour.gimmick;
              })
            }
          });
        }
        console.log(`%c Selected bot behaviour: ${botBehaviour}`, "color:green; font-size:14px;");

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
        
        const startingHistory = newPlayerColor === 'w' ? startingPgnWhite : startingPgnBlack;
        game.loadPgn(startingHistory);
        //console.log(startingHistory);
        //console.log(startingPgnWhite);
        //console.log(game.fen());
        //console.log(game.pgn());
        //console.log(game.history());
        setCurrentFen(game.fen());
        setVirtualFen(game.fen());
        
        botAI.current = new BotsAI(newBotBehaviour, newBotElo, botColor, timeControl, true);
        setPlayerColor(newPlayerColor as Color);
        setBotElo(newBotElo);
        setBotBehaviour(newBotBehaviour);
        //console.log('Player Color: ' + newPlayerColor);
        //console.log("Bot Elo: " + newBotElo);
        //console.log("Bot Behaviour: " + newBotBehaviour);
        //console.log(timeControl);
        //console.log(game.fen());
        movesTypeRef.current = [];
        //console.log(startingHistory);
        const historyArray = startingHistory.replaceAll('. ', '.').split(' ').filter(h => h.length > 0);
        //console.log(historyArray);
        historyArray.forEach((move, i) => movesTypeRef.current.push(0));
        //console.log(movesTypeRef.current);
    }, []);

    useEffect(() => {
      const botColor = playerColor === 'w' ? 'b' : 'w';
      //botAI.current = new BotsAI(botBehaviour, botElo, botColor, timeControl);
      botAI.current?.changeColor(botColor);
    }, [playerColor]);

    const gameMove = (moveNotation: string, moveType: number) => {
      //console.log('Play computer move (gameMove(moveNotation: string, moveType: number))');
      //console.log(game.fen());
      //console.log(game.moves());
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
        const newPlayerColor = playerColorBase === 'random' ? (playerColor === 'w' ? 'b' : 'w') : playerColorBase;
        const newBotColor = playerColor === 'w' ? 'b' : 'w';
        const newBotBehaviour = pickRandomBehaviour(newBotElo);

        game.reset();
        engine.current?.newGame();

        //TODO: Faire en sorte que ça remette à 0 la position chosie par le joueur
        const startingHistory = newPlayerColor === 'w' ? startingPgnWhite : startingPgnBlack;
        game.loadPgn(startingHistory);
        setCurrentFen(game.fen());
        setVirtualFen(game.fen());

        //botAI.current?.reset();
        //console.log(newBotElo);
        botAI.current?.new(newBotBehaviour, newBotElo, newBotColor, timeControl, true);
        gameActive.current = false;
        movesTypeRef.current = [];
        //console.log(startingHistory);
        const historyArray = startingHistory.replaceAll('. ', '.').split(' ').filter(h => h.length > 0);
        console.log(historyArray);
        historyArray.forEach((move, i) => movesTypeRef.current.push(0));
        setShowGameoverWindow(0);
        setWinner('');
        setPlayerColor(newPlayerColor as Color);
        setBotBehaviour(newBotBehaviour);
        setBotElo(newBotElo);
        setGameStarted(false);
        setIsVirtualMode(false);
        setMoveInfos('Description des étapes de réflexion du bot pour trouver le coup suivant.');

        //TODO: Peut créer des erreurs si la position de départ n'est pas DEFAULT_POSITION
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

    function stopSpeedrun() {
      //console.log('Stop Speedrun (TODO:)');
      setShowGameoverWindow(2);
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
          gamesHistory.current.push({
            title: playerColor === 'w' ? `Joueur VS ${botAI.current?.getUsername()}` : `${botAI.current?.getUsername()} VS Joueur`,
            pgn: game.pgn(),
            result: '1/2 - 1/2',
            currentElo: playerElo,
            eloGain: 0,
          });
          setPlayerElo(Math.max(0, playerElo));
          break;
        case 'w':
          setEngineEval('1 - 0');
          if(playerColor === 'w'){
            gamesHistory.current.push({
              title: `Joueur VS ${botAI.current?.getUsername()}`,
              pgn: game.pgn(),
              result: '1 - 0',
              currentElo: playerElo,
              eloGain: eloStep,
            });
            newPlayerElo+= eloStep;
          }else{
            gamesHistory.current.push({
              title: `${botAI.current?.getUsername()} VS Joueur`,
              pgn: game.pgn(),
              result: '1 - 0',
              currentElo: playerElo,
              eloGain: -eloStep,
            });
            newPlayerElo-= eloStep;
          }
          setPlayerElo(Math.max(0, newPlayerElo));
          break;
        case 'b':
          setEngineEval('0 - 1');
          if(playerColor === 'b'){
            gamesHistory.current.push({
              title: `${botAI.current?.getUsername()} VS Joueur`,
              pgn: game.pgn(),
              result: '0 - 1',
              currentElo: playerElo,
              eloGain: eloStep,
            });
            newPlayerElo+= eloStep;
          }else{
            gamesHistory.current.push({
              title: `Joueur VS ${botAI.current?.getUsername()}`,
              pgn: game.pgn(),
              result: '0 - 1',
              currentElo: playerElo,
              eloGain: -eloStep,
            });
            newPlayerElo-= eloStep;
          }
          setPlayerElo(Math.max(0, newPlayerElo));
          break;
        default:
          break;
      }
      
      if(newPlayerElo >= eloMax) {
        setShowGameoverWindow(2);
      }else{
        setShowGameoverWindow(1);
      }
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

    /* function getTimeControlDelay() {
      if(timeControl === 'infinite') return 300;
      //@ts-expect-error
      let rawDelay = (timeControls.get(timeControl)?.startingTime/60);
      console.log(`whiteTimeControl.current.startingTime: ${whiteTimeControl.current.startingTime}`);
      console.log(`whiteTimeControl.current.timeElapsed: ${whiteTimeControl.current.timeElapsed}`);
      console.log(`blackTimeControl.current.startingTime: ${blackTimeControl.current.startingTime}`);
      console.log(`blackTimeControl.current.startingTime: ${blackTimeControl.current.startingTime}`);
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
        if((whiteTimeControl.current.startingTime - whiteTimeControl.current.timeElapsed) < 20){
          rawDelay = 0.3;
          console.log("Les blancs ont moins de 20 secondes pour jouer !");
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
        if((blackTimeControl.current.startingTime - blackTimeControl.current.timeElapsed) < 20){
          rawDelay = 0.3;
          console.log("Les noirs ont moins de 20 secondes pour jouer !");
        }
      }
      let randDelay = Math.max(rawDelay,Math.random()*rawDelay*2)*1000;
      return randDelay;
    } */

    async function playComputerMove(botID: number) {
      //console.log('Play computer move, game active ? ' + gameActive.current);
      //console.log(`Bot current ID (${botAI.current?.getID()}) VS Request ID (${botID})`);
      if(game.pgn().includes('#') || !gameActive.current || botAI.current?.getID() !== botID) return;
      //console.log('Play computer move (playComputerMove(botID: number))');
      //console.log(game.fen());
      //console.log(game.moves());
      let move: Move | undefined = await botAI.current?.makeMove(game, botTimestamp);

      /* console.log(`Move: ${move.notation}`);
      console.log(`fen: ${game.fen()}`);
      console.log(`${move.notation} est valide: ${toolbox.isMoveValid(game.fen(), move.notation)}`); */

      if(move && move.type >= 0 && toolbox.isMoveValid(game.fen(), move.notation)){
        gameMove(move.notation, move.type);
        setMoveInfos(move?.moveInfos || '');
        return;
      } 
      console.log("Erreur lors de la génération d'un coup par l'ordinateur");
      move.notation = game.moves()[0];
      move.type = 4;
      gameMove(move.notation, move.type);
      return;
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
      const oldBotID = botAI.current?.getID() || Math.random();
      //console.log(game.fen());
      
      if(isVirtualMode) {
        gameVirtualMove(sourceSquare + targetSquare + promotion);
        return true;
      }

      if(!gameStarted) return false;
      if(gameStarted && game.get(sourceSquare).color !== playerColor) return false;

      gameMove(sourceSquare + targetSquare + promotion, 0);
  
      //let delay = getTimeControlDelay();
      //if(botElo === 3200) delay = 0;
      if(gameStarted && botAI.current){
        //const newTimeout = setTimeout(() => playComputerMove(oldBotID), delay);
        playComputerMove(oldBotID);
        //setCurrentTimeout(newTimeout);
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

    const speedrunMenu_1 =
      <div className=" flex flex-col justify-center items-center gap-5">
        <div
          className=" m-4 p-1 text-lg md:text-xl font-semibold text-cyan-300 brightness-110 cursor-pointer"
          onClick={() => stopSpeedrun()}
        >
          Arrêter le speedrun
        </div>
        <div
          className=" m-4 p-1 text-lg md:text-xl font-semibold text-cyan-300 brightness-110 cursor-pointer"
          onClick={() => resetGame()}
        >
          Adversaire suivant
        </div>
      </div>

    const speedrunMenu_2 =
      <div className=" flex flex-col justify-start items-center gap-5 h-full w-full">
        <div className=" flex flex-col justify-start items-center text-3xl text-cyan-400 brightness-110 font-bold w-full">{speedrunTime}</div>
        <div className=" flex flex-col justify-start items-start gap-5 w-full md:w-2/3 px-5 overflow-y-auto">
          {
            gamesHistory.current.map(gameInfos => {
              return <div key={gameInfos.title + gameInfos.pgn} className="flex flex-col justify-start items-start">
                <span className=" text-base md:text-lg font-semibold text-white" >{gameInfos.title}  ({gameInfos.currentElo} {gameInfos.eloGain >= 0 ? <span className=" text-green-600" >+{gameInfos.eloGain}</span> : <span className=" text-red-600" >{gameInfos.eloGain}</span>})</span>
                <span className=" text-white">{gameInfos.pgn.replaceAll('. ', '.').trim().slice(0, 50).replaceAll(/\d?\.?[a-zA-Z]+$|\d.$|\s\d$|\d\.O-O-$|\d\.O-$|O-O-$|O-$/gm, '')}...   {gameInfos.result}</span>
                <Link
                  className=" animate-pulse p-1 mt-1 text-cyan-400 brightness-110 cursor-pointer border-2 rounded-lg border-cyan-400 shadow-[0_0_2px_#fff,inset_0_0_2px_#fff,0_0_5px_#08f,0_0_15px_#08f,0_0_30px_#08f]"
                  onClick={() => clearEngines()}
                  href = {{
                    pathname: '/game-analysis',
                    query: {
                      pgn: gameInfos.pgn,
                      depth: 12
                    }
                  }}
                  target="_blank"
                >
                  Analyser
                </Link>
              </div>
            })
          }
        </div>
      </div>

    const gameOverWindow_1 = showGameoverWindow === 1 ? 
      <div className=" flex justify-center items-center w-full h-full absolute backdrop-blur top-0 left-0" >
        <div className=" flex flex-col justify-start items-center w-3/4 h-1/3 md:w-1/2 md:h-1/2 bg-slate-950 bg-opacity-80 border border-slate-600/40 rounded" >
          <div className=" flex justify-start items-center w-full h-fit">
            <button className=" text-white font-extrabold pl-2 md:pl-5 md:pt-2" onClick={() => setShowGameoverWindow(0)}>
              X
            </button>
          </div>
          <div className=" relative flex justify-center items-center w-full h-1/4 bg-transparent text-white rounded-t" >
            <div className=" text-lg md:text-2xl font-bold flex justify-center items-center">
              {
                winner === 'w' ? (playerColor === 'w' ? <h1 className="text-cyan-400 brightness-110" >Les blancs gagnent la partie !</h1> : <h1 className=" text-pink-400 brightness-110">Les blancs gagnent la partie !</h1>)
                :
                (
                  winner === 'b' ? (playerColor === 'b' ? <h1 className="text-cyan-400 brightness-110" >Les noirs gagnent la partie !</h1> : <h1 className=" text-pink-400 brightness-110">Les noirs gagnent la partie !</h1>)
                  :
                  <h1 className="text-slate-400 brightness-110" >Match nul</h1>
                )
              }
            </div>
          </div>
          <div className="flex justify-center items-center h-full w-full">
            {speedrunMenu_1}
          </div>
        </div>
      </div>
      :
      null

    const gameOverWindow_2 = showGameoverWindow === 2 ? 
      <div className=" flex justify-center items-center w-full h-full absolute backdrop-blur top-0 left-0" >
        <div className=" flex flex-col justify-start items-center w-4/5 h-2/3 md:w-1/2 md:h-1/2 bg-slate-950 bg-opacity-80 border border-slate-600/40 rounded" >
          <div className=" flex justify-start items-center w-full h-fit">
            <button className=" text-white font-extrabold pl-2 md:pl-5 md:pt-2" onClick={() => setShowGameoverWindow(0)}>
              X
            </button>
          </div>
          <div className="flex justify-center items-center h-full w-full overflow-y-hidden">
            {speedrunMenu_2}
          </div>
        </div>
      </div>
      :
      null

    /* const pgnComponentDesktop =
      <div className=" text-white w-1/4 hidden h-full md:flex flex-col flex-wrap">
        {gamePGN()}
      </div>
    
    const pgnComponentSmartphone =
      <div className=" text-white overflow-y-auto w-full md:hidden h-full flex flex-col flex-wrap mt-10">
        {gamePGN()}
      </div> */

    const pgnComponentDesktop =
      <div className=" text-white w-1/3 hidden h-full md:flex flex-col flex-wrap">
        {gamePGN()}
      </div>
    
    const pgnComponentSmartphone =
      <div className=" text-white overflow-y-auto w-full md:hidden h-1/5 flex flex-col gap-5 flex-wrap mt-2">
        {gamePGN()}
      </div>

    // TODO: Problème d'horloge lorsqu'on switch de position, le temps défile pour le mauvais joueur
    const boardComponent =
      <div className=" relative flex flex-col justify-center items-center h-min md:h-[480px] w-[95vw] md:w-[480px] mt-5 md:my-10" >
          <div className=" relative flex justify-start p-2 w-full h-10 font-medium bg-slate-100 rounded-t-md">
            <div className=" h-full flex justify-start items-center flex-grow-[4]" >
              <span className=' w-9 h-9 flex justify-center items-center rounded mr-3' >
                <Image
                    src={botAI.current?.getProfilePicture() || stockfishOnly_pp}
                    alt="Picture of the author"
                    width={50}
                    height={50}
                    // blurDataURL="data:..." automatically provided
                    placeholder="blur" // Optional blur-up while loading
                />
              </span>
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
              botColor={playerColor === 'w' ? 'b' : 'w'}
              timeControl={timeControl}
              gameOver={gameOver}
              setBotTimestamp={setBotTimestamp}
              gameStarted={gameStarted} 
              gameActive={gameActive}
            />
          </div>
          <div className=" relative w-full h-full flex justify-center items-center">
            <Chessboard 
              id="PlayVsRandom"
              position={isVirtualMode ? virtualFen : currentFen}
              onPieceDrop={onDrop} 
              boardOrientation={playerColor === 'w' ? 'white' : 'black'}
            />
          </div>
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
              botColor={playerColor === 'w' ? 'b' : 'w'}
              timeControl={timeControl} 
              gameOver={gameOver}
              setBotTimestamp={setBotTimestamp}
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
          if(game.turn() !== playerColor && botAI.current){
            //console.log('Play computer move (startGameButton)');
            //console.log(game.fen());
            //console.log(game.moves());
            playComputerMove(botAI.current.getID());
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
      <div className="flex justify-center pt-2 items-center gap-5 w-full h-fit" >
        {startGameButton}
      </div>

    const gameComponent = 
      <div className="flex flex-col justify-start items-center h-full">
        <SpeedrunClock gameActive={gameActive.current} setSpeedrunTime={setSpeedrunTime}/>
        {boardComponent}
        {buttonsComponent}
      </div>

    /* const gameContainer =
      <div className="flex flex-row justify-center items-center w-full md:w-1/2 h-full md:pl-5" >
        {gameComponent}
      </div> */
    const gameContainer =
      <div className="flex flex-row justify-center items-start md:items-center w-full md:w-2/3 h-fit md:h-full md:py-5" >
        {gameComponent}
      </div>

    /* return (
      <div className="flex flex-col md:flex-row justify-start md:justify-stretch items-center md:items-start bg-cyan-900 h-[95vh] w-full overflow-auto" >
          {pgnComponentDesktop}
          {gameContainer}
          {gameOverWindow_1}
          {gameOverWindow_2}
          {pgnComponentSmartphone}
      </div>
    ) */
   return (
    <div className="flex flex-col md:flex-row justify-start md:justify-center items-center md:items-center bg-slate-800 h-[95vh] w-full overflow-auto" >
        <div className=" flex flex-col md:flex-row justify-start md:justify-center items-center md:items-center h-4/5 md:h-full w-full md:w-2/3">
          {pgnComponentDesktop}
          {gameContainer}
          {gameOverWindow_1}
          {gameOverWindow_2}
          {pgnComponentSmartphone}
        </div>
        <div className="flex flex-col justify-start items-center text-xs md:text-base text-white overflow-y-auto pr-2 h-full w-full md:w-1/3">
          <p className="flex flex-row justify-start items-center text-cyan-400 text-sm md:text-xl font-semibold w-full" >Informations sur le dernier coup du bot:</p>
          <p className="flex flex-col justify-start items-start flex-wrap whitespace-pre-line" >
            {moveInfos}
          </p>
        </div>
      </div>
    )
}

export default SpeedrunPage;