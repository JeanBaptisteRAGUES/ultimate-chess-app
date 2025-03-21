import { Chess, Color, DEFAULT_POSITION, Move, Piece, PieceSymbol, Square, validateFen } from "chess.js";

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
export type MaterialAdvantage = {
    pawn: number,
    knight: number,
    bishop: number,
    rook: number,
    queen: number,
    points: number,
  }

export type defendedCase = {
  white: boolean,
  black: boolean,
}

export const pieceValues = new Map([
    ['p', 1],
    ['n', 3],
    ['b', 3.25],
    ['r', 5],
    ['q', 9],
  ]);

/* function getCapturesChainValueRec(fen: string, move: string): number {
  const game = new Chess();
  game.load(fen);
  const attackingPieceSquare = this.getMoveOrigin(move);
  const attackedPieceSquare = this.getMoveDestination(move);
  //const attackingPieceValue = pieceValues.get(this.game.get(attackingPieceSquare)?.type) || 0;
  const attackedPieceValue = pieceValues.get(this.game.get(attackedPieceSquare)?.type) || 0;

  this.game.move(move);

  let moves = this.game.moves({verbose: true}).filter(gMove => gMove.captured !== undefined);
  moves.sort((gMove1, gMove2) => (pieceValues.get(gMove1.piece) || 0) - (pieceValues.get(gMove2.piece) || 0));
  if(moves.length <= 0) return attackedPieceValue;

  return attackedPieceValue - getCapturesChainValueRec(this.game.fen(), moves[0]);
} */

class GameToolBox {
    game: Chess;

    constructor() {
        this.game = new Chess();
    }

    countMaterial(
        board: ({square: Square; type: PieceSymbol; color: Color;} | null)[][], 
        setWhiteMaterialAdvantage: (advantage: MaterialAdvantage) => any,
        setBlackMaterialAdvantage: (advantage: MaterialAdvantage) => any,
    ) {
        let whitePawns = 0;
        let whiteKnights = 0;
        let whiteBishops = 0;
        let whiteRooks = 0;
        let whiteQueens = 0;
  
        let blackPawns = 0;
        let blackKnights = 0;
        let blackBishops = 0;
        let blackRooks = 0;
        let blackQueens = 0;
  
        board.forEach((rank) => {
          rank.forEach((boardCase) => {
            if(boardCase?.color === 'w') {
              switch (boardCase.type) {
                case 'p':
                  whitePawns++;
                  break;
                case 'n':
                  whiteKnights++;
                  break;
                case 'b':
                  whiteBishops++;
                  break;
                case 'r':
                  whiteRooks++;
                  break;
                case 'q':
                  whiteQueens++;
                  break;
              
                default:
                  break;
              }
            }
            if(boardCase?.color === 'b') {
              switch (boardCase.type) {
                case 'p':
                  blackPawns++;
                  break;
                case 'n':
                  blackKnights++;
                  break;
                case 'b':
                  blackBishops++;
                  break;
                case 'r':
                  blackRooks++;
                  break;
                case 'q':
                  blackQueens++;
                  break;
              
                default:
                  break;
              }
            }
          })
        });
  
        let whitePawnsAdvantage = whitePawns - blackPawns;
        let whiteKnightsAdvantage = whiteKnights - blackKnights;
        let whiteBishopsAdvantage = whiteBishops - blackBishops;
        let whiteRooksAdvantage = whiteRooks - blackRooks;
        let whiteQueensAdvantage = whiteQueens - blackQueens;
        let whitePoints = whitePawnsAdvantage +
          whiteKnightsAdvantage*3 +
          whiteBishopsAdvantage*3 +
          whiteRooksAdvantage*5 +
          whiteQueensAdvantage*9;
  
        let blackPawnsAdvantage = blackPawns - whitePawns;
        let blackKnightsAdvantage = blackKnights - whiteKnights;
        let blackBishopsAdvantage = blackBishops - whiteBishops;
        let blackRooksAdvantage = blackRooks - whiteRooks;
        let blackQueensAdvantage = blackQueens - whiteQueens;
        let blackPoints = blackPawnsAdvantage +
          blackKnightsAdvantage*3 +
          blackBishopsAdvantage*3 +
          blackRooksAdvantage*5 +
          blackQueensAdvantage*9;
  
        setWhiteMaterialAdvantage({
          pawn: whitePawnsAdvantage,
          knight: whiteKnightsAdvantage,
          bishop: whiteBishopsAdvantage,
          rook: whiteRooksAdvantage,
          queen: whiteQueensAdvantage,
          points: whitePoints,
        });
  
        setBlackMaterialAdvantage({
          pawn: blackPawnsAdvantage,
          knight: blackKnightsAdvantage,
          bishop: blackBishopsAdvantage,
          rook: blackRooksAdvantage,
          queen: blackQueensAdvantage,
          points: blackPoints,
        });
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
        const digitDiff = Math.abs(eval(move[1]) - eval(move[3]));
        return letterDiff + digitDiff;
    }

