import { Color, DEFAULT_POSITION } from "chess.js";
import { safeFetchTheory } from "../libs/fetchWikibooks";
import GameToolBox from "../game-toolbox/GameToolbox";

export const bestMoveRegex = /bestmove\s(\w*)/;
export const pvMoveRegex = /\spv\s\w*/;
export const pvLineRegex = /\spv(?<bestLine>[\s\w*]*)/;
export const evalRegex = /cp\s-?[0-9]*|mate\s-?[0-9]*/; 
export const cpRegex = /cp\s-?[0-9]*/;
export const mateRegex = /mate\s-?[0-9]*/; 
export const firstEvalMoveRegex = /pv\s[a-h][1-8]/;

export type EvalResult = {
    playerColor: Color,
    bestMove: string,
    movePlayed: string,
    evalBefore: string,
    evalAfter: string,
    quality: string,
    bestLine?: string,
    accuracy?: number,
    isTheory?: boolean,
    wdl?: string[],
}

export type AnalysisResult = {
    results: EvalResult[],
    white: Map<string, number>,
    black: Map<string, number>,
}

export type EvalResultSimplified = {
    bestMove: string,
    eval: string,
    bestLine?: string,
    wdl?: string[],
}

export type FenEval = {
    fen: string,
    eval: string,
    wdl?: string[],
    bestLines?: string[],
}

let stockfish: Worker;

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

function getBestLineFromData(data: string) {
    let bestLine = pvLineRegex.exec(data)?.groups?.bestLine || '';
    bestLine = bestLine.trim();
    if(bestLine.length < 4) return '';

    
    return bestLine;
}

function findBestMove_v2(fen: string, depth: number, skillValue: number): Promise<string> {
    console.log('%c Engine_fbm_v2_start', 'color:blue; font-size: 14px;');
    return new Promise((resolve, reject) => {
        stockfish.postMessage(`position fen ${fen}`);
        stockfish.postMessage(`setoption name Skill Level value ${skillValue}`);
        stockfish.postMessage(`setoption name MultiPv value 1`);
        stockfish.postMessage(`go depth ${depth}`);

        stockfish.onmessage = function(event: any) {
            //console.log(event.data);
            if((event.data.match(bestMoveRegex)) !== null){
                const newBestMove = event.data.match(bestMoveRegex)[1];
                if(newBestMove !== null){
                    console.log('%c Engine_fbm_v2_ok', 'color:green; font-size: 14px;');
                    resolve(newBestMove);
                } else{
                    console.log('%c Engine_fbm_v2_error', 'color:red; font-size: 14px;');
                    reject(null);
                }
            }
        }

        stockfish.onerror = function(event: ErrorEvent) {
            //this = new Worker('stockfish.js#stockfish.wasm');
            event.stopPropagation();
            event.stopImmediatePropagation();
            console.log('%c Crash de Stockfish 16 (findBestMove_v2): réinitialisation..', "color:red; font-size:16px;");
            stockfish.terminate()
            stockfish = new Worker('stockfish.js#stockfish.wasm');
            
            findBestMove_v2(fen, depth, skillValue);
            
        }
        
    })
}


class Engine {
    stockfishAnalysis: Worker;
    toolbox: GameToolBox;

    constructor() {
        stockfish = new Worker('stockfish.js#stockfish.wasm');
        this.stockfishAnalysis = new Worker('stockfish.js#stockfish.wasm');
        this.toolbox = new GameToolBox();
    }

    init() {
        return new Promise((resolve, reject) => {    
            //console.log('Stockfish init');
            stockfish.postMessage('uci');
            stockfish.onmessage = function(event: any) {
                //console.log(event.data);
                if(event.data === 'uciok'){
                    //console.log('event.data === uciok');
                    stockfish.postMessage('setoption name Hash value 100');
                    resolve('uciok');
                }
            }
        })
    }

    initAnalysis() {
        return new Promise((resolve, reject) => {    
            console.log('Stockfish init');
            this.stockfishAnalysis.postMessage('uci');
            this.stockfishAnalysis.onmessage = function(event: any) {
                //console.log(event.data);
                if(event.data === 'uciok'){
                    console.log('Analysis: event.data === uciok');
                    resolve('uciok');
                }
            }
        })
    }

