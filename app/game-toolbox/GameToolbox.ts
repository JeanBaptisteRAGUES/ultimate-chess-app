import { Chess, Color, DEFAULT_POSITION } from "chess.js";
class GameToolBox {
    game: Chess;

    constructor() {
        this.game = new Chess();
    }

    getMateValue(mateEval: string, playerColor: Color) {
        const coeff = playerColor === 'w' ? 1 : -1;
        return eval(mateEval.replace('M', ''))*coeff;
    }

    // uci ~= lan (long algebric notation), 'f1c4' -> 'Bc4'
    convertMoveUciToSan(fen: string, uciNotation: string): string | undefined{
        this.game.load(fen);
        this.game.move(uciNotation);
        return this.game.history().pop();
    }

    // uci ~= lan (long algebric notation), 'f1c4' -> 'Bc4'
    convertMoveUciToSan2(movesList: string[], index: number, uciNotation: string): string | undefined {
        this.game.load(DEFAULT_POSITION);

        for(let i = 0; i < index; i++) {
            if(i < movesList.length) this.game.move(movesList[i]);
        }

        this.game.move(uciNotation);
        return this.game.history().pop();
    }

    // 'Bc4' -> 'f1c4'
    convertMoveSanToUci(fen: string, sanNotation: string): string | undefined {
        this.game.load(fen);
        this.game.move(sanNotation);
        return this.game.history({verbose: true}).pop()?.lan;
    }

    // ['e2e4', 'e7e5', 'g1f3'] -> ['e4', 'e5', 'Nf3']
    convertHistoryUciToSan(uciPGN: Array<string>): string[]{
        this.game.load(DEFAULT_POSITION);

        for(let uciMove of uciPGN){
            this.game.move(uciMove);
        }

        return this.game.history();
    }

    /**
     * ['e4', 'e5', 'Nf3'] -> ['e2e4', 'e7e5', 'g1f3']
     *
     * @param   sanPGN  The history of the game in SAN format: ['e4', 'e5', 'Nf3']
     * @returns The history of the game in UCI format: ['e2e4', 'e7e5', 'g1f3']
     */
    convertHistorySanToUci(sanPGN: Array<string>): string[]{
        let uciHistory = [];
        this.game.load(DEFAULT_POSITION);

        for(let sanMove of sanPGN){
            this.game.move(sanMove);
        }

        for(let moveData of this.game.history({verbose: true})){
            uciHistory.push(moveData.lan);
        }

        return uciHistory;
    }

    // ['e4', 'e5', 'Nf3'] -> '1.e4 e5 2.Nf3'
    convertHistoryToPGN(history: string[]): string{
        this.game.load(DEFAULT_POSITION);

        for(let sanMove of history){
            this.game.move(sanMove);
        }

        return this.game.pgn();
    }

    // '1.e4 e5 2.Nf3' -> ['e4', 'e5', 'Nf3']
    convertPgnToHistory(pgn: string): string[]{
        this.game.loadPgn(pgn);

        return this.game.history();
    }

    /**
     * '1. e4 e5 2. Nf3' -> ['1.e4', 'e5', '2.Nf3']
     *
     * @param   pgn  The pgn of the game in SAN format and one single string: '1. e4 e5 2. Nf3'
     * @returns An array of the game's moves and their indexes : ['1.e4', 'e5', '2.Nf3']
     */
    convertPgnToArray(pgn: string): string[] {
        return pgn.replaceAll('. ', '.').split(' ');
    }



    testAllMethods() {
        console.log('Test convertMoveUciToSan(): ');
        console.log("Input: 'e2e4', Expected output: 'e4'");
        console.log(this.convertMoveUciToSan(DEFAULT_POSITION, 'e2e4'));
        console.log('-----------------------------');

        console.log('Test convertMoveSanToUci(): ');
        console.log("Input: 'e4', Expected output: 'e2e4'");
        console.log(this.convertMoveSanToUci(DEFAULT_POSITION, 'e4'));
        console.log('-----------------------------');

        console.log('Test convertHistoryUciToSan(): ');
        console.log("Input: ['e2e4', 'e7e5', 'g1f3'], Expected output: ['e4', 'e5', 'Nf3']");
        console.log(this.convertHistoryUciToSan(['e2e4', 'e7e5', 'g1f3']));
        console.log('-----------------------------');

        console.log('Test convertHistorySanToUci(): ');
        console.log("Input: ['e4', 'e5', 'Nf3'], Expected output: ['e2e4', 'e7e5', 'g1f3']");
        console.log(this.convertHistorySanToUci(['e4', 'e5', 'Nf3']));
        console.log('-----------------------------');

        console.log('Test convertHistoryToPGN(): ');
        console.log("Input: ['e4', 'e5', 'Nf3'], Expected output: '1.e4 e5 2.Nf3'");
        console.log(this.convertHistoryToPGN(['e4', 'e5', 'Nf3']));
        console.log('-----------------------------');

        console.log('Test convertPgnToHistory(): ');
        console.log("Input: '1.e4 e5 2.Nf3', Expected output: ['e4', 'e5', 'Nf3']");
        console.log(this.convertPgnToHistory('1.e4 e5 2.Nf3'));
        console.log('-----------------------------');
    }

    //TODO: convertir notations type Nf3 en g1f3 et inversemment, formater les pgn, etc.. 
}

export default GameToolBox;