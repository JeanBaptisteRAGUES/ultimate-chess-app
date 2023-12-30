'use client'
import { useEffect, useMemo, useRef, useState } from "react";
import {BLACK, Chess} from "chess.js";
import { Chessboard } from "react-chessboard";
import { Piece, Square } from "react-chessboard/dist/chessboard/types";
//import 'remote-web-worker';


const ChessPage = () => {
    const [game, setGame] = useState(new Chess());
    const gameTest = new Chess();
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
    const [stockfishReady, setStockfishReady] = useState(false);
    const [bestMove, setBestMove] = useState('');
    const [engineEval, setEngineEval] = useState('0.3');
    const [lastRandomMove, setLastRandomMove] = useState(0);
    const evalRef = useRef();
    const engineRef = useRef();
    const evalRegex = /cp\s-?[0-9]*|mate\s-?[0-9]*/;
    const bestMoveRegex = /bestmove\s(\w*)/;
    const firstEvalMoveRegex = /pv\s[a-h][1-8]/;

    useEffect(() => {
        //const buffer = new SharedArrayBuffer(4096);
        console.log(crossOriginIsolated);
        //@ts-ignore
        evalRef.current = new Worker('stockfish.js#stockfish.wasm');
        //@ts-ignore
        engineRef.current = new Worker('stockfish.js#stockfish.wasm');

        //@ts-ignore
        evalRef.current.postMessage('uci');
        //@ts-ignore
        engineRef.current.postMessage('uci');

        //@ts-ignore
        evalRef.current.onmessage = function(event: any) {
          //TODO: bug évaluation négative -> useEffect() -> playerColor pas à jour ?
          //console.log('Stockfish message')
          //console.log(event.data);
    
          if(event.data === 'uciok'){
            console.log('Eval ok');
            //@ts-ignore
            evalRef.current.postMessage('setoption name MultiPV value 1');
          }
    
          if((evalRegex.exec(event.data)) !== null){
            //console.log(event.data);
            //console.log(`Game Turn: ${game.turn()}, Player color: ${playerColor}`);
            //@ts-ignore
            let evaluationStr: string = (evalRegex.exec(event.data)).toString();
            let firstMove = (event.data.match(firstEvalMoveRegex))[0].slice(-2);
            //console.log(firstMove);
            //console.log(game.get(firstMove));
            let coeff = game.get(firstMove).color === 'w' ? 1 : -1;
            const evaluationArr = evaluationStr.split(' ');
            //TODO: corriger le signe négatif pour le nombre de coups avant echec et mat
            if(evaluationArr[0] === 'mate') evaluationStr = '#' + coeff*(eval(evaluationArr[1]));
            if(evaluationArr[0] === 'cp') evaluationStr = (coeff*(eval(evaluationArr[1])/100)).toString();
            //console.log('Evaluation : ' + evaluationStr);
            setEngineEval(evaluationStr);
          }
        } 

        //@ts-ignore
        engineRef.current.onmessage = function(event: any) {
          //TODO: bug bestMove introuvable quand échec et mat ?
          if(event.data === 'uciok'){
            console.log('Engine ok');
            //@ts-ignore
            evalRef.current.postMessage('setoption name MultiPV value 1');
            setStockfishReady(true);
          }

          if((event.data.match(bestMoveRegex)) !== null){
            console.log(event.data);
            console.log(event.data.match(bestMoveRegex)[1]);
            const newBestMove = event.data.match(bestMoveRegex)[1];
            if(game.turn() !== playerColor && newBestMove !== null){
              //playMoveAtCertainLevel(databaseRating, newBestMove);
              game.move(newBestMove);
              setCurrentFen(game.fen());
              setBestMove(newBestMove);
            } 
          }
        }
    }, []);
  
    useEffect( () => {
      getCloudEval(game.fen());
    }, [count]);

    useEffect(() => {
      console.log('New Level : ' + databaseRating);
    }, [databaseRating]);

    useEffect(() => {
      //@ts-ignore
      evalRef.current.postMessage('stop');
      //@ts-ignore
      evalRef.current.postMessage(`position fen ${game.fen()}`);
      //@ts-ignore
      evalRef.current.postMessage('go depth 18');
    }, [currentFen]);
  
    function checkGameOver() {
      // exit if the game is over
      if (game.isGameOver() || game.isDraw() || game.moves().length === 0){
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
  
    function makeRandomMove(filterLevel: number, safeMoves: boolean) {
      // Minimise le risque que l'IA joue un coup aléatoire trop catastrophique en l'empechant de jouer certaines pièces
      const filter = [
        /noFilter/gm, // Beginner - Ban List [rien]
        /[Q][a-z]*[1-9]/gm, // Casual - Ban List [Queen]
        /[QK][a-z]*[1-9]/gm, // Intermediate - Ban List [Queen, King]
        /[QKR][a-z]*[1-9]/gm, // Advanced - Ban List [Queen, King, Rook]
        /[QKRNB][a-z]*[1-9]/gm, // Master - Ban List [Queen, King, Rook, Knight, Bishop]
      ]
      const possibleMoves = game.moves();
      console.log(possibleMoves);
      let possiblesMovesFiltered = possibleMoves.filter(move => !move.match(filter[filterLevel]));

      console.log(possiblesMovesFiltered);

      if(possiblesMovesFiltered.length < 1) possiblesMovesFiltered = possibleMoves;

      let safePossibleMoves = [possiblesMovesFiltered[0]];

      if(safeMoves) {
        const isPawn = (move: string) => !move.match(/[QKRNB][a-z]*[1-9]/gm);
        const isDestinationDefended = (move: string) => {
          //@ts-ignore
          return game.isAttacked(getMoveDestination(move), playerColor);
        }
        
        //@ts-ignore
        safePossibleMoves = possiblesMovesFiltered.filter(pMove => isPawn(pMove) || !isDestinationDefended(pMove));
        console.log(safePossibleMoves);
        if(safePossibleMoves.length < 1) safePossibleMoves = possiblesMovesFiltered;
      }
  
      checkGameOver();
  
      const randomIndex = Math.floor(Math.random() * safePossibleMoves.length);
      console.log(safePossibleMoves[randomIndex]);
      //makeLichessMove();
      if(safePossibleMoves.length <= 0) return;
      game.move(safePossibleMoves[randomIndex]);
      //setCount(0);
      setCurrentFen(game.fen());
    }

    function testF(functionName: string) {
      switch (functionName) {
        case 'getMoveDestination':
          console.log('Test getMoveDestination(move: string): string');
          console.log('Input (e4), Output expected (e4): ' + getMoveDestination('e4'));
          console.log('Input (exd4), Output expected (d4): ' + getMoveDestination('exd4'));
          console.log('Input (Qd4), Output expected (d4): ' + getMoveDestination('Qd4'));
          console.log('Input (Ngf3), Output expected (f3): ' + getMoveDestination('Ngf3'));
          console.log('Input (Bb5+), Output expected (b5): ' + getMoveDestination('Bb5+'));
          console.log('Input (Re8#), Output expected (e8): ' + getMoveDestination('Re8#'));
          console.log('Input (h8=N), Output expected (h8): ' + getMoveDestination('h8=N'));
          console.log('Input (hxg8=N), Output expected (g8): ' + getMoveDestination('hxg8=N'));
          console.log('Input (hxg8=R+), Output expected (g8): ' + getMoveDestination('hxg8=R+'));
          console.log('Input (hxg8=Q#), Output expected (g8): ' + getMoveDestination('hxg8=Q#'));
          break;
      
        default:
          break;
      }
    }

    function getMoveDestination(move: string) {
      //Qd4 -> d4, Ngf3 -> f3, exd4 -> d4, Bb5+ -> b5, Re8# -> e8, e4 -> e4
      //return move.replaceAll(/[+#]/gm, '').slice(-2);
      return move.match(/[a-h][1-8]/);
    }

    function isLastMoveDangerous() {
      const history = JSON.parse(JSON.stringify(game.history({verbose: true})));
      const lastMove = history.pop();

      if(lastMove === null || lastMove === undefined) return false;

      //console.log(lastMove);

      // Si le dernier coup est une capture, il faut obligatoirement réagir
      if(lastMove.san.match(/[x]/gm)) return true;

      const previousFen = lastMove.before;
      const currentFen = lastMove.after;

      gameTest.load(previousFen);
      gameTest.remove(lastMove.from);
      gameTest.put({type: lastMove.piece, color: lastMove.color}, lastMove.to);
      const pieceMoves = gameTest.moves({square: lastMove.to});
      //gameTest.load(currentFen);

      console.log(pieceMoves);

      let danger = false;

      //testF('getMoveDestination');

      pieceMoves.forEach(pieceMove => {
        const attackedCase = getMoveDestination(pieceMove);
        //console.log(attackedCase);
        //@ts-ignore
        const squareInfos = game.get(attackedCase);
        //console.log(squareInfos);
        if(squareInfos && squareInfos?.type !== 'p' && squareInfos?.color !== playerColor) {
          danger = true;
        }
      });

      console.log(`Is last move \x1B[34m(${lastMove.san})\x1B[0m dangerous: \x1B[31m` + danger);

      return danger;
    }

    function makeStockfishMove(level: string) {
      let randMoveChance = 0;
      let skillValue = 0;
      let depth = 5;
      let filterLevel = 0; // Empèche de jouer certaines pièces lors d'un coup aléatoire
      let securityLvl = 0; // 0: Pas de sécurité, 1: Réagit dernier coup adversaire, 2: Coup aléatoire -> case non défendue

      // Empeche d'avoir un deuxième coup aléatoire avant le Xème coup
      let randMoveInterval = 5;

      /* //@ts-ignore
      evalRef.current.postMessage('stop');
      //@ts-ignore
      evalRef.current.postMessage(`position fen ${game.fen()}`);
      //@ts-ignore
      evalRef.current.postMessage('go depth 18'); */


      //@ts-ignore
      engineRef.current.postMessage(`position fen ${game.fen()}`);
      console.log(databaseRating);

      console.log(level);

      switch (level) {
        case 'Beginner':
          // ~900 Elo (Bot chess.com)
          randMoveChance = 20; 
          randMoveInterval = 3; 
          filterLevel = 0;
          securityLvl = 0;
          skillValue = 0;
          depth = 10;
          break;
        case 'Casual':
          // ~1300 Elo (Bot chess.com) (ancien)
          randMoveChance = 10;
          randMoveInterval = 5;
          filterLevel = 1;
          securityLvl = 1;
          skillValue = 2;
          depth = 10;
          break;
        case 'Intermediate':
          // ~1800 Elo (Bot chess.com)
          randMoveChance = 5;
          randMoveInterval = 10;
          filterLevel = 2;
          securityLvl = 1;
          skillValue = 10;
          depth = 12;
          break;
        case 'Advanced':
          // Au moins 2100 Elo (Bot chess.com)
          randMoveChance = 3;
          randMoveInterval = 15;
          filterLevel = 3;
          securityLvl = 2;
          skillValue = 13;
          depth = 12;
          break;
        case 'Master':
          randMoveChance = 1;
          randMoveInterval = 15;
          filterLevel = 4;
          securityLvl = 2;
          skillValue = 16;
          depth = 16;
          break;
        case 'Maximum':
          randMoveChance = 0;
          randMoveInterval = 0;
          filterLevel = 0;
          securityLvl = 0;
          skillValue = 20;
          depth = 20;
          break;
        default:
          randMoveChance = 10;
          skillValue = 10;
          depth = 10;
          break;
      }
      let rand = Math.random()*100;

      if(securityLvl > 0 && isLastMoveDangerous()){
        console.log('Play Forced Stockfish Best Move !');
        setLastRandomMove(lastRandomMove-1);
        console.log(lastRandomMove);
        //@ts-ignore
        engineRef.current.postMessage(`setoption name Skill Level value ${skillValue}`);
        //@ts-ignore
        engineRef.current.postMessage(`go depth ${depth}`);
        return;
      }

      if(lastRandomMove <= -randMoveInterval){
        console.log('Play Forced Random Move !');
        console.log(`Random Move Interval: ${randMoveInterval}, Last Random Move: ${lastRandomMove}`);
        setLastRandomMove(randMoveInterval);
        makeRandomMove(filterLevel, securityLvl > 1);
        return;
      }

      if(rand <= randMoveChance && lastRandomMove < 1){
        console.log('Play Random Move !');
        console.log(`Random Move Interval: ${randMoveInterval}, Last Random Move: ${lastRandomMove}`);
        setLastRandomMove(randMoveInterval);
        makeRandomMove(filterLevel, securityLvl > 1);
      }else{
        console.log('Play Stockfish Best Move !');
        setLastRandomMove(lastRandomMove-1);
        console.log(lastRandomMove);
        //@ts-ignore
        engineRef.current.postMessage(`setoption name Skill Level value ${skillValue}`);
        //@ts-ignore
        engineRef.current.postMessage(`go depth ${depth}`);
      }
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

      checkGameOver();
      
      console.log("No more moves in the database !");
      if(stockfishReady) {
        makeStockfishMove(databaseRating);
      }else{
        console.log('Make Random Move !');
        makeRandomMove(0, false);
      }
      
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
      setCurrentFen(gameCopy.fen());
      //setCount(count+1);
  
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
        case 'Test King Attack':
          fen = '1k6/8/8/4K1b1/6n1/8/8/8 w - - 0 1';
          break;
        case 'Test Pawn Attack':
          fen = '2B1k1r1/q2n1p2/2p1p2P/3pP3/P2P4/1p5Q/1P3PP1/R4KN1 w - - 0 1';
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
              {engineEval}
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
              <option value="Test King Attack" >Test King Attack</option>
              <option value="Test Pawn Attack" >Test Pawn Attack</option>
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