    /**
     * Détermine la force à laquelle va jouer Stockfish (1320 - 3190)
     * @param strength 
     */
    setStrength(strength: number) {
        stockfish.postMessage('setoption name UCI_LimitStrength value true');
        stockfish.postMessage(`setoption name UCI_Elo value ${strength}`);
    }

    newGame() {
        return new Promise((resolve, reject) => {    
            stockfish.postMessage('ucinewgame');
            stockfish.postMessage('isready');
            stockfish.onmessage = function(event: any) {
                if(event.data === 'readyok'){
                    //console.log('uciok');
                    resolve('readyok');
                }
            }
        })
    }

    stop() {
        stockfish.postMessage('stop');
    }

    quit() {
        console.log('Quit Stockfish 16');
        stockfish.postMessage('quit');
    }

    showWinDrawLose() {
        stockfish.postMessage('setoption name UCI_ShowWDL value true');
    }

    /**
     * Ne demande pas une valeur pour le skill car le bot doit déjà avoir été programmé avec UCI_Elos
     * @param fen 
     * @param depth 
     * @returns 
     */
    findLimitedStrengthMove(fen: string, depth: number): Promise<string> {
        return new Promise((resolve, reject) => {
            try {
                stockfish.postMessage(`position fen ${fen}`);
                stockfish.postMessage(`go depth ${depth}`);

                stockfish.onmessage = function(event: any) {
                    //console.log(event.data);
                    if((event.data.match(bestMoveRegex)) !== null){
                        const newBestMove = event.data.match(bestMoveRegex)[1];
                        if(newBestMove !== null){
                            resolve(newBestMove);
                        } else{
                            reject(null);
                        }
                    }
                }
            } catch (error) {
                console.log('findBestMove error: ' + error);
                resolve('????');
            }
            
        })
    }

    
    findBestMove(fen: string, depth: number, skillValue: number): Promise<string> {
        console.log('%c Engine_fbm_start', 'color:blue; font-size:14px;');
        return new Promise((resolve, reject) => {
            stockfish.postMessage(`position fen ${fen}`);
            stockfish.postMessage(`setoption name Skill Level value ${skillValue}`);
            stockfish.postMessage(`setoption name MultiPv value 1`);
            stockfish.postMessage(`go depth ${depth}`);

            stockfish.onmessage = function(event: any) {
                //console.log(event.data);
                if((event.data.match(bestMoveRegex)) !== null){
                    const newBestMove = event.data.match(bestMoveRegex)[1];
                    if(newBestMove !== null){
                        console.log('%c Engine_fbm_ok', 'color:green; font-size:14px;');
                        resolve(newBestMove);
                    } else{
                        reject(null);
                    }
                }
            }

            stockfish.onerror = function(event: ErrorEvent) {
                //this = new Worker('stockfish.js#stockfish.wasm');
                event.stopPropagation();
                event.stopImmediatePropagation();
                console.log('%c Crash de Stockfish 16 (findBestMove): réinitialisation..', "color:red; font-size:16px;");
                stockfish = new Worker('stockfish.js#stockfish.wasm');

                stockfish.postMessage(`position fen ${fen}`);
                stockfish.postMessage(`setoption name Skill Level value ${skillValue}`);
                stockfish.postMessage(`setoption name MultiPv value 1`);
                stockfish.postMessage(`go depth ${depth}`);

                stockfish.onmessage = function(event: any) {
                    //console.log(event.data);
                    if((event.data.match(bestMoveRegex)) !== null){
                        const newBestMove = event.data.match(bestMoveRegex)[1];
                        if(newBestMove !== null){
                            resolve(newBestMove);
                        } else{
                            reject(null);
                        }
                    }
                }
            }
            
        })
    }

    findBestMove_v3(fen: string, depth: number, skillValue: number): Promise<string> {
        return findBestMove_v2(fen, depth, skillValue);
    }

