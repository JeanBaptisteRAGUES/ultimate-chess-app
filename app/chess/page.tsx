'use client'
import { useEffect, useMemo, useRef, useState } from "react";
import {BLACK, Chess} from "chess.js";
import { Chessboard } from "react-chessboard";
import { Piece, Square } from "react-chessboard/dist/chessboard/types";
import { fetchLichessDatabase } from "./libs/fetchLichess";
import { Chart } from "chart.js";
import { AnalysisChart } from "./components/AnalysisChart";
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
    const [gameStarted, setGameStarted] = useState(false);
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
    const [showEval, setShowEval] = useState(true);
    const [lastRandomMove, setLastRandomMove] = useState(0);
    const evalRef = useRef();
    const engineRef = useRef();
    const analysisRef = useRef();
    const movesHistoryRef = useRef();
    const bestMovesRef = useRef(new Array());
    const colorRef = useRef('w');
    const scoreHistory = useRef(new Array());
    const analysisChart = useRef();
    const ctxRef = useRef(null);
    const evalRegex = /cp\s-?[0-9]*|mate\s-?[0-9]*/;
    const bestMoveRegex = /bestmove\s(\w*)/;
    const firstEvalMoveRegex = /pv\s[a-h][1-8]/;
    const [chartHistoryData, setChartHistoryData] = useState([]);
    const [showChartHistory, setShowChartHistory] = useState(false);
    const [showGameoverWindow, setShowGameoverWindow] = useState(false);
    const [showAnalysisProgress, setShowAnalysisProgress] = useState(false);
    const [analysisProgress, setAnalysisProgress] = useState(0);
    const [winner, setWinner] = useState(''); // 'w' -> blancs gagnent, 'b' -> noirs gagnent, 'd' -> draw
    const timestampStart = useRef(0);
    const timestampEnd = useRef(0);

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
            if(evaluationArr[0] === 'mate') evaluationStr = '#' + coeff*(eval(evaluationArr[1]));
            if(evaluationArr[0] === 'cp') evaluationStr = (coeff*(eval(evaluationArr[1])/100)).toString();
            //console.log('Evaluation : ' + evaluationStr);
            setEngineEval(evaluationStr);
          }
        } 

        //@ts-ignore
        engineRef.current.onmessage = function(event: any) {
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
            console.log(`Game Turn: ${game.turn()}, Player Color: ${playerColor}`);
            if(newBestMove !== null){
              //playMoveAtCertainLevel(databaseRating, newBestMove);
              game.move(newBestMove);
              if(checkGameOver()) return;
              console.log('Not Game Over');
              setCurrentFen(game.fen());
              setBestMove(newBestMove);
            } 
          }
        }
    }, []);
  
    /* useEffect( () => {
      getCloudEval(game.fen());
    }, [count]); */

    useEffect(() => {
      console.log('New Level : ' + databaseRating);
      //@ts-ignore
      if(databaseRating === "Maximum") engineRef.current.postMessage('setoption name Use NNUE value on_use_NNUE');
      //@ts-ignore
      if(databaseRating !== "Maximum") engineRef.current.postMessage('setoption name Use NNUE value false');
    }, [databaseRating]);

    useEffect(() => {
      if(checkGameOver()) return;
      //@ts-ignore
      evalRef.current.postMessage('stop');
      //@ts-ignore
      evalRef.current.postMessage(`position fen ${game.fen()}`);
      //@ts-ignore
      evalRef.current.postMessage('go depth 18');
    }, [currentFen]);
  
    function checkGameOver() {
      // exit if the game is over
      if (game.isGameOver()){
        console.log('Game Over !');
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
  
    function movesHistory() {
      const movesObj = game.history({verbose: true});
      //console.log(movesObj);
  
      const movesStr: Array<string> = [];
  
      movesObj.forEach(move => (
        movesStr.push(move.lan)
      ));
  
      //console.log(JSON.stringify(movesStr));
  
      return movesStr;
    }

    function movesHistorySan(gamePGN: string){
      let pgnAfter = gamePGN.replaceAll(/\d*\.\s/gm, (test) => test.trim());

      return pgnAfter.split(' ');
    }

    function scoreToPercentage(score: number, isMate: boolean) {
      if(isMate){
        if(score < 0) return 0;
        return 100;
      } 
      const scoreLimit = Math.min(4.5,(Math.max(-4.5,score)));
      console.log(`Score: ${score}, Score Limit: ${scoreLimit}`);
      return (5+scoreLimit)/0.1;
    }

    function uciToSan(uci: string, testFen: string) {
      gameTest.load(testFen);
      gameTest.move(uci);

      const lastMove = gameTest.history({verbose: true}).pop();
      console.log(lastMove);

      return lastMove?.san;
    }

    function getBestMove(evalData: string) {
      const bestMoveObject = (/pv\s([a-h][1-8][a-h][1-8])/).exec(evalData);
      console.log(bestMoveObject);
      return bestMoveObject ? bestMoveObject[1] : '';
    }
    
    //TODO: Erreur à la fin de l'analyse (pour le dernier coup ?)
    //TODO: Les "meilleurs coups" de stockfish dans l'ouverture sont parfois très mauvais -> essayer d'utiliser l'option Ownbook
    //TODO: Évaluer les imprécisions/erreurs/gaffes 
    //TODO: Pouvoir naviguer dans la partie jouée avec l'évaluation de l'ordinateur (+ base de données ?)
    function launchStockfishAnalysis(depth: number) {
      //1. e4 c6 2. d4 d5 3. e5 c5 4. dxc5 Nc6 5. Nf3 Bg4 6. c3 e6 7. Be3 Nxe5 8. Qa4+ Nc6 9. Qxg4 Nf6 10. Be2
      //Temps d'analyse sans avoir rien modifié: 3.5s
      //Temps d'analyse en mode analyse: 3.5s
      //Temps d'analyse en mode analyse et 2 threads: ~4s
      //Temps d'analyse en mode analyse et 4 threads: ~4.2s
      const score12CpRegex = /\sdepth\s12.*cp\s(-?\d*)/gm;
      const score12MateRegex = /\sdepth\s12.*mate\s(-?\d*)|mate\s(0)/gm;
      const score16CpRegex = /\sdepth\s16.*cp\s(-?\d*)/gm;
      const score16MateRegex = /\sdepth\s16.*mate\s(-?\d*)|mate\s(0)/gm;
      let scoreCpRegex = score12CpRegex;
      let scoreMateRegex = score12MateRegex;
      let useNNUE = false;
      if(depth >= 16){
        depth = 16;
        scoreCpRegex = score16CpRegex;
        scoreMateRegex = score16MateRegex;
        useNNUE = true;
      }

      setChartHistoryData([]);
      scoreHistory.current = [];
      bestMovesRef.current = [];

      //@ts-ignore
      analysisRef.current = new Worker('stockfish.js#stockfish.wasm');

      //@ts-ignore
      analysisRef.current.postMessage('uci');

      //@ts-ignore
      movesHistoryRef.current = game.history({verbose: true});

      //@ts-ignore
      analysisRef.current.onmessage = function(event: any) {
        //console.log(event.data);
        if(event.data === 'uciok'){
          console.log('Analysis ok');
          timestampStart.current = performance.now();
          //@ts-ignore
          analysisRef.current.postMessage('setoption name MultiPV value 1');
          //@ts-ignore
          analysisRef.current.postMessage('setoption name UCI_AnalyseMode value true');
          if(useNNUE){
            console.log('Use NNUE !');
            //@ts-ignore
            analysisRef.current.postMessage('setoption name Use NNUE value on_use_NNUE');
          }else{
            //@ts-ignore
            analysisRef.current.postMessage('setoption name Use NNUE value false');
          } 
          /* //@ts-ignore
          analysisRef.current.postMessage('setoption name Threads value 4'); */
          console.log(movesHistoryRef.current);
          //@ts-ignore
          const lastMove = movesHistoryRef.current.pop();
          colorRef.current = lastMove.color;
          console.log(lastMove.after);
          //@ts-ignore
          analysisRef.current.postMessage(`position fen ${lastMove.after}`);
          //@ts-ignore
          analysisRef.current.postMessage(`go depth ${depth}`);
        }

        if(event.data.match(scoreCpRegex)){
          console.log(event.data);
          //console.log(event.data.match(score12CpRegex));
          //@ts-ignore
          let analysisEval = eval(((scoreCpRegex).exec(event.data))[1])/100.0;
          //const analysisColor = (/.*\s(b)|.*\s(w)/gm).exec(event.data);
          if(colorRef.current === 'w') analysisEval =  (-1)*analysisEval;
          //console.log(colorRef.current); 
          //console.log(analysisEval); 

          //scoreHistory.current.unshift(analysisEval);
          scoreHistory.current.unshift(scoreToPercentage(analysisEval, false));
          //console.log(analysisColor);
          //@ts-ignore
          const lastMove = movesHistoryRef.current.pop();

          const bestMoveUci = getBestMove(event.data);
          if(bestMoveUci?.length > 0 && bestMovesRef.current.length > 0) {
            bestMovesRef.current[0].pvSan = uciToSan(bestMoveUci, bestMovesRef.current[0].fenBefore);
            bestMovesRef.current[0].pvScoreBefore = analysisEval.toString();
          } 

          //@ts-ignore
          setAnalysisProgress(Math.min(100, (scoreHistory.current.length/game.history().length)*100));
          //setAnalysisProgress(Math.random()*100);
          //@ts-ignore
          //console.log(`scoreHistory.current.length: ${scoreHistory.current.length}, movesHistoryRef.current.length: ${movesHistoryRef.current.length}`);
          if(lastMove){
            const lastFen = lastMove.after;
            colorRef.current = lastMove.color;
            console.log(lastMove);
            bestMovesRef.current.unshift({fenBefore: lastMove.after, pvSan: '', pvScoreBefore: '', pvScoreAfter: analysisEval.toString()});
            //bestMovesRef.current.unshift(uciToSan(lastMove.san, lastFen));
            //@ts-ignore
            analysisRef.current.postMessage(`position fen ${lastFen}`);
            //@ts-ignore
            if(movesHistoryRef.current.length <= 5){
              //@ts-ignore
              analysisRef.current.postMessage(`go depth ${depth+4}`);
            }else{
              //@ts-ignore
              analysisRef.current.postMessage(`go depth ${depth}`);
            }
          }else{
            console.log(scoreHistory.current);
            timestampEnd.current = performance.now();
            console.log('Analysis time: ' + (timestampEnd.current - timestampStart.current)/1000 + 's');
            //@ts-ignore
            analysisRef.current.postMessage('stop');
            bestMovesRef.current.unshift('');
            console.log(bestMovesRef.current);
            //@ts-ignore
            setChartHistoryData(scoreHistory.current);
            setShowChartHistory(true);
          }
        }
        if(event.data.match(scoreMateRegex)){
          console.log(event.data);
          //console.log(((score12MateRegex).exec(event.data))?.length);
          //@ts-ignore
          const lastMove = movesHistoryRef.current.pop();
          let regexResult = ((scoreMateRegex).exec(event.data));
          console.log(regexResult);
          let analysisEval = 0;
          let analysisEvalPercentage = 0;
          if(regexResult && regexResult[1] !== undefined && regexResult[1] !== null) analysisEval = eval(regexResult[1]);

          const bestMoveUci = getBestMove(event.data);
          console.log('Best Move UCI: ' + bestMoveUci);
          if(bestMoveUci?.length > 0 && bestMovesRef.current.length > 0) {
            bestMovesRef.current[0].pvSan = uciToSan(bestMoveUci, bestMovesRef.current[0].fenBefore);
            bestMovesRef.current[0].pvScoreBefore = `M${analysisEval}`;
          } 

          //@ts-ignore
          if(colorRef.current === 'w' && analysisEval !== 0) analysisEval =  (-1)*analysisEval;
          if(colorRef.current === 'w' && analysisEval === 0) analysisEval =  100;
          if(colorRef.current === 'b' && analysisEval === 0) analysisEval =  -100;
          console.log(colorRef.current); 
          console.log(analysisEval);

          //@ts-ignore
          scoreHistory.current.unshift(scoreToPercentage(analysisEval, true));
          //console.log(analysisColor);
          //@ts-ignore
          setAnalysisProgress(Math.min(100, (scoreHistory.current.length/game.history().length)*100));

          if(lastMove){
            const lastFen = lastMove.after;
            colorRef.current = lastMove.color;
            console.log(lastMove);
            bestMovesRef.current.unshift({fenBefore: lastMove.after, pvSan: '', pvScoreBefore: '', pvScoreAfter: `M${analysisEval}`});
            //bestMovesRef.current.unshift(uciToSan(lastMove.san, lastFen));
            //@ts-ignore
            analysisRef.current.postMessage(`position fen ${lastFen}`);
            //@ts-ignore
            if(movesHistoryRef.current.length <= 5){
              //@ts-ignore
              analysisRef.current.postMessage(`go depth ${depth+4}`);
            }else{
              //@ts-ignore
              analysisRef.current.postMessage(`go depth ${depth}`);
            }
          }else{
            console.log(scoreHistory.current);
            timestampEnd.current = performance.now();
            console.log('Analysis time: ' + (timestampEnd.current - timestampStart.current)/1000 + 's');
            //@ts-ignore
            analysisRef.current.postMessage('stop');
            bestMovesRef.current.unshift('');
            console.log(bestMovesRef.current);
            //@ts-ignore
            setChartHistoryData(scoreHistory.current);
          }
        }
      }


    }
  
    function makeRandomMove(filterLevel: number, safeMoves: boolean) {
      if(checkGameOver()) return;
      console.log('Make Random Move');
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
      //const currentFen = lastMove.after;

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

    function checkmateOpponent() {
      const allMoves = game.moves();
      let isCheckmate = false;
      
      allMoves.forEach((testMove) => {
        if(!isCheckmate){
          gameTest.load(game.fen());
          gameTest.move(testMove);
          isCheckmate = gameTest.isCheckmate();
          //console.log(`Move (${testMove}) is checkmate: ${isCheckmate}`);
          if(isCheckmate){
            game.move(testMove);
            setCurrentFen(game.fen());
          } 
        }
      });

      return isCheckmate;
    }

    function makeStockfishMove(level: string) {
      if(checkGameOver()) return;
      console.log('Make Stockfish Move');
      let randMoveChance = 0;
      let skillValue = 0;
      let depth = 5;
      let filterLevel = 0; // Empèche de jouer certaines pièces lors d'un coup aléatoire
      let securityLvl = 0; // 0: Pas de sécurité, 1: Réagit dernier coup adversaire, 2: Coup aléatoire -> case non défendue

      // Empeche d'avoir un deuxième coup aléatoire avant le Xème coup
      let randMoveInterval = 5;

      //TODO: à implémenter
      let playForcedMate = 1; // Empèche de louper les mats en x quand x < ou = à playForcedMate

      //TODO: à implémenter quand le reste sera fait: plus il y a de pièces attaquées, plus la charge mentale augmente, plus 
      // les chances de commettre une erreur (randomMove) augmentent. Echanger des pièces réduit la charge mentale, maintenir
      // un clouage au contraire maintient cette charge mentale. Plus la partie avance, plus la charge mentale augmente (légèrement)
      let mentalChargeLimit = 100;
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
          playForcedMate = 1;
          break;
        case 'Casual':
          // ~1300 Elo (Bot chess.com) (ancien)
          randMoveChance = 10;
          randMoveInterval = 5;
          filterLevel = 1;
          securityLvl = 1;
          skillValue = 2;
          depth = 10;
          playForcedMate = 2;
          break;
        case 'Intermediate':
          // 1 victoire contre Jonas (1700 chess.com) avec les blancs, 1 victoire contre Maia9 (1681 rapide Lichess) avec les blancs
          randMoveChance = 10; //Test: 5 -> 10
          randMoveInterval = 10;
          filterLevel = 2;
          securityLvl = 2; //Test: 1 -> 2
          skillValue = 5; //Test: 10 -> 5
          depth = 12;
          playForcedMate = 3;
          break;
        case 'Advanced':
          // Au moins 2100 Elo (Bot chess.com)
          randMoveChance = 3;
          randMoveInterval = 15;
          filterLevel = 3;
          securityLvl = 2;
          skillValue = 13;
          depth = 12;
          playForcedMate = 4;
          break;
        case 'Master':
          // Environ 2900 Elo (Bot chess.com)
          randMoveChance = 1;
          randMoveInterval = 20;
          filterLevel = 4;
          securityLvl = 2;
          skillValue = 20;
          depth = 16;
          playForcedMate = 5;
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

      if(checkmateOpponent()){
        console.log('Play Forced Checkmate !');
        setLastRandomMove(lastRandomMove-1);
        return;
      }

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

      if(databaseRating !== 'Maximum' && lastRandomMove <= -randMoveInterval){
        console.log('Play Forced Random Move !');
        console.log(`Random Move Interval: ${randMoveInterval}, Last Random Move: ${lastRandomMove}`);
        setLastRandomMove(randMoveInterval);
        makeRandomMove(filterLevel, securityLvl > 1);
        return;
      }

      if(databaseRating !== 'Maximum' && rand <= randMoveChance && lastRandomMove < 1){
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
      if(checkGameOver()) return;
      console.log('Make Lichess Move');
      let lichessMove = {san: "", uci: "", winrate: {white: 33, draws: 33, black: 33}};
  
      lichessMove = fen === "" ? await fetchLichessDatabase(movesHistory(), databaseRating, startingFen) : await fetchLichessDatabase(movesHistory(), databaseRating, fen);
  
      console.log(lichessMove);
  
      if(databaseRating !== 'Maximum' && lichessMove?.san !== "" && lichessMove?.san !== undefined){
  
        game.move(lichessMove.san);
        setWinrate(lichessMove.winrate);
        console.log(lichessMove.winrate);
        setCurrentFen(game.fen());
        setBestMove(lichessMove.san);
        if(checkGameOver()) return;
        //setUseStockfish(true);
        return;
      }
      
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
      let delay = 100 + Math.random()*500;
      if(databaseRating === 'Maximum') delay = 0;
      //console.log('Delay: ' + delay);
      if(gameStarted){
        const newTimeout = setTimeout(makeLichessMove, delay);
        setCurrentTimeout(newTimeout);
      }
      
      return true;
    }
  
    function setPosition(positionName: string) {
      let fen = '';
      switch (positionName) {
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

    function analyseMoveByMove(cpBestMoves: any, gameHistory: string[]): string[] {
      let movesAnalysis: string[] = [];
      cpBestMoves.forEach((bMove: any, i: number) => {
        if(bMove !== '' && !bMove.pvScoreBefore.match('M') && !bMove.pvScoreAfter.match('M')){
          let comment = ' ';
          let scoreDiff = Math.abs(eval(bMove.pvScoreBefore) - eval(bMove.pvScoreAfter));
          if(scoreDiff > 0.5) comment = `?! (${bMove.pvSan} was best) `;
          if(scoreDiff > 1) comment = `? (${bMove.pvSan} was best) `;
          if(scoreDiff > 2) comment = `?? (${bMove.pvSan} was best) `;
          movesAnalysis.push(gameHistory[i] + comment);
        }else{
          if(bMove === ''){
            movesAnalysis.push(gameHistory[i] + ' ');
          }else{
            movesAnalysis.push(gameHistory[i]);
          }
        }
      })

      return movesAnalysis;
    }
  
    return (
      <div className="flex flex-col justify-center items-center bg-cyan-900 h-screen w-full overflow-auto" >
          <h4 className=" text-lg text-white" >
            Niveau de l'adversaire: {databaseRating}
          </h4>
          <div className=" absolute left-5 top-10 text-white w-96">
            {/* 1.e4 e5 2.Nf3 Nc6 3.Bb5 Bc5 4.c3 Nf6 5.d4 exd4 6.e5 Ne4 7.cxd4 Bb4+ 8.Nbd2 O-O 9.O-O Nxd2 10.Bxd2 Bxd2 11.Qxd2 */}
            {game.pgn()}
          </div>
          <div className=" h-20 w-full flex flex-col justify-center items-center">
            <div className=" text-white" >
              {showEval ? engineEval : '???'}
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
                setGameStarted(false);
                setChartHistoryData([]);
                scoreHistory.current = [];
                setWinner('');
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
              <option value="Maximum" >Maximum</option>
            </select>
            {/* <select id="opening" onChange={(e) => setPosition(e.target.value)} value={opening}>
              <option value="" >Tester une position</option>
              <option value="Test King Attack" >Test King Attack</option>
              <option value="Test Pawn Attack" >Test Pawn Attack</option>
            </select> */}
            {
              !gameStarted ? 
                <button
                  className=" m-4 p-1 bg-white border rounded cursor-pointer"
                  onClick={() => {
                    setGameStarted(true);
                    setShowEval(false);
                    if(game.turn() !== playerColor){
                      makeLichessMove();
                      //game.loadPgn('1. e4 c5 2. f4 d5 3. exd5 Nf6 4. c4 e6 5. dxe6 Bxe6 6. Nf3 Nc6 7. d3 Nd4 8. Nbd2 Be7 9. Nxd4 cxd4 10. Be2 O-O 11. g4 Qc7 12. f5 Bc8 13. O-O b6 14. Ne4 Bb7 15. Bf4 Qc6 16. g5 Nxe4 17. Bf3')
                    }
                  }}
                >
                  Start Game
                </button>
                :
                <button
                  className=" m-4 p-1 bg-white border rounded cursor-pointer"
                  onClick={() => setShowEval(!showEval)}
                >
                  Show Eval
                </button>
            }
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
                launchStockfishAnalysis(12);
              }}
            >
              Analysis
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
          {
            showGameoverWindow ? 
            <div className=" flex justify-center items-center w-full h-full absolute top-0 left-0" >
              <div className=" flex flex-col justify-start items-center w-1/2 h-1/2 bg-gray-200 rounded" >
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
                  {
                    !showAnalysisProgress ?
                    <div className=" flex flex-col justify-center items-center gap-5">
                      <button
                        className=" m-4 p-1 bg-fuchsia-600 text-white border rounded cursor-pointer"
                        onClick={() => {
                          launchStockfishAnalysis(12);
                          setShowAnalysisProgress(true);
                        }}
                      >
                        Analyse rapide
                      </button>
                      <button
                        className=" m-4 p-1 bg-fuchsia-600 text-white border rounded cursor-pointer"
                        onClick={() => {
                          launchStockfishAnalysis(16);
                          setShowAnalysisProgress(true);
                        }}
                      >
                        Analyse approfondie
                      </button>
                    </div>
                    :
                    <div className=" h-6 w-2/3 flex flex-row justify-start items-center bg-gray-600 rounded relative">
                      <div className=" bg-fuchsia-600 text-white h-full flex justify-center items-center rounded" style={{width: `${Math.round(analysisProgress)}%`}} >
                        {analysisProgress > 10 ? Math.round(analysisProgress) + '%' : ''}
                      </div>
                      <p></p>
                    </div>
                  }
                </div>
              </div>
            </div>
            :
            null
          }
          {
            showChartHistory ? 
            <div className=" flex justify-center items-center w-full h-full absolute top-0 left-0" >
              <div className=" relative flex flex-col justify-start items-center w-1/2 h-2/3 bg-gray-200 rounded" >
                <button 
                  className=" text-white font-extrabold absolute top-2 left-5" 
                  onClick={() => {setShowAnalysisProgress(false); setAnalysisProgress(0); setShowChartHistory(false);}}>
                  X
                </button>
                <div className=" w-full h-10 bg-fuchsia-600 rounded-t" ></div>
                <div className=" flex justify-center items-center w-full h-fit" >
                  <AnalysisChart historyData={chartHistoryData} className=" " />
                </div>
                <div className="  w-full h-max" >
                  {analyseMoveByMove(bestMovesRef.current, movesHistorySan(game.pgn()))}
                </div>
              </div>
            </div>
            :
            null
          }
      </div>
    )
}

export default ChessPage;