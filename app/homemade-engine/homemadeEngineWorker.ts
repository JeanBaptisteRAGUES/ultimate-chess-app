import { Chess, Color, DEFAULT_POSITION, Piece, Square, validateFen } from "chess.js";
import { Move } from "../bots-ai/BotsAI";
import GameToolBox from "../game-toolbox/GameToolbox";
//const Chess = require('chess.js');
//import { Worker, isMainThread, parentPort, workerData } from 'worker_threads';

const toolbox = new GameToolBox();

function testHeavyComputingFunction(fen: string) {
    const game = new Chess();
    let move: Move = {
        notation: '',
        type: -1,
    };
    let z = 0;

    
    for(let i =0; i < 800000000; i++) {
        z += i;
    }

    console.log(`z = ${z}`);
    
    if(validateFen(fen).ok) {
        game.load(fen);
        move.notation = game.moves({verbose: true})[0].lan;
        move.type = 4;
        move.moveInfos = `Le bot a choisi le premier coup possible.\n\n`;
    }else{
        move.moveInfos = `Le bot n'a pas trouvé de coup.\n\n`;
    }
    

    return move;
}

function minMax(fen: string, iRec: number, recMax: number, prevMoveDest: string, prevMoveValue: number): {bestMove: string, bestScore: number} {
    const newGame = new Chess();
    newGame.load(fen);
    let bestScore = -9999;
    let bestMove = '';
    let score = -10000;

    if(iRec >= recMax) return {bestMove: '', bestScore: 0};

    let moves = newGame.moves({verbose: true});
    //moves = moves.map(move => this.#toolbox.convertMoveSanToLan(newGame.fen(), move));

    //if(iRec === 0) console.log(moves);
    
    moves.forEach((gMove) => {
        newGame.load(fen);
        score = toolbox.getCapturesChainValue(newGame.fen(), gMove.lan);
        if(gMove.to === prevMoveDest) score -= prevMoveValue;
        newGame.move(gMove.lan);
        //console.log(`${gMove.san} flags: ${gMove.flags}`);
        //console.log(gMove.flags.match(/e|p|q|k/gm));

        //TODO: Décommenter
        if(iRec === 0) score += toolbox.getMoveActivity(gMove.lan);
        if(iRec === 0 && validateFen(toolbox.changeFenPlayer(newGame.fen())).ok) score += toolbox.getPositionActivity(toolbox.changeFenPlayer(newGame.fen()));
        if(gMove.flags.match(/q|k/gm)) score += 0.5;
        if((iRec === 0 && gMove.piece === 'n' && (gMove.from.match(/1|8/gm))) || (iRec === 0 && gMove.piece === 'b' && (gMove.from.match(/1|8/gm)))) score += 0.3;
        if(iRec === 0 && gMove.lan === 'h2h3' || gMove.lan === 'h7h6') score += 0.1;
        if(iRec === 0 && gMove.piece === 'q') {
            if(gMove.to.match(/d2|d7|e2|e7/gm)) {
                score += 0.2;
            }else {
                score -= 0.2;
            }
        }
        //if(iRec === 0) console.log(`${gMove.san} score de base: ${score}`);
        score -= minMax(newGame.fen(), iRec+1, recMax, gMove.to, toolbox.getSquareValue(fen, gMove.to)).bestScore;
        //if(iRec === 0) console.log(`${gMove.san} score après coup adversaire: ${score}`);
        if(score >= bestScore) {
            bestScore = score;
            bestMove = gMove.lan;
        }
    })

    //console.log(`Min Max: ${bestMove} est le meilleur coup avec un score de ${bestScore}`);

    return {bestMove: bestMove, bestScore: bestScore};
}

self.onmessage = function (event) {
    console.log(event.data);
    //self.postMessage(testHeavyComputingFunction(event.data));
    self.postMessage(minMax(event.data, 0, 2, '', 0));
}

export {};