    findBestMoves(fen: string, depth: number, skillValue: number, multiPv: number, useCoeff: boolean): Promise<EvalResultSimplified[]> {
        //console.log('Find Best Moves: ' + fen);
        let coeff = fen.includes(' w ') ? 1 : -1;
        if(!useCoeff) coeff = 1;
        let bestMoves: EvalResultSimplified[] = [];

        return new Promise((resolve, reject) => {
            try {
                stockfish.postMessage('stop');
                stockfish.postMessage(`position fen ${fen}`);
                stockfish.postMessage(`setoption name Skill Level value ${skillValue}`);
                stockfish.postMessage(`setoption name MultiPv value ${multiPv}`);
                stockfish.postMessage(`go depth ${depth}`);

                stockfish.onmessage = function(event: any) {
                    //console.log(event.data);
                    if(event.data.includes(`info depth ${depth} seldepth`)){
                        let evaluationStr: string | null = getEvalFromData(event.data, coeff);
                        let bestMove: string | null = getBestMoveFromData(event.data);
                        //console.log(bestMove + ': ' + evaluationStr);

                        if(!evaluationStr || !bestMove || !event.data.match(firstEvalMoveRegex)){
                            //console.log(event.data);
                            reject("Erreur lors de l'évaluation");
                            return;
                        }

                        //console.log(bestMoves);
                        //console.log(bestMoves.some((move) => move.bestMove === bestMove));
                        if(!bestMoves.some((move) => move.bestMove === bestMove)){
                            //console.log(bestMove + ' (2): ' + evaluationStr);
                            bestMoves.push({
                                eval: evaluationStr,
                                bestMove: bestMove
                            });
                        }
                    }
                    //TODO: Corriger erreur
                    if((event.data.match(bestMoveRegex)) !== null){
                        if(event.data.match(bestMoveRegex)[1]){
                            if(bestMoves.length > 0){
                                resolve(bestMoves);
                            }else{
                                //reject('Erreur: aucun coup trouvé');
                                console.log('Erreur (findBestMoves): aucun coup trouvé');
                            }
                        } 
                    }
                }

                stockfish.onerror = function(event: ErrorEvent) {
                    //this = new Worker('stockfish.js#stockfish.wasm');
                    event.stopPropagation();
                    event.stopImmediatePropagation();
                    console.log('%c Crash de Stockfish 16 (findBestMoves): réinitialisation..', "color:red; font-size:16px;");
                    stockfish = new Worker('stockfish.js#stockfish.wasm');
    
                    stockfish.postMessage(`position fen ${fen}`);
                    stockfish.postMessage(`setoption name Skill Level value ${skillValue}`);
                    stockfish.postMessage(`setoption name MultiPv value ${multiPv}`);
                    stockfish.postMessage(`go depth ${depth}`);
    
                    stockfish.onmessage = function(event: any) {
                        //console.log(event.data);
                        if(event.data.includes(`info depth ${depth} seldepth`)){
                            let evaluationStr: string | null = getEvalFromData(event.data, coeff);
                            let bestMove: string | null = getBestMoveFromData(event.data);
                            //console.log(bestMove + ': ' + evaluationStr);
    
                            if(!evaluationStr || !bestMove || !event.data.match(firstEvalMoveRegex)){
                                //console.log(event.data);
                                reject("Erreur lors de l'évaluation");
                                return;
                            }
    
                            //console.log(bestMoves);
                            //console.log(bestMoves.some((move) => move.bestMove === bestMove));
                            if(!bestMoves.some((move) => move.bestMove === bestMove)){
                                //console.log(bestMove + ' (2): ' + evaluationStr);
                                bestMoves.push({
                                    eval: evaluationStr,
                                    bestMove: bestMove
                                });
                            }
                        }
                        if((event.data.match(bestMoveRegex)) !== null){
                            if(event.data.match(bestMoveRegex)[1]){
                                if(bestMoves.length > 0){
                                    resolve(bestMoves);
                                }else{
                                    //reject('Erreur: aucun coup trouvé');
                                    console.log('Erreur (findBestMoves): aucun coup trouvé');
                                }
                            } 
                        }
                    }
                }
            } catch (error) {
                console.log('findBestMoves error: ' + error);
                reject(error);
            }
        })
    }

