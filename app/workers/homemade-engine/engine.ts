import { Chess, Color, DEFAULT_POSITION, Piece, Square, validateFen } from "chess.js";
//const Chess = require('chess.js');
//import { Worker, isMainThread, parentPort, workerData } from 'worker_threads';

/* function testHeavyComputingFunction(fen) {
    const game = new Chess();
    let move = {
        notation: '',
        type: -1,
    };
    let z = 0;

    
    for(let i =0; i < 2000000000; i++) {
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
} */

function testHeavyComputingFunction(fen: string) {
    const game = new Chess();
    let move = {
        notation: 'a7a6',
        type: 4,
    };
    let z = 0;

    
    for(let i =0; i < 800000000; i++) {
        z += i;
    }

    console.log(`z = ${z}`);

    game.load(fen);

    console.log(game.fen());
    
    /* if(validateFen(fen).ok) {
        game.load(fen);
        move.notation = game.moves({verbose: true})[0].lan;
        move.type = 4;
        move.moveInfos = `Le bot a choisi le premier coup possible.\n\n`;
    }else{
        move.moveInfos = `Le bot n'a pas trouvé de coup.\n\n`;
    } */
    

    return move;
}

onmessage = function (event) {
    console.log(event.data);
    postMessage(testHeavyComputingFunction(event.data));
}