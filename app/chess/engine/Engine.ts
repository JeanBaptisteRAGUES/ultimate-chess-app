const bestMoveRegex = /bestmove\s(\w*)/;
const evalRegex = /cp\s-?[0-9]*|mate\s-?[0-9]*/;
const firstEvalMoveRegex = /pv\s[a-h][1-8]/;

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

    
    //TODO: c'était pour tester, mais changer pour retourner une valeur numérique et créer findBestMove()
    findBestMove(fen: string, depth: number) {
        return new Promise((resolve, reject) => {
            this.stockfish.postMessage(`position fen ${fen}`)
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

    evalPosition(fen: string, depth: number, coeff: number) {
        return new Promise((resolve, reject) => {
            // On stope l'analyse au cas où la position aurait changé avant qu'une précédente analyse soit terminée
            this.stockfish.postMessage('stop');
            this.stockfish.postMessage(`position fen ${fen}`)
            this.stockfish.postMessage(`go depth ${depth}`);

            this.stockfish.onmessage = function(event: any) {
                if((evalRegex.exec(event.data)) !== null){
                    let evaluationStr: string | undefined = (evalRegex.exec(event.data))?.toString();

                    if(!evaluationStr || !event.data.match(firstEvalMoveRegex)){
                        resolve("Erreur lors de l'évaluation");
                        return;
                    }

                    const evaluationArr = evaluationStr.split(' ');
                    if(evaluationArr[0] === 'mate') evaluationStr = '#' + coeff*(eval(evaluationArr[1]));
                    if(evaluationArr[0] === 'cp') evaluationStr = (coeff*(eval(evaluationArr[1])/100)).toString();
                    resolve(evaluationStr);
                }
            }
        })
    }
}

export default Engine;