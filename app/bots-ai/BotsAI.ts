// TODO: Niveaux de difficulté Beginner, Casual, Intermediate, Advanced, Master, Maximum

import { Chess, Color, DEFAULT_POSITION, Piece, Square } from "chess.js";
import { fetchLichessDatabase, getHandMoveFromLichessDB } from "../libs/fetchLichess";
import Engine, { EvalResultSimplified } from "../engine/Engine";
import GameToolBox from "../game-toolbox/GameToolbox";
import { useEffect, useRef } from "react";
const humanNames = require('human-names');

// Bots "célébrités"
// TODO: Jouent les coups trouvés dans la BDD de chess.com pour des joueurs connus, puis stockfish

// Bots "miroirs"
// TODO: Jouent les coups trouvés dans la BDD de lichess ou chess.com de nos propres parties en utilisant le pseudo


export type Move = {
    notation: string,
    type: number
}

// TODO: 'strategy-stranger' | 'sacrifice-enjoyer' | 'min-max | 'botdanov' | 'sharp-player' | 'closed' | 'open' | 'hyper-aggressive'
export type Behaviour = 'default' | 'stockfish-random' | 'stockfish-only' | 'human' | 'pawn-pusher' | 'fianchetto-sniper' | 'shy' | 'blundering' | 'drawish' | 'exchanges-lover' | 'exchanges-hater' | 'queen-player' | 'botez-gambit' | 'castle-destroyer' | 'chessable-master' | 'auto-didacte' | 'random-player' | 'semi-random' | 'copycat' | 'bongcloud' | 'gambit-fanatic' | 'cow-lover' | 'indian-king' | 'stonewall' | 'dragon' | 'caro-london';

type DefaultBotParams = {
    randMoveChance: number, 
    randMoveInterval: number, 
    filterLevel: number,
    securityLvl: number,
    elo: number,
    skillValueMin: number,
    skillValueMax: number,
    eloRange: number[],
    depth: number,
    playForcedMate: number,
}

function getLevelFromElo(elo: number) {
    if(elo < 800) return 'Beginner';
    if(elo < 1200) return 'Casual';
    if(elo < 1800) return 'Intermediate';
    if(elo < 2200) return 'Advanced';
    if(elo < 3200) return 'Master';
    return 'Maximum';
}

function convertChesscomEloToLichessElo(elo: number) {
    return elo + 300;
}

function createEloIntervals(from: number, to: number, intervalsNumber: number) {
    const intervalsArray = [];

    if(intervalsNumber < 1) return [];

    for(let i = 0; i <= intervalsNumber; i++) {
        intervalsArray.push(Math.round(from + (i/intervalsNumber)*(to - from)));
    }

    return intervalsArray;
}

function createSkillValueIntervals(from: number, to: number) {
    const intervalsArray = [];

    if(to <= from) return [];

    for(let i = 0; i <= (to - from); i++) {
        intervalsArray.push(from + i);
    }

    return intervalsArray;
}

function selectSkillValue(eloIntervals: number[], skillMin: number, elo: number) {
    if(eloIntervals.length < 1) return skillMin;
    
    let selectedSkillValue = skillMin;
    let maxDiff = 0;
    
    eloIntervals.forEach((interval, i) => {
        let rand = Math.random();
        let chances = Math.min(0.9, Math.min(interval, elo)/Math.max(interval, elo));
        /*console.log('Interval: ' + interval);
        console.log('Rand: ' + rand);
        console.log('Chances: ' + chances);
        console.log('diff: ' + (chances - rand)); */
        if(rand <= chances && maxDiff < (chances - rand)){
            selectedSkillValue = skillMin + i;
            //console.log('selectedSkillValue: ' + selectedSkillValue);
            maxDiff = chances - rand;
        }
    });

    //console.log(`Selected skill value for elo ${elo} ([${eloIntervals[0]}, ${eloIntervals.pop()}]): ${selectedSkillValue}`);
    
    return selectedSkillValue;
}

/**
 * Retourne une valeur aléatoire du skillLevel dans un intervalle qui dépend du Élo du bot.
 * @param eloRange 
 * @param elo 
 * @param skillMin 
 * @param skillMax 
 * @returns 
 */
function getSkillValue(eloRange: number[], elo: number, skillMin: number, skillMax: number) {
    if(eloRange.length < 2) throw new Error("L'intervalle d'Élo n'est pas bon ! " + eloRange);
    //console.log(`Elo Range: [${eloRange[0]}, ${eloRange[1]}]`);
    const iArray = createEloIntervals(eloRange[0], eloRange[1], skillMax - skillMin);
    //console.log(`Elo Intervals: `);
    //console.log(iArray);

    return selectSkillValue(iArray, skillMin, elo);
}

function testProba(fromElo: number, toElo: number, fromSkillValue: number, toSkillValue: number, elo: number, testsNumber: number) {
    const iArray = createEloIntervals(fromElo, toElo, toSkillValue - fromSkillValue);
    const results: number[] = [];
    const intervalsProba = new Array(toSkillValue - fromSkillValue);
    const skillValuesArray = createSkillValueIntervals(fromSkillValue, toSkillValue);
    let selectedSkillValue = fromSkillValue;
    
    console.log(iArray);
    console.log(skillValuesArray);
    
    for(let i = 0; i < testsNumber; ++i){
        selectedSkillValue = selectSkillValue(iArray, fromSkillValue, elo);
        results.push(selectedSkillValue);
    }
    
    console.log(results);
    
    skillValuesArray.forEach((interval, i) => {
        let occurencesNumber = 0;
        results.forEach(res => {
            if(res === interval) {
                occurencesNumber++;
            }
        })
        intervalsProba[i] = occurencesNumber; 
    })
    
    //console.log(intervalsProba);
    console.log(skillValuesArray);
    
    return intervalsProba.map(value => Math.round(value*100/testsNumber));
}

//const proba = testProba(1600, 2000, 5, 10, 1994, 10000);
//console.log(proba);

function getMoveDestination(move: string) {
    //Qd4 -> d4, Ngf3 -> f3, exd4 -> d4, Bb5+ -> b5, Re8# -> e8, e4 -> e4
    return move.match(/[a-h][1-8]/);
}

function correctCastleMove(lichessMove: Move, fen: string, toolbox: GameToolBox): Move {
    const lichessCastleNotations = ['e1a1', 'e1h1', 'e8a8', 'e8h8'];
    if(!lichessCastleNotations.includes(lichessMove.notation)) return lichessMove;
    if(!(toolbox.getMovePiece(lichessMove.notation, fen).type === 'k')) return lichessMove;

    switch (lichessMove.notation) {
        case 'e1a1':
            lichessMove.notation = 'e1c1';
            return lichessMove;
        case 'e1h1':
            lichessMove.notation = 'e1g1';
            return lichessMove;
        case 'e8a8':
            lichessMove.notation = 'e8c8';
            return lichessMove;
        case 'e8h8':
            lichessMove.notation = 'e8g8';
            return lichessMove;
    
        default:
            return lichessMove;
    }
}

//TODO: Prendre en entrée le classement Élo et déterminer ENSUITE le 'level'
function initDefaultBotParams(elo: number, timeControl: string): DefaultBotParams {
    const baseDetph = new Map([
        ['1+0', 8],
        ['3+0', 10],
        ['3+2', 10],
        ['10+0', 12],
        ['15+10', 12],
        ['30+20', 12],
        ['90+30', 16],
        ['infinite', 16],
      ]).get(timeControl) || 12;

    let randMoveChance = Math.max(3, 70 - Math.pow(elo, 1/1.8));
    let skillValueMin = 0;
    let skillValueMax = 20;
    let depth = 5;
    let filterLevel = 0; // Empèche de jouer certaines pièces lors d'un coup aléatoire
    let eloRange = [1200, 1800];

    /*
        0-250 -> securityLvl = 0
        250-600 -> securityLvl = 1
        600-1295 -> securityLvl = 2
        1295- 2400 -> securityLvl = 3
    */
    const securityLvl = Math.round(Math.max(0, Math.pow(elo, 1/4) - 3.5));

    // Empeche d'avoir un deuxième coup aléatoire avant le Xème coup
    let randMoveInterval = 5;

    let playForcedMate = 1; // Empèche de louper les mats en x quand x < ou = à playForcedMate

    //TODO: à implémenter quand le reste sera fait: plus il y a de pièces attaquées, plus la charge mentale augmente, plus 
    // les chances de commettre une erreur (randomMove) augmentent. Echanger des pièces réduit la charge mentale, maintenir
    // un clouage au contraire maintient cette charge mentale. Plus la partie avance, plus la charge mentale augmente (légèrement)
    let mentalChargeLimit = 100;

    const level = getLevelFromElo(elo);

    console.log(randMoveChance);

    switch (level) {
        case 'Beginner':
            // ~900 Elo (Bot chess.com) 
            randMoveInterval = 1; 
            filterLevel = 0;
            skillValueMin = 0;
            skillValueMax = 2;
            eloRange = [100, 699];
            depth = baseDetph;
            playForcedMate = 0;
            break;
        case 'Casual':
            // ~1400 bot chess.com
            randMoveInterval = 3;
            filterLevel = 1;
            skillValueMin = 0;
            skillValueMax = 4;
            eloRange = [700, 1199];
            depth = baseDetph;
            playForcedMate = 1;
            break;
        case 'Intermediate':
            // 1700~1800 bot chess.comm
            randMoveInterval = 5;
            filterLevel = 2; 
            skillValueMin = 2;
            skillValueMax = 8;
            eloRange = [1200, 1799]; 
            depth = baseDetph;
            playForcedMate = 2;
            break;
        case 'Advanced':
            // ~2000 bot chess.com
            randMoveInterval = 10;
            filterLevel = 3;
            skillValueMin = 6;
            skillValueMax = 14;
            eloRange = [1800, 2199];
            depth = baseDetph;
            playForcedMate = 3;
            break;
        case 'Master':
            // ???
            randMoveInterval = 15;
            filterLevel = 4;
            skillValueMin = 12;
            skillValueMax = 20;
            eloRange = [2200, 3199];
            depth = baseDetph;
            playForcedMate = 4;
            break;
        case 'Maximum':
            randMoveChance = 0;
            randMoveInterval = 0;
            filterLevel = 0;
            skillValueMin = 20;
            skillValueMax = 20;
            eloRange = [3200, 3200];
            depth = baseDetph + 4;
            break;
        default:
            randMoveChance = 10;
            skillValueMin = 8;
            skillValueMax = 12;
            depth = 12;
        break;
    }

    return {
        randMoveChance,
        randMoveInterval,
        filterLevel,
        securityLvl,
        elo,
        skillValueMin,
        skillValueMax,
        eloRange,
        depth,
        playForcedMate,
    }
}