    /**
     * Prends deux cases en entrée et retourne la distance entre elles (un mouvement de 1 en diagonal donne une distance de 2)
     * @param square1 
     * @param square2 
     * @returns 
     */
    getDistanceBetweenSquares(square1: Square, square2: Square): number {
      const letterDiff = Math.abs(square1.charCodeAt(0) - square2.charCodeAt(0));
      const digitDiff = Math.abs(square1.charCodeAt(1) - square2.charCodeAt(1));
      //console.log(`Distance entre ${square1} et ${square2}: ${letterDiff} + ${digitDiff} = ${letterDiff + digitDiff}`);
      return letterDiff + digitDiff;
    }

    /**
     * Prend un coup au format lan en entrée et retourne la case de départ de ce coup.
     * Ex: g1f3 -> g1
     * @param move Coup au format lan (ex: g1f3, e2e4 etc..)
     * @returns Retourne la case de départ (ex: g1, e2 etc..)
     */
    getMoveOrigin(move: string): Square {
        if(!move.match(/[a-z]\d[a-z]\d/)){
            throw new Error('Erreur avec le format du coup: ' + move);
        }
        return (move[0] + move[1]) as Square;
    }

    /**
     * Prend un coup au format lan en entrée et retourne la case d'arrivée de ce coup.
     * Ex: g1f3 -> f3
     * @param move Coup au format lan (ex: g1f3, e2e4 etc..)
     * @returns Retourne la case de d'arrivée (ex: f3, e4 etc..)
     */
    getMoveDestination(move: string): Square {
        if(!move.match(/[a-z]\d[a-z]\d/)){
            throw new Error('Erreur avec le format du coup: ' + move);
        }
        return (move[2] + move[3]) as Square;
    }

    /**
     * Retourne tous les coups possibles dans la position donnnée.
     * @param fen (string)
     * @returns moves (String[]) 
     */
    getPositionMoves(fen: string): String[] {
        this.game.load(fen);

        return this.game.moves();
    }

    /**
     * Indique si une case est défendue par un pion ou une autre pièce
     * @param fen 
     * @param pieceCase 
     * @returns Retourne un booléen pour savoir si la pièce est défendue ou non
     */
    isDefended(fen: string, pieceSquare: Square): defendedCase {
        this.game.load(fen);

        return {
          white: this.game.isAttacked(pieceSquare, 'w'),
          black: this.game.isAttacked(pieceSquare, 'b'),
        }
    }

    /**
     * Renvoie vrai si le coup en paramètre est une capture, faux sinon.
     * @param fen string
     * @param move string
     */
    isCapture(fen: string, move: string): boolean {
        this.game.load(fen);
        this.game.move(move);

        return this.game.history().pop()?.includes('x') || false;
    }

    changeFenPlayer(fen: string): string {
      return fen.includes(' w ') ? fen.replace(' w ', ' b ') : fen.replace(' b ', ' w ');
    }

