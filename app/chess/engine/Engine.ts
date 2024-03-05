const bestMoveRegex = /bestmove\s(\w*)/;
const pvMoveRegex = /\spv\s\w*/;

//TODO: Remplacer par un truc du genre info depth ${depth}
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

    
    //TODO: Définir un paramètre pour le skill lvl (par défaut au max: 20)
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

    evalPositionWithFen(fen: string, depth: number, coeff: number) {
        return new Promise((resolve, reject) => {
            // On stope l'analyse au cas où la position aurait changé avant qu'une précédente analyse soit terminée
            this.stockfish.postMessage('stop');
            this.stockfish.postMessage(`position fen ${fen}`)
            this.stockfish.postMessage(`go depth ${depth}`);

            this.stockfish.onmessage = function(event: any) {
                if(event.data.includes(`info depth ${depth} `) && (evalRegex.exec(event.data)) !== null){
                    let evaluationStr: string | undefined = (evalRegex.exec(event.data))?.toString();
                    let bestMove: string | undefined = (pvMoveRegex.exec(event.data))?.toString();

                    if(!evaluationStr || !bestMove || !event.data.match(firstEvalMoveRegex)){
                        resolve("Erreur lors de l'évaluation");
                        return;
                    }

                    const evaluationArr = evaluationStr.split(' ');
                    const bestMoveArr = bestMove.trim().split(' ');

                    bestMove = bestMoveArr[1];

                    if(evaluationArr[0] === 'mate'){
                        evaluationStr = '#' + coeff*(eval(evaluationArr[1]));
                    } 
                    if(evaluationArr[0] === 'cp') {
                        evaluationStr = (coeff*(eval(evaluationArr[1])/100)).toString();
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
    evalPositionWithMovesList(movesList: string, depth: number, coeff: number) {
        console.log(movesList);
        return new Promise((resolve, reject) => {
            // On stope l'analyse au cas où la position aurait changé avant qu'une précédente analyse soit terminée
            this.stockfish.postMessage('stop');
            this.stockfish.postMessage(`position startpos moves ${movesList}`)
            this.stockfish.postMessage(`go depth ${depth}`);

            this.stockfish.onmessage = function(event: any) {
                if(event.data.includes(`info depth ${depth} `) && (evalRegex.exec(event.data)) !== null){
                    let evaluationStr: string | undefined = (evalRegex.exec(event.data))?.toString();
                    let bestMove: string | undefined = (pvMoveRegex.exec(event.data))?.toString();

                    if(!evaluationStr || !bestMove || !event.data.match(firstEvalMoveRegex)){
                        resolve("Erreur lors de l'évaluation");
                        return;
                    }

                    const evaluationArr = evaluationStr.split(' ');
                    const bestMoveArr = bestMove.trim().split(' ');

                    bestMove = bestMoveArr[1];

                    if(evaluationArr[0] === 'mate'){
                        evaluationStr = '#' + coeff*(eval(evaluationArr[1]));
                    } 
                    if(evaluationArr[0] === 'cp') {
                        evaluationStr = (coeff*(eval(evaluationArr[1])/100)).toString();
                    }
                    console.log({
                        eval: evaluationStr,
                        pv: bestMove
                    });
                    resolve({
                        eval: evaluationStr,
                        pv: bestMove
                    });
                }
            }
        })
    }

    //Test avec : movesArray = ['e2e4', 'e7e5', 'g1f3', 'b8c6', 'f1b5'];
    //TODO: Vérifier pourquoi le score en début de position est négatif
    //TODO: Faire pour chaque coup le score avant et le score après
    async launchGameAnalysis(movesList: Array<string>, depth: number) {
        console.log('Start Game Anaysis');
        let results = [];

        let movesSetArray = movesList.map((move, i) => {
            return movesList.slice(0, i).join(' ');
        });

        for(let movesSet of movesSetArray){
            const coeff = movesSet.split(' ').length%2 === 0 ? 1 : -1;
            const result: any = await this.evalPositionWithMovesList(movesSet, depth, coeff);
            results.push(result);
        }

        results.forEach((result, i) => {
            result.movePlayed = movesList[i];
        });

        console.log(results);
        return results;
    }
}

export default Engine;