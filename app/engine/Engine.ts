export const bestMoveRegex = /bestmove\s(\w*)/;
export const pvMoveRegex = /\spv\s\w*/;
export const evalRegex = /cp\s-?[0-9]*|mate\s-?[0-9]*/; 
export const cpRegex = /cp\s-?[0-9]*/;
export const mateRegex = /mate\s-?[0-9]*/; 
export const firstEvalMoveRegex = /pv\s[a-h][1-8]/;

export type EvalResult = {
    bestMove: string,
    movePlayed: string,
    evalBefore: string,
    evalAfter: string,
    quality: string,
}

export type EvalResultSimplified = {
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

    
    findBestMove(fen: string, depth: number, skillValue: number): Promise<string> {
        return new Promise((resolve, reject) => {
            this.stockfish.postMessage(`position fen ${fen}`);
            this.stockfish.postMessage(`setoption name Skill Level value ${skillValue}`);
            this.stockfish.postMessage(`setoption name MultiPv value 1`);
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

    

    findBestMoves(fen: string, depth: number, skillValue: number, multiPv: number, useCoeff: boolean): Promise<EvalResultSimplified[]> {
        console.log('Find Best Moves');
        let coeff = fen.includes(' w ') ? 1 : -1;
        if(!useCoeff) coeff = 1;

        return new Promise((resolve, reject) => {
            let bestMoves: EvalResultSimplified[] = [];
            this.stockfish.postMessage(`position fen ${fen}`);
            this.stockfish.postMessage(`setoption name Skill Level value ${skillValue}`);
            this.stockfish.postMessage(`setoption name MultiPv value ${multiPv}`);
            this.stockfish.postMessage(`go depth ${depth}`);

            this.stockfish.onmessage = function(event: any) {
                if(event.data.includes(`info depth ${depth} seldepth`)){
                    //console.log(event.data);
                    let evaluationStr: string | null = getEvalFromData(event.data, coeff);
                    let bestMove: string | null = getBestMoveFromData(event.data);
                    //console.log(bestMove + ': ' + evaluationStr);

                    if(!evaluationStr || !bestMove || !event.data.match(firstEvalMoveRegex)){
                        //console.log(event.data);
                        reject("Erreur lors de l'évaluation");
                        return;
                    }

                    if(!bestMoves.some((move) => move.bestMove === bestMove)){
                        //console.log(bestMove + ': ' + evaluationStr);
                        bestMoves.push({
                            eval: evaluationStr,
                            bestMove: bestMove
                        });
                    }
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
    evalPositionFromFen(fen: string, depth: number): Promise<EvalResultSimplified> {
        let coeff = fen.includes(' w ') ? 1 : -1;

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
                        bestMove: bestMove
                    });
                }
            }
        })
    }

    //TODO: Faire en sorte de calculer le coeff de manière interne
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
                    console.log(`#${-coeff}`);
                    resolve({
                        eval: `#${-coeff}`,
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
    // TODO: Erreur sur l'évaluation du dernier coup lors de l'analyse pour ce pgn : #-1 au lieu de #1
    // 1.e4 e5 2.Nf3 Bc5 3.d4 exd4 4.Nxd4 Qf6 5.Be3 Nc6 6.c3 Bxd4 7.cxd4 Qh4 8.Nc3 Nf6 9.e5 Ne4 10.g3 Nxc3 11.bxc3 Qd8 12.Qd2 d5 13.Bg2 Rb8 14.O-O b6 15.Rfe1 Be6 16.Rad1 Bg4 17.Rc1 Bf5 18.c4 Ne7 19.cxd5 O-O 20.d6 Rc8 21.dxe7 Qxe7 22.d5 Rfd8 23.Bf4 Be6 24.d6 cxd6 25.exd6 Qf8 26.Rxc8 Re8 27.Rxe8 Qxe8 28.Rd1 h6 29.d7 Qxd7 30.Qxd7 a6 31.Qd8+ Kh7 32.Be4+ f5 33.Bc2 g6 34.Qe7+ Bf7 35.Qxf7+ Kh8 36.Be5#
    async launchGameAnalysis(movesListUci: Array<string>, depth: number, callback: (progress: number) => void) {
        console.log('Start Game Anaysis');
        let results = [];
        //let i = 0; // for(let [movesSet, i] of movesSetArray){...} ne semble pas marcher 
        console.log(movesListUci);
        let movesSetArray = movesListUci.map((move, i) => {
            return movesListUci.slice(0, i+1).join(' ');
        });
        movesSetArray.unshift('');
        console.log(movesSetArray);
        //Il a fallu ajouter "downlevelIteration": true dans le tsconfig.json pour que ça marche
        //TODO: corriger l'eval pour le dernier coup de la partie
        for(let [i, movesSet] of movesSetArray.entries()){
            const coeff = i%2 === 0 ? 1 : -1;
            const result: any = await this.evalPositionFromMovesList(movesSet, depth, coeff);
            if(i < movesListUci.length ){
                let finalResult: EvalResult = {
                    bestMove: result.pv,
                    movePlayed: movesListUci[i],
                    evalBefore: result.eval,
                    evalAfter: result.eval,
                    quality: "",
                }
                results.push(finalResult);
            }
            
            callback(i/movesListUci.length);
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