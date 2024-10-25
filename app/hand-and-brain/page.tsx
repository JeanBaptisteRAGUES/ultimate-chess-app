/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import { useEffect, useRef, useState } from "react";
import {Chess, Color} from "chess.js";
import { Chessboard } from "react-chessboard";
import { Piece, Square } from "react-chessboard/dist/chessboard/types";
import EvalAndWinrate from "../components/EvalAndWinrate";
import Clock from "../components/Clock";
import Engine from "../engine/Engine";
import Link from "next/link";
import BotsAI, { Behaviour, Move } from "../bots-ai/BotsAI";
import { useSearchParams } from "next/navigation";
import { FaCirclePlay, FaHandFist, FaRotate } from 'react-icons/fa6';
import  { GiBrain } from 'react-icons/gi';
import { FaFontAwesomeFlag } from "react-icons/fa";
import GameToolBox from "../game-toolbox/GameToolbox";


const HandAndBrainPage = () => {
    const searchParams = useSearchParams();
    const playerRole = searchParams.get('playerRole') || 'Brain';
    const allyElo: number= eval(searchParams.get('allyElo') || '2600');
    const allyRole = playerRole === 'Brain' ? 'Hand' : 'Brain';
    const opponentElo: number = eval(searchParams.get('opponentElo') || '2600');
    const opponentBehaviour: Behaviour = searchParams.get('opponentBehaviour') as Behaviour || 'default';
    const gameActive = useRef(true);
    const [game, setGame] = useState(new Chess());
    const engine = useRef<Engine>();
    const toolbox = new GameToolBox();
    const allyAI = useRef<BotsAI>();
    const opponentAI = useRef<BotsAI>();
    const [playerColor, setPlayerColor] = useState<Color>('w');
    const [gameStarted, setGameStarted] = useState(false);
    const [currentTimeout, setCurrentTimeout] = useState<NodeJS.Timeout>();
    //const [databaseRating, setDatabaseRating] = useState('Master');
    //const [botBehaviour, setBotBehaviour] = useState<Behaviour>('default');
    const [currentFen, setCurrentFen] = useState('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    const [engineEval, setEngineEval] = useState('0.3');
    const [showEval, setShowEval] = useState(true);
    const scoreHistory = useRef(new Array());
    const movesTypeRef = useRef(new Array()); // -1: erreur, 0(blanc): joueur, 1(jaune): lichess, 2(vert clair): stockfish, 3(vert foncé): stockfish forcé, 4(rouge): random
    const [showGameoverWindow, setShowGameoverWindow] = useState(false);
    const [winner, setWinner] = useState(''); // 'w' -> blancs gagnent, 'b' -> noirs gagnent, 'd' -> draw
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
    });
    const timeControls = new Map([
      ['1+0', {startingTime: 60, increment: 0}],
      ['3+0', {startingTime: 180, increment: 0}],
      ['3+2', {startingTime: 180, increment: 2}],
      ['10+0', {startingTime: 600, increment: 0}],
      ['15+10', {startingTime: 900, increment: 10}],
      ['30+20', {startingTime: 1800, increment: 20}],
      ['90+30', {startingTime: 5400, increment: 30}],
    ]); */
    const [timeControl, setTimeControl] = useState('infinite');
    const [selectedPiece, setSelectedPiece] = useState<string>('');
    const [allyStatus, setAllyStatus] = useState(0); // 0: ready, 1: thinking, 2: waiting
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

    // TODO: Rendre les time control dynamiques
    useEffect(() => {
        engine.current = new Engine();
        engine.current.init();
        const opponentColor = playerColor === 'w' ? 'b' : 'w';
        allyAI.current = new BotsAI('default', allyElo, playerColor, '10+0', false);
        opponentAI.current = new BotsAI(opponentBehaviour, opponentElo, opponentColor, '10+0', false);
        console.log("Player Role: " + playerRole);
        console.log("Ally Elo: " + allyElo);
        console.log("Ally Role: " + allyRole);
        console.log("Opponent Elo: " + opponentElo);
        console.log("Opponent Behaviour: " + opponentBehaviour);
        /* if(allyRole === 'Brain' && game.turn() === playerColor) {
            setAllyStatus(1);
            allyAI.current?.getBrainPieceChoice(game).then((pieceChoice) => setSelectedPiece(pieceChoice));
        }  */
    }, []);

    useEffect(() => {
      const opponentColor = playerColor === 'w' ? 'b' : 'w';
      //opponentAI.current = new BotsAI(opponentBehaviour, opponentRating, opponentColor, '10+0');
      opponentAI.current?.changeColor(opponentColor);
      allyAI.current?.changeColor(playerColor);
      if(playerColor === 'b' && !gameActive) setAllyStatus(2);
    }, [playerColor]);

    // TODO: Problème lors de la promotion d'un pion (promeut automatiquement en cavalier)
    const gameMove = (moveNotation: string, moveType: number) => {
      game.move(moveNotation);
      toolbox.countMaterial(game.board(), setWhiteMaterialAdvantage, setBlackMaterialAdvantage);
      setCurrentFen(game.fen());
      movesTypeRef.current.push(moveType);
      checkGameOver();
      setSelectedPiece('');
    }

    function gameOver(winner: string) {
      console.log('Game Over !');
      console.log(game.pgn());
      gameActive.current = false;
      /* engine.current?.quit();
      botAI.current?.disable(); */
      engine.current?.stop();
      allyAI.current?.pause();
      opponentAI.current?.pause();
      setWinner(winner);
      
      switch (winner) {
        case 'd':
          setEngineEval('1/2 - 1/2');
          break;
        case 'w':
          setEngineEval('1 - 0');
          break;
        case 'b':
          setEngineEval('0 - 1');
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

    /* function getTimeControlDelay() {
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
        if((whiteTimeControl.current.startingTime - whiteTimeControl.current.timeElapsed) < 20000){
          rawDelay = 300;
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
        if((blackTimeControl.current.startingTime - blackTimeControl.current.timeElapsed) < 20000){
          rawDelay = 300;
          console.log("Les noirs ont moins de 20 secondes pour jouer !");
        }
      }
      let randDelay = Math.max(rawDelay,Math.random()*rawDelay*2)*1000;
      return randDelay;
    } */

    async function playComputerMove() {
      console.log('Play computer move');
      if(game.pgn().includes('#')) return;
      const move: Move | undefined = await opponentAI.current?.makeMove(game, botTimestamp);

      if(move && move.type >= 0){
        gameMove(move.notation, move.type);
        setAllyStatus(0);
        if(allyRole === 'Hand') return;
        setAllyStatus(1);
        allyAI.current?.getBrainPieceChoice(game).then((pieceChoice) => {
            setSelectedPiece(pieceChoice);
            setAllyStatus(0);
        });
      } else{
        console.log("Erreur lors de la génération d'un coup par l'ordinateur");
      }
      
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
      
      if(gameStarted){
        console.log(playerRole);
        if(playerRole === 'Brain') return false; 
        if(game.get(sourceSquare).type !== selectedPiece) return false;
        gameMove(sourceSquare + targetSquare + promotion, 0);
        setAllyStatus(2);
        //let delay = getTimeControlDelay();
        //if(opponentElo === 3200) delay = 0;
        
        //const newTimeout = setTimeout(playComputerMove, delay);
        playComputerMove();
        //setCurrentTimeout(newTimeout);
        return true;
      }
      
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
          target="_blank"
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
      {"Niveau de l adversaire: " + opponentElo}
    </h4>

    const allyStatusComponent = allyStatus === 0 ?
        <h3 className=" text-xl text-white mt-5 mb-16 md:my-2 md:py-0" >Votre équipier est pret !</h3>
        :
        allyStatus === 1 ?
              <h3 className=" text-xl text-white mt-5 mb-16 md:my-2 md:py-0" >Votre équipier réfléchit..</h3>
              :
              <h3 className=" text-xl text-white mt-5 mb-16 md:my-2 md:py-0" >Attente du coup de l'adversaire..</h3>

    async function selectPiece(piece: string) {
        setSelectedPiece(piece);
        setAllyStatus(1);
        const move: Move | undefined = await allyAI.current?.makeHandMove(game, piece);
        console.log(move);
        if(move && move.type >= 0){
            gameMove(move.notation, move.type);
            //let delay = getTimeControlDelay();
            //if(opponentElo === 3200) delay = 0;
            setAllyStatus(2);
            if(gameStarted){
                const newTimeout = setTimeout(playComputerMove, 300);
                setCurrentTimeout(newTimeout);
            }
            return;
        } 
        console.log("Erreur lors de la génération d'un coup par l'ordinateur");
    }

    const selectPieceComponentDesktop =
        <div className=' absolute flex flex-col justify-around items-center flex-wrap w-full gap-3 mt-5' >
            <div 
                onClick={playerRole === 'Brain' ? () => selectPiece('p') : void(0)} 
                className=' h-[100px] w-[100px] flex flex-col justify-start items-center cursor-pointer' 
                style={{color: selectedPiece === 'p' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  
            >
                <div className=' h-[80px] w-full text-8xl flex justify-center items-center' >♙</div>
                <span className=' w-full h-[10px] flex justify-center items-center' >Pawn</span>
            </div>
            <div 
                onClick={playerRole === 'Brain' ? () => selectPiece('n') : void(0)} 
                className=' h-[100px] w-[100px] flex flex-col justify-start items-center cursor-pointer' 
                style={{color: selectedPiece === 'n' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}
            >
                <div className=' h-[80px] w-full text-8xl flex justify-center items-center' >♘</div>
                <span className=' w-full h-[10px] flex justify-center items-center' >Knight</span>
            </div>
            <div 
                onClick={playerRole === 'Brain' ? () => selectPiece('b') : void(0)} 
                className=' h-[100px] w-[100px] flex flex-col justify-start items-center cursor-pointer' 
                style={{color: selectedPiece === 'b' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}
            >
                <div className=' h-[80px] w-full text-8xl flex justify-center items-center' >♗</div>
                <span className=' w-full h-[10px] flex justify-center items-center mt-3' >Bishop</span>
            </div>
            <div 
                onClick={playerRole === 'Brain' ? () => selectPiece('r') : void(0)} 
                className=' h-[100px] w-[100px] flex flex-col justify-start items-center cursor-pointer' 
                style={{color: selectedPiece === 'r' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}
            >
                <div className=' h-[80px] w-full text-8xl flex justify-center items-center' >♖</div>
                <span className=' w-full h-[10px] flex justify-center items-center' >Rook</span>
            </div>
            <div 
                onClick={playerRole === 'Brain' ? () => selectPiece('q') : void(0)} 
                className=' h-[100px] w-[100px] flex flex-col justify-start items-center cursor-pointer' 
                style={{color: selectedPiece === 'q' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}
            >
                <div className=' h-[80px] w-full text-8xl flex justify-center items-center' >♕</div>
                <span className=' w-full h-[10px] flex justify-center items-center' >Queen</span>
            </div>
            <div 
                onClick={playerRole === 'Brain' ? () => selectPiece('k') : void(0)} 
                className=' h-[100px] w-[100px] flex flex-col justify-start items-center cursor-pointer' 
                style={{color: selectedPiece === 'k' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  
            >
                <div className=' h-[80px] w-full text-8xl flex justify-center items-center' >♔</div>
                <span className=' w-full h-[10px] flex justify-center items-center' >King</span>
            </div>
        </div>

const selectPieceComponentSmartphone =
    <div className=' flex flex-row justify-around items-center flex-wrap w-full gap-2 ' >
        <div 
            id="Pawn"
            onClick={playerRole === 'Brain' ? () => selectPiece('p') : void(0)} 
            className=' h-[50px] w-[50px] font-md flex flex-col justify-start items-center cursor-pointer' 
            style={{color: selectedPiece === 'p' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  
        >
            <div className=' h-full w-full text-6xl flex justify-center items-center' >♙</div>
        </div>
        <div 
            id="Knight"
            onClick={playerRole === 'Brain' ? () => selectPiece('n') : void(0)} 
            className=' h-[50px] w-[50px] flex flex-col justify-start items-center cursor-pointer' 
            style={{color: selectedPiece === 'n' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}
        >
            <div className=' h-full w-full text-6xl flex justify-center items-center' >♘</div>
        </div>
        <div 
            id="Bishop"
            onClick={playerRole === 'Brain' ? () => selectPiece('b') : void(0)} 
            className=' h-[50px] w-[50px] flex flex-col justify-start items-center cursor-pointer' 
            style={{color: selectedPiece === 'b' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}
        >
            <div className=' h-full w-full text-6xl flex justify-center items-center' >♗</div>
        </div>
        <div 
            id="Rook"
            onClick={playerRole === 'Brain' ? () => selectPiece('r') : void(0)} 
            className=' h-[50px] w-[50px] flex flex-col justify-start items-center cursor-pointer' 
            style={{color: selectedPiece === 'r' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}
        >
            <div className=' h-full w-full text-6xl flex justify-center items-center' >♖</div>
        </div>
        <div 
            id="Queen"
            onClick={playerRole === 'Brain' ? () => selectPiece('q') : void(0)} 
            className=' h-[50px] w-[50px] flex flex-col justify-start items-center cursor-pointer' 
            style={{color: selectedPiece === 'q' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}
        >
            <div className=' h-full w-full text-6xl flex justify-center items-center' >♕</div>
        </div>
        <div 
            id="King" 
            onClick={playerRole === 'Brain' ? () => selectPiece('k') : void(0)} 
            className=' h-[50px] w-[50px] flex flex-col justify-start items-center cursor-pointer' 
            style={{color: selectedPiece === 'k' ? "rgb(34, 211, 238)" : "rgb(5, 5, 5)" }}  
        >
            <div className=' h-full w-full text-6xl flex justify-center items-center' >♔</div>
        </div>
    </div>

    const pgnComponentDesktop =
        <div className=" relative text-white w-1/4 hidden h-full md:flex flex-col flex-wrap">
            {selectPieceComponentDesktop}
        </div>
    
    const pgnComponentSmartphone =
      <div className=" text-white w-full md:hidden h-full flex flex-col justify-center items-center flex-wrap md:mt-5">
        {selectPieceComponentSmartphone}
      </div>

    // TODO: Problème d'horloge lorsqu'on switch de position, le temps défile pour le mauvais joueur
    const boardComponent =
      <div className=" flex flex-col justify-center items-center h-[300px] md:h-[500px] w-[95vw] md:w-[500px] my-10" >
          <div className=" relative flex justify-start p-2 w-full h-10 font-medium bg-slate-100 rounded-t-md">
            <div className=" h-full flex justify-start items-center flex-grow-[4]" >
              {opponentBehaviour} ({opponentElo}) {playerColor === 'w' ? (
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
          <Chessboard 
            id="PlayVsRandom"
            position={currentFen}
            onPieceDrop={onDrop} 
            boardOrientation={playerColor === 'w' ? 'white' : 'black'}
          />
          <div className=" relative flex justify-around p-2 w-full h-10 font-medium rounded-b-md bg-slate-100">
              {
                playerRole === 'Brain' ?
                  <div className=" h-full flex justify-start items-center flex-grow-[4] gap-3" >
                    <div className=" h-full w-fit flex justify-start items-center">
                      <GiBrain size={25} /> Joueur 
                    </div>
                    <div className=" h-full w-fit flex justify-start items-center">
                      <FaHandFist size={25} /> Stockfish 16 ({allyElo}) {playerColor === 'w' ? (
                        showMaterialAdvantage('w')
                      ) : (
                        showMaterialAdvantage('b')
                      )}
                    </div>
                  </div>
                :
                <div className=" h-full flex justify-start items-center flex-grow-[4] gap-5" >
                  <div className=" h-full w-fit flex justify-start items-center">
                    <GiBrain size={25} />Ordinateur ({allyElo})
                  </div>
                  <div className=" h-full w-fit flex justify-start items-center">
                    <FaHandFist size={25} />Joueur {playerColor === 'w' ? (
                        showMaterialAdvantage('w')
                      ) : (
                        showMaterialAdvantage('b')
                      )}
                  </div>
                </div>
              }
            
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
      </div>

    const startGameButton = !gameStarted ? 
      <div 
        onClick={() => {
          setGameStarted(true);
          gameActive.current = true;
          setShowEval(false);
          if(game.turn() !== playerColor){
            //makeLichessMove();
            playComputerMove();
          } else{
            if(allyRole === 'Brain') {
              setAllyStatus(1);
              allyAI.current?.getBrainPieceChoice(game).then((pieceChoice) => setSelectedPiece(pieceChoice));
            } 
          }
        }}
        className=' h-[50px] w-[50px] flex flex-col justify-center items-center cursor-pointer hover:text-cyan-400'>
          <FaCirclePlay size={40} />
      </div>
      :
      <div onClick={() => resign()} className=' h-[50px] w-[50px] flex flex-col justify-center items-center cursor-pointer hover:text-cyan-400'>
        <FaFontAwesomeFlag size={40} />
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
        {allyStatusComponent}
        {boardComponent}
        {buttonsComponent}
      </div>

    const gameContainer =
      <div className="flex flex-row justify-center items-center w-full md:w-1/2 h-5/6 md:h-full md:pl-5" >
        {gameComponent}
      </div>

    return (
      <div className="flex flex-col md:flex-row justify-start md:justify-stretch items-center md:items-start bg-slate-800 h-[95vh] w-full overflow-y-auto" >
          {pgnComponentDesktop}
          {gameContainer}
          {gameOverWindow}
          {pgnComponentSmartphone}
      </div>
    )
}

export default HandAndBrainPage;