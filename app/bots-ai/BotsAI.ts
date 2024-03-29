// TODO: Niveaux de difficulté Beginner, Casual, Intermediate, Advanced, Master, Maximum

import { Chess, Color, Square } from "chess.js";
import { fetchLichessDatabase } from "../libs/fetchLichess";
import Engine, { EvalResultSimplified } from "../engine/Engine";
import GameToolBox from "../game-toolbox/GameToolbox";
import { useEffect, useRef } from "react";

// Bots "humains"
// TODO: Jouent les coups trouvés dans la BDD de lichess puis stockfish prend le relai (déjà implanté)

// Bots "célébrités"
// TODO: Jouent les coups trouvés dans la BDD de chess.com pour des joueurs connus, puis stockfish

// Bots "miroirs"
// TODO: Jouent les coups trouvés dans la BDD de lichess ou chess.com de nos propres parties en utilisant le pseudo

// Bots à gimmick
// MultiPv 100, 'Classical' -> depth 14, 'Rapide' -> depth 12, 'Blitz' -> depth 10, 'Bullet' -> depth 8
// TODO: Lister les coups qui remplissent l'objectif désiré et piocher un coup dans un intervalle d'éval estimé en fonction de la difficulté
// TODO: Mélanger certains styles
// TODO: Pouvoir choisir la difficulté pour les bots gimmick sans que celà n'affecte trop leur comportement (ex: skillValue min etc..)

// TODO: Un bot qui aime jouer des sacrifices (sur le roque si possible) même quand ce n'est pas très bon
/* TODO: Un bot qui adore envoyer ses pions sur le roque adverse et faire un roque opposé
 *       (vérifier si le roi adverse est roqué et chercher des coups de pions correspondant au côté où le roi a roqué)
 */
/* TODO: Un bot qui détériore forcément sa position à chaque coup tant qu'on joue des coups solides, mais joue le meilleur coup si
 *       on blunder. Un fois la blunder passée, si on ne reblunder pas, le bot recommence à détériorer sa position.
 */
// TODO: Un bot qui joue les meilleurs coups mais à une profondeur très faible (Ne semble pas marcher)
// TODO: Un bot hyper agressif: mélange de gambit + sacrifice sur le roque

export type Move = {
    notation: string,
    type: number
}

export type Behaviour = 'default' | 'pawn-pusher' | 'fianchetto-sniper' | 'shy' | 'blundering' | 'drawish' | 'sacrifice-enjoyer' | 'exchanges-lover' | 'exchanges-hater' | 'queen-player' | 'botez-gambit' | 'castle-destroyer' | 'strategy-stranger' | 'openings-master' | 'openings-beginner' | 'random-player' | 'copycat' | 'bongcloud' | 'gambit-fanatic' | 'cow-lover' | 'hyper-aggressive';

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

    console.log(possiblesMovesFiltered);

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
    console.log(safePossibleMoves);
    if(safePossibleMoves.length < 1) safePossibleMoves = movesList;

    return safePossibleMoves;
}

function makeRandomMove(filterLevel: number, safeMoves: boolean, game: Chess): Move {
    //if(checkGameOver()) return;
    console.log('Make Random Move');
    
    const possibleMoves = game.moves();
    console.log(possibleMoves);
    let possiblesMovesFiltered = filterMoves(possibleMoves, filterLevel);

    let finalMovesList: string[] = possiblesMovesFiltered;

    if(safeMoves) finalMovesList = getSafeMovesOnly(possiblesMovesFiltered, game);

    const randomIndex = Math.floor(Math.random() * finalMovesList.length);
    console.log(finalMovesList[randomIndex]);

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

    console.log(pieceMoves);

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

    console.log(`Is last move \x1B[34m(${lastMove.san})\x1B[0m dangerous: \x1B[31m` + danger);

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
    console.log('Search Forced Stockfish Move');
    const playerColor = game.turn() === 'w' ? 'b' : 'w';
    let stockfishMove: Move = {
        notation: '',
        type: -1
    }  

    if(await isNearCheckmate(botParams.playForcedMate, botColor, game, engine, toolbox)){
        console.log('Play Forced Checkmate !');
        const stockfishRes = await engine.findBestMove(game.fen(), 12, 20);
        stockfishMove.notation = stockfishRes;
        stockfishMove.type = 3;
    }
    
    if(botParams.securityLvl > 0 && isLastMoveDangerous(game, playerColor)){
        console.log('Play Forced Stockfish Best Move !');
        const stockfishRes = await engine.findBestMove(game.fen(), botParams.skillValue, botParams.depth);
        stockfishMove.notation = stockfishRes;
        stockfishMove.type = 3;
    }

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
    let stockfishMove: Move = {
        notation: '',
        type: -1
    }

    const stockfishRes = await engine.findBestMove(game.fen(), botParams.depth, botParams.skillValue);
    console.log(stockfishRes);
    stockfishMove.notation = stockfishRes;
    stockfishMove.type = 2;

    return stockfishMove;
}