    //TODO: Afficher les lignes en entier, en plus du meilleur coup : (c7e5 g1f3 d7d6 d2d4 ...)
    //TODO: Prendre en compte quand l'utilisateur veut afficher plusieurs lignes de coups (MultiPv > 1)
    evalPositionFromFen(fen: string, depth: number): Promise<EvalResultSimplified> {
        let coeff = fen.includes(' w ') ? 1 : -1;

        return new Promise((resolve, reject) => {
            try {
                // On stope l'analyse au cas où la position aurait changé avant qu'une précédente analyse soit terminée
                this.stockfishAnalysis.postMessage('stop');
                this.stockfishAnalysis.postMessage(`position fen ${fen}`);
                this.stockfishAnalysis.postMessage('setoption name UCI_ShowWDL value true');
                this.stockfishAnalysis.postMessage(`go depth ${depth}`);

                this.stockfishAnalysis.onmessage = function(event: any) {
                    if(event.data.includes(`info depth ${depth} `) && (evalRegex.exec(event.data)) !== null){
                        //console.log(event.data);
                        const wdl = event.data.match(/wdl\s(?<wdl>\d*\s\d*\s\d*)\s/)?.groups.wdl.split(' ');
                        let evaluationStr: string | null = getEvalFromData(event.data, coeff);
                        let bestMove: string | null = getBestMoveFromData(event.data);
                        let bestLine: string | null = getBestLineFromData(event.data);
                        //console.log(wdl);

                        if(!evaluationStr || !bestMove || !event.data.match(firstEvalMoveRegex)){
                            reject("Erreur lors de l'évaluation");
                            return;
                        }

                        resolve({
                            eval: evaluationStr,
                            bestMove: bestMove,
                            bestLine: bestLine,
                            wdl: wdl,
                        });
                    }
                }
            } catch (error) {
                console.log('evalPositionFromFen error: ' + error);
                resolve({
                    eval: '???',
                    bestMove: '????',
                    bestLine: '????',
                    wdl: ['??', '??', '??'],
                });
            }
        })
    }

    //TODO: Faire en sorte de calculer le coeff de manière interne
    // movesList: e2e4 e7e5 g1f3 b8c6 f1b5 a7a6 ...
    evalPositionFromMovesList(movesListUci: string, depth: number, coeff: number, startingFen?: string): Promise<EvalResultSimplified> {
        //console.log("Starting fen: " + startingFen);
        //console.log("Moves List: " + movesListUci);
        return new Promise<EvalResultSimplified>((resolve, reject) => {
            try {
                // On stope l'analyse au cas où la position aurait changé avant qu'une précédente analyse soit terminée
                this.stockfishAnalysis.postMessage('stop');
                if(startingFen){
                    //console.log(`position fen ${startingFen} moves ${movesListUci}`);
                    this.stockfishAnalysis.postMessage(`position fen ${startingFen} moves ${movesListUci}`);
                }else{
                    //console.log(`position startpos moves ${movesListUci}`);
                    this.stockfishAnalysis.postMessage(`position startpos moves ${movesListUci}`);
                }
                this.stockfishAnalysis.postMessage('setoption name UCI_ShowWDL value true');
                this.stockfishAnalysis.postMessage(`go depth ${depth}`);

                this.stockfishAnalysis.onmessage = function(event: any) {
                    // Mate
                    //console.log(event.data);
                    if(event.data === "info depth 0 score mate 0"){
                        const wdl = event.data.match(/wdl\s(?<wdl>\d*\s\d*\s\d*)\s/)?.groups.wdl.split(' ');
                        resolve({
                            eval: `#${-coeff}`,
                            bestMove: '',
                            wdl: wdl
                        });
                    }

                    // Draw
                    if(event.data === "info depth 0 score cp 0"){
                        const wdl = event.data.match(/wdl\s(?<wdl>\d*\s\d*\s\d*)\s/)?.groups.wdl.split(' ');
                        resolve({
                            eval: '0',
                            bestMove: '',
                            wdl: wdl
                        });
                    }
                    if(event.data.includes(`info depth ${depth} `) && (evalRegex.exec(event.data)) !== null){
                        const wdl = event.data.match(/wdl\s(?<wdl>\d*\s\d*\s\d*)\s/)?.groups.wdl.split(' ');
                        let evaluationStr: string | null = getEvalFromData(event.data, coeff);
                        let bestMove: string | null = getBestMoveFromData(event.data);
                        let bestLine: string | null = getBestLineFromData(event.data);
                        console.log(event.data);

                        if(!evaluationStr || !bestMove || !event.data.match(firstEvalMoveRegex)){
                            reject("Erreur lors de l'évaluation");
                            return; // inutile ?
                        }

                        resolve({
                            eval: evaluationStr,
                            bestMove: bestMove,
                            bestLine: bestLine,
                            wdl: wdl
                        });
                    }
                }
            } catch (error) {
                console.log('evalPositionFromMovesList error: ' + error);
                resolve({
                    eval: '???',
                    bestMove: '????'
                });
            }
        })
    }

