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
    const [lastRandomMove, setLastRandomMove] = useState(0);
    const evalRef = useRef();
    const engineRef = useRef();
    const analysisRef = useRef();
    const movesHistoryRef = useRef();
    const colorRef = useRef('w');
    const scoreHistory = useRef(new Array());
    const analysisChart = useRef();
    const ctxRef = useRef(null);
    const evalRegex = /cp\s-?[0-9]*|mate\s-?[0-9]*/;
    const bestMoveRegex = /bestmove\s(\w*)/;
    const firstEvalMoveRegex = /pv\s[a-h][1-8]/;
    const [chartHistoryData, setChartHistoryData] = useState([]);

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
        }
        if(game.isCheckmate()){
          game.turn() === 'w' ? setEngineEval('0 - 1') : setEngineEval('1 - 0');
        }
        return true;
      }
      return false;
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

    function launchStockfishAnalysis(depth: number) {
      //@ts-ignore
      analysisRef.current = new Worker('stockfish.js#stockfish.wasm');

      //@ts-ignore
      analysisRef.current.postMessage('uci');

      //@ts-ignore
      movesHistoryRef.current = game.history({verbose: true});

      //@ts-ignore
      analysisRef.current.onmessage = function(event: any) {
        if(event.data === 'uciok'){
          console.log('Analysis ok');
          //@ts-ignore
          analysisRef.current.postMessage('setoption name MultiPV value 1');
          console.log(movesHistoryRef.current);
          //@ts-ignore
          analysisRef.current.postMessage(`position fen ${movesHistoryRef.current.pop().after}`);
          //@ts-ignore
          analysisRef.current.postMessage('go depth 12');
        }

        //TODO: Mettre un timer (début-fin) d'analyse pour en estimer le temps, + tester multi-threads et stockfish en mode analyse
        //TODO: Gérer les scores lorsqu'il s'agit d'un mat en x coups
        //TODO: Ordonnée max et ordonnée min
        //TODO: Le score ne doit pas directement être celui de stockfish mais doit avoir un max (ex: 8/-8 max et 10/-10 pour les mats)
        //TODO: Problème lors de l'analyse quand le dernier coup est joué par les noirs, ex: 1. e4 e5 2. Qh5 g6 3. Qxe5+ Qe7 4. Qxh8 Bg7 5. Nf3 Bxh8 -> [0.17, 0.22, -0.45, 4.74, 4.83, 4.96, 4.53, 7.61, -3.35, 3.11] (3.11 au lieu de -3.11)
        if(event.data.match(/\sdepth\s12.*cp\s(-?\d*)/gm)){
          console.log(event.data);
          console.log(event.data.match(/\sdepth\s12.*cp\s(-?\d*)/gm));
          //@ts-ignore
          let analysisEval = eval(((/\sdepth\s12.*cp\s(-?\d*)/gm).exec(event.data))[1])/100.0;
          //const analysisColor = (/.*\s(b)|.*\s(w)/gm).exec(event.data);
          if(colorRef.current === 'w') analysisEval =  (-1)*analysisEval;
          console.log(analysisEval); 

          scoreHistory.current.unshift(analysisEval);
          //console.log(analysisColor);
          //@ts-ignore
          const lastMove = movesHistoryRef.current.pop();
          if(lastMove){
            const lastFen = lastMove.after;
            colorRef.current = lastMove.color;
            console.log(lastFen);
            //@ts-ignore
            analysisRef.current.postMessage(`position fen ${lastFen}`);
            //@ts-ignore
            analysisRef.current.postMessage('go depth 12');
          }else{
            console.log(scoreHistory.current);
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
      if(checkGameOver()) return;
      console.log('Make Lichess Move');
      let lichessMove = {san: "", uci: "", winrate: {white: 33, draws: 33, black: 33}};
  
      lichessMove = fen === "" ? await fetchLichessDatabase(movesHistory(), databaseRating, startingFen) : await fetchLichessDatabase(movesHistory(), databaseRating, fen);
  
      console.log(lichessMove);
  
      if(lichessMove?.san !== "" && lichessMove?.san !== undefined){
  
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
      if(gameStarted){
        const newTimeout = setTimeout(makeLichessMove, 1000);
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
                setGameStarted(false);
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
            {/* <select id="opening" onChange={(e) => setPosition(e.target.value)} value={opening}>
              <option value="" >Tester une position</option>
              <option value="Test King Attack" >Test King Attack</option>
              <option value="Test Pawn Attack" >Test Pawn Attack</option>
            </select> */}
            <button
              className=" m-4 p-1 bg-white border rounded cursor-pointer"
              onClick={() => {
                setGameStarted(true);
                if(game.turn() !== playerColor){
                  makeLichessMove();
                }
              }}
            >
              Start Game
            </button>
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
          <div className=" flex justify-center items-center w-full h-fit" >
            {chartHistoryData.length > 0 ? <AnalysisChart historyData={chartHistoryData} /> : null}
          </div>
      </div>
    )
}

export default ChessPage;