function isRandomMovePlayable (botParams: DefaultBotParams, level: string, lastRandomMove: number): Boolean {
    let rand = Math.random()*100;
    const levelIsNotAtMax = level !== 'Maximum';
    const lastRandomMoveTooFar = lastRandomMove <= -botParams.randMoveInterval;
    const randomMoveChance = rand <= botParams.randMoveChance && lastRandomMove < 1;

    return levelIsNotAtMax && (lastRandomMoveTooFar || randomMoveChance);
}

async function makeStockfishMove(botParams: DefaultBotParams, game: Chess, engine: Engine): Promise<Move> {
    //console.log('Make Stockfish Move');
    //console.log(botParams);
    let stockfishMove: Move = {
        notation: '',
        type: -1
    }

    const skillValue = getSkillValue(botParams.eloRange, botParams.elo, botParams.skillValueMin, botParams.skillValueMax);

    const stockfishRes = await engine.findBestMove(game.fen(), botParams.depth, skillValue);
    stockfishMove.notation = stockfishRes;
    stockfishMove.type = 2;

    return stockfishMove;
}

async function makeLimitedStrengthMove(botParams: DefaultBotParams, game: Chess, engine: Engine): Promise<Move> {
    //console.log('makeLimitedStrengthMove');
    //console.log(botParams);
    let stockfishMove: Move = {
        notation: '',
        type: -1
    }

    const stockfishRes = await engine.findLimitedStrengthMove(game.fen(), 8);
    stockfishMove.notation = stockfishRes;
    stockfishMove.type = 2;

    return stockfishMove;
}

async function makeLichessMove(movesList: string[], botElo: number, fen: string, toolbox: GameToolBox): Promise<Move> {
    //console.log('Make Lichess Move');
    let lichessMove: Move = {
        notation: '',
        type: -1
    }
    let lichessResult = {san: "", uci: "", winrate: {white: 33, draws: 33, black: 33}};

    if(botElo >= 3200 || movesList.length > 42) return lichessMove;

    lichessResult = await fetchLichessDatabase(movesList, botElo, fen);

    lichessMove.notation = lichessResult.uci;

    if(lichessMove.notation !== "" && lichessMove.notation !== undefined){
        lichessMove.type = 1;
        return correctCastleMove(lichessMove, fen, toolbox);
    }

    //console.log("No more moves in the database !");
    return lichessMove;
}

function compareEval(evalA: EvalResultSimplified, evalB: EvalResultSimplified) {
    return eval(evalB.eval) - eval(evalA.eval);
}

function evalMove(move: EvalResultSimplified, botColor: Color, toolbox: GameToolBox): number {
    const baseValue = botColor === 'w' ? 100 : -100;
    if(move.eval.includes('#')) return baseValue/toolbox.getMateValue(move.eval, botColor, '#');
    return eval(move.eval);
}

function generateUsername(): string {
    const usernameNumber = Math.random() < 0.55 ? (Math.round(Math.random()*100)).toString() : (2020 - Math.round(Math.random()*70)).toString();
    const usernameSpeChar = Math.random() < 0.55 ? '' : (Math.random() < 0.7 ? '_' : '-');
    return humanNames.allRandom() + usernameSpeChar + usernameNumber;
}

class BotsAI {
    #engine: Engine;
    #toolbox: GameToolBox;
    #defaultBotParams: DefaultBotParams;
    #behaviour: Behaviour; 
    #botLevel: string;
    //#botElo: number;
    #lastRandomMove: number;
    #botColor: Color;
    #username: string;

    //TODO: Prendre en entrée le classement Élo et déterminer ENSUITE le 'level'
    constructor(behaviour: Behaviour, elo: number, botColor: Color, timeControl: string) {
        this.#engine = new Engine();
        this.#toolbox = new GameToolBox();
        //this.#botElo = elo;
        this.#botLevel = getLevelFromElo(elo);
        this.#behaviour = behaviour;
        this.#lastRandomMove = botColor === 'w' ? (-1)*Math.floor(Math.random()*3) - 1 : Math.floor(Math.random()*3) + 1;
        this.#botColor = botColor;
        this.#engine.init();
        this.#defaultBotParams = initDefaultBotParams(elo, timeControl);
        this.#username = generateUsername();

        console.log(this.#username);

        /* if(behaviour === 'stockfish-only') {
            this.#engine.setStrength(1400);
        } */
    }

    /*
        0-250 -> securityLvl = 0
        250-600 -> securityLvl = 1
        600-1295 -> securityLvl = 2
        1295- 2400 -> securityLvl = 3
    */
    //securityLvl = 0 -> joue n'importe quel coup
    //securityLvl = 1 -> ne joue pas une pièce sur une case défendue par un pion
    //securityLvl = 2 -> ne joue pas une pièce sur une case défendue par une pièce/pion et pas défendue par son camp
    //securityLvl = 3 -> ne joue pas une pièce sur une case défendue par une pièce/pion
    //TODO: securityLvl = 4 -> ne joue pas une pièce ou un pion sur une case défendue
    #makeRandomMove(filterLevel: number, securityLvl: number, game: Chess, botColor: Color): Move {
        //if(checkGameOver()) return;
        console.log('Make Random Move');

        const possibleMoves = game.moves();
        let possiblesMovesFiltered = this.#toolbox.filterMoves(possibleMoves, filterLevel);

        let finalMovesList: string[] = possiblesMovesFiltered;

        finalMovesList = this.#toolbox.getSafeMovesOnly(possiblesMovesFiltered, game.fen(), securityLvl, botColor);

        const randomIndex = Math.floor(Math.random() * finalMovesList.length);

        return {
            notation: finalMovesList[randomIndex],
            type: 4
        }
    }

    //Suivant le security level, ne prendre en compte que certaines attaques
    //SL 0 -> Ne détecte jamais le danger
    //SL 1 -> Danger qu'après une capture
    //SL 2 -> Danger si capture ou attaque avec une pièce de moindre valeur
    //TODO: SL 3 -> Danger si capture, attaque pièce de moindre valeur ou attaque pièce non protégée 
    #isLastMoveDangerous(game: Chess): {danger: boolean, dangerCases: {dangerCase: string, dangerValue: number}[] } {
        //console.log("Is last move dangerous ?");
        const history = JSON.parse(JSON.stringify(game.history({verbose: true})));
        const lastMove = history.pop();
        const gameTest = new Chess();

        //console.log('Security Level: ' + securityLvl);
    
        if(this.#defaultBotParams.securityLvl === 0 || lastMove === null || lastMove === undefined) return {
            danger: false,
            dangerCases: []
        };
    
        
        const previousFen = lastMove.before;
        
        gameTest.load(previousFen);
        gameTest.remove(lastMove.from);
        gameTest.put({type: lastMove.piece, color: lastMove.color}, lastMove.to);
        const pieceMoves = gameTest.moves({square: lastMove.to, verbose: true});
        
        let danger = false;
        const dangerCases: {dangerCase: string, dangerValue: number}[] = [];
    
        // Si le dernier coup est une capture, il faut obligatoirement réagir
        if(lastMove.san.match(/[x]/gm)) danger = true;
    
        pieceMoves.forEach(pieceMove => {
            const attackedCase = pieceMove.to;
            const squareInfos = gameTest.get(attackedCase);
    
            //console.log(squareInfos);
            if(squareInfos && squareInfos?.type !== 'p' && squareInfos?.color === this.#botColor) {
                const dangerValue = this.#toolbox.getExchangeValue(gameTest.fen(), pieceMove.lan);
                //console.log(`Danger: ${pieceMove.san} -> ${dangerValue}`);

                if(this.#defaultBotParams.securityLvl >= 2 && dangerValue > 0){
                    dangerCases.push({
                        dangerCase: attackedCase,
                        dangerValue: dangerValue
                    })
                    danger = true;
                }
            }
        });
    
        //console.log(`Is last move \x1B[34m(${lastMove.san})\x1B[0m dangerous: \x1B[31m` + danger);

        const ignoreDanger = Math.max(1, 50 - Math.pow(this.#defaultBotParams.elo, 1/1.8));

        if(danger && Math.random()*100 < ignoreDanger){
            danger = false;
            console.log(`${this.#username} ignore le danger !`);
        }
    
        return {
            danger: danger,
            dangerCases: dangerCases
        };
    }
    
    async #isNearCheckmate(maxMateValue: number, game: Chess) {
        const positionEval: EvalResultSimplified = await this.#engine.evalPositionFromFen(game.fen(), 10);
        if(!positionEval.eval.includes('#')) return false;
        
        const mateValue = this.#toolbox.getMateValue(positionEval.eval, this.#botColor, '#');
        //console.log(`Position eval: ${positionEval.eval}, checkmate distance: ${mateValue} (max: ${maxMateValue}) -> ${positionEval.bestMove}`);
        return mateValue > 0 && mateValue <= maxMateValue;
    }

    async #makeForcedCheckmate(game: Chess): Promise<Move> {
        const botColor = game.turn() === 'w' ? 'b' : 'w';
        let stockfishMove: Move = {
            notation: '',
            type: -1
        } 
    
