const bestMoveRegex = /bestmove\s(\w*)/;
const pvMoveRegex = /\spv\s\w*/;
const evalRegex = /cp\s-?[0-9]*|mate\s-?[0-9]*/; 
const firstEvalMoveRegex = /pv\s[a-h][1-8]/;

type EvalResult = {
    bestMove: string,
    movePlayed: string,
    evalBefore: string,
    evalAfter: string,
    quality: string,
}

type EvalResultSimplified = {
    bestMove: string,
    eval: string,
}

function getEvalFromData(data: string, coeff: number) {
    let evaluationStr: string | undefined = (evalRegex.exec(data))?.toString();
    if(!evaluationStr) return null;

    const evaluationArr = evaluationStr.split(' ');
    if(evaluationArr[0] === 'mate') evaluationStr = '#' + coeff*(eval(evaluationArr[1]));
    if(evaluationArr[0] === 'cp') evaluationStr = (coeff*(eval(evaluationArr[1])/100)).toString();

    return evaluationStr;
}

function getBestMoveFromData(data: string) {
    let bestMove: string | undefined = (pvMoveRegex.exec(data))?.toString();
    if(!bestMove) return null;

    const bestMoveArr = bestMove.trim().split(' ');
    bestMove = bestMoveArr[1];
    return bestMove;
}

class Engine {
    stockfish: Worker;

    constructor() {
        this.stockfish = new Worker('stockfish.js#stockfish.wasm');
    }

    init() {
        return new Promise((resolve, reject) => {    
            this.stockfish.postMessage('uci');
            this.stockfish.onmessage = function(event: any) {
                if(event.data === 'uciok'){
                    resolve('uciok');
                }
            }
        })
    }

    
    findBestMove(fen: string, depth: number, skillValue: number) {
        return new Promise((resolve, reject) => {
            this.stockfish.postMessage(`position fen ${fen}`);
            this.stockfish.postMessage(`setoption name Skill Level value ${skillValue}`);
            this.stockfish.postMessage(`go depth ${depth}`);

            this.stockfish.onmessage = function(event: any) {
                if((event.data.match(bestMoveRegex)) !== null){
                    const newBestMove = event.data.match(bestMoveRegex)[1];
                    if(newBestMove !== null){
                        resolve(newBestMove);
                    } else{
                        reject(null);
                    }
                }
            }
        })
    }

    

    findBestMoves(fen: string, depth: number, skillValue: number, multiPv: number, coeff: number) {
        return new Promise((resolve, reject) => {
            let bestMoves: EvalResultSimplified[] = [];
            this.stockfish.postMessage(`position fen ${fen}`);
            this.stockfish.postMessage(`setoption name Skill Level value ${skillValue}`);
            this.stockfish.postMessage(`setoption name MultiPv value ${multiPv}`);
            this.stockfish.postMessage(`go depth ${depth}`);

            this.stockfish.onmessage = function(event: any) {
                if(event.data.includes(`info depth ${depth} `)){
                    let evaluationStr: string | null = getEvalFromData(event.data, coeff);
                    let bestMove: string | null = getBestMoveFromData(event.data);

                    if(!evaluationStr || !bestMove || !event.data.match(firstEvalMoveRegex)){
                        reject("Erreur lors de l'évaluation");
                        return;
                    }

                    bestMoves.push({
                        eval: evaluationStr,
                        bestMove: bestMove
                    });
                }
                if((event.data.match(bestMoveRegex)) !== null){
                    if(event.data.match(bestMoveRegex)[1]){
                        resolve(bestMoves);
                    } else{
                        reject(null);
                    }
                }
            }
        })
    }

    //TODO: Afficher les lignes en entier, en plus du meilleur coup : (c7e5 g1f3 d7d6 d2d4 ...)
    //TODO: Prendre en compte quand l'utilisateur veut afficher plusieurs lignes de coups (MultiPv > 1)
    evalPositionFromFen(fen: string, depth: number, coeff: number) {
        return new Promise((resolve, reject) => {
            // On stope l'analyse au cas où la position aurait changé avant qu'une précédente analyse soit terminée
            this.stockfish.postMessage('stop');
            this.stockfish.postMessage(`position fen ${fen}`)
            this.stockfish.postMessage(`go depth ${depth}`);

            this.stockfish.onmessage = function(event: any) {
                if(event.data.includes(`info depth ${depth} `) && (evalRegex.exec(event.data)) !== null){
                    let evaluationStr: string | null = getEvalFromData(event.data, coeff);
                    let bestMove: string | null = getBestMoveFromData(event.data);

                    if(!evaluationStr || !bestMove || !event.data.match(firstEvalMoveRegex)){
                        reject("Erreur lors de l'évaluation");
                        return;
                    }

                    resolve({
                        eval: evaluationStr,
                        pv: bestMove
                    });
                }
            }
        })
    }