    mateToNumber(mateEval: string) {
        //return 20/eval(mateEval.split('#')[1]);
        return eval(mateEval.split('#')[1]) >= 0 ? 20 : -20;
    }

    //TODO: Régler erreur quand evalAfter >> evalBefore (ex: (4.55+3)/(-0.39+3))
    async evalMoveQuality(moveEval: EvalResult, movesSet: string[], checkTheory: boolean) {
        const isBookMove = checkTheory ? await safeFetchTheory(movesSet) : false;
        let evalBefore: number = moveEval.evalBefore.includes('#') ? this.mateToNumber(moveEval.evalBefore) : eval(moveEval.evalBefore);
        evalBefore = Math.min(20, Math.max(-20, evalBefore));
        let evalAfter: number = moveEval.evalAfter.includes('#') ? this.mateToNumber(moveEval.evalAfter) : eval(moveEval.evalAfter);
        evalAfter = Math.min(20, Math.max(-20, evalAfter));
        //let scoreAbsoluteDiff = Math.max(Math.abs(evalAfter - evalBefore) - 0.1, 0);
        //let scoreAbsoluteDiff = Math.max(Math.abs(evalAfter - evalBefore), 0);
        let scoreAbsoluteDiff = Math.max(Math.abs(evalAfter - evalBefore) - (0.05 + 0.02*Math.abs(evalBefore)), 0);
        let mult = 1;
        
        if(Math.sign(evalBefore) === Math.sign(evalAfter)){
            mult = 1 - Math.min(Math.abs(evalBefore), Math.abs(evalAfter))/Math.max(Math.abs(evalBefore), Math.abs(evalAfter));
        }

        //TODO: Tester différentes valeurs
        // Utilisé pour le score de précision
        //let scoreAccuracy = Math.max(1 - scoreAbsoluteDiff/3, 0);
        let scoreAccuracy = Math.max(1 - scoreAbsoluteDiff/1.5, -0.5);
        
        // Utilisé pour évaluer les erreurs
        //let blunderAccuracy = 1 - mult*scoreAbsoluteDiff/1.5;
        let blunderAccuracy = 1 - (0.5 + mult/2)*scoreAbsoluteDiff/1.5;

        // Empêche d'afficher des coups comme étant des erreurs graves si le score reste totalement gagnant
        if(Math.sign(evalBefore) === 1 && moveEval.playerColor === 'w' && evalAfter > 5) blunderAccuracy = Math.max(0.65, blunderAccuracy);
        if(Math.sign(evalBefore) === -1 && moveEval.playerColor === 'b' && evalAfter < -5) blunderAccuracy = Math.max(0.65, blunderAccuracy);

        if(Math.sign(evalBefore) === 1 && moveEval.playerColor === 'w' && evalAfter > 10) blunderAccuracy = Math.max(0.85, blunderAccuracy);
        if(Math.sign(evalBefore) === -1 && moveEval.playerColor === 'b' && evalAfter < -10) blunderAccuracy = Math.max(0.85, blunderAccuracy);

        if(moveEval.movePlayed === moveEval.bestMove) moveEval.quality = '*';

        // Empêche d'afficher des coups comme étant des erreurs si stockfish avait sous-estimé l'avantage de la position
        if(moveEval.playerColor === 'w' && evalAfter >= evalBefore) {
            scoreAccuracy = 1;
            scoreAbsoluteDiff = 0;
            moveEval.accuracy = 1;
            blunderAccuracy = 1;
            moveEval.quality = '*';
        }
        if(moveEval.playerColor === 'b' && evalAfter <= evalBefore) {
            scoreAccuracy = 1;
            scoreAbsoluteDiff = 0;
            moveEval.accuracy = 1;
            blunderAccuracy = 1;
            moveEval.quality = '*';
        }

        if(isBookMove && scoreAbsoluteDiff < 1) {
            moveEval.accuracy = 1;
            moveEval.isTheory = true;
            moveEval.quality = 'T';
            return moveEval;
        }
        moveEval.isTheory = false;

        /* console.log(`\x1B[34m${moveEval.movePlayed}`);
        console.log('Player Color: ' + moveEval.playerColor);
        console.log('Eval before: ' + evalBefore);
        console.log('Eval before sign: ' + Math.sign(evalBefore));
        console.log('Eval after: ' + evalAfter);
        console.log('Score diff abs: ' + scoreAbsoluteDiff);
        console.log('Accuracy: ' + scoreAccuracy);
        console.log('Best Move: ' + moveEval.bestMove);
        console.log('Mult: ' + mult);
        console.log('Blunder Accuracy: ' + blunderAccuracy);
        console.log('Marked as book move: ' + isBookMove); */

        const isBrillant = (scoreAbsoluteDiff: number, moveEval: EvalResult, movesSet: string[]) => {
            const fen = this.toolbox.convertHistoryToFen(movesSet.slice(0, -1));
            console.log(`Test si ${moveEval.movePlayed} est un coup brillant:`)
            console.log(`scoreAbsoluteDiff: ${scoreAbsoluteDiff}`);
            console.log(`moveEval.bestMove: ${moveEval.bestMove}`);
            console.log(`moveEval.movePlayed: ${moveEval.movePlayed}`);
            console.log(movesSet.slice(0, -1));
            console.log(`fen: ${fen}`);
            console.log(this.toolbox.getPositionMoves(fen));
            console.log(`Exchange Value: ${this.toolbox.getExchangeValue(this.toolbox.convertHistoryToFen(movesSet.slice(0, -1)), moveEval.movePlayed)}`);
            if(scoreAbsoluteDiff > 0.15 && moveEval.bestMove !== moveEval.movePlayed) return false;
            if(this.toolbox.getPositionMoves(fen).length < 2) return false; // Si seul coup possible, ce n'est pas un coup brillant
            //if(this.toolbox.getExchangeValue(this.toolbox.convertHistoryToFen(movesSet.slice(0, -1)), moveEval.movePlayed) > -2) return false;
            const capturesChainValue = this.toolbox.getCapturesChainValue(fen, moveEval.movePlayed);
            console.log(`${moveEval.movePlayed} est peut être un coup brillant ? (${capturesChainValue} <= -2) ?`);
            if(capturesChainValue > -2) return false;
            console.log(`%c ${moveEval.movePlayed} est un coup brillant !`, 'color:cyan; font-size:12px;');
            return true;
        }

        if(moveEval.bestMove === moveEval.movePlayed || scoreAccuracy >= 1) {
            if(isBrillant(scoreAbsoluteDiff, moveEval, movesSet)) moveEval.quality = "!!";
            moveEval.accuracy = 1;
            return moveEval;
        }


        //TODO: Prendre une marge d'erreur de 0.1 et faire en sorte que evalBefore = 0.12 et evalAfter = 0.01 ne donne pas une % de merde
        if(scoreAbsoluteDiff > 0.4 && blunderAccuracy < 0.9 && moveEval.bestMove !== moveEval.movePlayed) moveEval.quality = "?!";
        if(scoreAbsoluteDiff > 0.8 && blunderAccuracy < 0.7 && moveEval.bestMove !== moveEval.movePlayed) moveEval.quality = "?";
        if(scoreAbsoluteDiff > 2 && blunderAccuracy < 0.5 && moveEval.bestMove !== moveEval.movePlayed) moveEval.quality = "??";
        moveEval.accuracy = scoreAccuracy;

        //console.log('Quality: ' + moveEval.quality);

        return moveEval;
    }