        console.log(`${botColor} is forced to Checkmate`);
        const stockfishRes = await this.#engine.findBestMove(game.fen(), 20, 20);
        stockfishMove.notation = stockfishRes;
        stockfishMove.type = 3;
        //console.log(stockfishRes);
        return stockfishMove;
    }

    #makeForcedExchange(game: Chess): Move {
        let move: Move = {
            notation: '',
            type: -1,
        };

        const forceExchangeChance = new Map([
            ['Beginner', 100],
            ['Casual', 50],
            ['Intermediate', 25],
            ['Advanced', 10],
            ['Master', 5],
            ['Maximum', 0]
          ]).get(this.#botLevel) || 10;
        let hasForcedExchange = false;

        game.moves().forEach((possibleMove) => {
            if(!hasForcedExchange && this.#toolbox.isCapture(game.fen(), possibleMove)){
                const moveLan = this.#toolbox.convertMoveSanToLan(game.fen(), possibleMove);
                const rand = Math.fround(Math.random()*100);
                const captureValue = this.#toolbox.getExchangeValue(game.fen(), moveLan);
                const captureChance = Math.min(captureValue*forceExchangeChance, 90)
                //console.log(`Move: ${possibleMove} (value: ${captureValue}, capture chances: ${captureChance}, rand: ${rand})`);
                if(rand <= captureChance){
                    move.notation = moveLan;
                    move.type = 5
                    hasForcedExchange = true; 
                }
            }
        });

        if(move.type > 0) {
            console.log('Le bot est forcé de capturer en ' + this.#toolbox.getMoveDestination(move.notation));
        }

        return move;
    }

    //TODO: Si le bot ne réagit pas 'mal' à la menace, faire un coup humain plutôt que le meilleur coup de stockfish
    async #makeHumanThreatReaction(game: Chess, dangerCases: {dangerCase: string, dangerValue: number}[] ): Promise<Move> {
        let stockfishMove: Move = {
            notation: '',
            type: -1
        } 
        let humanReaction = false;

        /* const badReactionChanceBase = new Map([
            ['Beginner', 10],
            ['Casual', 5],
            ['Intermediate', 2],
            ['Advanced', 1],
            ['Master', 0.5],
            ['Maximum', 0]
          ]).get(this.#botLevel) || 10; */

        const badReactionChanceBase = Math.max(1, 30 - Math.pow(this.#defaultBotParams.elo, 1/2.3));

        //console.log("Attacked cases: ");
        //console.log(dangerCases);
        let stockfishMoves: EvalResultSimplified[] = await this.#engine.findBestMoves(game.fen(), 10, 20, 50, false);

        stockfishMoves = stockfishMoves.map((evalRes) => {
            const moveOrigin = this.#toolbox.getMoveOrigin(evalRes.bestMove);

            const {dangerCase, dangerValue} = dangerCases.find((dangerCase) => dangerCase.dangerCase === moveOrigin) || {dangerCase: '', dangerValue: 0};
            if(dangerValue !== 0) {
                //TODO: Il ne faudrait autoriser que les déplacements sur des cases safe
                const badReactionChance = badReactionChanceBase*Math.abs(dangerValue)
                const rand = Math.random()*100;
                let badReactionBonus = 0;

                if(rand <= badReactionChance){
                    badReactionBonus = Math.round(12 - Math.pow(this.#defaultBotParams.elo, 1/3));
                    humanReaction = true;
                }
                //console.log(`badReactionChanceBase: ${badReactionChanceBase}, badReactionChance: ${badReactionChance}, rand: ${rand}, badReactionBonus: ${badReactionBonus}`);
                //console.log(`${evalRes.bestMove} includes ${moveOrigin}`);
                //console.log(`Danger Case: ${dangerCase}, Danger Value: ${dangerValue}`);
                evalRes.eval = (evalMove(evalRes, this.#botColor, this.#toolbox) + badReactionBonus).toString();
                return evalRes;
            }

            evalRes.eval = (evalMove(evalRes, this.#botColor, this.#toolbox)).toString();
            return evalRes;
        });

        stockfishMoves.sort(compareEval);

        //console.log(stockfishMoves);

        stockfishMove.notation = stockfishMoves[0].bestMove;

        //if(dangerCases.includes(this.#toolbox.getMoveOrigin(stockfishMove.notation))) stockfishMove.type = 5;
        //Si humanReaction === false, type = -1 donc le coup n'est pas joué
        if(humanReaction) stockfishMove.type = 5;

        if(stockfishMove.type >= 0) {
            console.log('Le bot réagit mal à la menace et doit bouger sa pièce en ' + this.#toolbox.getMoveDestination(stockfishMove.notation))
        }

        return stockfishMove
    }

    async #makeTunelVisionMove(game: Chess): Promise<Move> {
        const newGame = new Chess(game.fen());
        const opponentColor = this.#botColor === 'b' ? 'w' : 'b';
        /* const forgotPieceChance = new Map([
            ['Beginner', 30],
            ['Casual', 20],
            ['Intermediate', 15],
            ['Advanced', 10],
            ['Master', 5],
            ['Maximum', 0]
          ]).get(this.#botLevel) || 10; */
        const forgotPieceChance = Math.max(1, (Math.round(55 - Math.sqrt(this.#defaultBotParams.elo))));
        let hasForgotten = false;
        let thingsForgotten = '';

        game.board().forEach((rank) => {
            rank.forEach((boardCase) => {
                if(boardCase?.color !== this.#botColor && (boardCase?.type === 'b' || boardCase?.type === 'q')){
                    const rand = Math.ceil(Math.random()*100);
                    //console.log("Random move result: " + rand);
                    const pieceInactivity = this.#toolbox.getPieceInactivity(game.history({verbose: true}), boardCase.square);
                    const inactivityBonusMult = 0.1 + Math.min(0.2*pieceInactivity, 1.5);
                    const forgotPieceChanceFinal = Math.ceil(forgotPieceChance*inactivityBonusMult);
                    //console.log(`Inactivité de la pièce en ${boardCase.square}: ${pieceInactivity} (mult: ${inactivityBonusMult})`);

                    if(boardCase?.type === 'b' && rand <= forgotPieceChanceFinal) {
                        //console.log('Oublie le fou en ' + boardCase.square);
                        thingsForgotten+= ` le fou en ${boardCase.square}`;
                        hasForgotten = true;
                        newGame.put({ type: 'p', color: opponentColor }, boardCase.square)
                    }
                    
                    if(boardCase?.type === 'q' && rand <= forgotPieceChance) {
                        //console.log('Oublie les déplacements en diagonale de la dame en ' + boardCase.square);
                        thingsForgotten+= ` les déplacements en diagonale de la dame en ${boardCase.square}`;
                        hasForgotten = true;
                        newGame.put({ type: 'r', color: opponentColor }, boardCase.square)
                    }

                    if(boardCase?.type === 'q' && rand <= forgotPieceChanceFinal) {
                        //console.log('Oublie la dame en ' + boardCase.square);
                        thingsForgotten+= ` la dame en ${boardCase.square}`;
                        hasForgotten = true;
                        newGame.put({ type: 'p', color: opponentColor }, boardCase.square)
                    }

                }
            })
        });

        //console.log(newGame.ascii());

        //TODO: Plutot utiliser makeStoskfishMoves() -> les 20 premiers et donner un bonus/malus pour les coups vers l'avant/l'arrière
        const stockfishMove = await makeStockfishMove(this.#defaultBotParams, newGame, this.#engine);
        
        if(hasForgotten) stockfishMove.type = 5;
        if(!this.#toolbox.isMoveValid(game.fen(), stockfishMove.notation)) stockfishMove.type = -1;

        if(stockfishMove.type === 5) {
            console.log(`Le bot ${this.#username} oublie:${thingsForgotten}`);
        }

        return stockfishMove;
    }

    async #ignoreOpponentMove(game: Chess): Promise<Move> {
        //const history = JSON.parse(JSON.stringify(game.history({verbose: true})));
        let fenBeforeOpponentMove = game.history({verbose: true}).pop()?.before || DEFAULT_POSITION;
        fenBeforeOpponentMove = this.#botColor === 'w' ? fenBeforeOpponentMove.replace(' b ', ' w ') : fenBeforeOpponentMove.replace(' w ', ' b ');
        const gameTest = new Chess();
        const ignoreOpponentMoveChance = Math.max(1, (Math.round(55 - Math.pow(this.#defaultBotParams.elo, 1/1.9))));
        let moveType = 5;

        if(Math.random()*100 > ignoreOpponentMoveChance) {
            return {
                notation: '',
                type: -1,
            }
        }

        try {
            //console.log(`${this.#username} ignore le dernier coup de l'adversaire !`);
            gameTest.load(fenBeforeOpponentMove);
    
            const stockfishMove = await makeStockfishMove(this.#defaultBotParams, gameTest, this.#engine);
            
            if(!this.#toolbox.isMoveValid(game.fen(), stockfishMove.notation)) {
                //console.log(`Le coup ${stockfishMove.notation} n'est pas jouable dans la position actuelle !`);
                moveType = -1;
            } 
    
            stockfishMove.type = moveType;

            if(stockfishMove.type >= 0) {
                console.log(`Le bot ${this.#username} ignore le dernier coup de l'adversaire`);
            }
    
            return stockfishMove; 
        } catch (error) {
            console.log(error);

            return {
                notation: '',
                type: -1,
            }
        }
        
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

            const lichessMove = await makeLichessMove(movesList, this.#defaultBotParams.elo, startingFen, this.#toolbox);
            if(lichessMove.type >= 0){
                return lichessMove;
            } 
            //console.log('No more moves in the Lichess Database for ' + this.#botColor);
        }

        const isNearCheckmateRes = await this.#isNearCheckmate(this.#defaultBotParams.playForcedMate, game) 
        if(isNearCheckmateRes) {
            const checkmateMove = await this.#makeForcedCheckmate(game);
            return checkmateMove;
        }

        const {danger, dangerCases} = this.#isLastMoveDangerous(game);

        //console.log("Le dernier coup est dangereux: " + danger);
    
        if(danger) {
            const reactingThreatMove = await makeStockfishMove(this.#defaultBotParams, game, this.#engine);
            if(reactingThreatMove.type >= 0 ){
                reactingThreatMove.type = 3;
                return reactingThreatMove;
            }
        }

        if(useRandom && isRandomMovePlayable(this.#defaultBotParams, this.#botLevel, this.#lastRandomMove)) {
            this.#lastRandomMove = this.#defaultBotParams.randMoveInterval;
            return this.#makeRandomMove(this.#defaultBotParams.filterLevel, this.#defaultBotParams.securityLvl, game, this.#botColor);
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
        console.log('Last Random Move: ' + this.#lastRandomMove);
        let move: Move = {
            notation: '',
            type: -1,
        };

        const defaultMove = await this.#defaultMoveLogic(game, true, true);
        if(defaultMove.type >= 0) {
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

    async #stockfishOnlyLogic(game: Chess, useDatabase: Boolean, useRandom: Boolean): Promise<Move> {
        let move: Move = {
            notation: '',
            type: -1,
        };

        const stockfishMove = await makeLimitedStrengthMove(this.#defaultBotParams, game, this.#engine);
        if(stockfishMove.type >= 0) {
            this.#lastRandomMove = this.#lastRandomMove-1;
            return stockfishMove;
        } 

        return move;
    }

    async #makeStockfishOnlyMove(game: Chess): Promise<Move> {
        //console.log('Bot AI: Stockfish Only behaviour');
        let move: Move = {
            notation: '',
            type: -1,
        };

        const defaultMove = await this.#stockfishOnlyLogic(game, false, false);
        if(defaultMove.type >= 0) {
            this.#lastRandomMove = this.#lastRandomMove-1;
            return defaultMove;
        }

        return move;
    }

    // TODO: isLastMoveDangerous ? Si oui -> plus le bot est faible, plus il aura envie de bouger la pièce
    async #humanMoveLogic(game: Chess, useDatabase: Boolean, useRandom: Boolean): Promise<Move> {
        //console.log('human logic: 0');
        if(useDatabase) {
            //const movesList = this.#toolbox.convertHistorySanToLan(this.#toolbox.convertPgnToHistory(game.pgn()));
            const startingFen = game.history().length > 0 ? game.history({verbose: true})[0].before : DEFAULT_POSITION;
            const movesList = this.#toolbox.convertHistorySanToLan(game.history(), startingFen);

            const lichessMove = await makeLichessMove(movesList, this.#defaultBotParams.elo, startingFen, this.#toolbox);
            if(lichessMove.type >= 0){
                //console.log(`${this.#botColor} make Lichess move`);
                return lichessMove;
            } 
            //console.log('No more moves in the Lichess Database for ' + this.#botColor);
        }
        //console.log('human logic: 1');

        //TODO: Cause un gros problème
        const isNearCheckmateRes = await this.#isNearCheckmate(this.#defaultBotParams.playForcedMate, game) 
        if(isNearCheckmateRes) {
            const checkmateMove = await this.#makeForcedCheckmate(game);
            return checkmateMove;
        }
        //console.log('human logic: 2');


        //this.#engine.stop();
        //const stockfishBestMoves: EvalResultSimplified[] = await this.#engine.findBestMoves(game.fen(), this.#defaultBotParams.depth, this.#defaultBotParams.skillValue, 3, false);
        //const stockfishBestMoves: EvalResultSimplified[] = await this.#engine.findBestMoves(game.fen(), 10, 20, 3, false);
        //console.log(game.fen());
        //console.log(stockfishBestMoves);
        //console.log(`Sans erreurs humaines, les 3 meilleurs coups de Stockfish sont: ${stockfishBestMoves[0]?.bestMove}, ${stockfishBestMoves[1]?.bestMove}, ${stockfishBestMoves[2]?.bestMove}`);
        //console.log(newGame.ascii());
        
        const {danger, dangerCases} = this.#isLastMoveDangerous(game);

        //console.log("Le dernier coup est dangereux: " + danger);

        if(!danger) {
            const forcedExchangeMove = this.#makeForcedExchange(game);

            if(forcedExchangeMove.type >= 0){
                this.#lastRandomMove = this.#lastRandomMove-1;
                return forcedExchangeMove;
            }
        }
        //console.log('human logic: 3');
    
        if(danger) {
            const reactingThreatMove = await this.#makeHumanThreatReaction(game, dangerCases);
            if(reactingThreatMove.type >= 0 ){
                return reactingThreatMove;
            }
            //console.log('human logic: 4');

            const tunelVisionMove = await this.#makeTunelVisionMove(game);

            if(tunelVisionMove.type >= 0) {
                if(tunelVisionMove.type === 5) console.log(`Human move (${tunelVisionMove.type}): ${this.#toolbox.convertMoveLanToSan(game.fen(), tunelVisionMove.notation)}`);
                this.#lastRandomMove = this.#lastRandomMove-1;
                return tunelVisionMove;
            }
            //console.log('human logic: 5');
        }
        //console.log('human logic: 6');

        if(useRandom && isRandomMovePlayable(this.#defaultBotParams, this.#botLevel, this.#lastRandomMove)) {
            this.#lastRandomMove = this.#defaultBotParams.randMoveInterval;
            return this.#makeRandomMove(this.#defaultBotParams.filterLevel, this.#defaultBotParams.securityLvl, game, this.#botColor);
        }
        //console.log('human logic: 7');

        const noOpponentMove = await this.#ignoreOpponentMove(game);

        if(noOpponentMove.type === 5) {
            this.#lastRandomMove = this.#lastRandomMove-1;
            return noOpponentMove;
        }
        //console.log('human logic: 8');

        // TODO: Faire en sorte que les débutant favorisent les coups vers l'avant et les échecs
        const tunelVisionMove = await this.#makeTunelVisionMove(game);

        if(tunelVisionMove.type > 0) {
            //console.log(`Human move (${tunelVisionMove.type}): ${this.#toolbox.convertMoveLanToSan(game.fen(), tunelVisionMove.notation)}`);
            this.#lastRandomMove = this.#lastRandomMove-1;
            return tunelVisionMove;
        } 
        //console.log('human logic: 9');

        const stockfishMove = await makeStockfishMove(this.#defaultBotParams, game, this.#engine);
        this.#lastRandomMove = this.#lastRandomMove-1;
        //console.log('human logic: 10');
        console.log(stockfishMove);

        return stockfishMove;
    }

    async #makeHumanMove(game: Chess): Promise<Move> {
        console.log('Bot AI: Human behaviour');
        //console.log('Last Random Move: ' + this.#lastRandomMove);
        let move: Move = {
            notation: '',
            type: -1,
        };

        const humanMove = await this.#humanMoveLogic(game, true, true);
        if(humanMove.type >= 0) {
            return humanMove;
        }

        const defaultMove = await this.#defaultMoveLogic(game, false, false);
        if(defaultMove.type >= 0) {
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
        
        const humanMove = await this.#humanMoveLogic(game, true, true);
        if(humanMove.type >= 0) {
            return humanMove;
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

        const skillValue = getSkillValue(
            this.#defaultBotParams.eloRange, 
            this.#defaultBotParams.elo, 
            this.#defaultBotParams.skillValueMin, 
            this.#defaultBotParams.skillValueMax
        );

        let stockfishMoves: EvalResultSimplified[] = await this.#engine.findBestMoves(game.fen(), 10, skillValue, 50, false);

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

        const humanMove = await this.#humanMoveLogic(game, true, true);
        if(humanMove.type >= 0) {
            return humanMove;
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

        const skillValue = getSkillValue(
            this.#defaultBotParams.eloRange, 
            this.#defaultBotParams.elo, 
            this.#defaultBotParams.skillValueMin, 
            this.#defaultBotParams.skillValueMax
        );

        let stockfishMoves: EvalResultSimplified[] = await this.#engine.findBestMoves(game.fen(), 10, skillValue, 50, false);

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

        const humanMove = await this.#humanMoveLogic(game, true, true);
        if(humanMove.type >= 0) {
            return humanMove;
        }

        const defaultMove = await this.#defaultMoveLogic(game, true, true);
        if(defaultMove.type >= 0) {
            this.#lastRandomMove = this.#lastRandomMove-1;
            return defaultMove;
        }

        return move;
    }

    #semiRandomLogic(game: Chess): Move {
        let move: Move = {
            notation: '',
            type: -1,
        };
        let maxValue = 0;

        game.moves({verbose: true}).forEach(possibleMove => {
            if(possibleMove.captured){
                let captureValue = this.#toolbox.getExchangeValue(game.fen(), possibleMove.lan) + 1 + Math.random()*1.5;

                if(captureValue >= maxValue){
                    maxValue = captureValue;
                    move.notation = possibleMove.lan;
                    move.type = 4;
                }
            }
        })

        return move;
    }

    #makeSemiRandomMove(game: Chess): Move {
        console.log('Make Semi Random Move');
        const gimmickMove = this.#semiRandomLogic(game);
        if(gimmickMove.type >= 0) {
            this.#lastRandomMove = this.#lastRandomMove-1;
            return gimmickMove;
        }

        const randomMove = this.#makeRandomMove(2, 2, game, this.#botColor);

        return randomMove;
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

    #queenPlayerOpenings(game: Chess): Move {
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
            if(formatedPGN === '1.e4 g6' || formatedPGN === '1.e4 Nf6') {
                move.notation = 'd1f3';
                move.type = 2;
                return move;
            }
            move.notation = 'd1h5';
            move.type = 2;
            return move;
        }

        if(game.history().length === 3) {
            move.notation = 'd8f6';
            move.type = 2;
            return move;
        }

        if(game.history().length === 4) {
            if(formatedPGN === '1.e4 e5 2.Qh5 g6' || formatedPGN === '1.e4 e5 2.Qh5 Nf6') {
                move.notation = 'h5e5';
                move.type = 2;
                return move;
            }
            if(formatedPGN === '1.e4 e5 2.Qh5 Nc6') {
                move.notation = 'f1c4';
                move.type = 2;
                return move;
            }
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

        let openingMove = this.#queenPlayerOpenings(game);
        if(openingMove.type >= 0) {
            return openingMove;
        }

        const pawnsCases: Square[] = ['c3', 'c4', 'c5', 'c6', 'e3', 'e4', 'e6', 'e5'];

        const skillValue = getSkillValue(
            this.#defaultBotParams.eloRange, 
            this.#defaultBotParams.elo, 
            this.#defaultBotParams.skillValueMin, 
            this.#defaultBotParams.skillValueMax
        );

        let stockfishMoves: EvalResultSimplified[] = await this.#engine.findBestMoves(game.fen(), 10, skillValue, 50, false);

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

        const humanMove = await this.#humanMoveLogic(game, true, true);
        if(humanMove.type >= 0) {
            return humanMove;
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

        if(game.history().length > 20) {
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
     * Aime sacrifier sa dame le plus rapidement possible !!!
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

        const humanMove = await this.#humanMoveLogic(game, true, true);
        if(humanMove.type >= 0) {
            return humanMove;
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

            // e4 e5 Nf3
            case '1.e4 e5 2.Nf3':
                if(rand <= 75){
                    move.notation = 'g8f6';
                    move.type = 2;
                    return move;
                }
                move.notation = 'b8c6';
                move.type = 2;
                return move;

            // Petrov's Defense (Modern Attack)
            case '1.e4 e5 2.Nf3 Nf6 3.d4':
                move.notation = 'f6e4';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.d4 Nxe4 4.dxe5':
                move.notation = 'd7d5';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.d4 Nxe4 4.Nxe5':
                move.notation = 'd7d5';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.d4 Nxe4 4.Bd3':
                move.notation = 'd7d5';
                move.type = 2;
                return move;

            // Petrov's Defense (d3?! Variation)
            case '1.e4 e5 2.Nf3 Nf6 3.d3':
                move.notation = 'c7c6';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.d3 c6 4.Nxe5':
                move.notation = 'd8a5';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.d3 c6 4.Bg5':
                move.notation = 'f8e7';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.d3 c6 4.Bg5 Be7 5.Nxe5':
                move.notation = 'd8a5';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.d3 c6 4.Be2':
                move.notation = 'f8e7';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.d3 c6 4.Be2 Be7 5.Nxe5':
                move.notation = 'd8a5';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.d3 c6 4.Nc3':
                move.notation = 'd7d5';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.d3 c6 4.Nc3 d5 5.exd5':
                move.notation = 'c6d5';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.d3 c6 4.Nc3 d5 5.exd5 cxd5 6.Nxe5':
                move.notation = 'd5d4';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.d3 c6 4.Nc3 d5 5.exd5 cxd5 6.Nxe5 d4 7.Ne4':
                move.notation = 'd8a5';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.d3 c6 4.Nc3 d5 5.exd5 cxd5 6.Nxe5 d4 7.Ne2':
                move.notation = 'd8a5';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.d3 c6 4.Nc3 d5 5.exd5 cxd5 6.Nxe5 d4 7.Nb1':
                move.notation = 'd8a5';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.d3 c6 4.Nc3 d5 5.exd5 cxd5 6.Nxe5 d4 7.Nb5':
                move.notation = 'd8a5';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.d3 c6 4.Nc3 d5 5.exd5 cxd5 6.Nxe5 d4 7.Na4':
                move.notation = 'd8a5';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.d3 c6 4.Nc3 d5 5.Nxe5':
                move.notation = 'd5d4';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.d3 c6 4.Nc3 d5 5.Nxe5 d4 6.Ne2':
                move.notation = 'd8a5';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.d3 c6 4.Nc3 d5 5.Nxe5 d4 6.Nb1':
                move.notation = 'd8a5';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.d3 c6 4.Nc3 d5 5.Nxe5 d4 6.Na4':
                move.notation = 'd8a5';
                move.type = 2;
                return move;

            // Petrov's Defense (Italian Variation)
            case '1.e4 e5 2.Nf3 Nf6 3.Bc4':
                move.notation = 'f6e4';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Bc4 Nxe4 4.Nxe5':
                move.notation = 'd7d5';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Bc4 Nxe4 4.Nxe5 d5 5.Bb3':
                move.notation = 'd8g5';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Bc4 Nxe4 4.Nxe5 d5 5.Qf3':
                move.notation = 'c8e6';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Bc4 Nxe4 4.Nxe5 d5 5.Qf3 Be6 6.Bb3':
                move.notation = 'd8g5';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Bc4 Nxe4 4.Nxe5 d5 5.Qf3 Be6 6.Bb3 Qg5 7.Nd3':
                move.notation = 'b8c6';
                move.type = 2;
                return move;

            // Petrov's Defense (Three Knights)
            case '1.e4 e5 2.Nf3 Nf6 3.Nc3':
                move.notation = 'b8c6';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nc3 Nc6 4.Bc4':
                move.notation = 'f6e4';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nc3 Nc6 4.Bc4 Nxe4 5.Nxe4':
                move.notation = 'd7d5';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nc3 Nc6 4.d4':
                move.notation = 'e5d4';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nc3 Nc6 4.d4 exd4 5.Nxd4':
                move.notation = 'f6e4';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nc3 Nc6 4.d4 exd4 5.Nxd4 Nxe4 6.Nxc6':
                move.notation = 'e4c3';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nc3 Nc6 4.d4 exd4 5.Nxd4 Nxe4 6.Nxe4':
                move.notation = 'd8e7';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nc3 Nc6 4.d4 exd4 5.Nxd4 Nxe4 6.Nxe4 Qe7 7.f3':
                move.notation = 'd7d5';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nc3 Nc6 4.d4 exd4 5.Nxd4 Nxe4 6.Nxe4 Qe7 7.Nxc6':
                move.notation = 'e5d4';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nc3 Nc6 4.d4 exd4 5.Nxd4 Nxe4 6.Nxe4 Qe7 7.Qd3':
                move.notation = 'd7d5';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nc3 Nc6 4.d4 exd4 5.Nxd4 Nxe4 6.Nxe4 Qe7 7.Bd3':
                move.notation = 'c6d4';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nc3 Nc6 4.d4 exd4 5.Nxd4 Nxe4 6.Nxe4 Qe7 7.Bd3 Nxd4 8.O-O':
                move.notation = 'd7d5';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nc3 Nc6 4.d4 exd4 5.Nxd4 Nxe4 6.Nxe4 Qe7 7.Qe2':
                move.notation = 'c6d4';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nc3 Nc6 4.d3':
                move.notation = 'd7d5';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nc3 Nc6 4.a3':
                move.notation = 'd7d5';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nc3 Nc6 4.Bb5':
                move.notation = 'c6d4';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nc3 Nc6 4.Bb5 Nd4 5.Nxd4':
                move.notation = 'e5d4';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nc3 Nc6 4.Bb5 Nd4 5.Nxd4 exd4 6.Ne2':
                move.notation = 'c7c6';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nc3 Nc6 4.Bb5 Nd4 5.Nxd4 exd4 6.Ne2 c6 7.Bd3':
                move.notation = 'd7d5';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nc3 Nc6 4.Bb5 Nd4 5.Nxe5':
                move.notation = 'd8e7';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nc3 Nc6 4.Bb5 Nd4 5.Nxe5 Qe7 6.Nf3':
                move.notation = 'd4b5';
                move.type = 2;
                return move;

            // Petrov's Defense (Staford Gambit)
            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5':
                move.notation = 'b8c6';
                move.type = 2;
                return move;
            
            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nf3':
                move.notation = 'f6e4';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nf3 Nxe4 5.Qe2':
                move.notation = 'd8e7';
                move.type = 2;
                return move;
            
            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.d4':
                move.notation = 'd8e7';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6':
                move.notation = 'd7c6';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.e5 Ne4 6.d3':
                move.notation = 'f8c5';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.e5 Ne4 6.d3 Bc5 7.Be3':
                move.notation = 'c5e3';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.e5 Ne4 6.d3 Bc5 7.Be3 Bxe3 8.fxe3':
                move.notation = 'd8h4';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.e5 Ne4 6.d3 Bc5 7.Be3 Bxe3 8.fxe3 Qh4+ 9.g3':
                move.notation = 'e4g3';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.e5 Ne4 6.d3 Bc5 7.Be3 Bxe3 8.fxe3 Qh4+ 9.g3 Nxg3 10.hxg3':
                move.notation = 'h4h1';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.e5 Ne4 6.d4':
                move.notation = 'd8h4';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.e5 Ne4 6.d4 Qh4 7.Be3':
                move.notation = 'c8g4';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.e5 Ne4 6.d4 Qh4 7.Be3 Bg4 8.Be2':
                move.notation = 'g4e2';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.e5 Ne4 6.d4 Qh4 7.Be3 Bg4 8.Be2 Bxe2 9.Qxe2':
                move.notation = 'e8c8';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.e5 Ne4 6.d4 Qh4 7.g3':
                move.notation = 'e4g3';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.e5 Ne4 6.d4 Qh4 7.Qf3':
                move.notation = 'f8e7';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.e5 Ne4 6.d4 Qh4 7.Qf3 Be7 8.Bd3':
                move.notation = 'e4g5';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.e5 Ne4 6.d4 Qh4 7.Qf3 Be7 8.g3':
                move.notation = 'e4g5';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.e5 Nd5 6.d4':
                move.notation = 'c6c5';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.e5 Nd5 6.d4 c5 7.c3':
                move.notation = 'c7c6';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.e5 Nd5 6.d4 c5 7.c4':
                move.notation = 'd5b4';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.e5 Nd5 6.d4 c5 7.c4 Nb4 8.a3':
                move.notation = 'b4c6';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.e5 Nd5 6.d4 c5 7.c4 Nb4 8.a3 Nc6 9.d5':
                move.notation = 'c6e5';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.e5 Nd5 6.d4 c5 7.Bc4':
                move.notation = 'd5b6';
                move.type = 2;
                return move;
            
            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.d3':
                move.notation = 'f8c5';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.d3 Bc5 6.h3':
                move.notation = 'c5f2';
                move.type = 2;
                return move;
            
            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.d3 Bc5 6.h3 Bxf2+ 7.Kxf2':
                move.notation = 'f6e4';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.d3 Bc5 6.h3 Bxf2+ 7.Kxf2 Nxe4+ 8.dxe4':
                move.notation = 'd8d1';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.d3 Bc5 6.h3 Bxf2+ 7.Kxf2 Nxe4+ 8.Kg1':
                move.notation = 'd8d4';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.d3 Bc5 6.h3 Bxf2+ 7.Kxf2 Nxe4+ 8.Kg1 Qd4+ 9.Kh2':
                move.notation = 'd4e5';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.d3 Bc5 6.h3 Bxf2+ 7.Kxf2 Nxe4+ 8.Kg1 Qd4+ 9.Kh2 Qe5+ 10.Kg1':
                move.notation = 'e5d4';
                move.type = 2;
                return move;
            
            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.d3 Bc5 6.h3 Bxf2+ 7.Kxf2 Nxe4+ 8.Ke1':
                move.notation = 'd8h4';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.d3 Bc5 6.h3 Bxf2+ 7.Kxf2 Nxe4+ 8.Ke1 Qh4+ 9.g3':
                move.notation = 'h4g3';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.d3 Bc5 6.Be2':
                move.notation = 'h7h5';
                move.type = 2;
                return move;
            
            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.d3 Bc5 6.Be2 h5 7.O-O':
                move.notation = 'f6g4';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.d3 Bc5 6.Be2 h5 7.Bg5':
                move.notation = 'd8d4';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.d3 Bc5 6.Be2 h5 7.h3':
                move.notation = 'd8d4';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.d3 Bc5 6.Be2 h5 7.Nc3':
                move.notation = 'f6g4';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.d3 Bc5 6.Be2 h5 7.Nc3':
                move.notation = 'f6g4';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.d3 Bc5 6.Be2 h5 7.c3':
                move.notation = 'f6g4';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.d3 Bc5 6.Be2 h5 7.c3 Ng4 8.d4':
                move.notation = 'c5d6';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.d3 Bc5 6.Be2 h5 7.c3 Ng4 8.d4 Bd6 9.h3':
                move.notation = 'd8h4';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.d3 Bc5 6.Be2 h5 7.c3 Ng4 8.d4 Bd6 9.h3 Qh4 10.g3':
                move.notation = 'd6g3';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.d3 Bc5 6.Bg5':
                move.notation = 'f6e4';
                move.type = 2;
                return move;
            
            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.d3 Bc5 6.Bg5 Nxe4 7.Bxd8':
                move.notation = 'c5f2';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.d3 Bc5 6.Bg5 Nxe4 7.dxe4':
                move.notation = 'c5f2';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.d3 Bc5 6.Bg5 Nxe4 7.dxe4 Bxf2+ 8.Ke2':
                move.notation = 'c8g4';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.d3 Bc5 6.Bg5 Nxe4 7.dxe4 Bxf2+ 8.Kxf2':
                move.notation = 'd8d1';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.d3 Bc5 6.Nc3':
                move.notation = 'f6g4';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.Nc3':
                move.notation = 'f8c5';
                move.type = 2;
                return move;
            
            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.Nc3 Bc5 6.Bc4':
                move.notation = 'f6g4';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.Nc3 Bc5 6.Bc4 Ng4 7.Qf3':
                move.notation = 'g4e5';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.Nc3 Bc5 6.Bc4 Ng4 7.Qf3 Ne5 8.Qe2':
                move.notation = 'd8e4';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.Nc3 Bc5 6.Bc4 Ng4 7.Qf3 Ne5 8.Qe2 Qh4 9.g3':
                move.notation = 'h4h3';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.Nc3 Bc5 6.Bc4 Ng4 7.Qf3 Ne5 8.Qe2 Qh4 9.g3 Qh3 10.d3':
                move.notation = 'c8g4';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.Nc3 Bc5 6.Bc4 Ng4 7.Qf3 Ne5 8.Qe2 Qh4 9.g3 Qh3 10.f4':
                move.notation = 'c8g4';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.Nc3 Bc5 6.Bc4 Ng4 7.Qf3 Ne5 8.Qe2 Qh4 9.O-O':
                move.notation = 'c8g4';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.Nc3 Bc5 6.Bc4 Ng4 7.Qf3 Ne5 8.Qe2 Qh4 9.O-O Bg4 10.Qe1':
                move.notation = 'e5f3';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.Nc3 Bc5 6.Bc4 Ng4 7.Qf3 Ne5 8.Qe2 Qh4 9.O-O Bg4 10.Qe1 Nf3+ 11.gxf3 Bxf3 12.Ne2':
                move.notation = 'h4g4';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.Nc3 Bc5 6.Bc4 Ng4 7.O-O':
                move.notation = 'd8h4';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.Nc3 Bc5 6.Bc4 Ng4 7.O-O Qh4 8.h3':
                move.notation = 'g4f2';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.Nc3 Bc5 6.Bc4 Ng4 7.O-O Qh4 8.h3 Nxf2 9.Qf3':
                move.notation = 'f2h3';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.Nc3 Bc5 6.Bc4 Ng4 7.O-O Qh4 8.h3 Nxf2 9.Qf3 Nxh3+ 10.Kh1':
                move.notation = 'h3f2';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.Nc3 Bc5 6.Bc4 Ng4 7.O-O Qh4 8.h3 Nxf2 9.Qf3 Nxh3+ 10.Kh1 Nf2+ 11.Kg1':
                move.notation = 'h4h1';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.Nc3 Bc5 6.d3':
                move.notation = 'f6g4';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.Nc3 Bc5 6.Be2':
                move.notation = 'd8d4';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.Nc3 Bc5 6.Be2 h5 7.d3':
                move.notation = 'f6g4';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.Nc3 Bc5 6.Be2 h5 7.d3 Ng4 8.O-O':
                move.notation = 'd8f6';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.Nc3 Bc5 6.Be2 h5 7.d3 Ng4 8.O-O Qf6 9.Bf3':
                move.notation = 'c8e6';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.Nc3 Bc5 6.Be2 h5 7.d3 Ng4 8.O-O Qf6 9.Bf3 Be6 10.Na4':
                move.notation = 'c5f2';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.Nc3 Bc5 6.Be2 h5 7.d3 Ng4 8.O-O Qf6 9.Bf3 Be6 10.Na4 Bxf2+ 11.Rxf2':
                move.notation = 'g4f2';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.Nc3 Bc5 6.Be2 h5 7.d3 Ng4 8.O-O Qf6 9.Bf3 Be6 10.Na4 Bxf2+ 11.Rxf2 Nxf2 12.Kxf2':
                move.notation = 'f6d4';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.Nc3 Bc5 6.Be2 h5 7.d3 Ng4 8.O-O Qf6 9.Bf3 Be6 10.Na4 Bxf2+ 11.Rxf2 Nxf2 12.Kxf2 Qd4+ 13.Be3':
                move.notation = 'd4a4';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.Nc3 Bc5 6.Be2 h5 7.h3':
                move.notation = 'd8d4';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.Nc3 Bc5 6.Be2 h5 7.h3 Qd4 8.O-O':
                move.notation = 'f6g4';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.Nc3 Bc5 6.Be2 h5 7.h3 Qd4 8.O-O Ng4 9.Bxg4':
                move.notation = 'h5g4';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.Nc3 Bc5 6.Be2 h5 7.h3 Qd4 8.O-O Ng4 9.Bxg4 hxg4 10.Ne2':
                move.notation = 'd4f6';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.Nc3 Bc5 6.Be2 h5 7.h3 Qd4 8.O-O Ng4 9.Bxg4 hxg4 10.Ne2 Qf6 11.d4':
                move.notation = 'g4h3';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.Nc3 Bc5 6.Be2 h5 7.h3 Qd4 8.O-O Ng4 9.Bxg4 hxg4 10.Ne2 Qf6 11.d4 gxh3 12.dxc5':
                move.notation = 'h3g2';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.Nc3 Bc5 6.Be2 h5 7.h3 Qd4 8.O-O Ng4 9.Bxg4 hxg4 10.Ne2 Qf6 11.d4 gxh3 12.dxc5 hxg2 13.Kxg2':
                move.notation = 'c8h3';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.Nc3 Bc5 6.Be2 h5 7.h3 Qd4 8.O-O Ng4 9.Bxg4 hxg4 10.Ne2 Qf6 11.d4 gxh3 12.dxc5 hxg2 13.Kxg2 Bh3+ 14.Kg1':
                move.notation = 'a8d8';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.Nc3 Bc5 6.Be2 h5 7.h3 Qd4 8.O-O Ng4 9.Bxg4 hxg4 10.hxg4':
                move.notation = 'd4e5';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.Nc3 Bc5 6.Be2 h5 7.h3 Qd4 8.O-O Ng4 9.Bxg4 hxg4 10.hxg4 Qe5 11.g3':
                move.notation = 'e5g3';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.Nc3 Bc5 6.Be2 h5 7.h3 Qd4 8.O-O Ng4 9.hxg4':
                move.notation = 'h5g4';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.Nc3 Bc5 6.Be2 h5 7.h3 Qd4 8.O-O Ng4 9.hxg4 hxg4 10.d3':
                move.notation = 'd4e5';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.Nc3 Bc5 6.Be2 h5 7.h3 Qd4 8.O-O Ng4 9.hxg4 hxg4 10.d3 Qe5 11.g3':
                move.notation = 'e5g3';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.Nc3 Bc5 6.Be2 h5 7.h3 Qd4 8.O-O Ng4 9.hxg4 hxg4 10.Bxg4':
                move.notation = 'd4e5';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.Nc3 Bc5 6.Be2 h5 7.h3 Qd4 8.O-O Ng4 9.hxg4 hxg4 10.Bxg4 Qe5 11.g3':
                move.notation = 'e5g3';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.Nc3 Bc5 6.Be2 h5 7.h3 Qd4 8.O-O Ng4 9.hxg4 hxg4 10.Bxg4 Qe5 11.Bh3':
                move.notation = 'h8h3';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.Nc3 Bc5 6.Be2 h5 7.O-O':
                move.notation = 'f6g4';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.Nc3 Bc5 6.Be2 h5 7.O-O Ng4 8.h3':
                move.notation = 'd8f6';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.Nc3 Bc5 6.Be2 h5 7.O-O Ng4 8.h3 Qf6 9.Bf3':
                move.notation = 'f6e5';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.Nc3 Bc5 6.Be2 h5 7.O-O Ng4 8.h3 Qf6 9.Qe1':
                move.notation = 'f6e5';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.Nc3 Bc5 6.Be2 h5 7.O-O Ng4 8.h3 Qf6 9.hxg4':
                move.notation = 'h5g4';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.Nc3 Bc5 6.Be2 h5 7.O-O Ng4 8.h3 Qf6 9.hxg4 hxg4 10.Bxg4':
                move.notation = 'f6g4';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.Nc3 Bc5 6.Be2 h5 7.O-O Ng4 8.h3 Qf6 9.hxg4 hxg4 10.Bxg4 Qh4 11.Bh3':
                move.notation = 'c8h3';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.Nc3 Bc5 6.Be2 h5 7.O-O Ng4 8.h3 Qf6 9.hxg4 hxg4 10.Bxg4 Qh4 11.Bh3 Bxh3 12.gxh3':
                move.notation = 'h4g3';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.Nc3 Bc5 6.Be2 h5 7.O-O Ng4 8.h3 Qf6 9.hxg4 hxg4 10.Bxg4 Qh4 11.Bh3 Bxh3 12.Qf3':
                move.notation = 'h3g4';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.Nc3 Bc5 6.h3':
                move.notation = 'b7b5';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.Nc3 Bc5 6.h3 b5 7.d3':
                move.notation = 'b5b4';
                move.type = 2;
                return move;

             case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.Nc3 Bc5 6.h3 b5 7.d3 b4 8.Na4':
                move.notation = 'c5f2';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.Nc3 Bc5 6.h3 b5 7.d3 b4 8.Na4 Bxf2+ 9.Kxf2':
                move.notation = 'f6e4';
                move.type = 2;
                return move;

             case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.Nc3 Bc5 6.h3 b5 7.d3 b4 8.Na4 Bxf2+ 9.Kxf2 Nxe4+ 10.Kg1':
                move.notation = 'd8d4';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.Bc4':
                move.notation = 'f8c5';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.Bc4 Bc5 6.O-O':
                move.notation = 'f6g4';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.Bc4 Bc5 6.O-O Ng4 7.h3':
                move.notation = 'g4f2';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.Bc4 Bc5 6.O-O Ng4 7.Qf3':
                move.notation = 'g4e5';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.Bc4 Bc5 6.O-O Ng4 7.Qf3 Ne5 8.Qb3':
                move.notation = 'd8h4';
                move.type = 2;
                return move;
            
            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.Bc4 Bc5 6.O-O Ng4 7.Qf3 Ne5 8.Qb3 Qh4 9.d3':
                move.notation = 'e5g4';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.Bc4 Bc5 6.d3':
                move.notation = 'f6g4';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.Bc4 Bc5 6.d3 Ng4 7.O-O':
                move.notation = 'd8h4';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.Bc4 Bc5 6.d3 Ng4 7.Be3':
                move.notation = 'c5e3';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.Bc4 Bc5 6.d3 Ng4 7.Be3 Bxe3 8.fxe3':
                move.notation = 'd8g5';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.Bc4 Bc5 6.d3 Ng4 7.Be3 Bxe3 8.fxe3 Qg5 9.Qf3':
                move.notation = 'g4e3';
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
                if(rand <= 30){
                    move.notation = 'f7f5';
                    move.type = 2;
                    return move;
                }
                if(rand > 90){
                    move.notation = 'c6d4';
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

            case '1.e4 e5 2.Nf3 Nc6 3.Bc4 Nf6 4.Ng5 Bc5 5.Nxf7':
                move.notation = 'c5f2';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nc6 3.Bc4 Nf6 4.Ng5 Bc5 5.Bxf7+':
                move.notation = 'e8e7';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nc6 3.Bc4 Nf6 4.Ng5 Bc5 5.Bxf7+ Ke7 6.Bb3':
                move.notation = 'h8f8';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nc6 3.Bc4 Nf6 4.Ng5 Bc5 5.Bxf7+ Ke7 6.Bc4':
                move.notation = 'h8f8';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nc6 3.Bc4 Nf6 4.Ng5 Bc5 5.Bxf7+ Ke7 6.Bd5':
                move.notation = 'h8f8';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nc6 3.Bc4 Nf6 4.Ng5 Bc5 5.Bxf7+ Ke7 6.O-O':
                move.notation = 'h7h6';
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

            case '1.d4 Nf6 2.c4 c5 3.d5':
                move.notation = 'b7b5';
                move.type = 2;
                return move;

            case '1.d4 Nf6 2.c4 c5 3.d5 b5 4.cxb5':
                move.notation = 'a7a6';
                move.type = 2;
                return move;

            case '1.d4 Nf6 2.c4 c5 3.d5 b5 4.cxb5 a6 5.bxa6':
                move.notation = 'g7g6';
                move.type = 2;
                return move;

            // Accelerated Catalan
            case '1.d4 Nf6 2.g3':
                move.notation = 'c7c5';
                move.type = 2;
                return move;

            // Trompowsky
            case '1.d4 Nf6 2.Bg5':
                move.notation = 'f6e4';
                move.type = 2;
                return move;

            case '1.d4 Nf6 2.Bg5 Ne4 3.Bf4':
                move.notation = 'c7c5';
                move.type = 2;
                return move;

            case '1.d4 Nf6 2.Bg5 Ne4 3.Bf4 c5 4.f3':
                move.notation = 'e4f6';
                move.type = 2;
                return move;

            case '1.d4 Nf6 2.Bg5 Ne4 3.Bf4 c5 4.f3 Nf6 5.d5':
                move.notation = 'f6h5';
                move.type = 2;
                return move;

            case '1.d4 Nf6 2.Bg5 Ne4 3.Bf4 c5 4.f3 Nf6 5.dxc5':
                move.notation = 'b7b6';
                move.type = 2;
                return move;

            case '1.d4 Nf6 2.Bg5 Ne4 3.Bh4':
                move.notation = 'c7c5';
                move.type = 2;
                return move;

            case '1.d4 Nf6 2.Bg5 Ne4 3.Bh4 c5 4.f3':
                move.notation = 'g7g5';
                move.type = 2;
                return move;

            case '1.d4 Nf6 2.Bg5 Ne4 3.h4':
                move.notation = 'c7c5';
                move.type = 2;
                return move;

            // d4 Nf3
            case '1.d4 Nf6 2.Nf3':
                move.notation = 'c7c5';
                move.type = 2;
                return move;

            // 1.Nf3
            case '1.Nf3':
                move.notation = 'g7g5';
                move.type = 2;
                return move;

            case '1.Nf3 g5 2.g3':
                move.notation = 'g5g4';
                move.type = 2;
                return move;

            case '1.Nf3 g5 2.d4':
                move.notation = 'g5g4';
                move.type = 2;
                return move;

            case '1.Nf3 g5 2.c4':
                move.notation = 'g5g4';
                move.type = 2;
                return move;

            case '1.Nf3 g5 2.Nxg5':
                move.notation = 'e7e5';
                move.type = 2;
                return move;

            case '1.Nf3 g5 2.Nxg5 e5 3.Nf3':
                move.notation = 'e5e4';
                move.type = 2;
                return move;

            case '1.Nf3 g5 2.Nxg5 e5 3.Nf3 e4 4.Nd4':
                move.notation = 'd7d5';
                move.type = 2;
                return move;

            case '1.Nf3 g5 2.Nxg5 e5 3.Nf3 e4 4.Nd4 d5 5.d3':
                move.notation = 'f8g7';
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
                if(rand <= 40){
                    move.notation = 'b2b3';
                    move.type = 2;
                    return move;
                }
                if(rand >= 70){
                    move.notation = 'c2c4';
                    move.type = 2;
                    return move;
                }
                move.notation = 'g1f3';
                move.type = 2;
                return move;
            case '1.e4 e6 2.c4 d5':
                move.notation = 'c4d5';
                move.type = 2;
                return move;
            case '1.e4 e6 2.c4 d5 3.cxd5 exd5':
                move.notation = 'd1b3';
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
                if(rand <= 40) {
                    move.notation = 'd2d4';
                    move.type = 2;
                    return move;
                }
                move.notation = 'g1f3';
                move.type = 2;
                return move;
            case '1.e4 d5 2.d4 dxe4':
                if(rand <= 60) {
                    move.notation = 'f2f3';
                    move.type = 2;
                    return move;
                }
                move.notation = 'b1c3';
                move.type = 2;
                return move;
            case '1.e4 d5 2.d4 dxe4 3.f3 exf3':
                if(rand <= 60) {
                    move.notation = 'g1f3';
                    move.type = 2;
                    return move;
                }
                move.notation = 'd1f3';
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

        const humanMove = await this.#humanMoveLogic(game, true, true);
        if(humanMove.type >= 0) {
            return humanMove;
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

        const humanMove = await this.#humanMoveLogic(game, true, true);
        if(humanMove.type >= 0) {
            return humanMove;
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

        const humanMove = await this.#humanMoveLogic(game, true, true);
        if(humanMove.type >= 0) {
            return humanMove;
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

        const skillValue = getSkillValue(
            this.#defaultBotParams.eloRange, 
            this.#defaultBotParams.elo, 
            this.#defaultBotParams.skillValueMin, 
            this.#defaultBotParams.skillValueMax
        );

        let stockfishMoves: EvalResultSimplified[] = await this.#engine.findBestMoves(game.fen(), 10, skillValue, 50, false);

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

        if(isRandomMovePlayable(this.#defaultBotParams, this.#botLevel, this.#lastRandomMove)) {
            this.#lastRandomMove = this.#defaultBotParams.randMoveInterval;
            return this.#makeRandomMove(this.#defaultBotParams.filterLevel, this.#defaultBotParams.securityLvl, game, this.#botColor);
        }

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

        const skillValue = getSkillValue(
            this.#defaultBotParams.eloRange, 
            this.#defaultBotParams.elo, 
            this.#defaultBotParams.skillValueMin, 
            this.#defaultBotParams.skillValueMax
        );

        let stockfishMoves: EvalResultSimplified[] = await this.#engine.findBestMoves(game.fen(), 10, skillValue, 50, false);

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

        if(isRandomMovePlayable(this.#defaultBotParams, this.#botLevel, this.#lastRandomMove)) {
            this.#lastRandomMove = this.#defaultBotParams.randMoveInterval;
            return this.#makeRandomMove(this.#defaultBotParams.filterLevel, this.#defaultBotParams.securityLvl, game, this.#botColor);
        }

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

        const humanMove = await this.#humanMoveLogic(game, true, true);
        if(humanMove.type >= 0) {
            return humanMove;
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

        const lichessMove = await makeLichessMove(movesList, 2500, '', this.#toolbox);
        if(lichessMove.type >= 0){
            return lichessMove;
        }

        const humanMove = await this.#humanMoveLogic(game, false, true);
        if(humanMove.type >= 0) {
            return humanMove;
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

        const lichessMove = await makeLichessMove(movesList, 500, '', this.#toolbox);
        if(lichessMove.type >= 0){
            return lichessMove;
        }

        const humanMove = await this.#humanMoveLogic(game, false, true);
        if(humanMove.type >= 0) {
            return humanMove;
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

        const skillValue = getSkillValue(
            this.#defaultBotParams.eloRange, 
            this.#defaultBotParams.elo, 
            this.#defaultBotParams.skillValueMin, 
            this.#defaultBotParams.skillValueMax
        );

        let stockfishMoves: EvalResultSimplified[] = await this.#engine.findBestMoves(game.fen(), 10, Math.max(10, skillValue), 50, false);
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

        const humanMove = await this.#humanMoveLogic(game, true, true);
        if(humanMove.type >= 0) {
            return humanMove;
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

        const pawnsCases: Square[] = ['b3', 'd3', 'd6'];
        const badPawnsCases: Square[] = ['d4', 'd5'];
        const bishopCases: Square[] = ['b2', 'g2', 'g7'];

        const skillValue = getSkillValue(
            this.#defaultBotParams.eloRange, 
            this.#defaultBotParams.elo, 
            this.#defaultBotParams.skillValueMin, 
            this.#defaultBotParams.skillValueMax
        );

        let stockfishMoves: EvalResultSimplified[] = await this.#engine.findBestMoves(game.fen(), 10, skillValue, 50, false);

        stockfishMoves = stockfishMoves.map((evalRes) => {
            const moveDestination = this.#toolbox.getMoveDestination(evalRes.bestMove);
            if(!moveDestination){
                evalRes.eval = (evalMove(evalRes, this.#botColor, this.#toolbox)).toString();
                return evalRes;
            }

            if(this.#toolbox.getMovePiece(evalRes.bestMove, game.fen()).type === 'p' && pawnsCases.includes(moveDestination)) {
                evalRes.eval = (evalMove(evalRes, this.#botColor, this.#toolbox) + 0.6).toString();
                return evalRes;
            }

            if(this.#toolbox.getMovePiece(evalRes.bestMove, game.fen()).type === 'p' && badPawnsCases.includes(moveDestination)) {
                evalRes.eval = (evalMove(evalRes, this.#botColor, this.#toolbox) - 0.9).toString();
                return evalRes;
            }

            if(this.#toolbox.getMovePiece(evalRes.bestMove, game.fen()).type === 'b' && bishopCases.includes(moveDestination)) {
                evalRes.eval = (evalMove(evalRes, this.#botColor, this.#toolbox) + 0.9).toString();
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

        const humanMove = await this.#humanMoveLogic(game, true, true);
        if(humanMove.type >= 0) {
            return humanMove;
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
                        evalRes.eval = (evalMove(evalRes, this.#botColor, this.#toolbox) + 0.9).toString();
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
                evalRes.eval = (evalMove(evalRes, this.#botColor, this.#toolbox) + 0.2).toString();
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

        const humanMove = await this.#humanMoveLogic(game, true, true);
        if(humanMove.type >= 0) {
            return humanMove;
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
            let rand = Math.random()*100;
            if(rand < 50) {
                move.notation = 'b1c3';
                move.type = 2;
                return move; 
            }
            move.notation = 'g2g3';
            move.type = 2;
            return move;
        }

        if(game.history().length === 3) {
            if(formatedPGN === '1.e4 c5 2.Nf3') {
                let rand = Math.random()*100;
                if(rand < 50) {
                    move.notation = 'b8c6';
                    move.type = 2;
                    return move; 
                }
                move.notation = 'g7g6';
                move.type = 2;
                return move;
            }
            if(formatedPGN === '1.e4 c5 2.Nc3') {
                let rand = Math.random()*100;
                if(rand < 80) {
                    move.notation = 'b8c6';
                    move.type = 2;
                    return move; 
                }
                move.notation = 'g7g6';
                move.type = 2;
                return move;
            }
            if(formatedPGN === '1.e4 c5 2.f4') {
                let rand = Math.random()*100;
                if(rand < 30) {
                    move.notation = 'b8c6';
                    move.type = 2;
                    return move; 
                }
                move.notation = 'g7g6';
                move.type = 2;
                return move;
            }

            if(formatedPGN === '1.e4 c5 2.d4') {
                move.notation = 'c5d4';
                move.type = 2;
                return move;
            }
        }

        if(game.history().length === 5) {
            if(formatedPGN === '1.e4 c5 2.Nf3 Nc6 3.Bb5') {
                move.notation = 'g7g6';
                move.type = 2;
                return move;
            }
            if(formatedPGN === '1.e4 c5 2.d4 cxd4 3.c3') {
                move.notation = 'd4c3';
                move.type = 2;
                return move;
            }
        }

        if(game.history().length === 7) {
            if(formatedPGN === '1.e4 c5 2.d4 cxd4 3.c3 dxc3 4.Nc3') {
                move.notation = 'g7g6';
                move.type = 2;
                return move;
            }
        }

        return move;
    }

    async #dragonLogic(game: Chess): Promise<Move> {
        let move: Move = {
            notation: '',
            type: -1,
        };

        if(game.history().length > 8) {
            return move;
        }

        let openingMove = this.#dragonOpenings(game);
        if(openingMove.type >= 0) {
            return openingMove;
        }


        const exchangesPawnsCases: Square[] = ['d4', 'd5'];
        const sidePawnsCases: Square[] = ['c5'];
        const badPawnStartingCases: Square[] = ['c4'];
        const fianchettoPawnsCases: Square[] = ['g3', 'g6'];
        const bishopCases: Square[] = ['g2', 'g7'];

        const skillValue = getSkillValue(
            this.#defaultBotParams.eloRange, 
            this.#defaultBotParams.elo, 
            this.#defaultBotParams.skillValueMin, 
            this.#defaultBotParams.skillValueMax
        );

        let stockfishMoves: EvalResultSimplified[] = await this.#engine.findBestMoves(game.fen(), 10, skillValue, 50, false);

        stockfishMoves = stockfishMoves.map((evalRes) => {
            const moveOrigin = this.#toolbox.getMoveOrigin(evalRes.bestMove);
            const moveDestination = this.#toolbox.getMoveDestination(evalRes.bestMove);
            if(!moveOrigin){
                evalRes.eval = (evalMove(evalRes, this.#botColor, this.#toolbox)).toString();
                return evalRes;
            }
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
                if(sidePawnsCases.includes(moveDestination) && !badPawnStartingCases.includes(moveOrigin)) {
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

        const humanMove = await this.#humanMoveLogic(game, true, true);
        if(humanMove.type >= 0) {
            return humanMove;
        }

        const defaultMove = await this.#defaultMoveLogic(game, true, true);
        if(defaultMove.type >= 0) {
            this.#lastRandomMove = this.#lastRandomMove-1;
            return defaultMove;
        }

        return move;
    }

    #caroLondonOpenings(game: Chess): Move {
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

        if(game.history().length === 1) {
            move.notation = 'c7c6';
            move.type = 2;
            return move;
        }

        if(game.history().length === 2) {
            if(formatedPGN === '1.d4 e5') {
                move.notation = 'd4e5';
                move.type = 2;
                return move;
            }
            if(formatedPGN === '1.d4 g5') {
                move.notation = 'c1g5';
                move.type = 2;
                return move;
            }
            move.notation = 'c1f4';
            move.type = 2;
            return move;
        }

        if(game.history().length === 3) {
            move.notation = 'd7d5';
            move.type = 2;
            return move;
        }

        return move;
    }

    async #caroLondonLogic(game: Chess): Promise<Move> {
        let move: Move = {
            notation: '',
            type: -1,
        };

        if(game.history().length > 3) {
            return move;
        }

        let openingMove = this.#caroLondonOpenings(game);
        if(openingMove.type >= 0) {
            return openingMove;
        }

        return move;
    }

    /**
     * Aime jouer un coup de pion sur le flanc (c4 ou c5) et le fou en fianchetto côté roi.
     */
    async #makeCaroLondonMove(game: Chess): Promise<Move> {
        console.log('Bot AI: Caro London');
        let move: Move = {
            notation: '',
            type: -1,
        };

        const gimmickMove = await this.#caroLondonLogic(game);
        if(gimmickMove.type >= 0) {
            this.#lastRandomMove = this.#lastRandomMove-1;
            return gimmickMove;
        }

        const humanMove = await this.#humanMoveLogic(game, true, true);
        if(humanMove.type >= 0) {
            return humanMove;
        }

        const defaultMove = await this.#defaultMoveLogic(game, true, true);
        if(defaultMove.type >= 0) {
            this.#lastRandomMove = this.#lastRandomMove-1;
            return defaultMove;
        }

        return move;
    }

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
                move = this.#makeRandomMove(2, 0, game, this.#botColor);
                break;

            case 'semi-random':
                move = this.#makeSemiRandomMove(game);
                break;

            case 'chessable-master':
                initDefaultBotParams(700, '3+0');
                move = await this.#makeChessableMasterMove(game);
                break;

            case 'auto-didacte':
                initDefaultBotParams(1800, '3+0');
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

            case 'caro-london':
                move = await this.#makeCaroLondonMove(game); 
                break;

            default:
                move = await this.#makeDefaultMove(game);
                break;
        }

        // TODO: Vérifier si ça peut faire match nul
        if(!move || this.#botLevel === 'Maximum') return move;
        const underPromoteMove = move.notation.match(/(?<move>.{4})[bnr]/)?.groups?.move;
        if(underPromoteMove) {
            console.log(move.notation + ' est une sous-promotion');
            move.notation = move.notation.replace(/.{4}[bnr]/, underPromoteMove + 'q');
        } 

        return move;
    }

    async makeHandMove(game: Chess, selectedPiece: string): Promise<Move> {
        let move: Move = {
            notation: '',
            type: -1,
        };

        const startingFen = game.history().length > 0 ? game.history({verbose: true})[0].before : DEFAULT_POSITION;
        const movesList = this.#toolbox.convertHistorySanToLan(game.history(), startingFen);

        const lichessMove = await getHandMoveFromLichessDB(selectedPiece, movesList, this.#botLevel, game.fen());
        if(lichessMove.type >= 0){
            console.log(`${this.#botColor} make Lichess move`);
            return correctCastleMove(lichessMove, game.fen(), this.#toolbox);
        } 

        const skillValue = getSkillValue(
            this.#defaultBotParams.eloRange, 
            this.#defaultBotParams.elo, 
            this.#defaultBotParams.skillValueMin, 
            this.#defaultBotParams.skillValueMax
        );

        let stockfishMoves: EvalResultSimplified[] = await this.#engine.findBestMoves(game.fen(), 12, skillValue, 50, false);
        
        const bestMoveIndex = stockfishMoves.findIndex((evalRes) => this.#toolbox.getMovePiece(evalRes.bestMove, game.fen()).type === selectedPiece);
        move.notation = stockfishMoves[bestMoveIndex].bestMove;
        move.type = 2;
        return move;
    }

    async getBrainPieceChoice(game: Chess): Promise<string> {
        console.log(this.#botColor + ' réfléchit à une pièce à bouger');

        const startingFen = game.history().length > 0 ? game.history({verbose: true})[0].before : DEFAULT_POSITION;
        const movesList = this.#toolbox.convertHistorySanToLan(game.history(), startingFen);

        const lichessMove = await makeLichessMove(movesList, this.#defaultBotParams.elo, startingFen, this.#toolbox);
        if(lichessMove.type >= 0){
            console.log(`${this.#botColor} make Lichess move`);
            return game.get(this.#toolbox.getMoveOrigin(lichessMove.notation) || 'a1').type;
        } 
        console.log('No more moves in the Lichess Database for ' + this.#botColor);


        const move = await makeStockfishMove(this.#defaultBotParams, game, this.#engine);

        return game.get(this.#toolbox.getMoveOrigin(move.notation) || 'a1').type;
    }

    getUsername() {
        return this.#username;
    }

    getElo() {
        return this.#defaultBotParams.elo;
    }

    changeColor(newColor: Color) {
        this.#botColor = newColor;
        this.#lastRandomMove = this.#botColor === 'w' ? (-1)*Math.floor(Math.random()*3) - 1 : Math.floor(Math.random()*3) + 1;
    }

    new(newBehaviour: Behaviour, newElo: number, newColor: Color, timeControl: string) {
        this.#engine.newGame();
        this.#lastRandomMove = this.#botColor === 'w' ? (-1)*Math.floor(Math.random()*3) - 1 : Math.floor(Math.random()*3) + 1;
        this.#botColor = newColor;
        this.#botLevel = getLevelFromElo(newElo);
        this.#behaviour = newBehaviour;
        this.#username = generateUsername();
        this.#engine.init();
        this.#defaultBotParams = initDefaultBotParams(newElo, timeControl);
    }

    reset() {
        this.#engine.newGame();
        this.#lastRandomMove = this.#botColor === 'w' ? (-1)*Math.floor(Math.random()*3) - 1 : Math.floor(Math.random()*3) + 1;
    }

    pause() {
        this.#engine.stop();
    }

    disable() {
        this.#engine.quit();
    }
}

export default BotsAI;