    getMoveActivity(move: string): number {
      const letters = new Map([
        ['a', 0.001],
        ['b', 0.002],
        ['c', 0.003],
        ['d', 0.005],
        ['e', 0.005],
        ['f', 0.003],
        ['g', 0.002],
        ['h', 0.001],
      ]);

      const digits = new Map([
        ['1', 0.001],
        ['2', 0.002],
        ['3', 0.003],
        ['4', 0.005],
        ['5', 0.005],
        ['6', 0.003],
        ['7', 0.002],
        ['8', 0.001],
      ]);

      return 100*(letters.get(move[2]) || 0) + 100*(digits.get(move[3]) || 0);
    }

    getPositionActivity(fen: string): number {
      const letters = new Map([
        ['a', 0.001],
        ['b', 0.002],
        ['c', 0.003],
        ['d', 0.005],
        ['e', 0.005],
        ['f', 0.003],
        ['g', 0.002],
        ['h', 0.001],
      ]);

      const digits = new Map([
        ['1', 0.001],
        ['2', 0.002],
        ['3', 0.003],
        ['4', 0.005],
        ['5', 0.005],
        ['6', 0.003],
        ['7', 0.002],
        ['8', 0.001],
      ]);

      this.game.load(fen);

      let moves = this.game.moves();
      moves = moves.map(move => this.convertMoveSanToLan(fen, move));

      return moves.reduce((acc, curr) => acc + (letters.get(curr[2]) || 0) + (digits.get(curr[3]) || 0), 0);
    }

    getSquareValue(fen: string, square: string): number {
      this.game.load(fen);

      return pieceValues.get(this.game.get(square as any as Square)?.type) || 0;
    }

    /**
     * Renvoie la valeur de l'échange entre deux pièces en supposant que la pièce qui capture va être re-mangée après
     * @param fen string
     * @param move string au format lan/uci 'e2e4' 'g1f3' etc..
     */
    getExchangeValue(fen: string, move: string): number {
      this.game.load(fen);
      const attackingPieceSquare = this.getMoveOrigin(move);
      const attackedPieceSquare = this.getMoveDestination(move);
      const attackingPieceValue = pieceValues.get(this.game.get(attackingPieceSquare)?.type) || 0;
      const attackedPieceValue = pieceValues.get(this.game.get(attackedPieceSquare)?.type) || 0;
      const attackingPieceColor = this.game.get(attackingPieceSquare).color;
      const destinationIsDefended = attackingPieceColor === 'w' ? this.isDefended(fen, attackedPieceSquare).black : this.isDefended(fen, attackedPieceSquare).white;

      //TODO: Attention, consière une case safe si elle est actuellement bloquée par la pièce qui va se déplacer alors que cette case
      //sera attaquée si la pièce bouge.
      // Voir si la pièce est défendue
      if(destinationIsDefended) {
        //console.log(`${attackedPieceSquare} est défendue: V(exchange) = ${attackedPieceValue} - ${attackingPieceValue}`);
        return attackedPieceValue - attackingPieceValue;
      } else {
        //console.log(`${attackedPieceSquare} n'est pas défendue: V(exchange) = ${attackedPieceValue}`);
        return attackedPieceValue;
      }
    }

    getCapturesChainValue(fen: string, move: string): number {
      this.game.load(fen);
      const attackedPieceSquare = this.getMoveDestination(move);
      const attackedPieceValue = pieceValues.get(this.game.get(attackedPieceSquare)?.type) || 0;
    
      this.game.move(move);

      if(this.game.isCheckmate()) return 1000;
    
      let moves = this.game.moves({verbose: true}).filter(gMove => gMove.captured !== undefined && gMove.to === attackedPieceSquare && this.getExchangeValue(this.game.fen(), gMove.lan) >= 0);
      moves.sort((gMove1, gMove2) => (pieceValues.get(gMove1.piece) || 0) - (pieceValues.get(gMove2.piece) || 0));

      if(moves.length <= 0) return attackedPieceValue;
    
      return attackedPieceValue - this.getCapturesChainValue(this.game.fen(), moves[0].lan);
    }

