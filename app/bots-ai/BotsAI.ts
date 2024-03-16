// TODO: Niveaux de difficulté Beginner, Casual, Intermediate, Advanced, Master, Maximum

import { Chess, Color } from "chess.js";
import { fetchLichessDatabase } from "../libs/fetchLichess";
import Engine, { EvalResultSimplified } from "../engine/Engine";
import GameToolBox from "../game-toolbox/GameToolbox";

// Bots "humains"
// TODO: Jouent les coups trouvés dans la BDD de lichess puis stockfish prend le relai (déjà implanté)

// Bots "célébrités"
// TODO: Jouent les coups trouvés dans la BDD de chess.com pour des joueurs connus, puis stockfish

// Bots "miroirs"
// TODO: Jouent les coups trouvés dans la BDD de lichess ou chess.com de nos propres parties en utilisant le pseudo

// Bots à gimmick
// MultiPv 100, 'Classical' -> depth 14, 'Rapide' -> depth 12, 'Blitz' -> depth 10, 'Bullet' -> depth 8
// TODO: Lister les coups qui remplissent l'objectif désiré et piocher un coup dans un intervalle d'éval estimé en fonction de la difficulté
// TODO: Un bot qui joue beaucoup de coups de pions
// TODO: Un bot qui aime jouer des fianchettos
// TODO: Un bot qui n'aime pas prendre de l'espace (style hippo/hedgehog/etc..)
// TODO: Un bot qui joue les pires coups possibles
// TODO: Un bot qui joue les coups qui amènent à la position la plus égale possible (éval ~ 0)
// TODO: Un bot qui aime jouer des sacrifices (sur le roque si possible) même quand ce n'est pas très bon
// TODO: Un bot qui adore échanger les pièces
// TODO: Un bot qui déteste échanger les pièces
// TODO: Un bot qui adore jouer sa dame
// TODO: Un bot qui adore SACRIFIER sa dame, puis joue au max ou presque
/* TODO: Un bot qui adore envoyer ses pions sur le roque adverse et faire un roque opposé
 *       (vérifier si le roi adverse est roqué et chercher des coups de pions correspondant au côté où le roi a roqué)
 */
/* TODO: Un bot qui détériore forcément sa position à chaque coup tant qu'on joue des coups solides, mais joue le meilleur coup si
 *       on blunder. Un fois la blunder passée, si on ne reblunder pas, le bot recommence à détériorer sa position.
 */
// TODO: Un bot qui joue très bien l'ouverture mais pas très bien le milieu de jeu et les finales
// TODO: Un bot qui joue mal l'ouverture mais plutôt bien le milieu de jeu et les finales
// TODO: Un bot qui joue les meilleurs coups mais à une profondeur très faible (Ne semble pas marcher)
// TODO: Un bot qui ne fait que des coups aléatoires

type Move = {
    notation: string,
    type: number
}

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

async function isNearCheckmate(maxMateValue: number, game: Chess, engine: Engine, toolbox: GameToolBox) {
    const playerColor = game.turn() === 'w' ? 'b' : 'w';
    const positionEval: EvalResultSimplified = await engine.evalPositionFromFen(game.fen(), 8);

    if(!positionEval.eval.includes('M')) return false;

    const mateValue = toolbox.getMateValue(positionEval.eval, playerColor);

    return mateValue > 0 && mateValue <= maxMateValue;

    return positionEval;
}

// TODO: Remplacer par stockfish puissance max si valeur checkmate <= valeur limite
function checkmateOpponent(game: Chess): Move {
    const allMoves = game.moves();
    let isCheckmate = false;
    const gameTest = new Chess();
    let checkMateMove = '';
    let moveType = -1;

    allMoves.forEach((testMove) => {
        if(!isCheckmate){
        gameTest.load(game.fen());
        gameTest.move(testMove);
        isCheckmate = gameTest.isCheckmate();
        if(isCheckmate){
            moveType = 3;
            checkMateMove = testMove;  
        } 
        }
    });

    return {
        notation: checkMateMove,
        type: moveType
    }
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
        playForcedMate = 1;
        break;
        case 'Casual':
        // ~1400 bot chess.com
        randMoveChance = 20;
        randMoveInterval = 5;
        filterLevel = 1;
        securityLvl = 2;
        skillValue = 2;
        depth = 10;
        playForcedMate = 2;
        break;
        case 'Intermediate':
        // 1700~1800 bot chess.comm
        randMoveChance = 10; 
        randMoveInterval = 10;
        filterLevel = 2;
        securityLvl = 2; 
        skillValue = 5; 
        depth = 12;
        playForcedMate = 3;
        break;
        case 'Advanced':
        // ~2000 bot chess.com
        randMoveChance = 3;
        randMoveInterval = 15;
        filterLevel = 3;
        securityLvl = 2;
        skillValue = 10;
        depth = 12;
        playForcedMate = 4;
        break;
        case 'Master':
        // ???
        randMoveChance = 1;
        randMoveInterval = 20;
        filterLevel = 4;
        securityLvl = 2;
        skillValue = 15;
        depth = 16;
        playForcedMate = 5;
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

// TODO: Un peu trop d'arguments
// TODO: Initier les paramètres par défaut dans le constructeur de la classe et directement les passer en paramètre
// TODO: makeStockfishMove() ne doit pas s'occuper de la génération des coups aléatoires
async function makeStockfishMove(level: string, lastRandomMove: number, game: Chess, engine: Engine, toolbox: GameToolBox): Promise<Move> {
    console.log('Make Stockfish Move');
    const playerColor = game.turn() === 'w' ? 'b' : 'w';
    const botParams = initDefaultBotParams(level);
    let stockfishMove: Move = {
        notation: '',
        type: -1
    }  
    
    if(await isNearCheckmate(botParams.playForcedMate, game, engine, toolbox)){
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
    
    // TODO: Voir s'il faut sortir ce bout de code de la fonction makeStockfishMove()
    if(level !== 'Maximum' && lastRandomMove <= -botParams.randMoveInterval){
        console.log('Play Forced Random Move !');
        console.log(`Random Move Interval: ${botParams.randMoveInterval}, Last Random Move: ${lastRandomMove}`);
        const randomRes = makeRandomMove(botParams.filterLevel, botParams.securityLvl > 1, game);
        stockfishMove.notation = randomRes.notation;
        stockfishMove.type = randomRes.type;
    }
    
    // TODO: Supprimer le quasi doublon avec la condition au dessus
    let rand = Math.random()*100;
    if(level !== 'Maximum' && rand <= botParams.randMoveChance && lastRandomMove < 1){
        console.log('Play Random Move !');
        console.log(`Random Move Interval: ${botParams.randMoveInterval}, Last Random Move: ${lastRandomMove}`);
        const randomRes = makeRandomMove(botParams.filterLevel, botParams.securityLvl > 1, game);
        stockfishMove.notation = randomRes.notation;
        stockfishMove.type = randomRes.type;
    }else{
        console.log('Play Stockfish Best Move !');
        const stockfishRes = await engine.findBestMove(game.fen(), botParams.skillValue, botParams.depth);
        stockfishMove.notation = stockfishRes;
        stockfishMove.type = 2;
    }

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

class BotsAI {

}