async function makeLichessMove(movesList: string[], databaseRating: string, fen: string): Promise<Move> {
    console.log('Make Lichess Move');
    let lichessMove = {san: "", uci: "", winrate: {white: 33, draws: 33, black: 33}};

    lichessMove = await fetchLichessDatabase(movesList, databaseRating, fen);

    console.log(lichessMove);

    if(databaseRating !== 'Maximum' && lichessMove?.san !== "" && lichessMove?.san !== undefined){
        return {
            notation: lichessMove.san,
            type: 1
        }
    }

    console.log("No more moves in the database !");
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
            const movesList = this.#toolbox.convertHistorySanToLan(this.#toolbox.convertPgnToHistory(game.pgn()));

            const lichessMove = await makeLichessMove(movesList, this.#botLevel, '');
            if(lichessMove.type >= 0){
                this.#lastRandomMove = this.#lastRandomMove-1;
                return lichessMove;
            } 
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
        console.log('Bot AI: Default behaviour');
        let move: Move = {
            notation: '',
            type: -1,
        };
        const movesList = this.#toolbox.convertHistorySanToLan(this.#toolbox.convertPgnToHistory(game.pgn()));

        const lichessMove = await makeLichessMove(movesList, this.#botLevel, '');
        if(lichessMove.type >= 0){
            this.#lastRandomMove = this.#lastRandomMove-1;
            return lichessMove;
        } 

        const forcedStockfishMove = await makeForcedStockfishMove(this.#defaultBotParams, this.#botColor, game, this.#engine, this.#toolbox);
        if(forcedStockfishMove.type >= 0) {
            this.#lastRandomMove = this.#lastRandomMove-1;
            return forcedStockfishMove;
        } 

        if(isRandomMovePlayable(this.#defaultBotParams, this.#botLevel, this.#lastRandomMove)) {
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

        console.log('Stockfish moves sorted');
        console.log(stockfishMoves);

        move.notation = stockfishMoves[0].bestMove;
        move.type = 2;

        return move;
    }

    /**
     * Joue le plus possible des coups de pions, souvent au détriment du développement de ses pièces.
     */
    async #makePawnPusherMove(game: Chess): Promise<Move> {
        console.log('Bot AI: Pawn Pusher');
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

        console.log('Stockfish moves sorted');
        console.log(stockfishMoves);

        move.notation = stockfishMoves[0].bestMove;
        move.type = 2;

        return move;
    }

    /**
     * Joue le plus possible des fianchettos.
     */
    async #makeFianchettoEnjoyerMove(game: Chess): Promise<Move> {
        console.log('Bot AI: Fianchetto Sniper');
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

        console.log('Stockfish moves sorted');
        console.log(stockfishMoves);

        move.notation = stockfishMoves[0].bestMove;
        move.type = 2;

        return move;
    }

    /**
     * Joue des coups très près les uns des autres.
     */
    async #makeShyMove(game: Chess): Promise<Move> {
        console.log('Bot AI: shy');
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

        console.log('Stockfish moves sorted');
        console.log(stockfishMoves);

        move.notation = stockfishMoves[0].bestMove;
        move.type = 2;

        return move;
    }

    /**
     * Joue les pires coups possibles.
     */
    async #makeBlunderMove(game: Chess): Promise<Move> {
        console.log('Bot AI: Blundering');
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

        console.log('Stockfish moves sorted');
        console.log(stockfishMoves);

        move.notation = stockfishMoves[0].bestMove;
        move.type = 2;

        return move;
    }

    /**
     * Joue les coups dont l'évaluation est la plus proche de 0.
     */
    async #makeDrawishMove(game: Chess): Promise<Move> {
        console.log('Bot AI: Drawish');
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

        console.log('Stockfish moves sorted');
        console.log(stockfishMoves);

        move.notation = stockfishMoves[0].bestMove;
        move.type = 2;

        return move;
    }

    /**
     * Joue le plus possible des coups de dame, souvent au détriment du développement de ses pièces.
     */
    async #makeQueenPlayerMove(game: Chess): Promise<Move> {
        console.log('Bot AI: Queen Player');
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

    async #botezGambitLogic(game: Chess): Promise<Move> {
        let move: Move = {
            notation: '',
            type: -1,
        };

        if(game.history().length > 40) {
            return move;
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

        console.log('Stockfish moves sorted');
        console.log(stockfishMoves);

        move.notation = stockfishMoves[0].bestMove;
        move.type = 2;

        return move;
    }

    /**
     * Aime sacrifier sa dame le plus rapidement possible.
     */
    async #makeBotezGambitMove(game: Chess): Promise<Move> {
        console.log('Bot AI: Botez Gambit');
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

    async #gambitFanaticLogic(game: Chess): Promise<Move> {
        let move: Move = {
            notation: '',
            type: -1,
        };

        let stockfishMoves: EvalResultSimplified[] = await this.#engine.findBestMoves(game.fen(), 10, 20, 50, false);
        console.log(game.history({verbose: true}));
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

        console.log('Stockfish moves sorted');
        console.log(stockfishMoves);

        move.notation = stockfishMoves[0].bestMove;
        move.type = 2;

        return move;
    }

    /**
     * Aime sortir l'adversaire de la théorie en jouant des Gambits dans l'ouverture.
     */
    async #makeGambitFanaticMove(game: Chess): Promise<Move> {
        console.log('Bot AI: Gambit Fanatic');
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
        
        console.log('Game history length: ' + game.history().length);
        const lastOpponentMove = game.history({verbose: true})[game.history().length-1].lan;
        const lastOpponentPiece = game.history({verbose: true})[game.history().length-1].piece;
        //console.log(game.history({verbose: true}));

        stockfishMoves = stockfishMoves.map((evalRes) => {
            let randBonus = 2;
            if(game.history().length > 20) randBonus = 0.3;
            let isCopycat = Math.abs(lastOpponentMove.charCodeAt(0) - evalRes.bestMove.charCodeAt(0)) === 0;
            isCopycat = isCopycat && (Math.abs(lastOpponentMove.charCodeAt(2) - evalRes.bestMove.charCodeAt(2)) === 0);
            isCopycat = isCopycat && (this.#toolbox.getMoveDistance(lastOpponentMove) === this.#toolbox.getMoveDistance(evalRes.bestMove));
            console.log('Random bonus: ' + randBonus);
            console.log(evalRes.bestMove + ' is copycat: ' + isCopycat);
            if(isCopycat){
                evalRes.eval = (evalMove(evalRes, this.#botColor, this.#toolbox) + randBonus).toString();
                return evalRes;
            }
            randBonus = randBonus/5;
            evalRes.eval = (evalMove(evalRes, this.#botColor, this.#toolbox) + randBonus).toString();
            return evalRes;
        });

        stockfishMoves.sort(compareEval);

        console.log('Stockfish moves sorted');
        console.log(stockfishMoves);

        move.notation = stockfishMoves[0].bestMove;
        move.type = 2;

        return move;
    }

    /**
     * Aime copier les coups de l'adversaire.
     */
    async #makeCopycatMove(game: Chess): Promise<Move> {
        console.log('Bot AI: Copycat');
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
        console.log(game.history({verbose: true}));
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

        console.log('Stockfish moves sorted');
        console.log(stockfishMoves);

        move.notation = stockfishMoves[0].bestMove;
        move.type = 2;

        return move;
    }

    /**
     * Joue le bongcloud.
     */
    async #makeBongcloudMove(game: Chess): Promise<Move> {
        console.log('Bot AI: Bongcloud');
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

        console.log('Stockfish moves sorted');
        console.log(stockfishMoves);

        move.notation = stockfishMoves[0].bestMove;
        move.type = 2;

        return move;
    }

    /**
     * Adore échanger les pièces.
     */
    async #makeExchangesLoverMove(game: Chess): Promise<Move> {
        console.log('Bot AI: Exchange Lover');
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

        console.log('Stockfish moves sorted');
        console.log(stockfishMoves);

        move.notation = stockfishMoves[0].bestMove;
        move.type = 2;

        return move;
    }

    /**
     * Évite les échanges autant que possible.
     */
    async #makeExchangesHaterMove(game: Chess): Promise<Move> {
        console.log('Bot AI: Exchange Hater');
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
                console.log(evalRes.bestMove + ' is bad: ' + badStartingCases.includes(moveOrigin));
                if(!badStartingCases.includes(moveOrigin)) {
                    evalRes.eval = (evalMove(evalRes, this.#botColor, this.#toolbox) + 2*randBonus).toString();
                    return evalRes;
                }
            }
            evalRes.eval = (evalMove(evalRes, this.#botColor, this.#toolbox)).toString();
            return evalRes;
        });

        stockfishMoves.sort(compareEval);

        console.log('Stockfish moves sorted');
        console.log(stockfishMoves);

        move.notation = stockfishMoves[0].bestMove;
        move.type = 2;

        return move;
    }

    /**
     * Joue la cow opening.
     */
    async #makeCowLoverMove(game: Chess): Promise<Move> {
        console.log('Bot AI: Cow Lover');
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
    async #makeOpeningsMasterMove(game: Chess): Promise<Move> {
        console.log('Bot AI: Openings Master');
        let move: Move = {
            notation: '',
            type: -1,
        };
        const openingsMasterParams: DefaultBotParams = {
            randMoveChance: 20, 
            randMoveInterval: 3, 
            filterLevel: 0,
            securityLvl: 0,
            skillValue: 2,
            depth: 12,
            playForcedMate: 0,
        }
        const movesList = this.#toolbox.convertHistorySanToLan(this.#toolbox.convertPgnToHistory(game.pgn()));

        const lichessMove = await makeLichessMove(movesList, 'Master', '');
        if(lichessMove.type >= 0){
            this.#lastRandomMove = this.#lastRandomMove-1;
            return lichessMove;
        }

        const stockfishMove = await makeStockfishMove(openingsMasterParams, game, this.#engine);
        console.log(stockfishMove);
        if(stockfishMove.type >= 0) {
            //this.#lastRandomMove = this.#lastRandomMove-1;
            return stockfishMove;
        } 

        return move;
    }

    /**
     * Joue très mal les ouvertures, mais assez bien le reste de la partie.
     */
    async #makeOpeningsBeginnerMove(game: Chess): Promise<Move> {
        console.log('Bot AI: Openings Beginner');
        let move: Move = {
            notation: '',
            type: -1,
        };
        const openingsBeginnerParams: DefaultBotParams = {
            randMoveChance: 3, 
            randMoveInterval: 15, 
            filterLevel: 3,
            securityLvl: 2,
            skillValue: 10,
            depth: 12,
            playForcedMate: 3,
        }

        const movesList = this.#toolbox.convertHistorySanToLan(this.#toolbox.convertPgnToHistory(game.pgn()));

        const lichessMove = await makeLichessMove(movesList, 'Beginner', '');
        if(lichessMove.type >= 0){
            this.#lastRandomMove = this.#lastRandomMove-1;
            return lichessMove;
        }

        const stockfishMove = await makeStockfishMove(openingsBeginnerParams, game, this.#engine);
        console.log(stockfishMove);
        if(stockfishMove.type >= 0) {
            //this.#lastRandomMove = this.#lastRandomMove-1;
            return stockfishMove;
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
                console.log(evalRes.bestMove + ': ' + eval(evalRes.bestMove.charAt(1)));
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

        console.log('Stockfish moves sorted');
        console.log(stockfishMoves);

        move.notation = stockfishMoves[0].bestMove;
        move.type = 2;

        return move;
    }

    /**
     * Attend que l'adversaire soit roqué pour roquer du côté opposé puis lui envoyer une marée de pions sur son roque.
     */
    // TODO: À améliorer
    async #makeCastleDestroyerMove(game: Chess): Promise<Move> {
        console.log('Bot AI: Castle Destroyer');
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

            case 'openings-master':
                move = await this.#makeOpeningsMasterMove(game);
                break;

            case 'openings-beginner':
                move = await this.#makeOpeningsBeginnerMove(game);
                break;

            case 'castle-destroyer':
                move = await this.#makeCastleDestroyerMove(game);
                break;

            default:
                move = await this.#makeDefaultMove(game);
                break;
        }

        console.log('Bot move : ');
        console.log(move);

        return move;
    }
}

export default BotsAI;