    //TODO: Régler le problème de surévaluer un coup car va prendre en compte le cas où la dame va prendre le pion protégé en h5
    //lors de la poussée h7 -> h5 sans se demander si c'est vraiment rentable pour l'adversaire de capturer
    getCapturesChainValue2(fen: string, move: string): number {
      this.game.load(fen);
      let attackedPieceSquare = this.getMoveDestination(move);
      let attackedPieceValue = pieceValues.get(this.game.get(attackedPieceSquare)?.type) || 0;
      let scoreCurrent = attackedPieceValue;
      let scoreBest = -999;
      let i = 1;
    
      //console.log(move);
      //console.log(`${move} -> ${attackedPieceValue} en ${attackedPieceSquare}`);
      this.game.move(move);

      if(this.game.isCheckmate()) return 1000;
    
      let moves = this.game.moves({verbose: true}).filter(gMove => gMove.captured !== undefined && gMove.to === attackedPieceSquare);
      moves.sort((gMove1, gMove2) => (pieceValues.get(gMove1.piece) || 0) - (pieceValues.get(gMove2.piece) || 0));

      //console.log(moves);

      while(moves.length > 0) {
        attackedPieceSquare = this.getMoveDestination(moves[0].lan);
        attackedPieceValue = pieceValues.get(this.game.get(attackedPieceSquare)?.type) || 0;

        if(i%2 === 0) {
          scoreCurrent += attackedPieceValue;
          //if(this.game.isCheckmate()) scoreCurrent += 1000;
        }else{
          scoreCurrent -= attackedPieceValue;
          //if(this.game.isCheckmate()) scoreCurrent -= 1000;
          
          if(scoreCurrent > scoreBest) scoreBest = scoreCurrent;
        }
        console.log(`${move} (${i}) -> score: ${scoreCurrent}, best: ${scoreBest}`);
        this.game.move(moves[0]);
        moves = this.game.moves({verbose: true}).filter(gMove => gMove.captured !== undefined && gMove.to === attackedPieceSquare);
        moves.sort((gMove1, gMove2) => (pieceValues.get(gMove1.piece) || 0) - (pieceValues.get(gMove2.piece) || 0));
        i++;
      }

      if(i%2 !== 0 && scoreCurrent > scoreBest) scoreBest = scoreCurrent;
      console.log(`${move} (${i}) -> score: ${scoreCurrent}, best: ${scoreBest}`);
  
      return scoreBest;
    }

    filterMoves(movesList: string[], filterLevel: number) {
        // Minimise le risque que l'IA joue un coup aléatoire trop catastrophique en l'empechant de jouer certaines pièces
        const filter = [
            /noFilter/gm, // Beginner - Ban List [rien]
            /[Q][a-z]*[1-9]/gm, // Casual - Ban List [Queen]
            /[QK][a-z]*[1-9]/gm, // Intermediate - Ban List [Queen, King]
            /[QKR][a-z]*[1-9]/gm, // Advanced - Ban List [Queen, King, Rook]
            /[QKRNB][a-z]*[1-9]/gm, // Master - Ban List [Queen, King, Rook, Knight, Bishop]
        ];
    
        let possiblesMovesFiltered = movesList.filter(move => !move.match(filter[filterLevel]));
    
        if(possiblesMovesFiltered.length < 1) possiblesMovesFiltered = movesList;
    
        return possiblesMovesFiltered;
    }

