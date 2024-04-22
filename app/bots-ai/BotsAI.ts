// TODO: Niveaux de difficulté Beginner, Casual, Intermediate, Advanced, Master, Maximum

import { Chess, Color, DEFAULT_POSITION, Piece, Square } from "chess.js";
import { fetchLichessDatabase } from "../libs/fetchLichess";
import Engine, { EvalResultSimplified } from "../engine/Engine";
import GameToolBox from "../game-toolbox/GameToolbox";
import { useEffect, useRef } from "react";

// Bots "célébrités"
// TODO: Jouent les coups trouvés dans la BDD de chess.com pour des joueurs connus, puis stockfish

// Bots "miroirs"
// TODO: Jouent les coups trouvés dans la BDD de lichess ou chess.com de nos propres parties en utilisant le pseudo


export type Move = {
    notation: string,
    type: number
}

// TODO: 'strategy-stranger' | 'sacrifice-enjoyer' | 'min-max | 'botdanov' | 'sharp-player' | 'closed' | 'open' | 'hyper-aggressive'
export type Behaviour = 'default' | 'stockfish-random' | 'stockfish-only' | 'human' | 'pawn-pusher' | 'fianchetto-sniper' | 'shy' | 'blundering' | 'drawish' | 'exchanges-lover' | 'exchanges-hater' | 'queen-player' | 'botez-gambit' | 'castle-destroyer' | 'chessable-master' | 'auto-didacte' | 'random-player' | 'copycat' | 'bongcloud' | 'gambit-fanatic' | 'cow-lover' | 'indian-king' | 'stonewall' | 'dragon';

type DefaultBotParams = {
    randMoveChance: number, 
    randMoveInterval: number, 
    filterLevel: number,
    securityLvl: number,
    skillValue: number,
    depth: number,
    playForcedMate: number,
}


function getMoveDestination(move: string) {
    //Qd4 -> d4, Ngf3 -> f3, exd4 -> d4, Bb5+ -> b5, Re8# -> e8, e4 -> e4
    return move.match(/[a-h][1-8]/);
}