    // movesList: e2e4 e7e5 g1f3 b8c6 f1b5 a7a6 ...
    evalPositionFromMovesList(movesListUci: string, depth: number, coeff: number) {
        console.log(movesListUci);
        return new Promise((resolve, reject) => {
            // On stope l'analyse au cas où la position aurait changé avant qu'une précédente analyse soit terminée
            this.stockfish.postMessage('stop');
            this.stockfish.postMessage(`position startpos moves ${movesListUci}`)
            this.stockfish.postMessage(`go depth ${depth}`);

            this.stockfish.onmessage = function(event: any) {
                if(event.data === "info depth 0 score mate 0"){
                    console.log(event.data);
                    resolve({
                        eval: '#' + coeff,
                        pv: ''
                    });
                }
                if(event.data.includes(`info depth ${depth} `) && (evalRegex.exec(event.data)) !== null){
                    console.log(event.data);
                    let evaluationStr: string | null = getEvalFromData(event.data, coeff);
                    let bestMove: string | null = getBestMoveFromData(event.data);

                    if(!evaluationStr || !bestMove || !event.data.match(firstEvalMoveRegex)){
                        reject("Erreur lors de l'évaluation");
                        return; // inutile ?
                    }

                    resolve({
                        eval: evaluationStr,
                        pv: bestMove
                    });
                }
            }
        })
    }

    mateToNumber(mateEval: string) {
        return 20/eval(mateEval.split('#')[1]);
    }

    evalMoveQuality(moveEval: EvalResult) {
        let evalBefore: number = moveEval.evalBefore.includes('#') ? this.mateToNumber(moveEval.evalBefore) : eval(moveEval.evalBefore);
        let evalAfter: number = moveEval.evalAfter.includes('#') ? this.mateToNumber(moveEval.evalAfter) : eval(moveEval.evalAfter);
        let scoreDiff = Math.abs(evalAfter - evalBefore);
        console.log(moveEval.movePlayed);
        console.log(evalBefore);
        console.log(evalAfter);
        console.log(scoreDiff);
        if(scoreDiff > 0.5 && moveEval.bestMove !== moveEval.movePlayed) moveEval.quality = "?!";
        if(scoreDiff > 1 && moveEval.bestMove !== moveEval.movePlayed) moveEval.quality = "?";
        if(scoreDiff > 2 && moveEval.bestMove !== moveEval.movePlayed) moveEval.quality = "??";
        return moveEval;
    }

    //Test avec : movesArray = ['e2e4', 'e7e5', 'g1f3', 'b8c6', 'f1b5'];
    //TODO: Voir s'il ne faudrait pas utiliser un Observable plutôt qu'une promesse (pour gérer la barre de progression)
    async launchGameAnalysis(movesListUci: Array<string>, depth: number) {
        console.log('Start Game Anaysis');
        let results = [];
        //let i = 0; // for(let [movesSet, i] of movesSetArray){...} ne semble pas marcher 

        let movesSetArray = movesListUci.map((move, i) => {
            return movesListUci.slice(0, i).join(' ');
        });

        //Il a fallu ajouter "downlevelIteration": true dans le tsconfig.json pour que ça marche
        //TODO: corriger l'eval pour le dernier coup de la partie
        for(let [i, movesSet] of movesSetArray.entries()){
            const coeff = i%2 === 0 ? 1 : -1;
            const result: any = await this.evalPositionFromMovesList(movesSet, depth, coeff);
            let finalResult: EvalResult = {
                bestMove: result.pv,
                movePlayed: movesListUci[i],
                evalBefore: result.eval,
                evalAfter: result.eval,
                quality: "",
            }
            results.push(finalResult);
            if(i > 0) results[i-1].evalAfter = result.eval;
        }

        for(let result of results){
            result = this.evalMoveQuality(result);
        }

        /* results.forEach((result, i) => {
            result.movePlayed = movesList[i];
        }); */

        console.log(results);
        return results;
    }
}

export default Engine;