    getCaseSafetyLevel(fen: string, move: string, botColor: Color) {
        const newGame = new Chess();
        let safetyLevel = 0; // On ne sait pas si la case est défendue
        const opponentColor = botColor === 'w' ? 'b' : 'w';
        //console.log('getCaseSafetyLevel: ' + move);
    
        newGame.load(fen);
    
        newGame.board().forEach(row => {
            row.forEach(boardCase => {
                if(boardCase && boardCase.type !== 'p') {
                    newGame.remove(boardCase.square);
                }
            })
        });
    
        if(!newGame.isAttacked(this.getMoveDestination(move), opponentColor)) {
            safetyLevel = 1;
            //console.log(`La case ${this.getMoveDestination(move)} n'est pas défendue par des pions adverses`);
        } 

        if(safetyLevel >= 1) {
            //const newFen = fen.replace(` ${botColor} `, ` ${opponentColor} `);
            newGame.load(fen);
            newGame.remove(this.getMoveOrigin(move));
    
            if(newGame.isAttacked(this.getMoveDestination(move), botColor)) {
                safetyLevel = 2;
                //console.log(`La case ${this.getMoveDestination(move)} est défendue par des pions/pièces alliées`);
            }
        }
    
        if(safetyLevel >= 2) {
            newGame.load(fen);
    
            if(!newGame.isAttacked(this.getMoveDestination(move), opponentColor)) {
                safetyLevel = 3;
                //console.log(`La case ${this.getMoveDestination(move)} n'est pas défendue par des pions/pièces adverses`);
            }
        }
    
        //console.log(`La case ${this.getMoveDestination(move)} a une sécurité de niveau: ${safetyLevel}`);
    
        return safetyLevel;
    }

    getSafeMovesOnly(movesList: string[], fen: string, securityLvl: number, botColor: Color) {
        let safePossibleMoves: string[] = [];
        //const opponentColor = game.turn() === 'w' ? 'b' : 'w';
        /* let newGame = new Chess();

        newGame.load(fen);

        newGame.moves({verbose: true}).forEach(ngMove => {
          this.getCaseSafetyLevel(fen, ngMove.lan, botColor);
        }) */
    
        const isPawn = (move: string) => !move.match(/[QKRNB][a-z]*[1-9]/gm);
        const isDestinationSafe = (move: string) => {
            return this.getCaseSafetyLevel(fen, move, botColor) >= securityLvl;
        }
        
        safePossibleMoves = movesList.filter(pMove => isPawn(pMove) || isDestinationSafe(this.convertMoveSanToLan(fen, pMove)));
        if(safePossibleMoves.length < 1) safePossibleMoves = movesList;
    
        //console.log(safePossibleMoves);
    
        return safePossibleMoves;
    }

