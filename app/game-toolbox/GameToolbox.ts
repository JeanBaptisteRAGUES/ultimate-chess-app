import { Chess, Color, DEFAULT_POSITION, Piece, Square } from "chess.js";

// TODO: Faire un type pour les coups de type san ou uci/lan
// TODO: Faire attention aux complications que celà peut amener (conversion, méthodes string inutilisables etc..)
// TODO: Regarder du côté des 'extensions' pour les types (ex: type Extension<T> = T & { someExtensionProperty: string } ou type TypeC = TypeA & TypeB;)
//export type San = keyof string;

//export type Lan = keyof string;

// TODO: Problème avec cette méthode -> dans la description, param est affiché comme de type 'string' et pas comme de type 'San2'
/* export type San2 = string;

function testF(param: San2) {
    if(param.includes('M')) console.log('This is mate');
} */

export type MateChar = '#' | 'M';

class GameToolBox {
    game: Chess;

    constructor() {
        this.game = new Chess();
    }

    /**
     * Prend un coup en entrée et renvoie la distance parcourue par la pièce
     * @param move Un coup au format Lan (ex: g1f3, e2e4 etc..)
     * @returns Retourne la distance parcourue par la pièce
     */
    getMoveDistance(move: string): number {
        if(!move.match(/[a-z]\d[a-z]\d/)){
            console.log('Erreur avec le format du coup');
            return 0;
        }
        const letterDiff = Math.abs(move[0].charCodeAt(0) - move[2].charCodeAt(0));
        const digitDiff = Math.abs(eval(move[1]) - eval(move[3]))
        return letterDiff + digitDiff;
    }

    /**
     * Prend un coup au format lan en entrée et retourne la case de départ de ce coup.
     * Ex: g1f3 -> g1
     * @param move Coup au format lan (ex: g1f3, e2e4 etc..)
     * @returns Retourne la case de départ (ex: g1, e2 etc..)
     */
    getMoveOrigin(move: string): Square | undefined {
        if(!move.match(/[a-z]\d[a-z]\d/)){
            console.log('Erreur avec le format du coup');
            return;
        }
        return (move[0] + move[1]) as Square;
    }

    /**
     * Prend un coup au format lan en entrée et retourne la case d'arrivée de ce coup.
     * Ex: g1f3 -> f3
     * @param move Coup au format lan (ex: g1f3, e2e4 etc..)
     * @returns Retourne la case de d'arrivée (ex: f3, e4 etc..)
     */
    getMoveDestination(move: string): Square | undefined {
        if(!move.match(/[a-z]\d[a-z]\d/)){
            console.log('Erreur avec le format du coup');
            return;
        }
        return (move[2] + move[3]) as Square;
    }

    /**
     * Retourne la valeur de l'échec et mat de l'évaluation passée en paramètre.
     * Ex: 'M5' -> 5
     * @param mateEval string -> ex: 'M5' / '-M5'
     * @param playerColor Color -> 'w' / 'b'
     * @returns Number -> 5 / -5
     */
    getMateValue(mateEval: string, playerColor: Color, mateChar: MateChar): number {
        const coeff = playerColor === 'w' ? 1 : -1;
        return eval(mateEval.replace(mateChar, ''))*coeff;
    }

    /**
     * Retourne la pièce et sa couleur en fonction du coup donné en entrée.
     * @param move Le coup en notation Lan (ex: 'g1f3')
     * @param fen La fen de la partie
     * @returns La pièce qui va jouer le coup (ex: {color: 'w', type: 'n'})
     */
    getMovePiece(move: string, fen: string): Piece {
        this.game.load(fen);
        return this.game.get(move.slice(0, 2) as any as Square);
    }

    // uci ~= lan (long algebric notation), 'f1c4' -> 'Bc4'
    /**
     * Lan (Long Algebric Notation) vers San (Short Algebric Notation)
     * depuis une position donnée avec la fen de la partie.
     * 'f1c4' -> 'Bc4'
     * @param fen string
     * @param lanNotation string -> 'f1c4'
     * @returns string -> 'Bc4'
     */
    convertMoveLanToSan(fen: string, lanNotation: string): string | undefined{
        this.game.load(fen);
        this.game.move(lanNotation);
        return this.game.history().pop();
    }