function filterMoves(movesList: string[], filterLevel: number) {
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

function getSafeMovesOnly(movesList: string[], game: Chess) {
    let safePossibleMoves: string[] = [];
    const playerColor = game.turn() === 'w' ? 'b' : 'w';

    const isPawn = (move: string) => !move.match(/[QKRNB][a-z]*[1-9]/gm);
    const isDestinationDefended = (move: string) => {
        // @ts-expect-error
        return game.isAttacked(getMoveDestination(move), playerColor);
    }
    
    safePossibleMoves = movesList.filter(pMove => isPawn(pMove) || !isDestinationDefended(pMove));
    if(safePossibleMoves.length < 1) safePossibleMoves = movesList;

    return safePossibleMoves;
}

function makeRandomMove(filterLevel: number, safeMoves: boolean, game: Chess): Move {
    //if(checkGameOver()) return;
    console.log('Make Random Move');
    
    const possibleMoves = game.moves();
    let possiblesMovesFiltered = filterMoves(possibleMoves, filterLevel);

    let finalMovesList: string[] = possiblesMovesFiltered;

    if(safeMoves) finalMovesList = getSafeMovesOnly(possiblesMovesFiltered, game);

    const randomIndex = Math.floor(Math.random() * finalMovesList.length);

    return {
        notation: finalMovesList[randomIndex],
        type: 4
    }
  }

function isLastMoveDangerous(game: Chess, playerColor: Color) {
    const history = JSON.parse(JSON.stringify(game.history({verbose: true})));
    const lastMove = history.pop();
    const gameTest = new Chess();

    if(lastMove === null || lastMove === undefined) return false;

    //console.log(lastMove);

    // Si le dernier coup est une capture, il faut obligatoirement réagir
    if(lastMove.san.match(/[x]/gm)) return true;

    const previousFen = lastMove.before;
    //const currentFen = lastMove.after;

    gameTest.load(previousFen);
    gameTest.remove(lastMove.from);
    gameTest.put({type: lastMove.piece, color: lastMove.color}, lastMove.to);
    const pieceMoves = gameTest.moves({square: lastMove.to});
    //gameTest.load(currentFen);

    let danger = false;

    pieceMoves.forEach(pieceMove => {
        const attackedCase = getMoveDestination(pieceMove);
        //console.log(attackedCase);
        // @ts-expect-error
        const squareInfos = game.get(attackedCase);
        //console.log(squareInfos);
        if(squareInfos && squareInfos?.type !== 'p' && squareInfos?.color !== playerColor) {
        danger = true;
        }
    });

    //console.log(`Is last move \x1B[34m(${lastMove.san})\x1B[0m dangerous: \x1B[31m` + danger);

    return danger;
}

async function isNearCheckmate(maxMateValue: number, botColor: Color, game: Chess, engine: Engine, toolbox: GameToolBox) {
    console.log('Test if Near Checkmate');
    const positionEval: EvalResultSimplified = await engine.evalPositionFromFen(game.fen(), 8);
    console.log(positionEval);
    if(!positionEval.eval.includes('#')) return false;

    const mateValue = toolbox.getMateValue(positionEval.eval, botColor, '#');
    console.log(botColor);
    console.log(mateValue);
    console.log(maxMateValue);
    return mateValue > 0 && mateValue <= maxMateValue;
}

function initDefaultBotParams(level: string): DefaultBotParams {
    let randMoveChance = 0;
    let skillValue = 0;
    let depth = 5;
    let filterLevel = 0; // Empèche de jouer certaines pièces lors d'un coup aléatoire
    let securityLvl = 0; // 0: Pas de sécurité, 1: Réagit dernier coup adversaire, 2: Coup aléatoire -> case non défendue

    // Empeche d'avoir un deuxième coup aléatoire avant le Xème coup
    let randMoveInterval = 5;

    //TODO: à implémenter
    let playForcedMate = 1; // Empèche de louper les mats en x quand x < ou = à playForcedMate

    //TODO: à implémenter quand le reste sera fait: plus il y a de pièces attaquées, plus la charge mentale augmente, plus 
    // les chances de commettre une erreur (randomMove) augmentent. Echanger des pièces réduit la charge mentale, maintenir
    // un clouage au contraire maintient cette charge mentale. Plus la partie avance, plus la charge mentale augmente (légèrement)
    let mentalChargeLimit = 100;

    switch (level) {
        case 'Beginner':
        // ~900 Elo (Bot chess.com)
        randMoveChance = 20; 
        randMoveInterval = 3; 
        filterLevel = 0;
        securityLvl = 0;
        skillValue = 0;
        depth = 10;
        playForcedMate = 0;
        break;
        case 'Casual':
        // ~1400 bot chess.com
        randMoveChance = 20;
        randMoveInterval = 5;
        filterLevel = 1;
        securityLvl = 2;
        skillValue = 2;
        depth = 10;
        playForcedMate = 1;
        break;
        case 'Intermediate':
        // 1700~1800 bot chess.comm
        randMoveChance = 10; 
        randMoveInterval = 10;
        filterLevel = 2;
        securityLvl = 2; 
        skillValue = 5; 
        depth = 12;
        playForcedMate = 2;
        break;
        case 'Advanced':
        // ~2000 bot chess.com
        randMoveChance = 3;
        randMoveInterval = 15;
        filterLevel = 3;
        securityLvl = 2;
        skillValue = 10;
        depth = 12;
        playForcedMate = 3;
        break;
        case 'Master':
        // ???
        randMoveChance = 1;
        randMoveInterval = 20;
        filterLevel = 4;
        securityLvl = 2;
        skillValue = 15;
        depth = 16;
        playForcedMate = 4;
        break;
        case 'Maximum':
        randMoveChance = 0;
        randMoveInterval = 0;
        filterLevel = 0;
        securityLvl = 0;
        skillValue = 20;
        depth = 20;
        break;
        default:
        randMoveChance = 10;
        skillValue = 10;
        depth = 10;
        break;
    }

    return {
        randMoveChance,
        randMoveInterval,
        filterLevel,
        securityLvl,
        skillValue,
        depth,
        playForcedMate,
    }
}

async function makeForcedStockfishMove(botParams: DefaultBotParams, botColor: Color, game: Chess, engine: Engine, toolbox: GameToolBox): Promise<Move> {
    //console.log('Search Forced Stockfish Move');
    const playerColor = game.turn() === 'w' ? 'b' : 'w';
    let stockfishMove: Move = {
        notation: '',
        type: -1
    }  

    const isNearCheckmateRes = await isNearCheckmate(botParams.playForcedMate, botColor, game, engine, toolbox) 
    if(isNearCheckmateRes){
        console.log(`${botColor} is forced to Checkmate`);
        const stockfishRes = await engine.findBestMove(game.fen(), 12, 20);
        stockfishMove.notation = stockfishRes;
        stockfishMove.type = 3;
        return stockfishMove;
    }
    
    if(botParams.securityLvl > 0 && isLastMoveDangerous(game, playerColor)){
        console.log(`${botColor} is forced to play a move from Stockfish`);
        const stockfishRes = await engine.findBestMove(game.fen(), botParams.skillValue, botParams.depth);
        stockfishMove.notation = stockfishRes;
        stockfishMove.type = 3;
        return stockfishMove;
    }

    console.log(`${botColor} is not forced to play a move from Stockfish`);

    return stockfishMove;
} 

function isRandomMovePlayable (botParams: DefaultBotParams, level: string, lastRandomMove: number): Boolean {
    let rand = Math.random()*100;
    const levelIsNotAtMax = level !== 'Maximum';
    const lastRandomMoveTooFar = lastRandomMove <= -botParams.randMoveInterval;
    const randomMoveChance = rand <= botParams.randMoveChance && lastRandomMove < 1;

    return levelIsNotAtMax && (lastRandomMoveTooFar || randomMoveChance);
}

async function makeStockfishMove(botParams: DefaultBotParams, game: Chess, engine: Engine): Promise<Move> {
    console.log('Make Stockfish Move');
    console.log(botParams);
    let stockfishMove: Move = {
        notation: '',
        type: -1
    }

    const stockfishRes = await engine.findBestMove(game.fen(), botParams.depth, botParams.skillValue);
    stockfishMove.notation = stockfishRes;
    stockfishMove.type = 2;

    return stockfishMove;
}

async function makeLichessMove(movesList: string[], databaseRating: string, fen: string): Promise<Move> {
    //console.log('Make Lichess Move');
    let lichessMove = {san: "", uci: "", winrate: {white: 33, draws: 33, black: 33}};

    lichessMove = await fetchLichessDatabase(movesList, databaseRating, fen);

    if(databaseRating !== 'Maximum' && lichessMove?.san !== "" && lichessMove?.san !== undefined){
        return {
            notation: lichessMove.san,
            type: 1
        }
    }

    //console.log("No more moves in the database !");
    return {
        notation: '',
        type: -1
    }
}

function compareEval(evalA: EvalResultSimplified, evalB: EvalResultSimplified) {
    return eval(evalB.eval) - eval(evalA.eval);
}

function evalMove(move: EvalResultSimplified, botColor: Color, toolbox: GameToolBox): number {
    const baseValue = botColor === 'w' ? 100 : -100;
    if(move.eval.includes('#')) return baseValue/toolbox.getMateValue(move.eval, botColor, '#');
    return eval(move.eval);
}

class BotsAI {
    #engine: Engine;
    #toolbox: GameToolBox;
    #defaultBotParams: DefaultBotParams;
    #behaviour: Behaviour; // default / pawn pusher / botez gambit etc.. TODO: Faire un type
    #botLevel: string;
    #lastRandomMove: number;
    #botColor: Color;

    constructor(behaviour: Behaviour, level: string, botColor: Color) {
        this.#engine = new Engine();
        this.#toolbox = new GameToolBox();
        this.#botLevel = level;
        this.#behaviour = behaviour;
        this.#lastRandomMove = 0;
        this.#botColor = botColor;
        this.#engine.init();
        this.#defaultBotParams = initDefaultBotParams(level);
    }

    async #defaultMoveLogic(game: Chess, useDatabase: Boolean, useRandom: Boolean): Promise<Move> {
        let move: Move = {
            notation: '',
            type: -1,
        };

        if(useDatabase) {
            //const movesList = this.#toolbox.convertHistorySanToLan(this.#toolbox.convertPgnToHistory(game.pgn()));
            const startingFen = game.history().length > 0 ? game.history({verbose: true})[0].before : DEFAULT_POSITION;
            const movesList = this.#toolbox.convertHistorySanToLan(game.history(), startingFen);

            const lichessMove = await makeLichessMove(movesList, this.#botLevel, startingFen);
            if(lichessMove.type >= 0){
                console.log(`${this.#botColor} make Lichess move`);
                this.#lastRandomMove = this.#lastRandomMove-1;
                return lichessMove;
            } 
            console.log('No more moves in the Lichess Database for ' + this.#botColor);
        }

        const forcedStockfishMove = await makeForcedStockfishMove(this.#defaultBotParams, this.#botColor, game, this.#engine, this.#toolbox);
        if(forcedStockfishMove.type >= 0) {
            this.#lastRandomMove = this.#lastRandomMove-1;
            return forcedStockfishMove;
        } 

        if(useRandom && isRandomMovePlayable(this.#defaultBotParams, this.#botLevel, this.#lastRandomMove)) {
            this.#lastRandomMove = this.#defaultBotParams.randMoveInterval;
            return makeRandomMove(this.#defaultBotParams.filterLevel, this.#defaultBotParams.securityLvl > 1, game);
        }

        const stockfishMove = await makeStockfishMove(this.#defaultBotParams, game, this.#engine);
        if(stockfishMove.type >= 0) {
            this.#lastRandomMove = this.#lastRandomMove-1;
            return stockfishMove;
        } 

        return move;
    }

    async #makeDefaultMove(game: Chess): Promise<Move> {
        //console.log('Bot AI: Default behaviour');
        let move: Move = {
            notation: '',
            type: -1,
        };

        const defaultMove = await this.#defaultMoveLogic(game, true, true);
        if(defaultMove.type >= 0) {
            this.#lastRandomMove = this.#lastRandomMove-1;
            return defaultMove;
        }

        return move;
    }

    async #makeStockfishRandomMove(game: Chess): Promise<Move> {
        //console.log('Bot AI: Stockfish Random behaviour');
        let move: Move = {
            notation: '',
            type: -1,
        };

        const defaultMove = await this.#defaultMoveLogic(game, false, true);
        if(defaultMove.type >= 0) {
            this.#lastRandomMove = this.#lastRandomMove-1;
            return defaultMove;
        }

        return move;
    }

    async #makeStockfishOnlyMove(game: Chess): Promise<Move> {
        //console.log('Bot AI: Stockfish Only behaviour');
        let move: Move = {
            notation: '',
            type: -1,
        };

        const defaultMove = await this.#defaultMoveLogic(game, false, false);
        if(defaultMove.type >= 0) {
            this.#lastRandomMove = this.#lastRandomMove-1;
            return defaultMove;
        }

        return move;
    }

    async #humanMoveLogic(game: Chess, useDatabase: Boolean, useRandom: Boolean): Promise<Move> {
        let move: Move = {
            notation: '',
            type: -1,
        };

        if(useDatabase) {
            //const movesList = this.#toolbox.convertHistorySanToLan(this.#toolbox.convertPgnToHistory(game.pgn()));
            const startingFen = game.history().length > 0 ? game.history({verbose: true})[0].before : DEFAULT_POSITION;
            const movesList = this.#toolbox.convertHistorySanToLan(game.history(), startingFen);

            const lichessMove = await makeLichessMove(movesList, this.#botLevel, startingFen);
            if(lichessMove.type >= 0){
                console.log(`${this.#botColor} make Lichess move`);
                this.#lastRandomMove = this.#lastRandomMove-1;
                return lichessMove;
            } 
            console.log('No more moves in the Lichess Database for ' + this.#botColor);
        }

        /* const forcedStockfishMove = await makeForcedStockfishMove(this.#defaultBotParams, this.#botColor, game, this.#engine, this.#toolbox);
        if(forcedStockfishMove.type >= 0) {
            this.#lastRandomMove = this.#lastRandomMove-1;
            return forcedStockfishMove;
        } 

        if(useRandom && isRandomMovePlayable(this.#defaultBotParams, this.#botLevel, this.#lastRandomMove)) {
            this.#lastRandomMove = this.#defaultBotParams.randMoveInterval;
            return makeRandomMove(this.#defaultBotParams.filterLevel, this.#defaultBotParams.securityLvl > 1, game);
        } */

        const newGame = new Chess(game.fen());
        const opponentColor = this.#botColor === 'b' ? 'w' : 'b';
        const forgotPieceChance = new Map([
            ['Beginner', 30],
            ['Casual', 20],
            ['Intermediate', 15],
            ['Advanced', 10],
            ['Master', 5],
            ['Maximum', 0]
          ]).get(this.#botLevel) || 10;
        let hasForgotten = false;

        //console.log(newGame.ascii());

        game.board().forEach((rank) => {
            rank.forEach((boardCase) => {
                if(boardCase?.color !== this.#botColor && (boardCase?.type === 'b' || boardCase?.type === 'q')){
                    const rand = Math.ceil(Math.random()*100);
                    console.log("Random move result: " + rand);
                    const pieceInactivity = this.#toolbox.getPieceInactivity(game.history({verbose: true}), boardCase.square);
                    const inactivityBonusMult = 0.1 + Math.min(0.2*pieceInactivity, 1.5);
                    const forgotPieceChanceFinal = Math.ceil(forgotPieceChance*inactivityBonusMult);
                    //console.log(`Inactivité de la pièce en ${boardCase.square}: ${pieceInactivity} (mult: ${inactivityBonusMult})`);

                    if(boardCase?.type === 'b' && rand <= forgotPieceChanceFinal) {
                        console.log('Oublie le fou en ' + boardCase.square);
                        hasForgotten = true;
                        newGame.put({ type: 'p', color: opponentColor }, boardCase.square)
                    }
                    
                    if(boardCase?.type === 'q' && rand <= forgotPieceChance) {
                        console.log('Oublie les déplacements en diagonale de la dame en ' + boardCase.square);
                        hasForgotten = true;
                        newGame.put({ type: 'r', color: opponentColor }, boardCase.square)
                    }

                    if(boardCase?.type === 'q' && rand <= forgotPieceChanceFinal) {
                        console.log('Oublie la dame en ' + boardCase.square);
                        hasForgotten = true;
                        newGame.put({ type: 'p', color: opponentColor }, boardCase.square)
                    }

                }
            })
        });

        //console.log(newGame.ascii());

        const stockfishMove = await makeStockfishMove(this.#defaultBotParams, newGame, this.#engine);
        
        if(hasForgotten) stockfishMove.type = 5;
        if(!this.#toolbox.isMoveValid(game.fen(), stockfishMove.notation)) stockfishMove.type = -1;

        if(stockfishMove.type >= 0) {
            if(stockfishMove.type === 5) console.log(`Human move (${stockfishMove.type}): ${this.#toolbox.convertMoveLanToSan(game.fen(), stockfishMove.notation)}`);
            this.#lastRandomMove = this.#lastRandomMove-1;
            return stockfishMove;
        } 

        return move;
    }

    // TODO: Vérifier si le coup humain est valide
    async #makeHumanMove(game: Chess): Promise<Move> {
        //console.log('Bot AI: Human behaviour');
        let move: Move = {
            notation: '',
            type: -1,
        };

        const humanMove = await this.#humanMoveLogic(game, true, false);
        if(humanMove.type >= 0) {
            this.#lastRandomMove = this.#lastRandomMove-1;
            return humanMove;
        }

        const defaultMove = await this.#defaultMoveLogic(game, false, false);
        if(defaultMove.type >= 0) {
            this.#lastRandomMove = this.#lastRandomMove-1;
            return defaultMove;
        }

        return move;
    }

    async #pawnPusherLogic(game: Chess): Promise<Move> {
        let move: Move = {
            notation: '',
            type: -1,
        };

        if(game.history().length > 20) {
            return move;
        }

        let stockfishMoves: EvalResultSimplified[] = await this.#engine.findBestMoves(game.fen(), 10, 20, 50, false);

        stockfishMoves = stockfishMoves.map((evalRes) => {
            let randBonus = Math.max(0.1, Math.random()/2);
            randBonus = randBonus*this.#toolbox.getMoveDistance(evalRes.bestMove);
            if(this.#toolbox.getMovePiece(evalRes.bestMove, game.fen()).type === 'p') {
                evalRes.eval = (evalMove(evalRes, this.#botColor, this.#toolbox) + randBonus).toString();
                return evalRes;
            }
            evalRes.eval = (evalMove(evalRes, this.#botColor, this.#toolbox)).toString();
            return evalRes;
        });

        stockfishMoves.sort(compareEval);

        move.notation = stockfishMoves[0].bestMove;
        move.type = 2;

        return move;
    }

    /**
     * Joue le plus possible des coups de pions, souvent au détriment du développement de ses pièces.
     */
    async #makePawnPusherMove(game: Chess): Promise<Move> {
        //console.log('Bot AI: Pawn Pusher');
        let move: Move = {
            notation: '',
            type: -1,
        };

        const gimmickMove = await this.#pawnPusherLogic(game);
        if(gimmickMove.type >= 0) {
            this.#lastRandomMove = this.#lastRandomMove-1;
            return gimmickMove;
        } 

        const defaultMove = await this.#defaultMoveLogic(game, false, true);
        if(defaultMove.type >= 0) {
            this.#lastRandomMove = this.#lastRandomMove-1;
            return defaultMove;
        }

        return move;
    }

    async #fianchettoEnjoyerLogic(game: Chess): Promise<Move> {
        let move: Move = {
            notation: '',
            type: -1,
        };

        if(game.history().length > 10) {
            return move;
        }

        const pawnsCases: Square[] = ['b3', 'b6', 'g3', 'g6'];
        const bishopCases: Square[] = ['b2', 'b7', 'g2', 'g7'];

        let stockfishMoves: EvalResultSimplified[] = await this.#engine.findBestMoves(game.fen(), 10, this.#defaultBotParams.skillValue, 50, false);

        stockfishMoves = stockfishMoves.map((evalRes) => {
            const moveDestination = this.#toolbox.getMoveDestination(evalRes.bestMove);
            if(!moveDestination){
                evalRes.eval = (evalMove(evalRes, this.#botColor, this.#toolbox)).toString();
                return evalRes;
            }
            let randBonus = Math.max(0.1, Math.random());

            // Si le coup est un coup de pion sur une case qui permet un fianchetto, on ajoute un bonus
            if(this.#toolbox.getMovePiece(evalRes.bestMove, game.fen()).type === 'p' && pawnsCases.includes(moveDestination)) {
                evalRes.eval = (evalMove(evalRes, this.#botColor, this.#toolbox) + randBonus).toString();
                return evalRes;
            }

            // Si le coup est le placement d'un fou en fianchetto, on ajoute un gros bonus
            if(this.#toolbox.getMovePiece(evalRes.bestMove, game.fen()).type === 'b' && bishopCases.includes(moveDestination)) {
                evalRes.eval = (evalMove(evalRes, this.#botColor, this.#toolbox) + 2*randBonus).toString();
                return evalRes;
            }
            evalRes.eval = (evalMove(evalRes, this.#botColor, this.#toolbox)).toString();
            return evalRes;
        });

        stockfishMoves.sort(compareEval);

        move.notation = stockfishMoves[0].bestMove;
        move.type = 2;

        return move;
    }

    /**
     * Joue le plus possible des fianchettos.
     */
    async #makeFianchettoEnjoyerMove(game: Chess): Promise<Move> {
        //console.log('Bot AI: Fianchetto Sniper');
        let move: Move = {
            notation: '',
            type: -1,
        };

        const gimmickMove = await this.#fianchettoEnjoyerLogic(game);
        if(gimmickMove.type >= 0) {
            this.#lastRandomMove = this.#lastRandomMove-1;
            return gimmickMove;
        }

        const defaultMove = await this.#defaultMoveLogic(game, true, true);
        if(defaultMove.type >= 0) {
            this.#lastRandomMove = this.#lastRandomMove-1;
            return defaultMove;
        }

        return move;
    }

    async #shyLogic(game: Chess): Promise<Move> {
        let move: Move = {
            notation: '',
            type: -1,
        };

        if(game.history().length > 20) {
            return move;
        }

        let stockfishMoves: EvalResultSimplified[] = await this.#engine.findBestMoves(game.fen(), 10, this.#defaultBotParams.skillValue, 50, false);

        stockfishMoves = stockfishMoves.map((evalRes) => {
            const moveDistance = this.#toolbox.getMoveDistance(evalRes.bestMove);
            let randBonus = Math.max(0.5, Math.random());
            randBonus = -randBonus*moveDistance;

            evalRes.eval = (evalMove(evalRes, this.#botColor, this.#toolbox) + randBonus).toString();
            return evalRes;
        });

        stockfishMoves.sort(compareEval);

        move.notation = stockfishMoves[0].bestMove;
        move.type = 2;

        return move;
    }

    /**
     * Joue des coups très près les uns des autres.
     */
    async #makeShyMove(game: Chess): Promise<Move> {
        //console.log('Bot AI: shy');
        let move: Move = {
            notation: '',
            type: -1,
        };

        const gimmickMove = await this.#shyLogic(game);
        if(gimmickMove.type >= 0) {
            this.#lastRandomMove = this.#lastRandomMove-1;
            return gimmickMove;
        }

        const defaultMove = await this.#defaultMoveLogic(game, true, true);
        if(defaultMove.type >= 0) {
            this.#lastRandomMove = this.#lastRandomMove-1;
            return defaultMove;
        }

        return move;
    }

    async #blunderLogic(game: Chess): Promise<Move> {
        let move: Move = {
            notation: '',
            type: -1,
        };

        let stockfishMoves: EvalResultSimplified[] = await this.#engine.findBestMoves(game.fen(), 10, 20, 50, false);

        stockfishMoves = stockfishMoves.map((evalRes) => {
            evalRes.eval = (-evalMove(evalRes, this.#botColor, this.#toolbox)).toString();
            return evalRes;
        });

        stockfishMoves.sort(compareEval);

        move.notation = stockfishMoves[0].bestMove;
        move.type = 2;

        return move;
    }

    /**
     * Joue les pires coups possibles.
     */
    async #makeBlunderMove(game: Chess): Promise<Move> {
        //console.log('Bot AI: Blundering');
        let move: Move = {
            notation: '',
            type: -1,
        };

        const gimmickMove = await this.#blunderLogic(game);
        if(gimmickMove.type >= 0) {
            this.#lastRandomMove = this.#lastRandomMove-1;
            return gimmickMove;
        }

        return move;
    }

    async #drawishLogic(game: Chess): Promise<Move> {
        let move: Move = {
            notation: '',
            type: -1,
        };

        let stockfishMoves: EvalResultSimplified[] = await this.#engine.findBestMoves(game.fen(), 10, 20, 50, false);

        stockfishMoves = stockfishMoves.map((evalRes) => {
            let moveEvalMalus = Math.abs(evalMove(evalRes, this.#botColor, this.#toolbox))*10;
            evalRes.eval = (evalMove(evalRes, this.#botColor, this.#toolbox) - moveEvalMalus).toString();
            return evalRes;
        });

        stockfishMoves.sort(compareEval);

        move.notation = stockfishMoves[0].bestMove;
        move.type = 2;

        return move;
    }

    /**
     * Joue les coups dont l'évaluation est la plus proche de 0.
     */
    async #makeDrawishMove(game: Chess): Promise<Move> {
        //console.log('Bot AI: Drawish');
        let move: Move = {
            notation: '',
            type: -1,
        };

        const gimmickMove = await this.#drawishLogic(game);
        if(gimmickMove.type >= 0) {
            this.#lastRandomMove = this.#lastRandomMove-1;
            return gimmickMove;
        }

        return move;
    }

    async #queenPlayerLogic(game: Chess): Promise<Move> {
        let move: Move = {
            notation: '',
            type: -1,
        };

        if(game.history().length > 20) {
            return move;
        }

        const pawnsCases: Square[] = ['c3', 'c4', 'c5', 'c6', 'e3', 'e4', 'e6', 'e5'];

        let stockfishMoves: EvalResultSimplified[] = await this.#engine.findBestMoves(game.fen(), 10, this.#defaultBotParams.skillValue, 50, false);

        stockfishMoves = stockfishMoves.map((evalRes) => {
            const moveDestination = this.#toolbox.getMoveDestination(evalRes.bestMove);
            let randBonus = Math.max(0.1, Math.random());
            if(!moveDestination){
                evalRes.eval = (evalMove(evalRes, this.#botColor, this.#toolbox)).toString();
                return evalRes;
            }
            
            if(this.#toolbox.getMovePiece(evalRes.bestMove, game.fen()).type === 'p' && pawnsCases.includes(moveDestination)) {
                evalRes.eval = (evalMove(evalRes, this.#botColor, this.#toolbox) + randBonus/2).toString();
                return evalRes;
            }

            if(this.#toolbox.getMovePiece(evalRes.bestMove, game.fen()).type === 'q') {
                evalRes.eval = (evalMove(evalRes, this.#botColor, this.#toolbox) + randBonus).toString();
                return evalRes;
            }

            evalRes.eval = (evalMove(evalRes, this.#botColor, this.#toolbox)).toString();
            return evalRes;
        });

        stockfishMoves.sort(compareEval);

        move.notation = stockfishMoves[0].bestMove;
        move.type = 2;

        return move;
    }

    /**
     * Joue le plus possible des coups de dame, souvent au détriment du développement de ses pièces.
     */
    async #makeQueenPlayerMove(game: Chess): Promise<Move> {
        //console.log('Bot AI: Queen Player');
        let move: Move = {
            notation: '',
            type: -1,
        };

        const gimmickMove = await this.#queenPlayerLogic(game);
        if(gimmickMove.type >= 0) {
            this.#lastRandomMove = this.#lastRandomMove-1;
            return gimmickMove;
        }

        const defaultMove = await this.#defaultMoveLogic(game, false, true);
        if(defaultMove.type >= 0) {
            this.#lastRandomMove = this.#lastRandomMove-1;
            return defaultMove;
        }

        return move;
    }

    #botezGambitOpenings(game: Chess): Move {
        let move: Move = {
            notation: '',
            type: -1,
        };

        const formatedPGN = game.pgn().replaceAll(/\.\s/g, '.');

        if(game.history().length === 0) {
            move.notation = 'e2e4';
            move.type = 2;
            return move;
        }

        if(game.history().length === 1) {
            if(formatedPGN === '1.e4') {
                move.notation = 'e7e5';
                move.type = 2;
                return move;
            }
            move.notation = 'e7e6';
            move.type = 2;
            return move;
        }

        if(game.history().length === 2) {
            move.notation = 'd1f3';
            move.type = 2;
            return move;
        }

        if(game.history().length === 3) {
            move.notation = 'd8f6';
            move.type = 2;
            return move;
        }

        return move;
    }

    async #botezGambitLogic(game: Chess): Promise<Move> {
        let move: Move = {
            notation: '',
            type: -1,
        };

        if(game.history().length > 40) {
            return move;
        }

        let openingMove = this.#botezGambitOpenings(game);
        if(openingMove.type >= 0) {
            return openingMove;
        }

        const pawnsCases: Square[] = ['c3', 'c4', 'c5', 'c6', 'e3', 'e4', 'e6', 'e5'];

        let stockfishMoves: EvalResultSimplified[] = await this.#engine.findBestMoves(game.fen(), 10, 20, 50, false);

        stockfishMoves = stockfishMoves.map((evalRes) => {
            const moveDestination = this.#toolbox.getMoveDestination(evalRes.bestMove);
            let randBonus = Math.max(0.1, Math.random());
            if(!moveDestination){
                evalRes.eval = (evalMove(evalRes, this.#botColor, this.#toolbox)).toString();
                return evalRes;
            }
            
            if(this.#toolbox.getMovePiece(evalRes.bestMove, game.fen()).type === 'p' && pawnsCases.includes(moveDestination)) {
                evalRes.eval = (evalMove(evalRes, this.#botColor, this.#toolbox) + randBonus/2).toString();
                return evalRes;
            }

            if(this.#toolbox.getMovePiece(evalRes.bestMove, game.fen()).type === 'q') {
                // Si game.get() ne renvoie pas null, alors la dame va sur une case occupée, c'est donc une capture
                if(game.get(moveDestination)) randBonus = 20;
                evalRes.eval = (evalMove(evalRes, this.#botColor, this.#toolbox) + 2*randBonus).toString();
                return evalRes;
            }

            evalRes.eval = (evalMove(evalRes, this.#botColor, this.#toolbox)).toString();
            return evalRes;
        });

        stockfishMoves.sort(compareEval);

        move.notation = stockfishMoves[0].bestMove;
        move.type = 2;

        return move;
    }

    /**
     * Aime sacrifier sa dame le plus rapidement possible.
     */
    async #makeBotezGambitMove(game: Chess): Promise<Move> {
        //console.log('Bot AI: Botez Gambit');
        let move: Move = {
            notation: '',
            type: -1,
        };

        const gimmickMove = await this.#botezGambitLogic(game);
        if(gimmickMove.type >= 0) {
            this.#lastRandomMove = this.#lastRandomMove-1;
            return gimmickMove;
        }

        const defaultMove = await this.#defaultMoveLogic(game, false, true);
        if(defaultMove.type >= 0) {
            this.#lastRandomMove = this.#lastRandomMove-1;
            return defaultMove;
        }

        return move;
    }

    #gambitFanaticOpenings(game: Chess): Move {
        let move: Move = {
            notation: '',
            type: -1,
        };
        let rand = Math.random()*100;

        switch (game.pgn().replaceAll(/\.\s/g, '.')) {
            // When Black
            // e4
            case '1.e4':
                move.notation = 'e7e5';
                move.type = 2;
                return move;

            // e4 e5 Nf3 (main line)
            case '1.e4 e5 2.Nf3':
                move.notation = 'b8c6';
                move.type = 2;
                return move;

            // Three Knights
            case '1.e4 e5 2.Nf3 Nc6 3.Nc3':
                move.notation = 'g8f6';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nc6 3.Nc3 Nf6 4.Bc4':
                move.notation = 'f6e4';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nc6 3.Nc3 Nf6 4.Bc4 Nxe4 5.Nxe4':
                move.notation = 'd7d5';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nc6 3.Nc3 Nf6 4.d4':
                move.notation = 'e5d4';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nc6 3.Nc3 Nf6 4.d4 exd4 5.Nxd4':
                move.notation = 'f6e4';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nc6 3.Nc3 Nf6 4.d4 exd4 5.Nxd4 Nxe4 6.Nxc6':
                move.notation = 'e4c3';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nc6 3.Nc3 Nf6 4.d4 exd4 5.Nxd4 Nxe4 6.Nxe4':
                move.notation = 'd8e7';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nc6 3.Nc3 Nf6 4.d4 exd4 5.Nxd4 Nxe4 6.Nxe4 Qe7 7.f3':
                move.notation = 'd7d5';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nc6 3.Nc3 Nf6 4.d4 exd4 5.Nxd4 Nxe4 6.Nxe4 Qe7 7.Nxc6':
                move.notation = 'e5d4';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nc6 3.Nc3 Nf6 4.d4 exd4 5.Nxd4 Nxe4 6.Nxe4 Qe7 7.Qd3':
                move.notation = 'd7d5';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nc6 3.Nc3 Nf6 4.d4 exd4 5.Nxd4 Nxe4 6.Nxe4 Qe7 7.Bd3':
                move.notation = 'c6d4';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nc6 3.Nc3 Nf6 4.d4 exd4 5.Nxd4 Nxe4 6.Nxe4 Qe7 7.Bd3 Nxd4 8.O-O':
                move.notation = 'd7d5';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nc6 3.Nc3 Nf6 4.d4 exd4 5.Nxd4 Nxe4 6.Nxe4 Qe7 7.Qe2':
                move.notation = 'c6d4';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nc6 3.Nc3 Nf6 4.d3':
                move.notation = 'd7d5';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nc6 3.Nc3 Nf6 4.a3':
                move.notation = 'd7d5';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nc6 3.Nc3 Nf6 4.Bb5':
                move.notation = 'c6d4';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nc6 3.Nc3 Nf6 4.Bb5 Nd4 5.Nxd4':
                move.notation = 'e5d4';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nc6 3.Nc3 Nf6 4.Bb5 Nd4 5.Nxd4 exd4 6.Ne2':
                move.notation = 'c7c6';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nc6 3.Nc3 Nf6 4.Bb5 Nd4 5.Nxd4 exd4 6.Ne2 c6 7.Bd3':
                move.notation = 'd7d5';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nc6 3.Nc3 Nf6 4.Bb5 Nd4 5.Nxe5':
                move.notation = 'd8e7';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nc6 3.Nc3 Nf6 4.Bb5 Nd4 5.Nxe5 Qe7 6.Nf3':
                move.notation = 'd4b5';
                move.type = 2;
                return move;

            // Italian
            case '1.e4 e5 2.Nf3 Nc6 3.Bc4':
                if(rand <= 40){
                    move.notation = 'f7f5';
                    move.type = 2;
                    return move;
                }
                move.notation = 'g8f6';
                move.type = 2;
                return move;
            
            case '1.e4 e5 2.Nf3 Nc6 3.Bc4 Nf6 4.Ng5':
                console.log(rand);
                if(rand <= 70){
                    move.notation = 'f8c5';
                    move.type = 2;
                    return move;
                }
                move.notation = 'f6e4';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nc6 3.Bc4 Nf6 4.Nc3':
                move.notation = 'f6e4';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nc6 3.Bc4 Nf6 4.O-O':
                move.notation = 'f6e4';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nc6 3.Bc4 Nf6 4.O-O Nxe4 5.Re1':
                move.notation = 'd7d5';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nc6 3.Bc4 Nf6 4.d3':
                move.notation = 'd7d5';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nc6 3.Bc4 Nf6 4.d4':
                move.notation = 'e5d4';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nc6 3.Bc4 Nf6 4.d4 exd4 5.e5':
                move.notation = 'd7d5';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nc6 3.Bc4 Nf6 4.c3':
                move.notation = 'f6e4';
                move.type = 2;
                return move;

            // Ruy Lopez
            case '1.e4 e5 2.Nf3 Nc6 3.Bb5':
                move.notation = 'f7f5';
                move.type = 2;
                return move;

            // Scotch
            case '1.e4 e5 2.Nf3 Nc6 3.d4':
                move.notation = 'd7d5';
                move.type = 2;
                return move;

            // Vienna
            case '1.e4 e5 2.Nc3':
                move.notation = 'g8f6';
                move.type = 2;
                return move;
            case '1.e4 e5 2.Nc3 Nf6 3.f4':
                move.notation = 'd7d5';
                move.type = 2;
                return move;
            case '1.e4 e5 2.Nc3 Nf6 3.Bc4':
                move.notation = 'f6e4';
                move.type = 2;
                return move;
            case '1.e4 e5 2.Nc3 Nf6 3.Bc4 Nxe4 4.Nxe4':
                move.notation = 'd7d5';
                move.type = 2;
                return move;
            case '1.e4 e5 2.Nc3 Nf6 3.Nf3':
                move.notation = 'f8b4';
                move.type = 2;
                return move; 
            case '1.e4 e5 2.Nc3 Nf6 3.Nf3 Bb4 4.Nxe5':
                move.notation = 'e8h8';
                move.type = 2;
                return move;

            // d4
            case '1.d4':;
                if(rand <= 75){
                    move.notation = 'e7e5';
                    move.type = 2;
                    return move;
                }
                move.notation = 'g8f6';
                move.type = 2;
                return move;

            // Englud Gambit Accepted
            case '1.d4 e5 2.dxe5':
                if(rand <= 65){
                    move.notation = 'f8c5';
                    move.type = 2;
                    return move;
                }
                move.notation = 'b8c6';
                move.type = 2;
                return move;
            case '1.d4 e5 2.dxe5 Nc6 3.Nf3':
                move.notation = 'd8e7';
                move.type = 2;
                return move;
            case '1.d4 e5 2.dxe5 Nc6 3.Nf3 Qe7 4.Bf4':
                move.notation = 'e7b4';
                move.type = 2;
                return move;

            case '1.d4 e5 2.dxe5 Bc5 3.Nf3':
                move.notation = 'd7d6';
                move.type = 2;
                return move;
            case '1.d4 e5 2.dxe5 Bc5 3.Nf3 d6 4.exd6':
                move.notation = 'g8e7';
                move.type = 2;
                return move;

            case '1.d4 e5 2.dxe5 Bc5 3.Nf3 d6 4.exd6 Ne7 5.dxe7':
                move.notation = 'c5f2';
                move.type = 2;
                return move;
            case '1.d4 e5 2.dxe5 Bc5 3.Nf3 d6 4.exd6 Ne7 5.dxe7 Bxf2+ 6.Kxf2':
                move.notation = 'd8d1';
                move.type = 2;
                return move;

            // London System
            case '1.d4 Nf6 2.Bf4':
                move.notation = 'c7c5';
                move.type = 2;
                return move;

            // Queen's Gambit
            case '1.d4 Nf6 2.c4':
                move.notation = 'c7c5';
                move.type = 2;
                return move;

            // Accelerated Catalan
            case '1.d4 Nf6 2.g3':
                move.notation = 'c7c5';
                move.type = 2;
                return move;

            // d4 Nf3
            case '1.d4 Nf6 2.Nf3':
                move.notation = 'c7c5';
                move.type = 2;
                return move; 
                
            // When White
            // Start
            case '':
                move.notation = 'e2e4';
                move.type = 2;
                return move;

            // e5
            case '1.e4 e5':
                if(rand >= 50){
                    move.notation = 'f2f4';
                    move.type = 2;
                    return move;
                }
                move.notation = 'd2d4';
                move.type = 2;
                return move;

            // Danish Gambit
            case '1.e4 e5 2.d4 exd4':
                move.notation = 'c2c3';
                move.type = 2;
                return move; 
            case '1.e4 e5 2.d4 exd4 3.c3 dxc3':
                move.notation = 'f1c4';
                move.type = 2;
                return move;

            // Caro-Kann
            case '1.e4 c6':
                if(rand >= 70){
                    move.notation = 'c2c4';
                    move.type = 2;
                    return move;
                }
                move.notation = 'd2d4';
                move.type = 2;
                return move;
            case '1.e4 c6 2.d4 d5':
                move.notation = 'b1d2';
                move.type = 2;
                return move; 
            case '1.e4 c6 2.d4 d5 3.Nd2 dxe4':
                move.notation = 'd2e4';
                move.type = 2;
                return move;
            case '1.e4 c6 2.d4 d5 3.Nd2 dxe4 4.Nxe4 Nf6':
                move.notation = 'e4g5';
                move.type = 2;
                return move;
            case '1.e4 c6 2.d4 d5 3.Nd2 dxe4 4.Nxe4 Nf6 5.Ng5 h6':
                move.notation = 'g5f7';
                move.type = 2;
                return move; 
            case '1.e4 c6 2.d4 d5 3.Nd2 dxe4 4.Nxe4 Nf6 5.Ng5 Bf5':
                move.notation = 'g5f7';
                move.type = 2;
                return move;
            case '1.e4 c6 2.d4 d5 3.Nd2 dxe4 4.Nxe4 Nf6 5.Ng5 Bg4':
                move.notation = 'g5f7';
                move.type = 2;
                return move;
            case '1.e4 c6 2.d4 d5 3.Nd2 dxe4 4.Nxe4 Bf5':
                move.notation = 'e4g5';
                move.type = 2;
                return move;
            case '1.e4 c6 2.d4 d5 3.Nd2 dxe4 4.Nxe4 Bf5 5.Ng5 h6':
                move.notation = 'g5f7';
                move.type = 2;
                return move;
            case '1.e4 c6 2.d4 d5 3.Nd2 dxe4 4.Nxe4 Bf5 5.Ng5 Nf6':
                move.notation = 'g5f7';
                move.type = 2;
                return move;

            // French Defense
            case '1.e4 e6':
                if(rand >= 50){
                    move.notation = 'g1f3';
                    move.type = 2;
                    return move;
                }
                move.notation = 'b2b3';
                move.type = 2;
                return move;
            case '1.e4 e6 2.b3 d5':
                move.notation = 'c1b2';
                move.type = 2;
                return move;
            case '1.e4 e6 2.Nf3 d5':
                move.notation = 'e4e5';
                move.type = 2;
                return move;
            case '1.e4 e6 2.Nf3 d5 3.e5 c5':
                move.notation = 'b2b4';
                move.type = 2;
                return move;
            case '1.e4 e6 2.Nf3 d5 3.e5 Nc6':
                move.notation = 'd2d4';
                move.type = 2;
                return move;

            // Sicilian Defense
            case '1.e4 c5':
                if(rand >= 40){
                    move.notation = 'd2d4';
                    move.type = 2;
                    return move;
                }
                move.notation = 'b2b4';
                move.type = 2;
                return move;
            case '1.e4 c5 2.d4 cxd4':
                move.notation = 'c2c3';
                move.type = 2;
                return move;

            // Pirc Defense
            case '1.e4 d6':
                move.notation = 'd2d4';
                move.type = 2;
                return move;
            case '1.e4 d6 2.d4 Nf6':
                move.notation = 'b1c3';
                move.type = 2;
                return move; 
            case '1.e4 d6 2.d4 Nf6 3.Nc3 g6':
                move.notation = 'c1g5';
                move.type = 2;
                return move;
            case '1.e4 d6 2.d4 Nf6 3.Nc3 g6 4.Bg5 Bg7':
                move.notation = 'e4e5';
                move.type = 2;
                return move;
            case '1.e4 d6 2.d4 Nf6 3.Nc3 g6 4.Bg5 Bg7 5.e5 dxe5':
                move.notation = 'd4e5';
                move.type = 2;
                return move; 
            case '1.e4 d6 2.d4 Nf6 3.Nc3 g6 4.Bg5 Bg7 5.e5 dxe5 6.dxe5 Qxd1+':
                move.notation = 'a1d1';
                move.type = 2;
                return move;
            case '1.e4 d6 2.d4 Nf6 3.Nc3 g6 4.Bg5 Bg7 5.e5 dxe5 6.dxe5 Qxd1+ 7.Rxd1 Ng4':
                move.notation = 'h2h3';
                move.type = 2;
                return move;
            case '1.e4 d6 2.d4 g6':
                move.notation = 'b1c3';
                move.type = 2;
                return move; 
            case '1.e4 d6 2.d4 g6 3.Nc3 Bg7':
                move.notation = 'c1g5';
                move.type = 2;
                return move;
            case '1.e4 d6 2.d4 g6 3.Nc3 Bg7 4.Bg5 Nf6':
                move.notation = 'e4e5';
                move.type = 2;
                return move;
            case '1.e4 d6 2.d4 g6 3.Nc3 Bg7 4.Bg5 Nf6 5.e5 dxe5':
                move.notation = 'd4e5';
                move.type = 2;
                return move; 
            case '1.e4 d6 2.d4 g6 3.Nc3 Bg7 4.Bg5 Nf6 5.e5 dxe5 6.dxe5 Qxd1+':
                move.notation = 'a1d1';
                move.type = 2;
                return move;
            case '1.e4 d6 2.d4 g6 3.Nc3 Bg7 4.Bg5 Nf6 5.e5 dxe5 6.dxe5 Qxd1+ 7.Rxd1 Ng4':
                move.notation = 'h2h3';
                move.type = 2;
                return move;

            // Modern Defense
            case '1.e4 g6':
                move.notation = 'd2d4';
                move.type = 2;
                return move;
            case '1.e4 g6 2.d4 Bg7':
                move.notation = 'b1c3';
                move.type = 2;
                return move; 
            case '1.e4 g6 2.d4 Bg7 3.Nc3 d6':
                move.notation = 'c1g5';
                move.type = 2;
                return move;
            case '1.e4 g6 2.d4 Bg7 3.Nc3 d6 4.Bg5 Nf6':
                move.notation = 'e4e5';
                move.type = 2;
                return move;
            case '1.e4 g6 2.d4 Bg7 3.Nc3 d6 4.Bg5 Nf6 5.e5 dxe5':
                move.notation = 'd4e5';
                move.type = 2;
                return move; 
            case '1.e4 g6 2.d4 Bg7 3.Nc3 d6 4.Bg5 Nf6 5.e5 dxe5 6.dxe5 Qxd1+':
                move.notation = 'a1d1';
                move.type = 2;
                return move;
            case '1.e4 d6 2.d4 Nf6 3.Nc3 g6 4.Bg5 Bg7 5.e5 dxe5 6.dxe5 Qxd1+ 7.Rxd1 Ng4':
                move.notation = 'h2h3';
                move.type = 2;
                return move;

            // Scandinavian Defense
            case '1.e4 d5':
                move.notation = 'g1f3';
                move.type = 2;
                return move;
            case '1.e4 d5 2.Nf3 dxe4':
                move.notation = 'f3g5';
                move.type = 2;
                return move; 
            case '1.e4 d5 2.Nf3 dxe4 3.Ng5 Nf6':
                move.notation = 'd2d3';
                move.type = 2;
                return move;
            case '1.e4 d5 2.Nf3 dxe4 3.Ng5 Nf6 4.d3 exd3':
                move.notation = 'f1d3';
                move.type = 2;
                return move;
            case '1.e4 d5 2.Nf3 dxe4 3.Ng5 Nf6 4.d3 exd3 5.Bxd3 h6':
                move.notation = 'g5f7';
                move.type = 2;
                return move; 
            case '1.e4 d5 2.Nf3 dxe4 3.Ng5 Nf6 4.d3 exd3 5.Bxd3 h6 6.Nxf7 Kxf7':
                move.notation = 'd3g6';
                move.type = 2;
                return move;
            case '1.e4 d5 2.Nf3 dxe4 3.Ng5 Nf6 4.d3 exd3 5.Bxd3 h6 6.Nxf7 Kxf7 7.Bg6+ Kxg6':
                move.notation = 'd1d8';
                move.type = 2;
                return move;

            default:
                break;
        }

        // Si aucune ouverture reconnue
        if(game.history().length > 2) {
            return move;
        }

        return move;
    }

    async #gambitFanaticLogic(game: Chess): Promise<Move> {
        let move: Move = {
            notation: '',
            type: -1,
        };

        let openingMove = this.#gambitFanaticOpenings(game);
        if(openingMove.type >= 0) {
            return openingMove;
        }

        let stockfishMoves: EvalResultSimplified[] = await this.#engine.findBestMoves(game.fen(), 10, 20, 50, false);
        if(game.history().length < 1 || game.history().length > 4) {
            return move;
        }
        
        const lastOpponentMove = game.history({verbose: true})[game.history().length-1].lan;
        const lastOpponentPiece = game.history({verbose: true})[game.history().length-1].piece;
        //console.log(game.history({verbose: true}));

        stockfishMoves = stockfishMoves.map((evalRes) => {
            let randBonus = Math.max(0.3, 1.5*Math.random());
            if(this.#toolbox.getMovePiece(evalRes.bestMove, game.fen()).type === 'p' && lastOpponentPiece === 'p') {
                let isGambit = Math.abs(lastOpponentMove.charCodeAt(2) - evalRes.bestMove.charCodeAt(2)) === 1;
                isGambit = isGambit && (Math.abs(lastOpponentMove.charCodeAt(3) - evalRes.bestMove.charCodeAt(3)) === 1);
                if(isGambit){
                    evalRes.eval = (evalMove(evalRes, this.#botColor, this.#toolbox) + randBonus).toString();
                    return evalRes;
                }
            }
            randBonus = randBonus/5;
            evalRes.eval = (evalMove(evalRes, this.#botColor, this.#toolbox) + randBonus).toString();
            return evalRes;
        });

        stockfishMoves.sort(compareEval);

        move.notation = stockfishMoves[0].bestMove;
        move.type = 2;

        return move;
    }

    /**
     * Aime sortir l'adversaire de la théorie en jouant des Gambits dans l'ouverture.
     */
    async #makeGambitFanaticMove(game: Chess): Promise<Move> {
        //console.log('Bot AI: Gambit Fanatic');
        let move: Move = {
            notation: '',
            type: -1,
        };
        
        const gimmickMove = await this.#gambitFanaticLogic(game);
        if(gimmickMove.type >= 0) {
            this.#lastRandomMove = this.#lastRandomMove-1;
            return gimmickMove;
        } 

        const defaultMove = await this.#defaultMoveLogic(game, true, true);
        if(defaultMove.type >= 0) {
            this.#lastRandomMove = this.#lastRandomMove-1;
            return defaultMove;
        }

        return move;
    }

    async #copycatLogic(game: Chess): Promise<Move> {
        let move: Move = {
            notation: '',
            type: -1,
        };

        if(game.history().length > 20) {
            return move;
        }

        if(game.history().length < 1) {
            move.notation = 'g1f3';
            move.type = 2;
            return move;
        }

        let stockfishMoves: EvalResultSimplified[] = await this.#engine.findBestMoves(game.fen(), 10, 20, 50, false);
        
        const lastOpponentMove = game.history({verbose: true})[game.history().length-1].lan;
        const lastOpponentPiece = game.history({verbose: true})[game.history().length-1].piece;
        //console.log(game.history({verbose: true}));

        stockfishMoves = stockfishMoves.map((evalRes) => {
            let randBonus = 2;
            if(game.history().length > 20) randBonus = 0.3;
            let isCopycat = Math.abs(lastOpponentMove.charCodeAt(0) - evalRes.bestMove.charCodeAt(0)) === 0;
            isCopycat = isCopycat && (Math.abs(lastOpponentMove.charCodeAt(2) - evalRes.bestMove.charCodeAt(2)) === 0);
            isCopycat = isCopycat && (this.#toolbox.getMoveDistance(lastOpponentMove) === this.#toolbox.getMoveDistance(evalRes.bestMove));
            if(isCopycat){
                evalRes.eval = (evalMove(evalRes, this.#botColor, this.#toolbox) + randBonus).toString();
                return evalRes;
            }
            randBonus = randBonus/5;
            evalRes.eval = (evalMove(evalRes, this.#botColor, this.#toolbox) + randBonus).toString();
            return evalRes;
        });

        stockfishMoves.sort(compareEval);

        move.notation = stockfishMoves[0].bestMove;
        move.type = 2;

        return move;
    }

    /**
     * Aime copier les coups de l'adversaire.
     */
    async #makeCopycatMove(game: Chess): Promise<Move> {
        //console.log('Bot AI: Copycat');
        let move: Move = {
            notation: '',
            type: -1,
        };

        const gimmickMove = await this.#copycatLogic(game);
        if(gimmickMove.type >= 0) {
            this.#lastRandomMove = this.#lastRandomMove-1;
            return gimmickMove;
        }

        const defaultMove = await this.#defaultMoveLogic(game, true, true);
        if(defaultMove.type >= 0) {
            this.#lastRandomMove = this.#lastRandomMove-1;
            return defaultMove;
        }

        return move;
    }

    async #bongcloudLogic(game: Chess): Promise<Move> {
        let move: Move = {
            notation: '',
            type: -1,
        };

        if(game.history().length > 10) {
            return move;
        }

        let stockfishMoves: EvalResultSimplified[] = await this.#engine.findBestMoves(game.fen(), 10, 20, 50, false);
        if(game.history().length < 1) {
            move.notation = 'e2e4';
            move.type = 2;
            return move;
        }
        if(game.history().length === 1) {
            const lastOpponentMove = game.history({verbose: true})[game.history().length-1].lan;
            if(lastOpponentMove === 'e2e4') {
                move.notation = 'e7e5';
                move.type = 2;
                return move;
            }
            move.notation = 'e7e6';
            move.type = 2;
            return move;
        }

        stockfishMoves = stockfishMoves.map((evalRes) => {
            let randBonus = 10;
            if(game.history().length > 4) randBonus = 0;
            if(evalRes.bestMove === 'e8e7' || evalRes.bestMove === 'e1e2') {
                evalRes.eval = (evalMove(evalRes, this.#botColor, this.#toolbox) + randBonus).toString();
                return evalRes;
            }
            evalRes.eval = (evalMove(evalRes, this.#botColor, this.#toolbox)).toString();
            return evalRes;
        });

        stockfishMoves.sort(compareEval);

        move.notation = stockfishMoves[0].bestMove;
        move.type = 2;

        return move;
    }

    /**
     * Joue le bongcloud.
     */
    async #makeBongcloudMove(game: Chess): Promise<Move> {
        //console.log('Bot AI: Bongcloud');
        let move: Move = {
            notation: '',
            type: -1,
        };

        const gimmickMove = await this.#bongcloudLogic(game);
        if(gimmickMove.type >= 0) {
            this.#lastRandomMove = this.#lastRandomMove-1;
            return gimmickMove;
        }

        const defaultMove = await this.#defaultMoveLogic(game, true, true);
        if(defaultMove.type >= 0) {
            this.#lastRandomMove = this.#lastRandomMove-1;
            return defaultMove;
        }

        return move;
    }

    async #exchangesLoverLogic(game: Chess): Promise<Move> {
        let move: Move = {
            notation: '',
            type: -1,
        };

        let stockfishMoves: EvalResultSimplified[] = await this.#engine.findBestMoves(game.fen(), 10, this.#defaultBotParams.skillValue, 50, false);

        stockfishMoves = stockfishMoves.map((evalRes) => {
            const moveDestination = this.#toolbox.getMoveDestination(evalRes.bestMove);
            let randBonus = Math.max(0.1, Math.random()/4);
            if(!moveDestination){
                evalRes.eval = (evalMove(evalRes, this.#botColor, this.#toolbox)).toString();
                return evalRes;
            }
            
            if(this.#toolbox.getMovePiece(evalRes.bestMove, game.fen()).type !== 'p') {
                if(game.get(moveDestination)) randBonus = 1;
                evalRes.eval = (evalMove(evalRes, this.#botColor, this.#toolbox) + randBonus).toString();
                return evalRes;
            }

            evalRes.eval = (evalMove(evalRes, this.#botColor, this.#toolbox)).toString();
            return evalRes;
        });

        stockfishMoves.sort(compareEval);

        move.notation = stockfishMoves[0].bestMove;
        move.type = 2;

        return move;
    }

    /**
     * Adore échanger les pièces.
     */
    async #makeExchangesLoverMove(game: Chess): Promise<Move> {
        //console.log('Bot AI: Exchange Lover');
        let move: Move = {
            notation: '',
            type: -1,
        };

        const gimmickMove = await this.#exchangesLoverLogic(game);
        if(gimmickMove.type >= 0) {
            this.#lastRandomMove = this.#lastRandomMove-1;
            return gimmickMove;
        }

        return move;
    }

    async #exchangesHaterLogic(game: Chess): Promise<Move> {
        let move: Move = {
            notation: '',
            type: -1,
        };

        let stockfishMoves: EvalResultSimplified[] = await this.#engine.findBestMoves(game.fen(), 10, this.#defaultBotParams.skillValue, 50, false);

        stockfishMoves = stockfishMoves.map((evalRes) => {
            const moveDestination = this.#toolbox.getMoveDestination(evalRes.bestMove);
            let randBonus = Math.max(0.1, Math.random()/4);
            if(!moveDestination){
                evalRes.eval = (evalMove(evalRes, this.#botColor, this.#toolbox)).toString();
                return evalRes;
            }
            
            if(this.#toolbox.getMovePiece(evalRes.bestMove, game.fen()).type !== 'p') {
                if(game.get(moveDestination)) randBonus = 1;
                evalRes.eval = (evalMove(evalRes, this.#botColor, this.#toolbox) - randBonus).toString();
                return evalRes;
            }

            evalRes.eval = (evalMove(evalRes, this.#botColor, this.#toolbox)).toString();
            return evalRes;
        });

        stockfishMoves.sort(compareEval);

        
        

        move.notation = stockfishMoves[0].bestMove;
        move.type = 2;

        return move;
    }

    /**
     * Évite les échanges autant que possible.
     */
    async #makeExchangesHaterMove(game: Chess): Promise<Move> {
        //console.log('Bot AI: Exchange Hater');
        let move: Move = {
            notation: '',
            type: -1,
        };

        const gimmickMove = await this.#exchangesHaterLogic(game);
        if(gimmickMove.type >= 0) {
            this.#lastRandomMove = this.#lastRandomMove-1;
            return gimmickMove;
        }

        return move;
    }

    async #cowLoverLogic(game: Chess): Promise<Move> {
        let move: Move = {
            notation: '',
            type: -1,
        };

        if(game.history().length > 16) {
            return move;
        }

        const pawnsCases: Square[] = ['e3', 'e6', 'd3', 'd6'];
        const knightCases: Square[] = ['e2', 'e7', 'd2', 'd7', 'b3', 'b6', 'g3', 'g6'];
        const badStartingCases: Square[] = ['b3', 'b6', 'g3', 'g6'];

        let stockfishMoves: EvalResultSimplified[] = await this.#engine.findBestMoves(game.fen(), 10, 20, 50, false);

        stockfishMoves = stockfishMoves.map((evalRes) => {
            const moveDestination = this.#toolbox.getMoveDestination(evalRes.bestMove);
            const moveOrigin = this.#toolbox.getMoveOrigin(evalRes.bestMove);
            if(!moveDestination || !moveOrigin){
                evalRes.eval = (evalMove(evalRes, this.#botColor, this.#toolbox)).toString();
                return evalRes;
            }
            let randBonus = Math.max(0.5, Math.random());
            if(game.history().length > 15) randBonus = 0;
            if(this.#toolbox.getMovePiece(evalRes.bestMove, game.fen()).type === 'p' && pawnsCases.includes(moveDestination)) {
                evalRes.eval = (evalMove(evalRes, this.#botColor, this.#toolbox) + randBonus).toString();
                return evalRes;
            }

            if(this.#toolbox.getMovePiece(evalRes.bestMove, game.fen()).type === 'n' && knightCases.includes(moveDestination)) {
                if(!badStartingCases.includes(moveOrigin)) {
                    evalRes.eval = (evalMove(evalRes, this.#botColor, this.#toolbox) + 2*randBonus).toString();
                    return evalRes;
                }
            }
            evalRes.eval = (evalMove(evalRes, this.#botColor, this.#toolbox)).toString();
            return evalRes;
        });

        stockfishMoves.sort(compareEval);

        
        

        move.notation = stockfishMoves[0].bestMove;
        move.type = 2;

        return move;
    }

    /**
     * Joue la cow opening.
     */
    async #makeCowLoverMove(game: Chess): Promise<Move> {
        //console.log('Bot AI: Cow Lover');
        let move: Move = {
            notation: '',
            type: -1,
        };

        const gimmickMove = await this.#cowLoverLogic(game);
        if(gimmickMove.type >= 0) {
            this.#lastRandomMove = this.#lastRandomMove-1;
            return gimmickMove;
        }

        const defaultMove = await this.#defaultMoveLogic(game, false, true);
        if(defaultMove.type >= 0) {
            this.#lastRandomMove = this.#lastRandomMove-1;
            return defaultMove;
        }

        return move;
    }

    /**
     * Joue très bien les ouvertures, mais assez mal le reste de la partie.
     */
    async #makeChessableMasterMove(game: Chess): Promise<Move> {
        //console.log('Bot AI: Openings Master');
        let move: Move = {
            notation: '',
            type: -1,
        };
        const movesList = this.#toolbox.convertHistorySanToLan(this.#toolbox.convertPgnToHistory(game.pgn()));

        const lichessMove = await makeLichessMove(movesList, 'Master', '');
        if(lichessMove.type >= 0){
            this.#lastRandomMove = this.#lastRandomMove-1;
            return lichessMove;
        }

        const defaultMove = await this.#defaultMoveLogic(game, false, true);
        if(defaultMove.type >= 0) {
            this.#lastRandomMove = this.#lastRandomMove-1;
            return defaultMove;
        }

        return move;
    }

    /**
     * Connait très mal les ouvertures, mais assez bien le reste de la partie.
     */
    async #makeAutoDidacteMove(game: Chess): Promise<Move> {
        //console.log('Bot AI: Openings Beginner');
        let move: Move = {
            notation: '',
            type: -1,
        };

        const movesList = this.#toolbox.convertHistorySanToLan(this.#toolbox.convertPgnToHistory(game.pgn()));

        const lichessMove = await makeLichessMove(movesList, 'Beginner', '');
        if(lichessMove.type >= 0){
            this.#lastRandomMove = this.#lastRandomMove-1;
            return lichessMove;
        }

        const defaultMove = await this.#defaultMoveLogic(game, false, true);
        if(defaultMove.type >= 0) {
            this.#lastRandomMove = this.#lastRandomMove-1;
            return defaultMove;
        }

        return move;
    }

    async #castleDestroyerLogic(game: Chess): Promise<Move> {
        let move: Move = {
            notation: '',
            type: -1,
        };

        if(game.history().length > 40) {
            return move;
        }

        let stockfishMoves: EvalResultSimplified[] = await this.#engine.findBestMoves(game.fen(), 10, Math.max(10, this.#defaultBotParams.skillValue), 50, false);
        const opponentKingColor: Color = this.#botColor === 'w' ? 'b' : 'w';
        const kingsideCastleFiles = ['f', 'g', 'h'];
        const queensideCastleFiles = ['a', 'b', 'c', 'd'];

        const kingsideCastleMoves = ['e1g1', 'e8g8'];
        const queensideCastleMoves = ['e1c1', 'e8c8'];
        const castleMoves = kingsideCastleMoves.concat(queensideCastleMoves);

        let opponentCastledKingside = kingsideCastleFiles.includes(this.#toolbox.getKingSquare(game.fen(), opponentKingColor).charAt(0));
        let opponentCastledQueenside = queensideCastleFiles.includes(this.#toolbox.getKingSquare(game.fen(), opponentKingColor).charAt(0));
        let opponentHasCastled = opponentCastledKingside || opponentCastledQueenside;
        let botHasCastled = this.#toolbox.getKingSquare(game.fen(), this.#botColor).charAt(0) !== 'e';
        console.log("L'adversaire a fait un petit roque: " + opponentCastledKingside);
        console.log("L'adversaire a fait un grand roque: " + opponentCastledQueenside);

        stockfishMoves = stockfishMoves.map((evalRes) => {
            let randBonus = Math.max(0.5, Math.random());

            if(!opponentHasCastled){
                if(castleMoves.includes(evalRes.bestMove)) {
                    evalRes.eval = (evalMove(evalRes, this.#botColor, this.#toolbox) - 2).toString();
                    return evalRes;
                }
            }else{
                if(opponentCastledKingside && queensideCastleMoves.includes(evalRes.bestMove)){
                    evalRes.eval = (evalMove(evalRes, this.#botColor, this.#toolbox) + 3).toString();
                    return evalRes;
                }
                if(opponentCastledKingside && kingsideCastleMoves.includes(evalRes.bestMove)){
                    evalRes.eval = (evalMove(evalRes, this.#botColor, this.#toolbox) - 2).toString();
                    return evalRes;
                }
                if(opponentCastledQueenside && kingsideCastleMoves.includes(evalRes.bestMove)){
                    evalRes.eval = (evalMove(evalRes, this.#botColor, this.#toolbox) + 3).toString();
                    return evalRes;
                }
                if(opponentCastledQueenside && queensideCastleMoves.includes(evalRes.bestMove)){
                    evalRes.eval = (evalMove(evalRes, this.#botColor, this.#toolbox) - 2).toString();
                    return evalRes;
                }
                if(botHasCastled && this.#toolbox.getMovePiece(evalRes.bestMove, game.fen()).type === 'p') {
                    if(evalRes.bestMove.charAt(0) === 'd' || evalRes.bestMove.charAt(0) === 'e'){
                        evalRes.eval = (evalMove(evalRes, this.#botColor, this.#toolbox) + 0.3).toString();
                        return evalRes;
                    }
                    if(opponentCastledKingside && kingsideCastleFiles.includes(evalRes.bestMove.charAt(0))){
                        randBonus = randBonus * this.#toolbox.getMoveDistance(evalRes.bestMove);
                        evalRes.eval = (evalMove(evalRes, this.#botColor, this.#toolbox) + randBonus).toString();
                        return evalRes;
                    }
                    if(opponentCastledQueenside && queensideCastleFiles.includes(evalRes.bestMove.charAt(0))){
                        randBonus = randBonus * this.#toolbox.getMoveDistance(evalRes.bestMove);
                        evalRes.eval = (evalMove(evalRes, this.#botColor, this.#toolbox) + randBonus).toString();
                        return evalRes;
                    }
                }
            }

            // Si le bot n'a pas encore roqué, il cherche à développer ses pièces pour roquer
            if(!botHasCastled && this.#toolbox.getMovePiece(evalRes.bestMove, game.fen()).type !== 'p') {
                if((eval(evalRes.bestMove.charAt(1)) === 1 && eval(evalRes.bestMove.charAt(3)) !== 1) || (eval(evalRes.bestMove.charAt(1)) === 8 && eval(evalRes.bestMove.charAt(3)) !== 8)){
                    randBonus = randBonus * this.#toolbox.getMoveDistance(evalRes.bestMove);
                    evalRes.eval = (evalMove(evalRes, this.#botColor, this.#toolbox) + 0.2).toString();
                    return evalRes;
                }
            }
            
            evalRes.eval = (evalMove(evalRes, this.#botColor, this.#toolbox)).toString();
            return evalRes;
        });

        stockfishMoves.sort(compareEval);

        
        

        move.notation = stockfishMoves[0].bestMove;
        move.type = 2;

        return move;
    }

    /**
     * Attend que l'adversaire soit roqué pour roquer du côté opposé puis lui envoyer une marée de pions sur son roque.
     */
    // TODO: À améliorer
    async #makeCastleDestroyerMove(game: Chess): Promise<Move> {
        //console.log('Bot AI: Castle Destroyer');
        let move: Move = {
            notation: '',
            type: -1,
        };

        const gimmickMove = await this.#castleDestroyerLogic(game);
        if(gimmickMove.type >= 0) {
            this.#lastRandomMove = this.#lastRandomMove-1;
            return gimmickMove;
        }

        const defaultMove = await this.#defaultMoveLogic(game, false, true);
        if(defaultMove.type >= 0) {
            this.#lastRandomMove = this.#lastRandomMove-1;
            return defaultMove;
        }

        return move;
    }

    #indianKingOpenings(game: Chess): Move {
        let move: Move = {
            notation: '',
            type: -1,
        };

        const formatedPGN = game.pgn().replaceAll(/\.\s/g, '.');

        if(game.history().length === 0) {
            move.notation = 'g1f3';
            move.type = 2;
            return move;
        }

        if(game.history().length === 1) {
            if(formatedPGN === '1.e4') {
                move.notation = 'd7d6';
                move.type = 2;
                return move;
            }
            move.notation = 'g8f6';
            move.type = 2;
            return move;
        }

        if(game.history().length === 2) {
            if(formatedPGN === '1.Nf3 e5') {
                move.notation = 'f3e5';
                move.type = 2;
                return move;
            }
            move.notation = 'g2g3';
            move.type = 2;
            return move;
        }

        if(game.history().length === 3) {
            if(game.history()[2] !== 'e5') {
                move.notation = 'g7g6';
                move.type = 2;
                return move;
            }
        }

        return move;
    }

    async #indianKingLogic(game: Chess): Promise<Move> {
        let move: Move = {
            notation: '',
            type: -1,
        };

        if(game.history().length > 10) {
            return move;
        }

        let openingMove = this.#indianKingOpenings(game);
        if(openingMove.type >= 0) {
            return openingMove;
        }

        const pawnsCases: Square[] = ['b3', 'b6'];
        const bishopCases: Square[] = ['b2', 'b7'];

        let stockfishMoves: EvalResultSimplified[] = await this.#engine.findBestMoves(game.fen(), 10, this.#defaultBotParams.skillValue, 50, false);

        stockfishMoves = stockfishMoves.map((evalRes) => {
            const moveDestination = this.#toolbox.getMoveDestination(evalRes.bestMove);
            if(!moveDestination){
                evalRes.eval = (evalMove(evalRes, this.#botColor, this.#toolbox)).toString();
                return evalRes;
            }
            let randBonus = Math.max(0.1, Math.random()/2);

            // Si le coup est un coup de pion sur une case qui permet un fianchetto, on ajoute un bonus
            if(this.#toolbox.getMovePiece(evalRes.bestMove, game.fen()).type === 'p' && pawnsCases.includes(moveDestination)) {
                evalRes.eval = (evalMove(evalRes, this.#botColor, this.#toolbox) + randBonus).toString();
                return evalRes;
            }

            // Si le coup est le placement d'un fou en fianchetto, on ajoute un gros bonus
            if(this.#toolbox.getMovePiece(evalRes.bestMove, game.fen()).type === 'b' && bishopCases.includes(moveDestination)) {
                evalRes.eval = (evalMove(evalRes, this.#botColor, this.#toolbox) + 2*randBonus).toString();
                return evalRes;
            }
            evalRes.eval = (evalMove(evalRes, this.#botColor, this.#toolbox)).toString();
            return evalRes;
        });

        stockfishMoves.sort(compareEval);

        move.notation = stockfishMoves[0].bestMove;
        move.type = 2;

        return move;
    }

    /**
     * Aime jouer la KID, KIA ou la Pirc sur 1.e4
     */
    async #makeIndianKingMove(game: Chess): Promise<Move> {
        console.log('Bot AI: Indian King');
        let move: Move = {
            notation: '',
            type: -1,
        };

        const gimmickMove = await this.#indianKingLogic(game);
        if(gimmickMove.type >= 0) {
            this.#lastRandomMove = this.#lastRandomMove-1;
            return gimmickMove;
        }

        const defaultMove = await this.#defaultMoveLogic(game, true, true);
        if(defaultMove.type >= 0) {
            this.#lastRandomMove = this.#lastRandomMove-1;
            return defaultMove;
        }

        return move;
    }

    #stonewallOpenings(game: Chess): Move {
        let move: Move = {
            notation: '',
            type: -1,
        };
        const formatedPGN = game.pgn().replaceAll(/\.\s/g, '.');

        if(game.history().length === 0) {
            move.notation = 'd2d4';
            move.type = 2;
            return move;
        }

        if(game.history().length === 2) {
            move.notation = 'e2e3';
            move.type = 2;
            return move;
        }

        if(game.history().length === 4) {
            if(formatedPGN === '1.d4 d5 2.e3 c5') {
                move.notation = 'f2f4';
                move.type = 2;
                return move;
            }
            if(formatedPGN === '1.d4 c5 2.e3 d5') {
                move.notation = 'c2c3';
                move.type = 2;
                return move;
            }
            if(formatedPGN === '1.d4 c5 2.e3 cxd4') {
                move.notation = 'e3d4';
                move.type = 2;
                return move;
            }
            move.notation = 'f1d3';
            move.type = 2;
            return move;
        }

        if(game.history().length === 1) {
            console.log(formatedPGN);
            console.log(formatedPGN === '1.e4');
            if(formatedPGN === '1.e4') {
                move.notation = 'e7e6';
                move.type = 2;
                return move;
            }
            if(formatedPGN === '1.d4') {
                move.notation = 'd7d5';
                move.type = 2;
                return move;
            }
            move.notation = 'e7e6';
            move.type = 2;
            return move;
        }

        if(game.history().length === 3) {
            if(game.history()[0] !== 'd4') {
                console.log(game.history()[0]);
                move.notation = 'd7d5';
                move.type = 2;
                return move;
            }
            move.notation = 'e7e6';
            move.type = 2;
            return move;
        }

        switch (game.pgn().replaceAll(/\.\s/g, '.')) {
            // When Black
            // e4
            case '1.e4 e6 2.d4 d5 3.e5':
                move.notation = 'f7f5';
                move.type = 2;
                return move;

            case '1.e4 e6 2.d4 d5 3.e5 f5 4.exf6':
                move.notation = 'g8f6';
                move.type = 2;
                return move;

            case '1.e4 e6 2.d4 d5 3.Nc3':
                move.notation = 'f7f5';
                move.type = 2;
                return move;

            case '1.e4 e6 2.d4 d5 3.Nd2':
                move.notation = 'f7f5';
                move.type = 2;
                return move;

            case '1.e4 e6 2.Bc4 d5 3.exd5':
                move.notation = 'e6d5';
                move.type = 2;
                return move;

            case '1.e4 e6 2.Bc4 d5 3.exd5 exd5 4.Bd3':
                move.notation = 'f7f5';
                move.type = 2;
                return move;

            case '1.e4 e6 2.Bc4 d5 3.exd5 exd5 4.Be2':
                move.notation = 'f7f5';
                move.type = 2;
                return move;

            case '1.e4 e6 2.Bc4 d5 3.exd5 exd5 4.Bf1':
                move.notation = 'f7f5';
                move.type = 2;
                return move;

            case '1.e4 e6 2.Bc4 d5 3.exd5 exd5 4.Bb3':
                move.notation = 'f7f5';
                move.type = 2;
                return move;

            case '1.e4 e6 2.Bc4 d5 3.exd5 exd5 4.Bb5+':
                move.notation = 'c7c6';
                move.type = 2;
                return move;

            case '1.e4 e6 2.Bc4 d5 3.exd5 exd5 4.Bb5+ c6 5.Ba4':
                move.notation = 'f7f5';
                move.type = 2;
                return move;

            case '1.e4 e6 2.Bc4 d5 3.exd5 exd5 4.Bb5+ c6 5.Be2':
                move.notation = 'f7f5';
                move.type = 2;
                return move;

            case '1.e4 e6 2.Bc4 d5 3.exd5 exd5 4.Bb5+ c6 5.Bf1':
                move.notation = 'f7f5';
                move.type = 2;
                return move;

            case '1.e4 e6 2.Bc4 d5 3.exd5 exd5 4.Bb5+ c6 5.Bd3':
                move.notation = 'f7f5';
                move.type = 2;
                return move;

            case '1.e4 e6 2.d4 d5 3.exd5':
                move.notation = 'e6d5';
                move.type = 2;
                return move;

            case '1.e4 e6 2.d4 d5 3.exd5 exd5 4.Nf3':
                move.notation = 'f7f5';
                move.type = 2;
                return move;

            case '1.e4 e6 2.d4 d5 3.exd5 exd5 4.Nc3':
                move.notation = 'd7d5';
                move.type = 2;
                return move;

            case '1.e4 e6 2.d4 d5 3.exd5 exd5 4.Bd3':
                move.notation = 'c7c6';
                move.type = 2;
                return move;

            case '1.e4 e6 2.d4 d5 3.exd5 exd5 4.c4':
                move.notation = 'c7c6';
                move.type = 2;
                return move;

            case '1.e4 e6 2.d4 d5 3.exd5 exd5 4.Qe2+':
                move.notation = 'f8e7';
                move.type = 2;
                return move;

            case '1.d4 d5 2.c4 e6 3.Nc3':
                move.notation = 'f7f5';
                move.type = 2;
                return move;

            case '1.d4 d5 2.c4 e6 3.Nf3':
                move.notation = 'c7c6';
                move.type = 2;
                return move;

            case '1.d4 d5 2.c4 e6 3.e3':
                move.notation = 'c7c6';
                move.type = 2;
                return move;

            case '1.d4 d5 2.c4 e6 3.cxd5':
                move.notation = 'e6d5';
                move.type = 2;
                return move;

            case '1.d4 d5 2.c4 e6 3.cxd5 exd5 4.Nc3':
                move.notation = 'f7f5';
                move.type = 2;
                return move;

            case '1.d4 d5 2.c4 e6 3.cxd5 exd5 4.Nf3':
                move.notation = 'c7c6';
                move.type = 2;
                return move;

            case '1.d4 d5 2.Nf3 e6 3.Bf4':
                move.notation = 'c7c6';
                move.type = 2;
                return move;

            case '1.d4 d5 2.Nf3 e6 3.Bf4 c6 4.e3':
                move.notation = 'f7f5';
                move.type = 2;
                return move;

            case '1. d4 d5 2.Bf4 e6 3.e3':
                move.notation = 'c7c6';
                move.type = 2;
                return move;

            case '1.d4 d5 2.Bf4 e6 3.e3 c6 4.Nf3':
                move.notation = 'f7f5';
                move.type = 2;
                return move;

            case '1.d4 d5 2.Bf4 e6 3.e3 c6 4.Bd3':
                move.notation = 'f7f5';
                move.type = 2;
                return move;

            case '1.d4 d5 2.Bf4 e6 3.Nf3':
                move.notation = 'c7c6';
                move.type = 2;
                return move;

            case '1.d4 d5 2.Bf4 e6 3.Nf3 c6 4.e3':
                move.notation = 'f7f5';
                move.type = 2;
                return move;

            case '1.d4 d5 2.Bf4 e6 3.Nf3 c6 4.Nbd2':
                move.notation = 'f7f5';
                move.type = 2;
                return move;

            case '1.d4 d5 2.Bf4 e6 3.Nf3 c6 4.c3':
                move.notation = 'f7f5';
                move.type = 2;
                return move;

            case '1.d4 d5 2.Bf4 e6 3.Nf3 c6 4.Nc3':
                move.notation = 'f7f5';
                move.type = 2;
                return move;

            default:
                break;
        }

        return move;
    }

    async #stonewallLogic(game: Chess): Promise<Move> {
        let move: Move = {
            notation: '',
            type: -1,
        };

        if(game.history().length > 22) {
            return move;
        }

        let openingMove = this.#stonewallOpenings(game);
        if(openingMove.type >= 0) {
            return openingMove;
        }

        // TODO: Empecher les coups de pions hors ceux mentionnés !!!
        const pawnsCases: Square[] = ['c3', 'c6', 'e3', 'e6', 'd4', 'd5', 'f4', 'f5'];
        const bishopCases: Square[] = ['d3', 'd6', 'd2', 'd7', 'e1', 'e8', 'h4', 'h5'];
        const knightsCases: Square[] = [ 'd2', 'd7', 'e4', 'e5', 'f3', 'f6'];
        const queenCases: Square[] = ['e1', 'e8', 'g3', 'g6'];
        const exchangesCasesOrigin_1:  Square[] = ['e3', 'e6'];
        const exchangesCasesDestination_1:  Square[] = ['d4', 'd5']; 
        const exchangesCasesOrigin_2:  Square[] = ['f4', 'f5'];
        const exchangesCasesDestination_2:  Square[] = ['e4', 'e5']; 
        const badPawnStartingCases: Square[] = ['c3', 'c6', 'e3', 'e6', 'd4', 'd5', 'f4', 'f5'];
        const badKnightStartingCases: Square[] = [ 'd2', 'd7', 'e4', 'e5'];

        let stockfishMoves: EvalResultSimplified[] = await this.#engine.findBestMoves(game.fen(), 10, 20, 50, false);

        stockfishMoves = stockfishMoves.map((evalRes) => {
            const moveDestination = this.#toolbox.getMoveDestination(evalRes.bestMove);
            const moveOrigin = this.#toolbox.getMoveOrigin(evalRes.bestMove);
            if(!moveDestination || !moveOrigin){
                evalRes.eval = (evalMove(evalRes, this.#botColor, this.#toolbox)).toString();
                return evalRes;
            }

            if(this.#toolbox.getMovePiece(evalRes.bestMove, game.fen()).type === 'p') {
                // Si le coup de pion est un échange effectué avec le bon pion
                if(exchangesCasesOrigin_1.includes(moveOrigin) && exchangesCasesDestination_1.includes(moveDestination)) {
                    evalRes.eval = (evalMove(evalRes, this.#botColor, this.#toolbox) + 0.7).toString();
                    return evalRes;
                }

                if(exchangesCasesOrigin_2.includes(moveOrigin) && exchangesCasesDestination_2.includes(moveDestination)) {
                    evalRes.eval = (evalMove(evalRes, this.#botColor, this.#toolbox) + 0.7).toString();
                    return evalRes;
                }

                // Si le coup de pion permet d'aller sur une des cases stratégiques de la structure stonewall
                if(pawnsCases.includes(moveDestination)) {
                    // Évite que le pion en f4 soit poussé en f5 par exemple
                    if(badPawnStartingCases.includes(moveOrigin)) {
                        evalRes.eval = (evalMove(evalRes, this.#botColor, this.#toolbox) - 0.5).toString();
                        return evalRes;
                    }
                    // f4 et f5 on un bonus plus élevé pour compensé la mauvaise évaluation dû à l'affaiblissement de la position
                    if(moveDestination === 'f4' || moveDestination === 'f5') {
                        evalRes.eval = (evalMove(evalRes, this.#botColor, this.#toolbox) + 0.7).toString();
                        return evalRes;
                    }
                    evalRes.eval = (evalMove(evalRes, this.#botColor, this.#toolbox) + 0.5).toString();
                    return evalRes;
                }
                // On évite les autres coups de pions pour garder une structure stonewall intacte
                evalRes.eval = (evalMove(evalRes, this.#botColor, this.#toolbox) - 0.3).toString();
                return evalRes;
            }

            if(this.#toolbox.getMovePiece(evalRes.bestMove, game.fen()).type === 'b' && bishopCases.includes(moveDestination)) {
                evalRes.eval = (evalMove(evalRes, this.#botColor, this.#toolbox) + 0.15).toString();
                return evalRes;
            }

            if(this.#toolbox.getMovePiece(evalRes.bestMove, game.fen()).type === 'n' && knightsCases.includes(moveDestination)) {
                if(badKnightStartingCases.includes(moveOrigin)) {
                    evalRes.eval = (evalMove(evalRes, this.#botColor, this.#toolbox)).toString();
                    return evalRes;
                }
                evalRes.eval = (evalMove(evalRes, this.#botColor, this.#toolbox) + 0.3).toString();
                return evalRes;
            }

            if(this.#toolbox.getMovePiece(evalRes.bestMove, game.fen()).type === 'q' && queenCases.includes(moveDestination)) {
                evalRes.eval = (evalMove(evalRes, this.#botColor, this.#toolbox) + 0.3).toString();
                return evalRes;
            }
            evalRes.eval = (evalMove(evalRes, this.#botColor, this.#toolbox)).toString();
            return evalRes;
        });

        stockfishMoves.sort(compareEval);

        
        

        move.notation = stockfishMoves[0].bestMove;
        move.type = 2;

        return move;
    }

    /**
     * Aime jouer la structure Stonewall.
     */
    async #makeStonewallMove(game: Chess): Promise<Move> {
        console.log('Bot AI: Stonewall');
        let move: Move = {
            notation: '',
            type: -1,
        };

        const gimmickMove = await this.#stonewallLogic(game);
        if(gimmickMove.type >= 0) {
            this.#lastRandomMove = this.#lastRandomMove-1;
            return gimmickMove;
        }

        const defaultMove = await this.#defaultMoveLogic(game, true, true);
        if(defaultMove.type >= 0) {
            this.#lastRandomMove = this.#lastRandomMove-1;
            return defaultMove;
        }

        return move;
    }

    #dragonOpenings(game: Chess): Move {
        let move: Move = {
            notation: '',
            type: -1,
        };

        const formatedPGN = game.pgn().replaceAll(/\.\s/g, '.');

        if(game.history().length === 0) {
            move.notation = 'c2c4';
            move.type = 2;
            return move;
        }

        if(game.history().length === 1) {
            if(formatedPGN === '1.e4') {
                move.notation = 'c7c5';
                move.type = 2;
                return move;
            }
            move.notation = 'g8f6';
            move.type = 2;
            return move;
        }

        if(game.history().length === 2) {
            if(formatedPGN === '1.c4 d5') {
                move.notation = 'c4d5';
                move.type = 2;
                return move;
            }
            move.notation = 'g2g3';
            move.type = 2;
            return move;
        }

        return move;
    }

    async #dragonLogic(game: Chess): Promise<Move> {
        let move: Move = {
            notation: '',
            type: -1,
        };

        if(game.history().length > 10) {
            return move;
        }

        let openingMove = this.#dragonOpenings(game);
        if(openingMove.type >= 0) {
            return openingMove;
        }


        const exchangesPawnsCases: Square[] = ['d4', 'd5'];
        const sidePawnsCases: Square[] = ['c5'];
        const fianchettoPawnsCases: Square[] = ['g3', 'g6'];
        const bishopCases: Square[] = ['g2', 'g7'];

        let stockfishMoves: EvalResultSimplified[] = await this.#engine.findBestMoves(game.fen(), 10, this.#defaultBotParams.skillValue, 50, false);

        stockfishMoves = stockfishMoves.map((evalRes) => {
            const moveDestination = this.#toolbox.getMoveDestination(evalRes.bestMove);
            if(!moveDestination){
                evalRes.eval = (evalMove(evalRes, this.#botColor, this.#toolbox)).toString();
                return evalRes;
            }
            

            // Si le coup est un coup de pion sur une case qui permet un fianchetto, on ajoute un bonus
            if(this.#toolbox.getMovePiece(evalRes.bestMove, game.fen()).type === 'p') {
                if(exchangesPawnsCases.includes(moveDestination) && this.#toolbox.isCapture(game.fen(), evalRes.bestMove)) {
                    evalRes.eval = (evalMove(evalRes, this.#botColor, this.#toolbox) + 0.9).toString();
                    return evalRes;
                }
                if(sidePawnsCases.includes(moveDestination)) {
                    evalRes.eval = (evalMove(evalRes, this.#botColor, this.#toolbox) + 0.9).toString();
                    return evalRes;
                }
                if(fianchettoPawnsCases.includes(moveDestination)) {
                    evalRes.eval = (evalMove(evalRes, this.#botColor, this.#toolbox) + 0.6).toString();
                    return evalRes;
                }
            }

            if(this.#toolbox.getMovePiece(evalRes.bestMove, game.fen()).type === 'b' && bishopCases.includes(moveDestination)) {
                evalRes.eval = (evalMove(evalRes, this.#botColor, this.#toolbox) + 0.3).toString();
                return evalRes;
            }
            evalRes.eval = (evalMove(evalRes, this.#botColor, this.#toolbox)).toString();
            return evalRes;
        });

        stockfishMoves.sort(compareEval);

        move.notation = stockfishMoves[0].bestMove;
        move.type = 2;

        return move;
    }

    /**
     * Aime jouer un coup de pion sur le flanc (c4 ou c5) et le fou en fianchetto côté roi.
     */
    async #makeDragonMove(game: Chess): Promise<Move> {
        console.log('Bot AI: Indian King');
        let move: Move = {
            notation: '',
            type: -1,
        };

        const gimmickMove = await this.#dragonLogic(game);
        if(gimmickMove.type >= 0) {
            this.#lastRandomMove = this.#lastRandomMove-1;
            return gimmickMove;
        }

        const defaultMove = await this.#defaultMoveLogic(game, true, true);
        if(defaultMove.type >= 0) {
            this.#lastRandomMove = this.#lastRandomMove-1;
            return defaultMove;
        }

        return move;
    }

    // TODO: Choisir le behaviour directement puis l'interface utilisateur
    async makeMove(game: Chess): Promise<Move> {
        let move: Move = {
            notation: '',
            type: -1,
        };

        switch (this.#behaviour) {
            case "default":
                move = await this.#makeDefaultMove(game);
                break;

            //TODO: Récupérer game.history({verbose: true}) et si length > 1 utiliser startingFen = history[0].before
            case "stockfish-random": // Plutôt faire puzzle bot qui utilise aussi la bdd lichess
                move = await this.#makeStockfishRandomMove(game);
                break;

            case "stockfish-only": // Plutôt faire puzzle bot qui utilise aussi la bdd lichess
                move = await this.#makeStockfishOnlyMove(game);
                break;

            case "human":
                move = await this.#makeHumanMove(game);
                break;
            case "pawn-pusher":
                move = await this.#makePawnPusherMove(game);
                break;

            case "fianchetto-sniper":
                move = await this.#makeFianchettoEnjoyerMove(game);
                break;

            case "shy":
                move = await this.#makeShyMove(game);
                break;

            case "blundering":
                move = await this.#makeBlunderMove(game);
                break;

            case "drawish":
                move = await this.#makeDrawishMove(game);
                break;

            case "queen-player":
                move = await this.#makeQueenPlayerMove(game);
                break;

            case "botez-gambit":
                move = await this.#makeBotezGambitMove(game);
                break;

            case "gambit-fanatic":
                move = await this.#makeGambitFanaticMove(game);
                break;
            
            case "copycat":
                move = await this.#makeCopycatMove(game);
                break;

            case 'bongcloud':
                move = await this.#makeBongcloudMove(game);
                break;

            case 'exchanges-lover':
                move = await this.#makeExchangesLoverMove(game);
                break;

            case 'exchanges-hater':
                move = await this.#makeExchangesHaterMove(game);
                break;
            
            case 'cow-lover':
                move = await this.#makeCowLoverMove(game);
                break;

            case 'random-player':
                move = makeRandomMove(2, true, game);
                break;

            case 'chessable-master':
                initDefaultBotParams('Casual');
                move = await this.#makeChessableMasterMove(game);
                break;

            case 'auto-didacte':
                initDefaultBotParams('Advanced');
                move = await this.#makeAutoDidacteMove(game);
                break;

            case 'castle-destroyer':
                move = await this.#makeCastleDestroyerMove(game);
                break;

            case 'indian-king':
                move = await this.#makeIndianKingMove(game); 
                break;

            case 'stonewall':
                move = await this.#makeStonewallMove(game); 
                break;

            case 'dragon':
                move = await this.#makeDragonMove(game); 
                break;

            default:
                move = await this.#makeDefaultMove(game);
                break;
        }

        return move;
    }

    async makeHandMove(game: Chess, selectedPiece: string): Promise<Move> {
        let move: Move = {
            notation: '',
            type: -1,
        };

        let stockfishMoves: EvalResultSimplified[] = await this.#engine.findBestMoves(game.fen(), 12, this.#defaultBotParams.skillValue, 50, false);
        
        const bestMoveIndex = stockfishMoves.findIndex((evalRes) => this.#toolbox.getMovePiece(evalRes.bestMove, game.fen()).type === selectedPiece);
        move.notation = stockfishMoves[bestMoveIndex].bestMove;
        move.type = 2;
        return move;
    }

    async getBrainPieceChoice(game: Chess): Promise<string> {
        console.log(this.#botColor + ' réfléchit à une pièce à bouger');
        const move = await makeStockfishMove(this.#defaultBotParams, game, this.#engine);

        return game.get(this.#toolbox.getMoveOrigin(move.notation) || 'a1').type;
    }

    disable() {
        this.#engine.quit();
    }
}

export default BotsAI;