    getCaseIndex(myCase: Square, boardOrientation: Color): number {
        const fileValue = myCase.charCodeAt(0) - 'a'.charCodeAt(0);
        const rankValue = eval(myCase.charAt(1))-1;
        if(boardOrientation === 'b') return rankValue*8 + (7-fileValue);
        return 64 - rankValue*8 - (8-fileValue);
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

    getKingSquare(fen: string, kingColor: Color): Square {
        this.game.load(fen);
        let kingSquare: Square = 'e1';

        this.game.board().forEach(rank => {
            rank.forEach(square => {
                if(square?.type === 'k' && square.color === kingColor) kingSquare = square.square;
            })
        });

        return kingSquare;
    }

    /**
     * Prend en entrée historique: game.history({verbose: true}) et la case de la pièce à examiner.
     * Renvoie le nombre de coups depuis lequel la pièce n'a pas été jouée.
     * @param history game.history({verbose: true}): Move[]
     * @param pieceSquare Square
     * @returns Nombre de coups d'inactivité: number
     */
    getPieceInactivity(history: Move[], pieceSquare: string): number {
        const lastMoveIndex = history.findLastIndex((move) => move.lan.includes(pieceSquare));
        if(lastMoveIndex >= 0) return Math.floor((history.length - (lastMoveIndex+1))/2);
        return Math.floor(history.length/2);
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
    convertMoveLanToSan(fen: string, lanNotation: string): string{
        this.game.load(fen);
        try {
            this.game.move(lanNotation);
            const lastMove = this.game.history().pop();
            if(lastMove === undefined) throw new Error(`Erreur lors de la conversion du coup ${lanNotation} vers sa notation SAN`);
            return lastMove;
        } catch (error) {
            console.log(`Erreur lors de la conversion du coup ${lanNotation} (${fen}) vers sa notation SAN: ${error}`);
            return lanNotation;
            //throw new Error(`Erreur lors de la conversion du coup ${lanNotation} vers sa notation SAN: ${error}`);
        }
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
    convertMoveLanToSan2(movesList: string[], index: number, lanNotation: string, startingFen?: string): string | undefined {
        this.game.load(DEFAULT_POSITION);
        if(startingFen) this.game.load(startingFen);

        try {
            for(let i = 0; i < index; i++) {
                if(i < movesList.length) this.game.move(movesList[i]);
            }
    
            this.game.move(lanNotation);
            return this.game.history().pop();
        } catch (error) {
            console.log(`Erreur lors de la conversion du coup ${lanNotation} vers sa notation SAN: ${error}`);
            return lanNotation;
        }
    }

    /**
     * San (Short Algebric Notation) vers Lan (Long Algebric Notation)
     * depuis une position donnée avec la fen de la partie.
     * 'Bc4' -> 'f1c4'
     * @param fen string
     * @param sanNotation string -> 'Bc4'
     * @returns string -> 'f1c4'
     */
    convertMoveSanToLan(fen: string, sanNotation: string): string {
        //console.log(`Convert San to Lan: ${sanNotation} (${fen})`);
        this.game.load(fen);
        this.game.move(sanNotation);

        const lastMove = this.game.history({verbose: true}).pop()?.lan;
        if(lastMove === undefined) throw new Error(`Erreur lors de la conversion du coup ${sanNotation} vers sa notation LAN`);
        return lastMove;
    }

    /**
     * ['e2e4', 'e7e5', 'g1f3'] -> ['e4', 'e5', 'Nf3']
     *
     * @param   lanHistory  The history of the game in LAN format: ['e2e4', 'e7e5', 'g1f3']
     * @returns The history of the game in SAN format: ['e4', 'e5', 'Nf3']
     */
    convertHistoryLanToSan(lanHistory: Array<string>, startingFen?: string): string[]{
        this.game.load(DEFAULT_POSITION);
        if(startingFen) this.game.load(startingFen);

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
    convertHistorySanToLan(sanHistory: string[], startingFen?: string): string[]{
        let lanHistory:string[] = [];
        this.game.load(DEFAULT_POSITION);
        if(startingFen) this.game.load(startingFen);
        for(let sanMove of sanHistory.filter((sanMove) => sanMove !== '')){
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
    convertHistoryToPGN(history: string[], startingFen?: string): string{
        this.game.load(DEFAULT_POSITION);
        if(startingFen) this.game.load(startingFen);

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
        //this.game.loadPgn(pgn);

        //return this.game.history();
        return pgn.replaceAll(/\d*\.{1,}/g, '').trim().replaceAll(/\s{2,}/g, ' ').split(' ');
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

    /**
     * '1. e4 e5 2. Nf3' -> 'rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2'
     * @param pgn 
     * @returns 
     */
    convertPgnToFen(pgn: string): string {
      this.game.loadPgn(pgn);
      return this.game.fen();
    }

    /**
     * ['e4', 'e5', 'Nf3'] -> 'rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2'
     * @param history 
     * @param startingFen 
     * @returns 
     */
    convertHistoryToFen(history: string[], startingFen?: string): string {
      this.game.load(DEFAULT_POSITION);
        if(startingFen) this.game.load(startingFen);

        for(let sanMove of history){
            this.game.move(sanMove);
        }

        return this.game.fen();
    }

    isMoveValid(fen: string, move: string): boolean {
        this.game.load(fen);
        return this.game.moves({verbose: true}).findIndex((legalMove) => legalMove.lan === move) >= 0;
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