    // uci ~= lan (long algebric notation), 'f1c4' -> 'Bc4'
    /**
     * Lan (Long Algebric Notation) vers San (Short Algebric Notation)
     * depuis une position donnée avec la liste des coups de la partie.
     * 'f1c4' -> 'Bc4'
     * @param movesList string[] -> ['e2e4', 'e7e5'] / ['e4', 'e5']
     * @param lanNotation string -> 'f1c4'
     * @returns string -> 'Bc4'
     */
    convertMoveLanToSan2(movesList: string[], index: number, lanNotation: string): string | undefined {
        this.game.load(DEFAULT_POSITION);

        for(let i = 0; i < index; i++) {
            if(i < movesList.length) this.game.move(movesList[i]);
        }

        this.game.move(lanNotation);
        return this.game.history().pop();
    }

    /**
     * San (Short Algebric Notation) vers Lan (Long Algebric Notation)
     * depuis une position donnée avec la fen de la partie.
     * 'Bc4' -> 'f1c4'
     * @param fen string
     * @param sanNotation string -> 'Bc4'
     * @returns string -> 'f1c4'
     */
    convertMoveSanToLan(fen: string, sanNotation: string): string | undefined {
        this.game.load(fen);
        this.game.move(sanNotation);
        return this.game.history({verbose: true}).pop()?.lan;
    }

    /**
     * ['e2e4', 'e7e5', 'g1f3'] -> ['e4', 'e5', 'Nf3']
     *
     * @param   lanHistory  The history of the game in LAN format: ['e2e4', 'e7e5', 'g1f3']
     * @returns The history of the game in SAN format: ['e4', 'e5', 'Nf3']
     */
    convertHistoryLanToSan(lanHistory: Array<string>): string[]{
        this.game.load(DEFAULT_POSITION);

        for(let lanMove of lanHistory){
            this.game.move(lanMove);
        }

        return this.game.history();
    }

    /**
     * ['e4', 'e5', 'Nf3'] -> ['e2e4', 'e7e5', 'g1f3']
     *
     * @param   sanHistory  The history of the game in SAN format: ['e4', 'e5', 'Nf3']
     * @returns The history of the game in LAN format: ['e2e4', 'e7e5', 'g1f3']
     */
    convertHistorySanToLan(sanHistory: string[]): string[]{
        let lanHistory = [];
        this.game.load(DEFAULT_POSITION);

        for(let sanMove of sanHistory){
            this.game.move(sanMove);
        }

        for(let moveData of this.game.history({verbose: true})){
            lanHistory.push(moveData.lan);
        }

        return lanHistory;
    }

    /**
     * ['e4', 'e5', 'Nf3'] -> '1.e4 e5 2.Nf3'
     * ['e2e4', 'e7e5', 'g1f3'] -> '1.e4 e5 2.Nf3'
     *
     * @param   history  The history of the game in SAN or LAN format: ['e4', 'e5', 'Nf3'] / ['e2e4', 'e7e5', 'g1f3']
     * @returns The pgn of the game: '1.e4 e5 2.Nf3'
     */
    convertHistoryToPGN(history: string[]): string{
        this.game.load(DEFAULT_POSITION);

        for(let sanMove of history){
            this.game.move(sanMove);
        }

        return this.game.pgn();
    }

    // '1.e4 e5 2.Nf3' -> ['e4', 'e5', 'Nf3']
    /**
     * '1.e4 e5 2.Nf3' -> ['e4', 'e5', 'Nf3']
     * @param pgn string -> '1.e4 e5 2.Nf3'
     * @returns string[] -> ['e4', 'e5', 'Nf3']
     */
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
        console.log('Test convertMoveLanToSan(): ');
        console.log("Input: 'e2e4', Expected output: 'e4'");
        console.log(this.convertMoveLanToSan(DEFAULT_POSITION, 'e2e4'));
        console.log('-----------------------------');

        console.log('Test convertMoveSanToLan(): ');
        console.log("Input: 'e4', Expected output: 'e2e4'");
        console.log(this.convertMoveSanToLan(DEFAULT_POSITION, 'e4'));
        console.log('-----------------------------');

        console.log('Test convertHistoryLanToSan(): ');
        console.log("Input: ['e2e4', 'e7e5', 'g1f3'], Expected output: ['e4', 'e5', 'Nf3']");
        console.log(this.convertHistoryLanToSan(['e2e4', 'e7e5', 'g1f3']));
        console.log('-----------------------------');

        console.log('Test convertHistorySanToLan(): ');
        console.log("Input: ['e4', 'e5', 'Nf3'], Expected output: ['e2e4', 'e7e5', 'g1f3']");
        console.log(this.convertHistorySanToLan(['e4', 'e5', 'Nf3']));
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