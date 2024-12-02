//import { Chess, Color, DEFAULT_POSITION, Piece, Square, validateFen } from "chess.js";
//const Chess = require('chess.js');

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

function testHeavyComputingFunction(fen) {
    //const game = new Chess();
    let move = {
        notation: 'a7a6',
        type: 4,
    };
    let z = 0;

    
    for(let i =0; i < 800000000; i++) {
        z += i;
    }

    console.log(`z = ${z}`);
    
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

function deepStringsToFunctions(obj, functionPaths) {
    for (let functionPath of functionPaths) {
        let finalKey = functionPath.pop();
        let value = obj;
        for (let key of functionPath) {
            value = value[key];
        }
        value[finalKey] = eval(value[finalKey]);
    }
}

function testChessClass(game) {
    let move = {
        notation: 'a7a6',
        type: 4,
    };

    console.log(game.fen());

    return move;
}

onmessage = function (event) {
    console.log((event.data));
    obj = event.data.obj;
    deepStringsToFunctions(obj, event.data.objFunctionPaths);
    console.log(obj);
    this.postMessage(testChessClass(obj));
}