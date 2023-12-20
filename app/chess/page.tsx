'use client'
import { useEffect, useMemo, useRef, useState } from "react";
import {Chess} from "chess.js";
import { Chessboard } from "react-chessboard";
import { Piece, Square } from "react-chessboard/dist/chessboard/types";
//import 'remote-web-worker';


const ChessPage = () => {
    const [game, setGame] = useState(new Chess());
    const [playerColor, setPlayerColor] = useState('w');
    const [ponderArrow, setPonderArrow] = useState<Square[][]>([]);
    const [positionEvaluation, setPositionEvalutation] = useState("");
    const [possibleMate, setPossibleMate] = useState("");
    const [showPonderHint, setShowPonderHint] = useState("");
    const [count, setCount] = useState(0);
    const [currentTimeout, setCurrentTimeout] = useState<NodeJS.Timeout>();
    const [databaseRating, setDatabaseRating] = useState('Master');
    const [opening, setOpening] = useState('');
    const [startingFen, setStartingFen] = useState('');
    const [currentFen, setCurrentFen] = useState('');
    const [winrate, setWinrate] = useState({
      white: 50,
      draws: 0,
      black: 50
    });
    const [evaluation, setEvaluation] = useState('0.3');
    const [useStockfish, setUseStockfish] = useState(false);
    const workRef = useRef();

    useEffect(() => {
        //const buffer = new SharedArrayBuffer(4096);
        console.log(crossOriginIsolated);
        //@ts-ignore
        workRef.current = new Worker('stockfish.js#stockfish.wasm');

        //@ts-ignore
        workRef.current.postMessage('uci');

        //@ts-ignore
        workRef.current.onmessage = function(event: any) {
            console.log(event.data);
        }
    }, []);
  
    useEffect( () => {
      getCloudEval(game.fen());
    }, [count]);
  
    function safeGameMutate(modify: any) {
      setGame((g: any) => {
        const update = { ...g };
        modify(update);
        return update;
      });
    } 
  
    function checkGameOver(possibleMoves: string[]) {
      // exit if the game is over
      if (game.isGameOver() || game.isDraw() || possibleMoves.length === 0){
        console.log('Game Over !');
        return ;
      }
    }
  
    function movesHistory() {
      const movesObj = game.history({verbose: true});
      console.log(movesObj);
  
      const movesStr: Array<string> = [];
  
      movesObj.forEach(move => (
        movesStr.push(move.lan)
      ));
  
      console.log(JSON.stringify(movesStr));
  
      return movesStr;
    }
  
    function makeRandomMove() {
      const possibleMoves = game.moves();
  
      checkGameOver(possibleMoves);
  
      const randomIndex = Math.floor(Math.random() * possibleMoves.length);
      console.log(possibleMoves);
      console.log(possibleMoves[randomIndex]);
      //makeLichessMove();
      if(possibleMoves.length <= 0) return;
      game.move(possibleMoves[randomIndex]);
      setCount(0);
    }
  
    async function makeLichessMove(fen = "") {
      /* let lichessMove = {san: "", uci: "", winrate: {white: 33, draws: 33, black: 33}};
  
      lichessMove = fen === "" ? await fetchLichessDatabase(movesHistory(), databaseRating, startingFen) : await fetchLichessDatabase(movesHistory(), databaseRating, fen);
  
      console.log(lichessMove);
  
      if(lichessMove?.san !== "" && lichessMove?.san !== undefined){
  
        game.move(lichessMove.san);
        setWinrate(lichessMove.winrate);
        console.log(lichessMove.winrate);
        setCount(0);
        setUseStockfish(true);
        return;
      } */
      
      console.log("No more moves in the database !");
      makeRandomMove();
    }
  
    async function getCloudEval(fen: string) {
      //let cloudEval = await fetchLichessCloudEval(fen);
      let cloudEval = '???';
  
      console.log(cloudEval);
  
      setEvaluation(cloudEval);
    }
  
    function onDrop(sourceSquare: Square, targetSquare: Square, piece: Piece) {
      //const gameCopy = { ...game };
  
      const gameCopy = game; // gameCopy = {...game} as Game ?
      const move = gameCopy.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: piece[1].toLowerCase() ?? "q",
      });
  
      setGame(gameCopy);
      setCount(count+1);
  
      // illegal move
      if (move === null) return false;
  
      // store timeout so it can be cleared on undo/reset
      //const newTimeout = setTimeout(makeRandomMove, 2000);
      const newTimeout = setTimeout(makeLichessMove, 2000);
      setCurrentTimeout(newTimeout);
      return true;
    }
  
    function setPosition(positionName: string) {
      let fen = '';
      switch (positionName) {
        case 'e4e5':
          fen = 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2';
          break;
  
        case 'e4e5Nf3Nc6':
          fen = 'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3';
          break;
  
        case 'Ruy Lopez':
          fen = 'r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3';
          break;
  
        case 'Ruy Lopez: Morphy Defense':
          fen = 'r1bqkbnr/1ppp1ppp/p1n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 4';
          break;
          
        case 'Ruy Lopez: Morphy Defense, Caro Variation':
          fen = 'r1bqkbnr/2pp1ppp/p1n5/1p2p3/B3P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 5';
          break;
        
        case 'Ruy Lopez: Morphy Defense, Main Line':
          fen = 'r1bqkb1r/1ppp1ppp/p1n2n2/4p3/B3P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 2 5';
          break;
  
        case 'Ruy Lopez: Anti-Marshall (h3)':
          fen = 'r1bq1rk1/2p1bppp/p1n2n2/1p1pp3/4P3/1B3N1P/PPPP1PP1/RNBQR1K1 w - - 0 9';
          break;
          
        case 'Ruy Lopez: Berlin Defense':
          fen = 'r1bqkb1r/pppp1ppp/2n2n2/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4';
          break;
          
        case 'Italian Game':
          fen = 'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3';
          break;
  
        case 'Italian Game: Giuoco Piano':
          fen = 'r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4';
          break;
  
        case 'Italian Game: Two Knights Defense':
          fen = 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4';
          break;
  
        case 'Italian Game: Traxler Counterattack':
          fen = 'r1bqk2r/pppp1ppp/2n2n2/2b1p1N1/2B1P3/8/PPPP1PPP/RNBQK2R w KQkq - 6 5';
          break;
          
        case 'Italian Game: Ponziani-Steinitz Gambit':
          fen = 'r1bqkb1r/pppp1ppp/2n5/4p1N1/2B1n3/8/PPPP1PPP/RNBQK2R w KQkq - 0 5';
          break;
        
        case 'Italian Game: Fried Liver Attack':
          fen = 'r1bqkb1r/ppp2Npp/2n5/3np3/2B5/8/PPPP1PPP/RNBQK2R b KQkq - 0 6';
          break;
  
        case 'Italian Game: Polerio Defense':
          fen = 'r1bqkb1r/ppp2ppp/5n2/n2Pp1N1/2B5/8/PPPP1PPP/RNBQK2R w KQkq - 1 6';
          break;
          
        case 'Italian Game: Fritz Variation':
          fen = 'r1bqkb1r/ppp2ppp/5n2/3Pp1N1/2Bn4/8/PPPP1PPP/RNBQK2R w KQkq - 1 6';
          break;
          
        case 'Italian Game: Ulvestad Variation':
          fen = 'r1bqkb1r/p1p2ppp/2n2n2/1p1Pp1N1/2B5/8/PPPP1PPP/RNBQK2R w KQkq - 0 6';
          break;
  
        case 'Petrov Defense':
          fen = 'rnbqkb1r/pppp1ppp/5n2/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3';
          break;
  
        case 'Stafford Gambit':
          fen = 'r1bqkb1r/pppp1ppp/2n2n2/4N3/4P3/8/PPPP1PPP/RNBQKB1R w KQkq - 1 4';
          break;
  
        case 'French Defense':
          fen = 'rnbqkbnr/pppp1ppp/4p3/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2';
          break;
  
        case 'French Defense: Paulsen Variation':
          fen = 'rnbqkbnr/ppp2ppp/4p3/3p4/3PP3/2N5/PPP2PPP/R1BQKBNR b KQkq - 1 3';
          break;
  
        case 'French Defense: Winawer Variation':
          fen = 'rnbqk1nr/ppp2ppp/4p3/3p4/1b1PP3/2N5/PPP2PPP/R1BQKBNR w KQkq - 2 4';
          break;
        
        case 'French Defense: Classical Variation':
          fen = 'rnbqkb1r/ppp2ppp/4pn2/3p4/3PP3/2N5/PPP2PPP/R1BQKBNR w KQkq - 2 4';
          break;
  
        case 'French Defense: Rubinstein Variation':
          fen = 'rnbqkbnr/ppp2ppp/4p3/8/3Pp3/2N5/PPP2PPP/R1BQKBNR w KQkq - 0 4';
          break;
          
        case 'French Defense: Paulsen Variation (3...c5)':
          fen = 'rnbqkbnr/pp3ppp/4p3/2pp4/3PP3/2N5/PPP2PPP/R1BQKBNR w KQkq - 0 4';
          break;
          
        case 'French Defense: Tarrasch Variation':
          fen = 'rnbqkbnr/ppp2ppp/4p3/3p4/3PP3/8/PPPN1PPP/R1BQKBNR b KQkq - 1 3';
          break;
  
        case 'French Defense: Tarrasch Variation, Open System':
          fen = 'rnbqkbnr/pp3ppp/4p3/2pp4/3PP3/8/PPPN1PPP/R1BQKBNR w KQkq - 0 4';
          break;
  
        case 'French Defense: Tarrasch Variation, Closed Variation':
          fen = 'rnbqkb1r/ppp2ppp/4pn2/3p4/3PP3/8/PPPN1PPP/R1BQKBNR w KQkq - 2 4';
          break;
  
        case 'Caro-Kann Defense':
          fen = 'rnbqkbnr/pp1ppppp/2p5/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2';
          break;
  
        case 'Caro-Kann Defense: Advance Variation':
          fen = 'rnbqkbnr/pp2pppp/2p5/3pP3/3P4/8/PPP2PPP/RNBQKBNR b KQkq - 0 3';
          break;
          
        case 'Caro-Kann Defense: Advance Variation (3...Bf5)':
          fen = 'rn1qkbnr/pp2pppp/2p5/3pPb2/3P4/8/PPP2PPP/RNBQKBNR w KQkq - 1 4';
          break;
        
        case 'Caro-Kann Defense: Advance Variation (3...c5)':
          fen = 'rnbqkbnr/pp2pppp/8/2ppP3/3P4/8/PPP2PPP/RNBQKBNR w KQkq - 0 4';
          break;
  
        case 'Caro-Kann Defense: Fantasy Variation':
          fen = 'rnbqkbnr/pp2pppp/2p5/3p4/3PP3/5P2/PPP3PP/RNBQKBNR b KQkq - 0 3';
          makeLichessMove();
          break;
          
        case 'Caro-Kann Defense: Fantasy Variation (3...dxe4)':
          fen = 'rnbqkbnr/pp2pppp/2p5/8/3Pp3/5P2/PPP3PP/RNBQKBNR w KQkq - 0 4';
          break;
          
        case 'Caro-Kann Defense: Fantasy Variation (3...e6)':
          fen = 'rnbqkbnr/pp3ppp/2p1p3/3p4/3PP3/5P2/PPP3PP/RNBQKBNR w KQkq - 0 4';
          break;
  
        case 'Caro-Kann Defense: Fantasy Variation (3...g6)':
          fen = 'rnbqkbnr/pp2pp1p/2p3p1/3p4/3PP3/5P2/PPP3PP/RNBQKBNR w KQkq - 0 4';
          break;
  
        case 'Caro-Kann Defense: Fantasy Variation (3...Qb6)':
          fen = 'rnb1kbnr/pp2pppp/1qp5/3p4/3PP3/5P2/PPP3PP/RNBQKBNR w KQkq - 1 4';
          break;
  
        case 'Caro-Kann Defense: Exchange Variation':
          fen = 'rnbqkbnr/pp2pppp/2p5/3P4/3P4/8/PPP2PPP/RNBQKBNR b KQkq - 0 3';
          break;
  
        case 'Caro-Kann Defense: Exchange Variation (4...Nc6)':
          fen = 'r1bqkbnr/pp2pppp/2n5/3p4/3P4/3B4/PPP2PPP/RNBQK1NR w KQkq - 2 5';
          break;
          
        case 'Caro-Kann Defense: Exchange Variation (4...Nf6)':
          fen = 'rnbqkb1r/pp2pppp/5n2/3p4/3P4/3B4/PPP2PPP/RNBQK1NR w KQkq - 2 5';
          break;
        
        case 'Sicilian Defense':
          fen = 'rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2';
          break;
  
        case 'Sicilian Defense (2...d6)':
          fen = 'rnbqkbnr/pp2pppp/3p4/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 3';
          break;
          
        case 'Sicilian Defense (2...e6)':
          fen = 'rnbqkbnr/pp1p1ppp/4p3/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 3';
          break;
  
        case 'Sicilian Defense: Kan Variation':
          fen = 'rnbqkbnr/1p1p1ppp/p3p3/8/3NP3/8/PPP2PPP/RNBQKB1R w KQkq - 0 5';
          break;
        
        case 'Sicilian Defense: Kan Variation (5.Nc3)':
          fen = 'rnbqkbnr/1p1p1ppp/p3p3/8/3NP3/2N5/PPP2PPP/R1BQKB1R b KQkq - 1 5';
          break;
  
        case 'Sicilian Defense: Kan Variation (5.Bd3)':
          fen = 'rnbqkbnr/1p1p1ppp/p3p3/8/3NP3/3B4/PPP2PPP/RNBQK2R b KQkq - 1 5';
          break;
  
        case 'Sicilian Defense: Kan Variation (5.c4)':
          fen = 'rnbqkbnr/1p1p1ppp/p3p3/8/2PNP3/8/PP3PPP/RNBQKB1R b KQkq - 0 5';
          break;
  
        case 'Sicilian Defense: Alapin Variation':
          fen = 'rnbqkbnr/pp1ppppp/8/2p5/4P3/2P5/PP1P1PPP/RNBQKBNR b KQkq - 0 2';
          break;
  
        case 'Sicilian Defense: Alapin Variation (3.exd5)':
          fen = 'rnbqkbnr/pp2pppp/8/2pP4/8/2P5/PP1P1PPP/RNBQKBNR b KQkq - 0 3';
          break;
  
        case 'Sicilian Defense: Alapin Variation (3.e5)':
          fen = 'rnbqkbnr/pp2pppp/8/2ppP3/8/2P5/PP1P1PPP/RNBQKBNR b KQkq - 0 3';
          break;
  
        case 'Sicilian Defense: Alapin Variation Exchange (6.Be2)':
          fen = 'rnb1kb1r/pp3ppp/4pn2/2pq4/3P4/2P2N2/PP2BPPP/RNBQK2R b KQkq - 1 6';
          break;
  
        case 'Sicilian Defense: Alapin Variation Exchange (6.Na3)':
          fen = 'rnb1kb1r/pp3ppp/4pn2/2pq4/3P4/N1P2N2/PP3PPP/R1BQKB1R b KQkq - 1 6';
          break;
  
        case 'Sicilian Defense: Delayed Alapin Variation':
          fen = 'rnbqkbnr/pp1p1ppp/4p3/2p5/4P3/2P2N2/PP1P1PPP/RNBQKB1R b KQkq - 0 3';
          break;
  
        case 'Sicilian Defense: Closed Variation':
          fen = 'rnbqkbnr/pp1ppppp/8/2p5/4P3/2N5/PPPP1PPP/R1BQKBNR b KQkq - 1 2';
          break;
  
        case 'Sicilian Defense: Closed Variation (3.g3)':
          fen = 'rnbqkbnr/pp1p1ppp/4p3/2p5/4P3/2N3P1/PPPP1P1P/R1BQKBNR b KQkq - 0 3';
          break;
  
        case 'Sicilian Defense: Grand Prix Attack':
          fen = 'rnbqkbnr/pp1p1ppp/4p3/2p5/4PP2/2N5/PPPP2PP/R1BQKBNR b KQkq - 0 3';
          break;
  
        case 'Sicilian Defense: McDonnell Attack':
          fen = 'rnbqkbnr/pp1ppppp/8/2p5/4PP2/8/PPPP2PP/RNBQKBNR b KQkq - 0 2';
          break;
  
        case 'Sicilian Defense: McDonnell Attack (3.exd5)':
          fen = 'rnbqkbnr/pp2pppp/8/2pP4/5P2/8/PPPP2PP/RNBQKBNR b KQkq - 0 3';
          break;
  
        case 'Sicilian Defense: McDonnell Attack (3.e5)':
          fen = 'rnbqkbnr/pp2pppp/8/2ppP3/5P2/8/PPPP2PP/RNBQKBNR b KQkq - 0 3';
          break;
  
        case 'Sicilian Defense: Kramnik Variation':
          fen = 'rnbqkbnr/pp1p1ppp/4p3/2p5/2P1P3/5N2/PP1P1PPP/RNBQKB1R b KQkq - 0 3';
          break;
        
        case 'Sicilian Defense: Wing Gambit (2.b4)':
          fen = 'rnbqkbnr/pp1ppppp/8/2p5/1P2P3/8/P1PP1PPP/RNBQKBNR b KQkq - 0 2';
          break;
  
        case 'Sicilian Defense: Wing Gambit Deferred (3.b4)':
          fen = 'rnbqkbnr/pp1p1ppp/4p3/2p5/1P2P3/5N2/P1PP1PPP/RNBQKB1R b KQkq - 0 3';
          break;
  
        case 'Sicilian Defense: Mengarini Variation (2.a3)':
          fen = 'rnbqkbnr/pp1ppppp/8/2p5/4P3/P7/1PPP1PPP/RNBQKBNR b KQkq - 0 2';
          break;
          
        case 'Sicilian Defense: Taimanov Variation':
          fen = 'r1bqkbnr/pp1p1ppp/2n1p3/8/3NP3/8/PPP2PPP/RNBQKB1R w KQkq - 1 5';
          break;
          
        case 'Sicilian Defense (2...Nc6)':
          fen = 'r1bqkbnr/pp1ppppp/2n5/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3';
          break;
        
        case 'Pirc Defense':
          fen = 'rnbqkbnr/ppp1pppp/3p4/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2';
          break;
          
        case 'Modern Defense':
          fen = 'rnbqkbnr/pppppp1p/6p1/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2';
          break;
          
        case 'Alekhine Defense':
          fen = 'rnbqkb1r/pppppppp/5n2/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 1 2';
          break;
  
        case 'Scandinavian Defense':
          fen = 'rnbqkbnr/ppp1pppp/8/3p4/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2';
          break;
  
        case 'Scandinavian Defense: (2...Qxd5)':
          fen = 'rnb1kbnr/ppp1pppp/8/3q4/8/8/PPPP1PPP/RNBQKBNR w KQkq - 0 3';
          break;
  
        case 'Scandinavian Defense: (2...Nf6)':
          fen = 'rnbqkb1r/ppp1pppp/5n2/3P4/8/8/PPPP1PPP/RNBQKBNR w KQkq - 1 3';
          break;
          
        default:
          fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
          break;
      }
  
      game.load(fen);
      setStartingFen(fen);
      if(playerColor !== game.turn()) makeLichessMove(fen);
  
      setOpening(positionName);
    }
  
    return (
      <div className="flex flex-col justify-center items-center bg-cyan-900 h-full w-full overflow-auto" >
          <h4 className=" text-lg text-white" >
            Niveau de l'adversaire: {databaseRating}
          </h4>
          <div className=" absolute left-5 top-10 text-white w-96">
            {/* 1.e4 e5 2.Nf3 Nc6 3.Bb5 Bc5 4.c3 Nf6 5.d4 exd4 6.e5 Ne4 7.cxd4 Bb4+ 8.Nbd2 O-O 9.O-O Nxd2 10.Bxd2 Bxd2 11.Qxd2 */}
            {game.pgn()}
          </div>
          <div className=" h-20 w-full flex flex-col justify-center items-center">
            <div className=" text-white" >
              {/* <TestEngine 
                fen={game.fen()} 
                whiteToMove={game.turn() === 'w'} 
                useStockfish={useStockfish}
                setUseStockfish={setUseStockfish}
              /> */}
            </div>
            <div className=" h-5 w-52 flex flex-row">
              <div className="bg-white h-5 flex justify-center" style={{width: `${winrate.white}%`}} >{
                winrate.white >= 10 ? `${winrate.white}%` : "" 
              }</div>
              <div className=" bg-slate-500 h-5 flex justify-center" style={{width: `${winrate.draws}%`}} >{
                winrate.draws >= 10 ? `${winrate.draws}%` : "" 
              }</div>
              <div className="bg-black text-white h-5 flex justify-center" style={{width: `${winrate.black}%`}} >{
                winrate.black >= 10 ? `${winrate.black}%` : "" 
              }</div>
            </div>
          </div>
          <div className=" h-[500px] w-[500px]" >
              <Chessboard 
                id="PlayVsRandom"
                position={game.fen()}
                onPieceDrop={onDrop} 
                boardOrientation={playerColor === 'w' ? 'white' : 'black'}
              />
          </div>
          <div className=" flex justify-center items-center w-full h-fit" >
            <button
              className=" m-4 p-1 bg-white border rounded cursor-pointer"
              onClick={() => {
                game.reset();
                clearTimeout(currentTimeout);
                setCount(-1);
              }}
            >
              reset
            </button>
            {/* <button
              className=" m-4 p-1 bg-white border rounded cursor-pointer"
              onClick={() => {
                test();
              }}
            >
              test
            </button> */}
            <select id="rating" onChange={(e) => setDatabaseRating(e.target.value)} value={databaseRating}>
              <option value="" >Sélectionnez un niveau</option>
              <option value="Beginner" >Débutant</option>
              <option value="Casual" >Casual</option>
              <option value="Intermediate" >Intermédiaire</option>
              <option value="Advanced" >Avancé</option>
              <option value="Master" >Maître</option>
            </select>
            <select id="opening" onChange={(e) => setPosition(e.target.value)} value={opening}>
              <option value="" >Sélectionnez une ouverture</option>
              <option value="e4e5" >e4e5</option>
              <option value="e4e5Nf3Nc6" >e4e5Nf3Nc6</option>
              <option value="Ruy Lopez" >Ruy Lopez</option>
              <option value="Ruy Lopez: Morphy Defense" >Ruy Lopez: Morphy Defense</option>
              <option value="Ruy Lopez: Morphy Defense, Caro Variation" >Ruy Lopez: Morphy Defense, Caro Variation</option>
              <option value="Ruy Lopez: Morphy Defense, Main Line" >Ruy Lopez: Morphy Defense, Main Line</option>
              <option value="Ruy Lopez: Anti-Marshall (h3)" >Ruy Lopez: Anti-Marshall (h3)</option>
              <option value="Ruy Lopez: Berlin Defense" >Ruy Lopez: Berlin Defense</option>
              <option value="Italian Game" >Italian Game</option>
              <option value="Italian Game: Giuoco Piano" >Italian Game: Giuoco Piano</option>
              <option value="Italian Game: Two Knights Defense" >Italian Game: Two Knights Defense</option>
              <option value="Italian Game: Traxler Counterattack" >Italian Game: Traxler Counterattack</option>
              <option value="Italian Game: Ponziani-Steinitz Gambit" >Italian Game: Ponziani-Steinitz Gambit</option>
              <option value="Italian Game: Fried Liver Attack" >Italian Game: Fried Liver Attack</option>
              <option value="Italian Game: Polerio Defense" >Italian Game: Polerio Defense</option>
              <option value="Italian Game: Fritz Variation" >Italian Game: Fritz Variation</option>
              <option value="Italian Game: Ulvestad Variation" >Italian Game: Ulvestad Variation</option>
              <option value="Petrov Defense" >Petrov Defense</option>
              <option value="Stafford Gambit" >Stafford Gambit</option>
              <option value="French Defense" >French Defense</option>
              <option value="French Defense: Paulsen Variation" >French Defense: Paulsen Variation</option>
              <option value="French Defense: Winawer Variation" >French Defense: Winawer Variation</option>
              <option value="French Defense: Classical Variation" >French Defense: Classical Variation</option>
              <option value="French Defense: Rubinstein Variation" >French Defense: Rubinstein Variation</option>
              <option value="French Defense: Paulsen Variation (3...c5)" >French Defense: Paulsen Variation (3...c5)</option>
              <option value="French Defense: Tarrasch Variation" >French Defense: Tarrasch Variation</option>
              <option value="French Defense: Tarrasch Variation, Open System" >French Defense: Tarrasch Variation, Open System</option>
              <option value="French Defense: Tarrasch Variation, Closed Variation" >French Defense: Tarrasch Variation, Closed Variation</option>
              <option value="Caro-Kann Defense" >Caro-Kann Defense</option>
              <option value="Caro-Kann Defense: Advance Variation" >Caro-Kann Defense: Advance Variation</option>
              <option value="Caro-Kann Defense: Advance Variation (3...Bf5)" >Caro-Kann Defense: Advance Variation (3...Bf5)</option>
              <option value="Caro-Kann Defense: Advance Variation (3...c5)" >Caro-Kann Defense: Advance Variation (3...c5)</option>
              <option value="Caro-Kann Defense: Fantasy Variation" >Caro-Kann Defense: Fantasy Variation</option>
              <option value="Caro-Kann Defense: Fantasy Variation (3...dxe4)" >Caro-Kann Defense: Fantasy Variation (3...dxe4)</option>
              <option value="Caro-Kann Defense: Fantasy Variation (3...e6)" >Caro-Kann Defense: Fantasy Variation (3...e6)</option>
              <option value="Caro-Kann Defense: Fantasy Variation (3...g6)" >Caro-Kann Defense: Fantasy Variation (3...g6)</option>
              <option value="Caro-Kann Defense: Fantasy Variation (3...Qb6)" >Caro-Kann Defense: Fantasy Variation (3...Qb6)</option>
              <option value="Caro-Kann Defense: Exchange Variation" >Caro-Kann Defense: Exchange Variation</option>
              <option value="Caro-Kann Defense: Exchange Variation (4...Nc6)" >Caro-Kann Defense: Exchange Variation (4...Nc6)</option>
              <option value="Caro-Kann Defense: Exchange Variation (4...Nf6)" >Caro-Kann Defense: Exchange Variation (4...Nf6)</option>
              <option value="Sicilian Defense" >Sicilian Defense</option>
              <option value="Sicilian Defense (2...d6)" >Sicilian Defense (2...d6)</option>
              <option value="Sicilian Defense (2...e6)" >Sicilian Defense (2...e6)</option>
              <option value="Sicilian Defense: Kan Variation" >Sicilian Defense: Kan Variation</option>
              <option value="Sicilian Defense: Kan Variation (5.Nc3)" >Sicilian Defense: Kan Variation (5.Nc3)</option>
              <option value="Sicilian Defense: Kan Variation (5.Bd3)" >Sicilian Defense: Kan Variation (5.Bd3)</option>
              <option value="Sicilian Defense: Kan Variation (5.c4)" >Sicilian Defense: Kan Variation (5.c4)</option>
              <option value="Sicilian Defense: Alapin Variation" >Sicilian Defense: Alapin Variation</option>
              <option value="Sicilian Defense: Alapin Variation (3.exd5)" >Sicilian Defense: Alapin Variation (3.exd5)</option>
              <option value="Sicilian Defense: Alapin Variation (3.e5)" >Sicilian Defense: Alapin Variation (3.e5)</option>
              <option value="Sicilian Defense: Alapin Variation Exchange (6.Be2)" >Sicilian Defense: Alapin Variation Exchange (6.Be2)</option>
              <option value="Sicilian Defense: Alapin Variation Exchange (6.Na3)" >Sicilian Defense: Alapin Variation Exchange (6.Na3)</option>
              <option value="Sicilian Defense: Delayed Alapin Variation" >Sicilian Defense: Delayed Alapin Variation</option>
              <option value="Sicilian Defense: Closed Variation" >Sicilian Defense: Closed Variation</option>
              <option value="Sicilian Defense: Closed Variation (3.g3)" >Sicilian Defense: Closed Variation (3.g3)</option>
              <option value="Sicilian Defense: Grand Prix Attack" >Sicilian Defense: Grand Prix Attack</option>
              <option value="Sicilian Defense: McDonnell Attack" >Sicilian Defense: McDonnell Attack</option>
              <option value="Sicilian Defense: McDonnell Attack (3.exd5)" >Sicilian Defense: McDonnell Attack (3.exd5)</option>
              <option value="Sicilian Defense: McDonnell Attack (3.e5)" >Sicilian Defense: McDonnell Attack (3.e5)</option>
              <option value="Sicilian Defense: Kramnik Variation" >Sicilian Defense: Kramnik Variation</option>
              <option value="Sicilian Defense: Wing Gambit (2.b4)" >Sicilian Defense: Wing Gambit (2.b4)</option>
              <option value="Sicilian Defense: Wing Gambit Deferred (3.b4)" >Sicilian Defense: Wing Gambit Deferred (3.b4)</option>
              <option value="Sicilian Defense: Mengarini Variation (2.a3)" >Sicilian Defense: Mengari Variation (2.a3)</option>
              <option value="Sicilian Defense: Taimanov Variation" >Sicilian Defense: Taimanov Variation</option>
              <option value="Sicilian Defense (2...Nc6)" >Sicilian Defense (2...Nc6)</option>
              <option value="Pirc Defense" >Pirc Defense</option>
              <option value="Modern Defense" >Modern Defense</option>
              <option value="Alekhine Defense" >Alekhine Defense</option>
              <option value="Scandinavian Defense" >Scandinavian Defense</option>
              <option value="Scandinavian Defense: (2...Qxd5)" >Scandinavian Defense: (2...Qxd5)</option>
              <option value="Scandinavian Defense: (2...Nf6)" >Scandinavian Defense: (2...Nf6)</option>
            </select>
            <button
              className=" m-4 p-1 bg-white border rounded cursor-pointer"
              onClick={() => {
                playerColor === 'w' ? setPlayerColor('b') : setPlayerColor('w')
              }}
            >
              Switch
            </button>
            <button
              className=" m-4 p-1 bg-white border rounded cursor-pointer"
              onClick={() => {
                getCloudEval(game.fen())
              }}
            >
              Eval
            </button>
            {/* <button
              className=" m-4 p-1 bg-white border rounded cursor-pointer"
              onClick={() => {
                game.undo();
                clearTimeout(currentTimeout);
                setCount(-1);
              }}
            >
              undo
            </button> */}
          </div>
      </div>
    )
}

export default ChessPage;