    //Test avec : movesArray = ['e2e4', 'e7e5', 'g1f3', 'b8c6', 'f1b5'];
    // TODO: Erreur sur l'évaluation du dernier coup lors de l'analyse pour ce pgn : #-1 au lieu de #1
    // 1.e4 e5 2.Nf3 Bc5 3.d4 exd4 4.Nxd4 Qf6 5.Be3 Nc6 6.c3 Bxd4 7.cxd4 Qh4 8.Nc3 Nf6 9.e5 Ne4 10.g3 Nxc3 11.bxc3 Qd8 12.Qd2 d5 13.Bg2 Rb8 14.O-O b6 15.Rfe1 Be6 16.Rad1 Bg4 17.Rc1 Bf5 18.c4 Ne7 19.cxd5 O-O 20.d6 Rc8 21.dxe7 Qxe7 22.d5 Rfd8 23.Bf4 Be6 24.d6 cxd6 25.exd6 Qf8 26.Rxc8 Re8 27.Rxe8 Qxe8 28.Rd1 h6 29.d7 Qxd7 30.Qxd7 a6 31.Qd8+ Kh7 32.Be4+ f5 33.Bc2 g6 34.Qe7+ Bf7 35.Qxf7+ Kh8 36.Be5#
    async launchGameAnalysis(movesList_lan: string[], depth: number, callback: (progress: number) => void, startingFen?: string): Promise<AnalysisResult> {
        console.log('Start Game Anaysis');
        let results = [];
        let whiteMovesQuality = new Map([
            ['', 0], // Correct move
            ['T', 0], // Theory move
            ['*', 0], // Best move
            ['!!', 0], // Brillant move
            ['?!', 0], // Inaccuracy
            ['?', 0], // Mistake
            ['??', 0], //Blunder
        ]);
        let blackMovesQuality = new Map([
            ['', 0], // Correct move
            ['T', 0], // Theory move
            ['*', 0], // Best move
            ['!!', 0], // Brillant move
            ['?!', 0], // Inaccuracy
            ['?', 0], // Mistake
            ['??', 0], //Blunder
        ]);
        let movesSetArray = movesList_lan.map((move, i) => {
            return movesList_lan.slice(0, i+1).join(' ');
        });
        movesSetArray.unshift('');
        let movesList_san = this.toolbox.convertHistoryLanToSan(movesList_lan, startingFen);
        let movesSetArray_san = movesList_san.map((move, i) => {
            return movesList_san.slice(0, i+1);
        });
        //movesSetArray_san.unshift(['']);
        const fen = startingFen ? startingFen : DEFAULT_POSITION;
        const coeffBase = fen.includes(' w ') ? 1 : -1;
        console.log('Starting fen: ' + fen);
        console.log(coeffBase > 0 ? 'Au tour des blancs de commencer à jouer (1)' : 'Au tour des noirs de commencer à jouer (-1)');
        //Il a fallu ajouter "downlevelIteration": true dans le tsconfig.json pour que ça marche
        for(let [i, movesSet] of movesSetArray.entries()){
            //const coeff = i%2 === 0 ? 1 : -1;
            const coeff = i%2 === 0 ? coeffBase : -coeffBase;
            const result: EvalResultSimplified = await this.evalPositionFromMovesList(movesSet, depth, coeff, fen); 
            //const result: any = await this.evalPositionFromMovesList('e2e4 f7f5', depth, coeff, fen);
            const playerColor = Math.sign(coeff) === 1 ? 'w' : 'b';
            if(i < movesList_lan.length ){
                let finalResult: EvalResult = {
                    playerColor: playerColor,
                    bestMove: result.bestMove,
                    bestLine: result.bestLine,
                    movePlayed: movesList_lan[i],
                    evalBefore: result.eval,
                    evalAfter: result.eval,
                    quality: "",
                    wdl: result.wdl,
                }
                results.push(finalResult);
            }
            
            callback(i/movesList_lan.length);
            if(i > 0) results[i-1].evalAfter = result.eval;
        }

        for(let [i, result] of results.entries()){
            result = await this.evalMoveQuality(result, movesSetArray_san[i], i < 15);
            if(result.playerColor === 'w' && whiteMovesQuality.has(result.quality)) {
                whiteMovesQuality.set(result.quality, (whiteMovesQuality.get(result.quality) || 0) + 1)
            }
            if(result.playerColor === 'b' && blackMovesQuality.has(result.quality)) {
                blackMovesQuality.set(result.quality, (blackMovesQuality.get(result.quality) || 0) + 1)
            }
        }

        /* results.forEach((result, i) => {
            result.movePlayed = movesList[i];
        }); */

        console.log(results);
        //return results;
        return {
            results: results,
            white: whiteMovesQuality,
            black: blackMovesQuality,
        }
    }
}

export default Engine;