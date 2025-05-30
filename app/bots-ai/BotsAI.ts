// TODO: Niveaux de difficulté Beginner, Casual, Intermediate, Advanced, Master, Maximum

import { Chess, Color, DEFAULT_POSITION, Piece, Square, validateFen } from "chess.js";
import { fetchLichessDatabase, getHandMoveFromLichessDB } from "../libs/fetchLichess";
import Engine, { EvalResultSimplified } from "../engine/Engine";
import GameToolBox from "../game-toolbox/GameToolbox";
import { useEffect, useRef } from "react";
import { StaticImageData } from "next/image";
const humanNames = require('human-names');

import indianKing_pp from "@/public/Bots_images/chess3d_indian-king.jpg";
import cowLover_pp from "@/public/Bots_images/chess3d_cow-lover.jpg";
import hippo_pp from "@/public/Bots_images/chess3d_hippo.jpg";
import knightsDance_pp from "@/public/Bots_images/chess3d_knights-dance.jpg";
import stockfishOnly_pp from "@/public/Bots_images/chess3d_stockfish-only.jpg";
import human_pp from "@/public/Bots_images/chess3d_human.jpg";
import pawnsPusher_pp from "@/public/Bots_images/chess3d_pawns-pusher.jpg";
import shy_pp from "@/public/Bots_images/chess3d_shy.jpg";
import blundering_pp from "@/public/Bots_images/chess3d_blundering.jpg";
import drawish_pp from "@/public/Bots_images/chess3d_drawish.jpg";
import exchangesLover_pp from "@/public/Bots_images/chess3d_exchanges-lover.jpg";
import exchangesHater_pp from "@/public/Bots_images/chess3d_exchanges-hater.jpg";
import queenPlayer_pp from "@/public/Bots_images/chess3d_queen-player.jpg";
import castleDestroyer_pp from "@/public/Bots_images/chess3d_castle-destroyer.jpg";
import chessableMaster_pp from "@/public/Bots_images/chess3d_chessable-master.jpg";
import autodidacte_pp from "@/public/Bots_images/chess3d_autodidacte.jpg";
import randomPlayer_pp from "@/public/Bots_images/chess3d_random.jpg";
import semiRandom_pp from "@/public/Bots_images/chess3d_semi-random.jpg";
import botezGambit_pp from "@/public/Bots_images/chess3d_botez-gambit.jpg";
import copycat_pp from "@/public/Bots_images/chess3d_copycat.jpg";
import bongcloud_pp from "@/public/Bots_images/chess3d_bongcloud.jpg";
import gambitFanatic_pp from "@/public/Bots_images/chess3d_gambit-fanatic.jpg";
import stonewall_pp from "@/public/Bots_images/chess3d_stone-wall.jpg";
import dragon_pp from "@/public/Bots_images/chess3d_dragon.jpg";
import caroLondon_pp from "@/public/Bots_images/chess3d_caro-london.jpg";
import homemadeEngine_pp from "@/public/Bots_images/chess3d_homemade-engine.jpg";

import speedrun_male01 from "@/public/Speedrun_opponents/males/speedrun_male01.jpg";
import speedrun_male02 from "@/public/Speedrun_opponents/males/speedrun_male02.jpg";
import speedrun_male03 from "@/public/Speedrun_opponents/males/speedrun_male03.jpg";
import speedrun_male04 from "@/public/Speedrun_opponents/males/speedrun_male04.jpg";
import speedrun_male05 from "@/public/Speedrun_opponents/males/speedrun_male05.jpg";
import speedrun_male06 from "@/public/Speedrun_opponents/males/speedrun_male06.jpg";
import speedrun_male07 from "@/public/Speedrun_opponents/males/speedrun_male07.jpg";
import speedrun_male08 from "@/public/Speedrun_opponents/males/speedrun_male08.jpg";
import speedrun_male09 from "@/public/Speedrun_opponents/males/speedrun_male09.jpg";
import speedrun_male10 from "@/public/Speedrun_opponents/males/speedrun_male10.jpg";
import speedrun_male11 from "@/public/Speedrun_opponents/males/speedrun_male11.jpg";
import speedrun_male12 from "@/public/Speedrun_opponents/males/speedrun_male12.jpg";
import speedrun_male13 from "@/public/Speedrun_opponents/males/speedrun_male13.jpg";
import speedrun_male14 from "@/public/Speedrun_opponents/males/speedrun_male14.jpg";
import speedrun_male15 from "@/public/Speedrun_opponents/males/speedrun_male15.jpg";
import speedrun_male16 from "@/public/Speedrun_opponents/males/speedrun_male16.jpg";
import speedrun_male17 from "@/public/Speedrun_opponents/males/speedrun_male17.jpg";
import speedrun_male18 from "@/public/Speedrun_opponents/males/speedrun_male18.jpg";
import speedrun_male19 from "@/public/Speedrun_opponents/males/speedrun_male19.jpg";
import speedrun_male20 from "@/public/Speedrun_opponents/males/speedrun_male20.jpg";

import speedrun_female01 from "@/public/Speedrun_opponents/females/speedrun_female01.jpg";
import speedrun_female02 from "@/public/Speedrun_opponents/females/speedrun_female02.jpg";
import speedrun_female03 from "@/public/Speedrun_opponents/females/speedrun_female03.jpg";
import speedrun_female04 from "@/public/Speedrun_opponents/females/speedrun_female04.jpg";
import speedrun_female05 from "@/public/Speedrun_opponents/females/speedrun_female05.jpg";
import speedrun_female06 from "@/public/Speedrun_opponents/females/speedrun_female06.jpg";
import speedrun_female07 from "@/public/Speedrun_opponents/females/speedrun_female07.jpg";
import speedrun_female08 from "@/public/Speedrun_opponents/females/speedrun_female08.jpg";
import speedrun_female09 from "@/public/Speedrun_opponents/females/speedrun_female09.jpg";
import speedrun_female10 from "@/public/Speedrun_opponents/females/speedrun_female10.jpg";
import speedrun_female11 from "@/public/Speedrun_opponents/females/speedrun_female11.jpg";
import speedrun_female12 from "@/public/Speedrun_opponents/females/speedrun_female12.jpg";
import speedrun_female13 from "@/public/Speedrun_opponents/females/speedrun_female13.jpg";
import speedrun_female14 from "@/public/Speedrun_opponents/females/speedrun_female14.jpg";
import speedrun_female15 from "@/public/Speedrun_opponents/females/speedrun_female15.jpg";
import speedrun_female16 from "@/public/Speedrun_opponents/females/speedrun_female16.jpg";
import speedrun_female17 from "@/public/Speedrun_opponents/females/speedrun_female17.jpg";
import speedrun_female18 from "@/public/Speedrun_opponents/females/speedrun_female18.jpg";
import speedrun_female19 from "@/public/Speedrun_opponents/females/speedrun_female19.jpg";
import speedrun_female20 from "@/public/Speedrun_opponents/females/speedrun_female20.jpg";
import { Timestamp } from "../components/Clock";
import HomemadeEngine from "../homemade-engine/HomemadeEngine";

// Bots "célébrités"
// TODO: Jouent les coups trouvés dans la BDD de chess.com pour des joueurs connus, puis stockfish

// Bots "miroirs"
// TODO: Jouent les coups trouvés dans la BDD de lichess ou chess.com de nos propres parties en utilisant le pseudo


export type Move = {
    notation: string,
    type: number,
    moveInfos?: string,
}

export type BotDescription  = {
    name: string,
    description: string,
    image: StaticImageData,
}

// TODO: 'strategy-stranger' | 'sacrifice-enjoyer' | 'min-max | 'botdanov' | 'sharp-player' | 'closed' | 'open' | 'hyper-aggressive'
export type Behaviour = 'default' | 'homemade-engine' | 'stockfish-random' | 'stockfish-only' | 'human' | 'pawn-pusher' | 'fianchetto-sniper' | 'shy' | 'blundering' | 'drawish' | 'exchanges-lover' | 'exchanges-hater' | 'queen-player' | 'botez-gambit' | 'castle-destroyer' | 'chessable-master' | 'auto-didacte' | 'random-player' | 'semi-random' | 'copycat' | 'bongcloud' | 'gambit-fanatic' | 'sacrifice-fanatic' | 'cow-lover' | 'indian-king' | 'stonewall' | 'dragon' | 'caro-london' | 'knights-dance' | 'naive-player';

type DefaultBotParams = {
    randMoveChance: number, 
    randMoveInterval: number, 
    filterLevel: number,
    securityLvl: number,
    elo: number,
    skillValue: number,
    eloRange: number[],
    depth: number,
    playForcedMate: number,
}

export const botsInfo = new Map<Behaviour, BotDescription>([
    ['human', {name: 'Judith', description: "Judith joue comme un humain et fera les mêmes erreurs qu'un humain de même Élo.", image: human_pp }],
    ['stockfish-only', {name: 'Stockfish', description: "Stockfish s'adapte au niveau du joueur mais n'aura pas un comportement humain.", image: stockfishOnly_pp}],
    ['indian-king', {name: 'Radjah', description: "Radjah joue tout le temps l'ouverture Est-Indienne, que ce soit avec les blancs ou les noirs", image: indianKing_pp}],
    ['auto-didacte', {name: 'Emma', description: "Emma a toujours aimé tout apprendre par elle même. Ses connaissances dans les ouvertures sont très limitées mais elle se débrouille bien dans le milieu de jeu.", image: autodidacte_pp}],
    ['blundering', {name: 'Worstfish', description: "Ce devait être le moteur d'échecs le plus performant au monde.. Malheureusement à cause d'une erreur de signe dans son code binaire, il ne joue que les pires coups de la position.", image: blundering_pp}],
    ['bongcloud', {name: 'Hika', description: "Hika sait que dans les finales, il est important de mettre son roi au centre. Alors pourquoi perdre du temps et ne pas le faire dès le début avec l'ouverture 'Bongcloud' ?", image: bongcloud_pp}],
    ['botez-gambit', {name: 'Andrea', description: "Andrea se considère comme une reine et n'aime pas partager sa place. C'est pour celà qu'elle aime sacrifier sa reine en début de partie car il ne peut n'y en avoir qu'une !", image: botezGambit_pp}],
    ['caro-london', {name: 'James', description: "James aime les ouvertures solides quite à renoncer à challenger son adversaire. Il joue le système de Londres avec les blancs et la caro-kann ou la slav avec les noirs.", image: caroLondon_pp}],
    ['castle-destroyer', {name: 'Ragnar', description: "Ragnar aime la bagarre et n'est pas là pour conséder la nulle ! Il n'hésitera pas à envoyer des marées de pions sur le roque adverse voir à sacrifier une pièce pour attaquer votre roi, même si le sacrifice est douteux !", image: castleDestroyer_pp}],
    ['chessable-master', {name: 'Jenna', description: "Jenna est une femme très studieuse. Elle collectionne les cours Chessable sur les ouvertures des plus grands maîtres d'échecs ! Malheureusement, une fois sortie de la théorie elle aura un peu plus de mal à trouver les bons coups.", image: chessableMaster_pp}],
    ['naive-player', {name: 'Theo', description: "Theo se fait souvent avoir lorsqu'on lui tend des pièges dans l'ouverture.", image: speedrun_male01}],
    ['copycat', {name: 'Mr. Mime', description: "Mr. Mime a une technique simple pour ne pas s'embêter à apprendre les coups dans l'ouverture: il jouera de façon symétrique jusqu'à pousser l'adversaire à l'erreur.", image: copycat_pp}],
    ['cow-lover', {name: 'Marguerite', description: "Marguerite est la première vache au monde a avoir appris à jouer aux échecs. Elle jouera la Cow opening que ce soit avec les blancs ou avec les noirs.", image: cowLover_pp}],
    ['knights-dance', {name: 'Tango', description: "Tango aime jouer ses cavaliers dans l'ouverture. Il aime VRAIMENT jouer ses cavaliers dans l'ouverture !", image: knightsDance_pp}],
    ['dragon', {name: 'Pyro', description: "Pyro aime prendre le centre avec un pion de l'aile et placer son fou en fianchetto pour qu'il puisse cracher ses flammes tel un dragon !", image: dragon_pp}],
    ['drawish', {name: 'François', description: "François est un homme ennuyant, avec un boulot ennuyant et une femme qui le trompe. Il compte bien vous entrainer dans sa vie insipide en jouant des positions les plus égales possibles.", image: drawish_pp}],
    ['stonewall', {name: 'Robert', description: "Robert le golem aime construire un mur de pion impénétrable et solide comme la roche. C'est donc tout naturellement qu'il joue l'ouverture stonewall avec les blancs comme avec les noirs.", image: stonewall_pp}],
    ['shy', {name: 'Lucie', description: "Lucie est timide et a peur de trop avancer ses pièces de peur de se les faire manger. Elle essaiera d'avancer ses pièces le moins possible dans le camp adverse.", image: shy_pp}],
    ['semi-random', {name: 'Georges Sr.', description: "Georges Sr. a plus d'expérience que son fils. Il joue des coups aléatoires mais sait comment les captures marchent aux échecs et n'hésitera pas à en faire s'il en a la possibilité.", image: semiRandom_pp}],
    ['random-player', {name: 'Georges Jr.', description: "Georges Jr. est un singe à qui on a appris à jouer aux échecs. Enfin 'appris' est un bien grand mot, il sait comment les pièces se déplacent mais à part ça ses coups sont totalement aléatoires !", image: randomPlayer_pp}],
    ['queen-player', {name: 'Martin', description: "Martin sait que la Dame est la pièce la plus forte. C'est donc pour ça qu'il essaiera de la jouer le plus tôt possible dans l'ouverture.", image: queenPlayer_pp}],
    ['pawn-pusher', {name: 'Lucas', description: "Lucas sait que les pions valent moins que les pièces. C'est pour ça qu'il aime les envoyer au combat tout en laissant ses pièces à l'abris dans son camp.", image: pawnsPusher_pp}],
    ['gambit-fanatic', {name: 'Joker', description: "Joker aime sortir ses adversaires des sentiers battus et les entrainer dans les profondeurs obscures de la foret. Il ne vous laissera aucun répis et vous donnera du fil à retordre dès l'ouverture avec des gambits agressifs !", image: gambitFanatic_pp}],
    ['sacrifice-fanatic', {name: 'Brian', description: "Brian aime jouer des coups brillants en sacrifiant ses pièces afin d'obtenir un avantage positionnel.", image: speedrun_male13}],
    ['fianchetto-sniper', {name: 'Hippo', description: "Ne vous fiez pas à l'apparente tranquilité de l'hippopotame, il peut se réveler être un animal très dangereux et agressif. Il en va de même pour l'ouverture Hippopotamus !", image: hippo_pp}],
    ['exchanges-hater', {name: 'Emmeline', description: "Emmeline est de nature pacifiste et évitera le plus possible les échanges de pièces", image: exchangesHater_pp}],
    ['exchanges-lover', {name: 'Jason', description: "Jason aime l'action et cherchera le plus possible à capturer les pièces adverses.", image: exchangesLover_pp}],
    ['homemade-engine', {name: 'Simplet', description: "Simplet aime appliquer les principes de base aux Échecs. Il développe ses pièces, essaie de controler le centre et il défend ses pièces en prise même s'il lui arrive de rater des tactiques plus complexes.", image: homemadeEngine_pp }],

]);

const speedrun_opponents = new Map<string, StaticImageData>([
    ['male1', speedrun_male01],
    ['male2', speedrun_male02],
    ['male3', speedrun_male03],
    ['male4', speedrun_male04],
    ['male5', speedrun_male05],
    ['male6', speedrun_male06],
    ['male7', speedrun_male07],
    ['male8', speedrun_male08],
    ['male9', speedrun_male09],
    ['male10', speedrun_male10],
    ['male11', speedrun_male11],
    ['male12', speedrun_male12],
    ['male13', speedrun_male13],
    ['male14', speedrun_male14],
    ['male15', speedrun_male15],
    ['male16', speedrun_male16],
    ['male17', speedrun_male17],
    ['male18', speedrun_male18],
    ['male19', speedrun_male19],
    ['male20', speedrun_male20],
    ['female1', speedrun_female01],
    ['female2', speedrun_female02],
    ['female3', speedrun_female03],
    ['female4', speedrun_female04],
    ['female5', speedrun_female05],
    ['female6', speedrun_female06],
    ['female7', speedrun_female07],
    ['female8', speedrun_female08],
    ['female9', speedrun_female09],
    ['female10', speedrun_female10],
    ['female11', speedrun_female11],
    ['female12', speedrun_female12],
    ['female13', speedrun_female13],
    ['female14', speedrun_female14],
    ['female15', speedrun_female15],
    ['female16', speedrun_female16],
    ['female17', speedrun_female17],
    ['female18', speedrun_female18],
    ['female19', speedrun_female19],
    ['female20', speedrun_female20],
]);

//const STOCKFISH_TIMEOUT = new Promise<Move>((res) => setTimeout(() => res({notation: '', type: -1, moveInfos: 'Temps écoulé !'}), 10000));

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

/* function createSkillValueIntervals(from: number, to: number) {
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
        if(rand <= chances && maxDiff < (chances - rand)){
            selectedSkillValue = skillMin + i;
            //console.log('selectedSkillValue: ' + selectedSkillValue);
            maxDiff = chances - rand;
        }
    });

    //console.log(`Selected skill value for elo ${elo} ([${eloIntervals[0]}, ${eloIntervals.pop()}]): ${selectedSkillValue}`);
    
    return selectedSkillValue;
} */

/**
 * Retourne une valeur aléatoire du skillLevel dans un intervalle qui dépend du Élo du bot.
 * @param eloRange 
 * @param elo 
 * @param skillMin 
 * @param skillMax 
 * @returns 
 */
/* function getSkillValue(eloRange: number[], elo: number, skillMin: number, skillMax: number) {
    if(eloRange.length < 2) throw new Error("L'intervalle d'Élo n'est pas bon ! " + eloRange);
    //console.log(`Elo Range: [${eloRange[0]}, ${eloRange[1]}]`);
    const iArray = createEloIntervals(eloRange[0], eloRange[1], skillMax - skillMin);
    //console.log(`Elo Intervals: `);
    //console.log(iArray);

    return selectSkillValue(iArray, skillMin, elo);
} */

/* function testProba(fromElo: number, toElo: number, fromSkillValue: number, toSkillValue: number, elo: number, testsNumber: number) {
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
} */

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
    let skillValue = Math.max(0, Math.min(20, Math.round(Math.pow(1.06, Math.sqrt(elo)) - 1)));
    let depth = 5;
    let filterLevel = 0; // Empèche de jouer certaines pièces lors d'un coup aléatoire
    let eloRange = [1200, 1800];

    //console.log(`Le bot d'un Élo de ${elo} a un skill de ${skillValue}`);

    /*
        0-325 -> securityLvl = 0
        325-755 -> securityLvl = 1
        755-1525 -> securityLvl = 2
        1525- 2770 -> securityLvl = 3
    */
    const securityLvl = Math.round(Math.max(0, Math.pow(elo, 1/4) - 3.75));

    // Empeche d'avoir un deuxième coup aléatoire avant le Xème coup
    let randMoveInterval = 5;

    let playForcedMate = 1; // Empèche de louper les mats en x quand x < ou = à playForcedMate

    //TODO: à implémenter quand le reste sera fait: plus il y a de pièces attaquées, plus la charge mentale augmente, plus 
    // les chances de commettre une erreur (randomMove) augmentent. Echanger des pièces réduit la charge mentale, maintenir
    // un clouage au contraire maintient cette charge mentale. Plus la partie avance, plus la charge mentale augmente (légèrement)
    let mentalChargeLimit = 100;

    const level = getLevelFromElo(elo);

    //console.log(randMoveChance);

    switch (level) {
        case 'Beginner':
            // ~900 Elo (Bot chess.com) 
            randMoveInterval = 1; 
            filterLevel = 0;
            eloRange = [100, 699];
            depth = baseDetph;
            playForcedMate = 0;
            break;
        case 'Casual':
            // ~1400 bot chess.com
            randMoveInterval = 3;
            filterLevel = 1;
            eloRange = [700, 1199];
            depth = baseDetph;
            playForcedMate = 1;
            break;
        case 'Intermediate':
            // 1700~1800 bot chess.comm
            randMoveInterval = 5;
            filterLevel = 2; 
            eloRange = [1200, 1799]; 
            depth = baseDetph;
            playForcedMate = 2;
            break;
        case 'Advanced':
            // ~2000 bot chess.com
            randMoveInterval = 10;
            filterLevel = 3;
            eloRange = [1800, 2199];
            depth = baseDetph;
            playForcedMate = 3;
            break;
        case 'Master':
            // ???
            randMoveInterval = 15;
            filterLevel = 4;
            eloRange = [2200, 3199];
            depth = baseDetph;
            playForcedMate = 4;
            break;
        case 'Maximum':
            randMoveChance = 0;
            randMoveInterval = 0;
            filterLevel = 0;
            eloRange = [3200, 3200];
            depth = baseDetph + 4;
            break;
        default:
            randMoveChance = 10;
            depth = 12;
        break;
    }

    return {
        randMoveChance,
        randMoveInterval,
        filterLevel,
        securityLvl,
        elo,
        skillValue,
        eloRange,
        depth,
        playForcedMate,
    }
}

function isRandomMovePlayable (botParams: DefaultBotParams, level: string, lastRandomMove: number, blunderMult: number): Boolean {
    let rand = Math.random()*100;
    const levelIsNotAtMax = level !== 'Maximum';
    const lastRandomMoveTooFar = lastRandomMove <= -botParams.randMoveInterval;
    const randomMoveChance = rand <= botParams.randMoveChance*blunderMult && lastRandomMove < 1;

    return levelIsNotAtMax && (lastRandomMoveTooFar || randomMoveChance);
}

async function makeStockfishMove(botParams: DefaultBotParams, game: Chess, engine: Engine): Promise<Move> {
    //console.log('Make Stockfish Move');
    //console.log(botParams);
    let stockfishMove: Move = {
        notation: '',
        type: -1
    }

    //const stockfishRes = await engine.findBestMove(game.fen(), botParams.depth, botParams.skillValue);
    const stockfishRes = await engine.findBestMove_v3(game.fen(), botParams.depth, botParams.skillValue);
    stockfishMove.notation = stockfishRes;
    stockfishMove.type = 2;
    stockfishMove.moveInfos = `Make Stockfish Move: ${stockfishRes} est le coup choisi par Stockfish 16 pour une profondeur de ${botParams.depth} et une force de ${botParams.skillValue}.\n\n`;

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
        lichessMove.moveInfos = `Make Lichess Move: Lichess a trouvé le coup ${lichessResult.san} dans sa base de données.\n\n`;
        return correctCastleMove(lichessMove, fen, toolbox);
    }else {
        lichessMove.moveInfos = `Make Lichess Move: Le bot n'a pas trouvé de coup pour cette position (${fen}, rapid & classical, Élo: ${botElo}) dans la BDD Lichess.\n\n`;
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

function generateBotID(): number { 
    return Math.round(Math.random()*1000000000);
} 

function generateRandomProfile(): BotDescription {
    const usernameNumber = Math.random() < 0.55 ? (Math.round(Math.random()*100)).toString() : (2020 - Math.round(Math.random()*70)).toString();
    const usernameSpeChar = Math.random() < 0.55 ? '' : (Math.random() < 0.7 ? '_' : '-');
    //return humanNames.allRandom() + usernameSpeChar + usernameNumber;
    const rand = Math.random()*100;
    const randProfilePicture = Math.round(Math.random()*20);

    if(rand <= 50) {
        return {
            name: humanNames.maleRandom() + usernameSpeChar + usernameNumber,
            description: '',
            image: speedrun_opponents.get(`male${randProfilePicture}`) || speedrun_male01,
        }
    }else {
        return {
            name: humanNames.femaleRandom() + usernameSpeChar + usernameNumber,
            description: '',
            image: speedrun_opponents.get(`female${randProfilePicture}`) || speedrun_female01,
        }
    }
}

class BotsAI {
    #botID: number;
    #engine: Engine;
    #homemadeEngine: HomemadeEngine;
    #toolbox: GameToolBox;
    #defaultBotParams: DefaultBotParams;
    #behaviour: Behaviour; 
    #botLevel: string;
    //#botElo: number;
    #lastRandomMove: number;
    #botColor: Color;
    #username: string;
    #profilePicture: StaticImageData;

    //TODO: Prendre en entrée le classement Élo et déterminer ENSUITE le 'level'
    constructor(behaviour: Behaviour, elo: number, botColor: Color, timeControl: string, randomName: boolean) {
        this.#botID = generateBotID();
        this.#engine = new Engine();
        this.#homemadeEngine = new HomemadeEngine();
        this.#toolbox = new GameToolBox();
        //this.#botElo = elo;
        this.#botLevel = getLevelFromElo(elo);
        this.#behaviour = behaviour;
        this.#lastRandomMove = botColor === 'w' ? (-1)*Math.floor(Math.random()*3) - 1 : Math.floor(Math.random()*3) + 1;
        this.#botColor = botColor;
        this.#engine.init();
        this.#defaultBotParams = initDefaultBotParams(elo, timeControl);
        const botInfos: BotDescription = generateRandomProfile();
        this.#username = randomName ? botInfos.name : (botsInfo.get(behaviour)?.name || botInfos.name);
        this.#profilePicture = randomName ? botInfos.image : (botsInfo.get(behaviour)?.image || botInfos.image);

        //console.log(this.#username);

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
        //console.log('Make Random Move');

        const possibleMoves = game.moves();
        let possiblesMovesFiltered = this.#toolbox.filterMoves(possibleMoves, filterLevel);

        let finalMovesList: string[] = possiblesMovesFiltered;

        finalMovesList = this.#toolbox.getSafeMovesOnly(possiblesMovesFiltered, game.fen(), securityLvl, botColor);

        const randomIndex = Math.floor(Math.random() * finalMovesList.length);

        return {
            notation: finalMovesList[randomIndex],
            type: 4,
            moveInfos: `Make Random Move: Le coup aléatoire ${finalMovesList[randomIndex]} a été choisi parmis la liste de coups possibles
            disponibles au niveau de sécurité ${securityLvl}.\n\n`,
        }
    }

    //Suivant le security level, ne prendre en compte que certaines attaques
    //SL 0 -> Ne détecte jamais le danger
    //SL 1 & 2 -> Danger si capture, ou attaque avec une pièce de moindre valeur (chances d'ignorer basses)
    //TODO: SL 3 -> +Regarder les coups de toutes les pièces (ex: en cas de découverte, chances d'ignorer importantes) 
    #isLastMoveDangerous(game: Chess, blunderMult: number): {danger: boolean, dangerCases: {dangerCase: string, dangerValue: number}[], dangerousMoveInfos: string } {
        //console.log("Is last move dangerous ?");
        const history = JSON.parse(JSON.stringify(game.history({verbose: true})));
        const lastMove = history.pop();
        const gameTest = new Chess();
        let dangerousMoveInfos = '';

        //console.log('Security Level: ' + securityLvl);
    
        if(this.#defaultBotParams.securityLvl === 0 || lastMove === null || lastMove === undefined) return {
            danger: false,
            dangerCases: [],
            dangerousMoveInfos: `Is Last Move Dangerous: Le bot ne considère pas le dernier coup comme dangereux (security level: ${this.#defaultBotParams.securityLvl}).\n\n`,
        };
    
        
        /* const previousFen = lastMove.before;
        
        gameTest.load(previousFen);
        gameTest.remove(lastMove.from);
        gameTest.put({type: lastMove.piece, color: lastMove.color}, lastMove.to); */

        // On modifie la fen pour que l'adversaire puisse virtuellement jouer deux fois d'affilé
        //console.log(`Game Fen: ${game.fen()}`);
        const testFen = game.fen().includes(' b ') ? game.fen().replace(' b ', ' w ') : game.fen().replace(' w ', ' b ');
        console.log(`Test Fen: ${testFen}`);
        if(!this.#toolbox.isFenValid(testFen)) {
            return {
                danger: false,
                dangerCases: [],
                dangerousMoveInfos: `Is Last Move Dangerous: Le bot n'a pas réussi à analyser la position -> false`,
            };
        }
        gameTest.load(testFen);
        console.log('ok_1');

        const pieceMoves = gameTest.moves({square: lastMove.to, verbose: true});
        
        let danger = false;
        const dangerCases: {dangerCase: string, dangerValue: number}[] = [];
    
        // Si le dernier coup est une capture, il faut obligatoirement réagir
        if(lastMove.san.match(/[x|+]/gm)) danger = true;
    
        // On ne regarde que les attaques de la pièce déplacée et pas les découvertes
        pieceMoves.forEach(pieceMove => {
            const attackedCase = pieceMove.to;
            const squareInfos = gameTest.get(attackedCase);
    
            //console.log(squareInfos);
            if(squareInfos && squareInfos?.type !== 'p' && squareInfos?.color === this.#botColor) {
                const dangerValue = this.#toolbox.getExchangeValue(gameTest.fen(), pieceMove.lan);
                //console.log(`Danger: ${pieceMove.san} -> ${dangerValue}`);

                if(dangerValue >= 1){
                    if(!dangerCases.some(dc => dc.dangerCase === attackedCase && dc.dangerValue === dangerValue)){
                        dangerCases.push({
                            dangerCase: attackedCase,
                            dangerValue: dangerValue
                        })
                    }
                    danger = true;
                }

                if(this.#defaultBotParams.securityLvl >= 2 && dangerValue > 0){
                    if(!dangerCases.some(dc => dc.dangerCase === attackedCase && dc.dangerValue === dangerValue)){
                        dangerCases.push({
                            dangerCase: attackedCase,
                            dangerValue: dangerValue
                        })
                    }
                    danger = true;
                }
            }
        });

        console.log('ok_2');
    
        //console.log(`Is last move \x1B[34m(${lastMove.san})\x1B[0m dangerous: \x1B[31m` + danger);

        const ignoreDirectAttackChances = Math.max(1, 50 - Math.pow(this.#defaultBotParams.elo, 1/1.8))*blunderMult;
        let ignoreDirectAttack = Math.random()*100;

        if(danger) dangerousMoveInfos = `Is Last Move Dangerous: Le bot considère le dernier coup comme une attaque directe dangereuse (security level: ${this.#defaultBotParams.securityLvl}).\n\n`;
        if(!danger) dangerousMoveInfos = `Is Last Move Dangerous: Le bot ne considère pas le dernier coup comme une attaque directe dangereuse (security level: ${this.#defaultBotParams.securityLvl}).\n\n`;

        if(danger && ignoreDirectAttack < ignoreDirectAttackChances){
            danger = false;
            //console.log(`${this.#username} ignore le danger !`);
            dangerousMoveInfos = `Ignore Danger: Le dernier coup était une attaque directe dangereuse (security level: ${this.#defaultBotParams.securityLvl}) mais le bot l'ignore (${Math.round(ignoreDirectAttack)} < ${ignoreDirectAttackChances}).\n\n`;
        }
    
        if(this.#defaultBotParams.securityLvl < 3) {
            if(!danger) dangerousMoveInfos += `Is Last Move Dangerous: Le bot ne regarde pas s'il y a des attaques à la découverte (security level: ${this.#defaultBotParams.securityLvl}).\n\n`;
            return {
                danger: danger,
                dangerCases: dangerCases,
                dangerousMoveInfos: dangerousMoveInfos,
            };
        } 

        // On regarde les déplacements de toutes les pièces adverses (attaque à la découverte par exemple)
        gameTest.moves({verbose: true}).forEach(pieceMove => {
            const attackedCase = pieceMove.to;
            const squareInfos = gameTest.get(attackedCase);
    
            //console.log(squareInfos);
            if(squareInfos && squareInfos?.type !== 'p' && squareInfos?.color === this.#botColor) {
                const dangerValue = this.#toolbox.getExchangeValue(gameTest.fen(), pieceMove.lan);
                //console.log(`Danger: ${pieceMove.san} -> ${dangerValue}`);

                if(dangerValue >= 1){
                    if(!dangerCases.some(dc => dc.dangerCase === attackedCase && dc.dangerValue === dangerValue)){
                        dangerCases.push({
                            dangerCase: attackedCase,
                            dangerValue: dangerValue
                        })
                    }
                    danger = true;
                }
            }
        });

        console.log('ok_3');

        const ignoreDiscoveryAttackChances = Math.max(1, 50 - Math.pow(this.#defaultBotParams.elo - 1500, 1/1.6))*blunderMult;
        let ignoreDiscoveryAttack = Math.random()*100;

        if(danger) dangerousMoveInfos += `Is Last Move Dangerous: Le bot considère le dernier coup comme une attaque à la découverte dangereuse (security level: ${this.#defaultBotParams.securityLvl}).\n\n`;
        if(!danger) dangerousMoveInfos += `Is Last Move Dangerous: Le bot ne considère pas le dernier coup comme une attaque à la découverte dangereuse (security level: ${this.#defaultBotParams.securityLvl}).\n\n`;

        if(danger && ignoreDiscoveryAttack < ignoreDiscoveryAttackChances){
            danger = false;
            //console.log(`${this.#username} ignore le danger !`);
            dangerousMoveInfos += `Ignore Danger: Le dernier coup était une attaque à la découverte dangereuse (security level: ${this.#defaultBotParams.securityLvl}) mais le bot l'ignore (${Math.round(ignoreDiscoveryAttack)} < ${ignoreDiscoveryAttackChances}).\n\n`;
        }

        return {
            danger: danger,
            dangerCases: dangerCases,
            dangerousMoveInfos: dangerousMoveInfos,
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
            type: -1,
            moveInfos: '',
        } 
    
        //console.log(`${botColor} is forced to Checkmate`);
        const stockfishRes = await this.#engine.findBestMove(game.fen(), 20, 20);
        stockfishMove.notation = stockfishRes;
        stockfishMove.type = 3;
        stockfishMove.moveInfos = "Make Forced Checkmate: Le bot est forcé de jouer le meilleur coup pour mater l'adversaire.\n\n";
        //console.log(stockfishRes);
        return stockfishMove;
    }

    #makeForcedExchange(game: Chess, blunderMult: number): Move {
        let move: Move = {
            notation: '',
            type: -1,
            moveInfos: `Make Forced Exchange: Le bot ${this.#username} n'a pas trouvé d'échange assez intéressant pour être forcé.\n\n`,
        };

        const forceExchangeChance = (new Map([
            ['Beginner', 100],
            ['Casual', 50],
            ['Intermediate', 25],
            ['Advanced', 10],
            ['Master', 5],
            ['Maximum', 0]
          ]).get(this.#botLevel) || 10)*blunderMult;
        let hasForcedExchange = false;

        game.moves().forEach((possibleMove) => {
            if(!hasForcedExchange && this.#toolbox.isCapture(game.fen(), possibleMove)){
                const moveLan = this.#toolbox.convertMoveSanToLan(game.fen(), possibleMove);
                const rand = Math.round(Math.random()*100);
                const captureValue = this.#toolbox.getExchangeValue(game.fen(), moveLan);
                const captureChance = Math.min(captureValue*forceExchangeChance, 90)
                //console.log(`Move: ${possibleMove} (value: ${captureValue}, capture chances: ${captureChance}, rand: ${rand})`);
                if(rand <= captureChance){
                    move.notation = moveLan;
                    move.type = 5
                    hasForcedExchange = true; 
                    move.moveInfos = `Make Forced Exchange: Le bot ${this.#username} est forcé de capturer en ${this.#toolbox.getMoveDestination(move.notation)} (${Math.round(rand)} <= ${captureChance}).\n\n`;
                }
            }
        });

        return move;
    }

    //TODO: Si le bot ne réagit pas 'mal' à la menace, faire un coup humain plutôt que le meilleur coup de stockfish
    async #makeHumanThreatReaction(game: Chess, dangerCases: {dangerCase: string, dangerValue: number}[], blunderMult: number): Promise<Move> {
        let stockfishMove: Move = {
            notation: '',
            type: -1
        }

        if(!dangerCases || dangerCases.length <= 0) {
            /* console.log('%c Erreur avec le paramètre dangerCases !', "color:red; font-size:14px;");
            console.log(dangerCases); */
            stockfishMove.moveInfos = `Make Human Threat Reaction: Pas de pièce en danger d'après le bot ! (Niveau de sécurité: ${this.#defaultBotParams.securityLvl})`;
            return stockfishMove;
        }
        
        const sortedThreats = dangerCases.sort((case1, case2) => case2.dangerValue - case1.dangerValue);
        const mostThreatenedPiece = sortedThreats[0];
        let badReactionChance = Math.round(mostThreatenedPiece.dangerValue*Math.max(0.1, 90 - Math.pow(this.#defaultBotParams.elo, 1/1.7))*blunderMult);
        badReactionChance = Math.min(50, badReactionChance);
        const rand = Math.round(Math.random()*100);

        /* console.log(`sortedThreats:`);
        console.log(sortedThreats);
        console.log(`mostThreatenedPiece:`);
        console.log(mostThreatenedPiece);
        console.log(`badReactionChance: ${badReactionChance}`);
        console.log(`rand: ${rand}`); */

        if(rand <= badReactionChance){
            //console.log(`Danger cases: `);
            //console.log(dangerCases);

            //console.log(`Most Threatened Piece Case: ${mostThreatenedPiece.dangerCase}`);
            //console.log(game.moves({square: mostThreatenedPiece.dangerCase as any as Square}));

            //TODO: Problème quand la pièce menacée peut aller au même endroit qu'une autre pièce du même type: Rd1 au lieu de Rdd1 ou Rhd1
            //let threatenedPieceMoves = game.moves({square: mostThreatenedPiece.dangerCase as any as Square});
            let threatenedPieceMoves = game.moves({verbose: true}).filter(move => move.from === mostThreatenedPiece.dangerCase).map(move => move.lan);

            //console.log(`Threatened Piece Moves 2: ${threatenedPieceMoves}`);

            threatenedPieceMoves = threatenedPieceMoves.filter(move => this.#toolbox.getExchangeValue(game.fen(), move) >= 0);

            //console.log(`Safe Threatened Piece Moves: ${threatenedPieceMoves}`);

            const randPick = Math.floor(Math.random()*threatenedPieceMoves.length);
            //console.log(`randPick: ${randPick}`);

            stockfishMove.notation = threatenedPieceMoves.length > 0 ? threatenedPieceMoves[randPick] : '';
            //console.log(stockfishMove.notation);

            if(stockfishMove.notation !== '') stockfishMove.type = 5;
        }

        if(stockfishMove.type >= 0) {
            //console.log('Le bot réagit mal à la menace et doit bouger sa pièce en ' + this.#toolbox.getMoveDestination(stockfishMove.notation))
            stockfishMove.moveInfos = `Make Human Threat Reaction: Le bot réagit mal à la menace (${rand} <= ${badReactionChance}) et doit bouger sa pièce en ${this.#toolbox.getMoveDestination(stockfishMove.notation)}.\n\n`;
        }else{
            stockfishMove.moveInfos = `Make Human Threat Reaction: Malgrès le danger, le bot n'a pas réagi dans la précipitation à la menace (${rand} > ${badReactionChance}).\n\n`;
        }

        return stockfishMove
    }

    async #makeTunelVisionMove(game: Chess, blunderMult: number): Promise<Move> {
        let stockfishMove: Move = {
            notation: '',
            type: -1,
            moveInfos: '',
        } 
        
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
        let forgotPieceChance = Math.max(1, (Math.round(50 - Math.sqrt(this.#defaultBotParams.elo))))*blunderMult;
        //let forgotPieceChance = 10000;
        //console.log('Forgot Piece Chances (base): ' + forgotPieceChance);
        forgotPieceChance = forgotPieceChance*(Math.min(1.2, 0.8 + 0.01*(game.history().length/2)));
        //console.log('Forgot Piece Chances (adjusted): ' + forgotPieceChance);
        let hasForgotten = false;
        let thingsForgotten = '';
        let forgottenPiecesCases: Square[] = [];

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
                        thingsForgotten+= `-le fou en ${boardCase.square} (${Math.round(rand)} <= ${forgotPieceChanceFinal} (${Math.round(forgotPieceChance)} * ${Math.round(10*inactivityBonusMult)/10}))\n`;
                        hasForgotten = true;
                        newGame.put({ type: 'p', color: opponentColor }, boardCase.square);
                        forgottenPiecesCases.push(boardCase.square);
                    }
                    
                    if(boardCase?.type === 'q' && rand <= forgotPieceChanceFinal) {
                        //console.log('Oublie les déplacements en diagonale de la dame en ' + boardCase.square);
                        thingsForgotten+= `-les déplacements en diagonale de la dame en ${boardCase.square} (${Math.round(rand)} <= ${forgotPieceChanceFinal} (${Math.round(forgotPieceChance)} * ${Math.round(inactivityBonusMult)}))\n`;
                        hasForgotten = true;
                        newGame.put({ type: 'r', color: opponentColor }, boardCase.square);
                        forgottenPiecesCases.push(boardCase.square);
                    }

                    if(boardCase?.type === 'q' && rand <= forgotPieceChanceFinal/2) {
                        //console.log('Oublie la dame en ' + boardCase.square);
                        thingsForgotten+= `-la dame en ${boardCase.square} (${Math.round(rand)} <= ${forgotPieceChanceFinal/2} (${Math.round(forgotPieceChance)}/2 * ${Math.round(inactivityBonusMult)}))\n`;
                        hasForgotten = true;
                        newGame.put({ type: 'p', color: opponentColor }, boardCase.square);
                        forgottenPiecesCases.push(boardCase.square);
                    }

                }
            })
        });

        //console.log(newGame.ascii());

        
        if(hasForgotten) {
            //console.log(forgottenPiecesCases);
            const timestampStart = performance.now();
            //const stockfishMove = await makeStockfishMove(this.#defaultBotParams, newGame, this.#engine);
            let stockfishMoves: EvalResultSimplified[] = await this.#engine.findBestMoves(newGame.fen(), 10, this.#defaultBotParams.skillValue, 10, false);
            //console.log(`Durée de la recherche des 30 meilleurs coups: ${(performance.now() - timestampStart)/1000}s`);
            //console.log(stockfishMoves);

            //TODO: getExchangeValue(game.fen(), sfMove.bestMove) ou getExchangeValue(newGame.fen(), sfMove.bestMove) ?
            /* console.log("Tableau des valeurs des 'échanges': ");
            stockfishMoves.forEach((sfMove) => console.log(this.#toolbox.getExchangeValue(game.fen(), sfMove.bestMove)));

            console.log("Tableau des distances avec la pièce oubliée: ");
            stockfishMoves.forEach((sfMove) => {
                console.log(`${sfMove.bestMove}: `);
                forgottenPiecesCases.forEach((fpc) => console.log(`${fpc}: ${this.#toolbox.getDistanceBetweenSquares(fpc, this.#toolbox.getMoveDestination(sfMove.bestMove))}`));
            }); */
            stockfishMoves = stockfishMoves.filter((sfMove) => (this.#toolbox.getExchangeValue(game.fen(), sfMove.bestMove) >= 0 || !forgottenPiecesCases.some((fpc) => this.#toolbox.getDistanceBetweenSquares(fpc, this.#toolbox.getMoveDestination(sfMove.bestMove)) < 3)));
            //console.log(stockfishMoves);

            //console.log(`${square?.square} is defended: ${this.#toolbox.isDefended(game.fen(), square?.square || 'a1')}`)
            /* const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
            const digits = ['1', '2', '3', '4', '5', '6', '7', '8'];

            digits.forEach((digit) => {
                letters.forEach((letter) => {
                    console.log(`${letter + digit} is defended by white: ${this.#toolbox.isDefended(game.fen(), (letter + digit) as any as Square).white}`);
                    console.log(`${letter + digit} is defended by black: ${this.#toolbox.isDefended(game.fen(), (letter + digit) as any as Square).black}`);
                })
            })

            digits.forEach((digit) => {
                letters.forEach((letter) => {
                    console.log(`${letter + digit} is attacked by white: ${game.isAttacked((letter + digit) as any as Square, 'w')}`);
                    console.log(`${letter + digit} is attacked by black: ${game.isAttacked((letter + digit) as any as Square, 'b')}`);
                })
            }) */

            //stockfishMove.type = 5;

            stockfishMoves = stockfishMoves.filter((sfMove) => this.#toolbox.isMoveValid(game.fen(), sfMove.bestMove));
            //console.log(stockfishMoves);

            /* stockfishMoves.sort(compareEval);
            console.log(stockfishMoves); */

            if(stockfishMoves.length > 0) {
                stockfishMove.notation = stockfishMoves[0].bestMove;
                stockfishMove.type = 5;
            }

            if(stockfishMove.type === 5) {
                //console.log(`Le bot ${this.#username} oublie:${thingsForgotten}`);
                stockfishMove.moveInfos = `Make Tunel Vision Move: Le bot ${this.#username} oublie:\n${thingsForgotten}\n\n`;
            }else{
                stockfishMove.moveInfos = `Make Tunel Vision Move: Le bot ${this.#username} avait oublié une ou des pièces mais le coup résultant n'était pas valide (forgot piece chance: ${Math.round(forgotPieceChance)} * inactivity (0.1 - 1.5)).\n\n`;
            }

            return stockfishMove;
            
        } 

        return {
            notation: '',
            type: -1,
            moveInfos: `Make Tunel Vision Move: Le bot ${this.#username} n'oublie aucune pièce adverse sur l'échiquier (forgot piece chance: ${Math.round(forgotPieceChance)} * inactivity (0.1 - 1.5)).\n\n`,
        }
        
    }

    async #ignoreOpponentMove(game: Chess, blunderMult: number): Promise<Move> {
        let stockfishMove: Move = {
            notation: '',
            type: -1,
            moveInfos: '',
        } 
        //const history = JSON.parse(JSON.stringify(game.history({verbose: true})));
        let lastOpponentMove = game.history({verbose: true}).pop();
        let lastOpponentMoveLan = lastOpponentMove?.lan || '';
        let fenBeforeOpponentMove = lastOpponentMove?.before || DEFAULT_POSITION;
        fenBeforeOpponentMove = this.#botColor === 'w' ? fenBeforeOpponentMove.replace(' b ', ' w ') : fenBeforeOpponentMove.replace(' w ', ' b ');
        const gameTest = new Chess();
        let ignoreOpponentMoveChance = Math.max(1, (Math.round(55 - Math.pow(this.#defaultBotParams.elo, 1/1.9))))*blunderMult;
        //console.log('Ignore Opponent Move Chances (base): ' + ignoreOpponentMoveChance);
        ignoreOpponentMoveChance = ignoreOpponentMoveChance*(Math.min(1.2, 0.8 + 0.01*(game.history().length/2)));
        //console.log('Ignore Opponent Move Chances (adjusted): ' + ignoreOpponentMoveChance);
        let moveType = 5;
        let ignoreLastMoveRand = Math.round(Math.random()*100 );

        if((lastOpponentMoveLan !== '') || ignoreLastMoveRand > ignoreOpponentMoveChance) {
            return {
                notation: '',
                type: -1,
                moveInfos: `Ignore Opponent Move: Le bot ${this.#username} n'ignore pas le dernier coup de l'adversaire (${Math.round(ignoreLastMoveRand)} > ${Math.round(ignoreOpponentMoveChance)})!\n\n`,
            }
        }

        try {
            //console.log(`${this.#username} ignore le dernier coup de l'adversaire !`);
            gameTest.load(fenBeforeOpponentMove);
    
            //const stockfishMove = await makeStockfishMove(this.#defaultBotParams, gameTest, this.#engine);
            let stockfishMoves: EvalResultSimplified[] = await this.#engine.findBestMoves(fenBeforeOpponentMove, 10, this.#defaultBotParams.skillValue, 10, false);
            
            stockfishMoves = stockfishMoves.filter((sfMove) => this.#toolbox.getDistanceBetweenSquares(this.#toolbox.getMoveOrigin(lastOpponentMoveLan), this.#toolbox.getMoveDestination(sfMove.bestMove)) === 0);
            console.log(stockfishMoves);

            //stockfishMove.type = 5;

            stockfishMoves = stockfishMoves.filter((sfMove) => this.#toolbox.isMoveValid(game.fen(), sfMove.bestMove));
            console.log(stockfishMoves);

            /* stockfishMoves.sort(compareEval);
            console.log(stockfishMoves); */

            if(stockfishMoves.length > 0) {
                stockfishMove.notation = stockfishMoves[0].bestMove;
                stockfishMove.type = 5;
                //console.log(`Le bot ${this.#username} ignore le dernier coup de l'adversaire`);
                stockfishMove.moveInfos = `Ignore Oponent Move: Le bot ${this.#username} ignore le dernier coup de l'adversaire (${Math.round(ignoreLastMoveRand)} <= ${Math.round(ignoreOpponentMoveChance)}).\n\n`;
            }else{
                stockfishMove.moveInfos = `Ignore Oponent Move: Le bot ${this.#username} aurait dû ignorer le dernier coup de l'adversaire (${Math.round(ignoreLastMoveRand)} <= ${Math.round(ignoreOpponentMoveChance)}), mais le coup résultant n'était pas valide.\n\n`;
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

    async #defaultMoveLogic(game: Chess, useDatabase: Boolean, useRandom: Boolean, blunderMult: number): Promise<Move> {
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

        const {danger, dangerCases} = this.#isLastMoveDangerous(game, blunderMult);

        //console.log("Le dernier coup est dangereux: " + danger);
    
        if(danger) {
            const reactingThreatMove = await makeStockfishMove(this.#defaultBotParams, game, this.#engine);
            if(reactingThreatMove.type >= 0 ){
                reactingThreatMove.type = 3;
                return reactingThreatMove;
            }
        }

        if(useRandom && isRandomMovePlayable(this.#defaultBotParams, this.#botLevel, this.#lastRandomMove, blunderMult)) {
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

    async #makeDefaultMove(game: Chess, blunderMult: number): Promise<Move> {
        console.log('Bot AI: Default behaviour');
        console.log('Last Random Move: ' + this.#lastRandomMove);
        let move: Move = {
            notation: '',
            type: -1,
        };

        const defaultMove = await this.#defaultMoveLogic(game, true, true, blunderMult);
        if(defaultMove.type >= 0) {
            return defaultMove;
        }

        const homemadeEngineMove = await this.#homemadeEngine.findBestMove(game.fen());
        if(homemadeEngineMove.type >= 0) {
            this.#lastRandomMove = this.#lastRandomMove-1;
            return homemadeEngineMove;
        }

        return move;
    }

    #habitsOpenings(game: Chess): Move {
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
                move.type = 1;
                return move;

            // e4 e5 Nf3
            case '1.e4 e5 2.Nf3':
                move.notation = 'b8c6';
                move.type = 1;
                return move;  
                
            // Italian
            case '1.e4 e5 2.Nf3 Nc6 3.Bc4':
                move.notation = 'f8c5';
                move.type = 1;
                return move;
                
            case '1.e4 e5 2.Nf3 Nc6 3.Bc4 Bc5 4.d3':
                move.notation = 'g8f6';
                move.type = 1;
                return move; 

            case '1.e4 e5 2.Nf3 Nc6 3.Bc4 Bc5 4.d3 Nf6 5.Ng5':
                move.notation = 'e8g8';
                move.type = 1;
                return move; 

            // Ruy Lopez
            case '1.e4 e5 2.Nf3 Nc6 3.Bb5':
                move.notation = 'g8f6';
                move.type = 1;
                return move;
                
            case '1.e4 e5 2.Nf3 Nc6 3.Bb5 Nf6 4.d3':
                move.notation = 'f8c5';
                move.type = 1;
                return move; 

            case '1.e4 e5 2.Nf3 Nc6 3.Bb5 Nf6 4.d3 Bc5 5.O-O':
                move.notation = 'd7d6';
                move.type = 1;
                return move;

            case '1.e4 e5 2.Nf3 Nc6 3.Bb5 Nf6 4.d3 Bc5 5.Bxc6':
                move.notation = 'd7c6';
                move.type = 1;
                return move;

            case '1.e4 e5 2.Nf3 Nc6 3.Bb5 Nf6 4.d3 Bc5 5.Bxc6 dxc6 6.Nxe5':
                move.notation = 'd8d4';
                move.type = 1;
                return move;

            // Scotch Game
            case '1.e4 e5 2.Nf3 Nc6 3.d4':
                move.notation = 'e5d4';
                move.type = 1;
                return move;

            case '1.e4 e5 2.Nf3 Nc6 3.d4 exd4 4.Nxd4':
                move.notation = 'g8f6';
                move.type = 1;
                return move;

            case '1.e4 e5 2.Nf3 Nc6 3.d4 exd4 4.Nxd4 Nf6 5.Nxc6':
                move.notation = 'b7c6';
                move.type = 1;
                return move;

            case '1.e4 e5 2.Nf3 Nc6 3.d4 exd4 4.Nxd4 Nf6 5.Nxc6 bxc6 6.e5':
                move.notation = 'd8e7';
                move.type = 1;
                return move;

            case '1.e4 e5 2.Nf3 Nc6 3.d4 exd4 4.Nxd4 Nf6 5.Nc3':
                move.notation = 'f8b4';
                move.type = 1;
                return move;

            case '1.e4 e5 2.Nf3 Nc6 3.d4 exd4 4.Nxd4 Nf6 5.Nc3 Bb4 6.Nxc6':
                move.notation = 'b7c6';
                move.type = 1;
                return move;

            case '1.e4 e5 2.Nf3 Nc6 3.d4 exd4 4.Nxd4 Nf6 5.Nc3 Bb4 6.Nxc6 bxc6 7.e5':
                move.notation = 'd8e7';
                move.type = 1;
                return move;

            // Scotch Gambit
            case '1.e4 e5 2.Nf3 Nc6 3.d4 exd4 4.Bc4':
                move.notation = 'g8f6';
                move.type = 1;
                return move;

            case '1.e4 e5 2.Nf3 Nc6 3.d4 exd4 4.Bc4 Nf6 5.e5':
                move.notation = 'd7d5';
                move.type = 1;
                return move;

            case '1.e4 e5 2.Nf3 Nc6 3.d4 exd4 4.Bc4 Nf6 5.e5 d5 6.Bb5':
                move.notation = 'f6e4';
                move.type = 1;
                return move;

            case '1.e4 e5 2.Nf3 Nc6 3.d4 exd4 4.Bc4 Nf6 5.e5 d5 6.Bb5 Nxe4 7.Nxd4':
                move.notation = 'c8d7';
                move.type = 1;
                return move;

            case '1.e4 e5 2.Nf3 Nc6 3.d4 exd4 4.Bc4 Nf6 5.O-O':
                move.notation = 'f6e4';
                move.type = 1;
                return move;

            case '1.e4 e5 2.Nf3 Nc6 3.d4 exd4 4.Bc4 Nf6 5.O-O Nxe4 7.Re1':
                move.notation = 'd7d5';
                move.type = 1;
                return move;

            // Three Knights
            case '1.e4 e5 2.Nf3 Nc6 3.Nc3':
                move.notation = 'g8f6';
                move.type = 1;
                return move;

            case '1.e4 e5 2.Nf3 Nc6 3.Nc3 Nf6 4.Bc4':
                move.notation = 'f8c5';
                move.type = 1;
                return move;

            // Ponziani
            case '1.e4 e5 2.Nf3 Nc6 3.c3':
                move.notation = 'g8f6';
                move.type = 1;
                return move;

            // White

            case '':
                move.notation = 'e2e4';
                move.type = 1;
                return move;

            case '1.e4 e5':
                move.notation = 'g1f3';
                move.type = 1;
                return move;

            // Petrov
            case '1.e4 e5 2.Nf3 Nf6':
                move.notation = 'b1c3';
                move.type = 1;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nc3 Nc6':
                if(this.#defaultBotParams.elo < 1200) {
                    move.notation = 'f1c4';
                    move.type = 1;
                    return move;
                }
                move.notation = 'f1b5';
                move.type = 1;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nc3 Nc6 4.Bc4 Bc5':
                move.notation = 'd2d3';
                move.type = 1;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nc3 Nc6 4.Bc4 Nxe4':
                move.notation = 'c3e4';
                move.type = 1;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nc3 Nc6 4.Bc4 Nxe4 5.Nxe4 d5':
                move.notation = 'c4d3';
                move.type = 1;
                return move;

            // Italian
            case '1.e4 e5 2.Nf3 Nc6':
                move.notation = 'b1c3';
                move.type = 1;
                return move;

            case '1.e4 e5 2.Nf3 Nc6 3.Nc3 Nf6':
                if(this.#defaultBotParams.elo < 1200) {
                    move.notation = 'f1c4';
                    move.type = 1;
                    return move;
                }
                move.notation = 'f1b5';
                move.type = 1;
                return move;

            case '1.e4 e5 2.Nf3 Nc6 3.Nc3 Nf6 4.Bc4 Bc5':
                move.notation = 'd2d3';
                move.type = 1;
                return move;

            case '1.e4 e5 2.Nf3 Nc6 3.Nc3 Nf6 4.Bc4 Nxe4':
                move.notation = 'c3e4';
                move.type = 1;
                return move;

            case '1.e4 e5 2.Nf3 Nc6 3.Nc3 Nf6 4.Bc4 Nxe4 5.Nxe4 d5':
                move.notation = 'c4d3';
                move.type = 1;
                return move;

            // Philidor
            case '1.e4 e5 2.Nf3 d6':
                if(this.#defaultBotParams.elo < 1200) {
                    move.notation = 'b1c3';
                    move.type = 1;
                    return move;
                }
                move.notation = 'd2d4';
                move.type = 1;
                return move;

            // Sicilian defense
            case '1.e4 c5':
                move.notation = 'g1f3';
                move.type = 1;
                return move;

            // Delayed Alapin (d6)
            case '1.e4 c5 2.Nf3 d6':
                move.notation = 'c2c3';
                move.type = 1;
                return move;

            case '1.e4 c5 2.Nf3 d6 3.c3 Nf6':
                move.notation = 'f1e2';
                move.type = 1;
                return move;

            case '1.e4 c5 2.Nf3 d6 3.c3 Nf6 4.Be2 Nc6':
                move.notation = 'd2d4';
                move.type = 1;
                return move;

            case '1.e4 c5 2.Nf3 d6 3.c3 Nf6 4.Be2 Nc6 5.d4 cxd4':
                move.notation = 'c3d4';
                move.type = 1;
                return move;

            case '1.e4 c5 2.Nf3 d6 3.c3 Nf6 4.Be2 Nxe4':
                move.notation = 'd1a4';
                move.type = 1;
                return move;

            case '1.e4 c5 2.Nf3 d6 3.c3 Nf6 4.Be2 Nxe4':
                move.notation = 'd1a4';
                move.type = 1;
                return move;

            case '1.e4 c5 2.Nf3 d6 3.c3 Nc6':
                move.notation = 'd2d4';
                move.type = 1;
                return move;

            case '1.e4 c5 2.Nf3 d6 3.c3 Nc6 4.d4 cxd4':
                move.notation = 'c3d4';
                move.type = 1;
                return move;

            case '1.e4 c5 2.Nf3 d6 3.c3 e5':
                move.notation = 'd2d4';
                move.type = 1;
                return move;

            case '1.e4 c5 2.Nf3 d6 3.c3 e5 4.d4 cxd4':
                move.notation = 'c3d4';
                move.type = 1;
                return move;

            case '1.e4 c5 2.Nf3 d6 3.c3 g6':
                move.notation = 'd2d4';
                move.type = 1;
                return move;

            case '1.e4 c5 2.Nf3 d6 3.c3 g6 4.d4 cxd4':
                move.notation = 'c3d4';
                move.type = 1;
                return move;

            case '1.e4 c5 2.Nf3 d6 3.c3 a6':
                move.notation = 'd2d4';
                move.type = 1;
                return move;

            case '1.e4 c5 2.Nf3 d6 3.c3 a6 4.d4 cxd4':
                move.notation = 'c3d4';
                move.type = 1;
                return move;

            case '1.e4 c5 2.Nf3 d6 3.c3 e6':
                move.notation = 'd2d4';
                move.type = 1;
                return move;

            case '1.e4 c5 2.Nf3 d6 3.c3 e6 4.d4 cxd4':
                move.notation = 'c3d4';
                move.type = 1;
                return move;

            // Delayed Alapin (Nc6)
            case '1.e4 c5 2.Nf3 Nc6':
                move.notation = 'c2c3';
                move.type = 1;
                return move;
            
            case '1.e4 c5 2.Nf3 Nc6 3.c3 Nf6':
                move.notation = 'e4e5';
                move.type = 1;
                return move;

            case '1.e4 c5 2.Nf3 Nc6 3.c3 e5':
                move.notation = 'd2d4';
                move.type = 1;
                return move;

            case '1.e4 c5 2.Nf3 Nc6 3.c3 e5 4.d4 cxd4':
                move.notation = 'c3d4';
                move.type = 1;
                return move;

            case '1.e4 c5 2.Nf3 Nc6 3.c3 d6':
                move.notation = 'd2d4';
                move.type = 1;
                return move;

            case '1.e4 c5 2.Nf3 Nc6 3.c3 d6 4.d4 cxd4':
                move.notation = 'c3d4';
                move.type = 1;
                return move;

            case '1.e4 c5 2.Nf3 Nc6 3.c3 g6':
                move.notation = 'd2d4';
                move.type = 1;
                return move;

            case '1.e4 c5 2.Nf3 Nc6 3.c3 g6 4.d4 cxd4':
                move.notation = 'c3d4';
                move.type = 1;
                return move;

            case '1.e4 c5 2.Nf3 Nc6 3.c3 a6':
                move.notation = 'd2d4';
                move.type = 1;
                return move;

            case '1.e4 c5 2.Nf3 Nc6 3.c3 a6 4.d4 cxd4':
                move.notation = 'c3d4';
                move.type = 1;
                return move;

            case '1.e4 c5 2.Nf3 Nc6 3.c3 e6':
                move.notation = 'd2d4';
                move.type = 1;
                return move;

            case '1.e4 c5 2.Nf3 Nc6 3.c3 e6 4.d4 cxd4':
                move.notation = 'c3d4';
                move.type = 1;
                return move;

            // Delayed Alapin (e6)
            case '1.e4 c5 2.Nf3 e6':
                move.notation = 'c2c3';
                move.type = 1;
                return move;

            case '1.e4 c5 2.Nf3 e6 3.c3 d5':
                move.notation = 'e4d5';
                move.type = 1;
                return move;

            case '1.e4 c5 2.Nf3 e6 3.c3 d5 4.exd5 Qxd5':
                move.notation = 'd2d4';
                move.type = 1;
                return move;

            case '1.e4 c5 2.Nf3 e6 3.c3 d5 4.exd5 exd5':
                move.notation = 'd2d4';
                move.type = 1;
                return move;

            case '1.e4 c5 2.Nf3 e6 3.c3 Nf6':
                move.notation = 'e4e5';
                move.type = 1;
                return move;

            case '1.e4 c5 2.Nf3 e6 3.c3 e5':
                move.notation = 'd2d4';
                move.type = 1;
                return move;

            case '1.e4 c5 2.Nf3 e6 3.c3 e5 4.d4 cxd4':
                move.notation = 'c3d4';
                move.type = 1;
                return move;

            case '1.e4 c5 2.Nf3 e6 3.c3 d6':
                move.notation = 'd2d4';
                move.type = 1;
                return move;

            case '1.e4 c5 2.Nf3 e6 3.c3 d6 4.d4 cxd4':
                move.notation = 'c3d4';
                move.type = 1;
                return move;

            case '1.e4 c5 2.Nf3 e6 3.c3 g6':
                move.notation = 'd2d4';
                move.type = 1;
                return move;

            case '1.e4 c5 2.Nf3 e6 3.c3 g6 4.d4 cxd4':
                move.notation = 'c3d4';
                move.type = 1;
                return move;

            case '1.e4 c5 2.Nf3 e6 3.c3 a6':
                move.notation = 'd2d4';
                move.type = 1;
                return move;

            case '1.e4 c5 2.Nf3 e6 3.c3 a6 4.d4 cxd4':
                move.notation = 'c3d4';
                move.type = 1;
                return move;

            case '1.e4 c5 2.Nf3 e6 3.c3 Nc6':
                move.notation = 'd2d4';
                move.type = 1;
                return move;

            case '1.e4 c5 2.Nf3 e6 3.c3 Nc6 4.d4 cxd4':
                move.notation = 'c3d4';
                move.type = 1;
                return move;

            // Delayed Alapin (g6)
            case '1.e4 c5 2.Nf3 g6':
                move.notation = 'c2c3';
                move.type = 1;
                return move;

            case '1.e4 c5 2.Nf3 g6 3.c3 Bg7':
                move.notation = 'd2d4';
                move.type = 1;
                return move;

            case '1.e4 c5 2.Nf3 g6 3.c3 Bg7 4.d4 cxd4':
                move.notation = 'c3d4';
                move.type = 1;
                return move;

            case '1.e4 c5 2.Nf3 g6 3.c3 d5':
                move.notation = 'e4d5';
                move.type = 1;
                return move;

            case '1.e4 c5 2.Nf3 g6 3.c3 d5 4.exd5 Qxd5':
                move.notation = 'd2d4';
                move.type = 1;
                return move;

            // Delayed Alapin (a6)
            case '1.e4 c5 2.Nf3 a6':
                move.notation = 'c2c3';
                move.type = 1;
                return move;
            
            case '1.e4 c5 2.Nf3 a6 3.c3 Nf6':
                move.notation = 'e4e5';
                move.type = 1;
                return move;

            case '1.e4 c5 2.Nf3 a6 3.c3 b5':
                move.notation = 'd2d4';
                move.type = 1;
                return move;

            case '1.e4 c5 2.Nf3 a6 3.c3 b5 4.d4 cxd4':
                move.notation = 'c3d4';
                move.type = 1;
                return move;

            case '1.e4 c5 2.Nf3 a6 3.c3 e5':
                move.notation = 'f3e5';
                move.type = 1;
                return move;

            case '1.e4 c5 2.Nf3 a6 3.c3 d5':
                move.notation = 'e4d5';
                move.type = 1;
                return move;

            case '1.e4 c5 2.Nf3 a6 3.c3 d5 4.exd5 Qxd5':
                move.notation = 'd2d4';
                move.type = 1;
                return move;

            case '1.e4 c5 2.Nf3 a6 3.c3 d6':
                move.notation = 'd2d4';
                move.type = 1;
                return move;

            case '1.e4 c5 2.Nf3 a6 3.c3 d6 4.d4 cxd4':
                move.notation = 'c3d4';
                move.type = 1;
                return move;

            case '1.e4 c5 2.Nf3 a6 3.c3 g6':
                move.notation = 'd2d4';
                move.type = 1;
                return move;

            case '1.e4 c5 2.Nf3 a6 3.c3 g6 4.d4 cxd4':
                move.notation = 'c3d4';
                move.type = 1;
                return move;

            case '1.e4 c5 2.Nf3 a6 3.c3 e6':
                move.notation = 'd2d4';
                move.type = 1;
                return move;

            case '1.e4 c5 2.Nf3 a6 3.c3 e6 4.d4 cxd4':
                move.notation = 'c3d4';
                move.type = 1;
                return move;

            case '1.e4 c5 2.Nf3 e6 3.c3 Nc6':
                move.notation = 'd2d4';
                move.type = 1;
                return move;

            case '1.e4 c5 2.Nf3 e6 3.c3 Nc6 4.d4 cxd4':
                move.notation = 'c3d4';
                move.type = 1;
                return move;

            // French defense
            case '1.e4 e6':
                move.notation = 'd2d4';
                move.type = 1;
                return move;

            case '1.e4 e6 2.d4 d5':
                move.notation = 'e4d5';
                move.type = 1;
                return move;

            // Caro Kann
            case '1.e4 c6':
                move.notation = 'g1f3';
                move.type = 1;
                return move;

            case '1.e4 c6 2.Nf3 d5':
                move.notation = 'b1c3';
                move.type = 1;
                return move;

            case '1.e4 c6 2.Nf3 d5 3.Nc3 Bg4':
                move.notation = 'h2h3';
                move.type = 1;
                return move;

            // Scandinavian defense
            case '1.e4 d5':
                move.notation = 'e4d5';
                move.type = 1;
                return move;

            case '1.e4 d5 2.exd5 Qxd5':
                move.notation = 'b1c3';
                move.type = 1;
                return move;

            case '1.e4 d5 2.exd5 Qxd5 3.Nc3 Qa5':
                move.notation = 'd2d4';
                move.type = 1;
                return move;

            // Alekhine defense
            case '1.e4 Nf6':
                move.notation = 'b1c3';
                move.type = 1;
                return move;

            case '1.e4 Nf6 2.Nc3 e5':
                move.notation = 'g1f3';
                move.type = 1;
                return move;

            case '1.e4 Nf6 2.Nc3 e5 3.Nf3 Nc6':
                if(this.#defaultBotParams.elo < 1200) {
                    move.notation = 'f1c4';
                    move.type = 1;
                    return move;
                }
                move.notation = 'f1b5';
                move.type = 1;
                return move;

            // Modern defense
            case '1.e4 g6':
                move.notation = 'd2d4';
                move.type = 1;
                return move;

            case '1.e4 g6 2.d4 Bg7':
                move.notation = 'g1f3';
                move.type = 1;
                return move;

            case '1.e4 g6 2.d4 Bg7 3.Nf3 d6':
                move.notation = 'b1c3';
                move.type = 1;
                return move;

            // Pirc defense
            case '1.e4 d6':
                move.notation = 'd2d4';
                move.type = 1;
                return move;

            case '1.e4 d6 2.d4 g6':
                move.notation = 'g1f3';
                move.type = 1;
                return move;

            case '1.e4 d6 2.d4 g6 3.Nf3 Bg7':
                move.notation = 'b1c3';
                move.type = 1;
                return move;

            case '1.e4 d6 2.d4 Nf6':
                move.notation = 'g1f3';
                move.type = 1;
                return move;

            case '1.e4 d6 2.d4 Nf6 3.Nf3 g6':
                move.notation = 'b1c3';
                move.type = 1;
                return move;

            // Nimzowitsch Defense
            case '1.e4 Nc6':
                move.notation = 'g1f3';
                move.type = 1;
                return move;

            case '1.e4 Nc6 2.Nf3 e5':
                move.notation = 'f1c4';
                move.type = 1;
                return move;

            default:
                break;
        }

        return move;
    }

    async #homemadeEngineLogic(game: Chess, blunderMult: number): Promise<Move> {
        let move: Move = {
            notation: '',
            type: -1,
        };

        const habitsMove = this.#habitsOpenings(game);

        if(habitsMove.type >= 0) {
            habitsMove.moveInfos = `Ouverture: Le bot ${this.#username} a trouvé un coup dans sa base d'ouvertures (Habits openings).\n\n`;
            return habitsMove;
        }

        move.moveInfos = `Ouverture: Le bot ${this.#username} n'a pas trouvé de coup dans sa base d'ouvertures (Habits openings).\n\n`;

        if(isRandomMovePlayable(this.#defaultBotParams, this.#botLevel, this.#lastRandomMove, blunderMult)) {
            this.#lastRandomMove = this.#defaultBotParams.randMoveInterval;
            return this.#makeRandomMove(this.#defaultBotParams.filterLevel, this.#defaultBotParams.securityLvl, game, this.#botColor);
        }

        const homemadeEngineMove = await this.#homemadeEngine.findBestMove(game.fen());
        this.#lastRandomMove = this.#lastRandomMove-1;
        move.notation = homemadeEngineMove.notation;
        move.type = homemadeEngineMove.type;
        move.moveInfos += homemadeEngineMove.moveInfos;

        return move;
    }

    async #makeHomemadeEngineMove(game: Chess, blunderMult: number): Promise<Move> {
        console.log('Bot AI: Homemade Engine');
        let move: Move = {
            notation: '',
            type: -1,
        };

        move = await this.#homemadeEngineLogic(game, blunderMult);

        return move;
    }

    async #makeStockfishRandomMove(game: Chess, blunderMult: number): Promise<Move> {
        //console.log('Bot AI: Stockfish Random behaviour');
        let move: Move = {
            notation: '',
            type: -1,
        };

        const defaultMove = await this.#defaultMoveLogic(game, false, true, blunderMult);
        if(defaultMove.type >= 0) {
            this.#lastRandomMove = this.#lastRandomMove-1;
            return defaultMove;
        }

        const homemadeEngineMove = await this.#homemadeEngine.findBestMove(game.fen());
        if(homemadeEngineMove.type >= 0) {
            this.#lastRandomMove = this.#lastRandomMove-1;
            return homemadeEngineMove;
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

    async #makeStockfishOnlyMove(game: Chess, blunderMult: number): Promise<Move> {
        //console.log('Bot AI: Stockfish Only behaviour');
        let move: Move = {
            notation: '',
            type: -1,
            moveInfos: '',
        };

        const defaultMove = await this.#stockfishOnlyLogic(game, false, false);
        if(defaultMove.type >= 0) {
            this.#lastRandomMove = this.#lastRandomMove-1;
            return defaultMove;
        }

        const homemadeEngineMove = await this.#homemadeEngine.findBestMove(game.fen());
        if(homemadeEngineMove.type >= 0) {
            return homemadeEngineMove;
        }

        return move;
    }

    // TODO: isLastMoveDangerous ? Si oui -> plus le bot est faible, plus il aura envie de bouger la pièce
    async #humanMoveLogic(game: Chess, useDatabase: Boolean, useRandom: Boolean, blunderMult: number): Promise<Move> {
        console.log('human logic: humanMoveLogic_start');
        //console.log(`blunderMult: ${blunderMult}`);
        let moveInfos = blunderMult > 1 ? 
            `Le bot ${this.#username} a ${Math.round((blunderMult-1)*100)}% de risque en plus de faire des erreurs par manque de temps.\n\n`
            :
            `Le bot ${this.#username} a encore assez de temps à la pendule pour ne pas augmenter les risques de faire une erreur.\n\n`;

        if(useDatabase) {
            //console.log(moveInfos);
            //const movesList = this.#toolbox.convertHistorySanToLan(this.#toolbox.convertPgnToHistory(game.pgn()));
            /* const startingFen = game.history().length > 0 ? game.history({verbose: true})[0].before : DEFAULT_POSITION;
            const startingFen_2 = game.fen(); */
            const startingFen = game.history().length > 0 ? game.history({verbose: true})[0].before : game.fen();
            const movesList = this.#toolbox.convertHistorySanToLan(game.history(), startingFen);
            //console.log(`startingFen: ${startingFen}`);
            /* console.log(`startingFen_2: ${startingFen_2}`);
            console.log(`startingFen_3: ${startingFen_3}`); */
            console.log('%c human logic: makeLichessMove_start', "color:orange; font-size:14px;");
            const lichessMove = await makeLichessMove(movesList, this.#defaultBotParams.elo, startingFen, this.#toolbox);
            moveInfos += lichessMove.moveInfos;
            console.log('%c human logic: makeLichessMove_ok', "color:green; font-size:14px;");
            if(lichessMove.type >= 0){
                //console.log(`${this.#botColor} make Lichess move`);
                lichessMove.moveInfos = moveInfos;
                console.log('%c human logic: humanMoveLogic_ok', "color:green; font-size:14px;");
                return lichessMove;
            } 
            //console.log('No more moves in the Lichess Database for ' + this.#botColor);
        }else{
            moveInfos += `Le bot ne se sert pas de la BDD de Lichess pour trouver des coups dans l'ouverture.\n\n`;
            console.log('%c human logic: notUseDatabase_ok', "color:green; font-size:14px;");
        }
        //console.log('human logic: 1');
        

        console.log('%c human logic: isNearCheckmate_start', "color:orange; font-size:14px;");
        const isNearCheckmateRes = await this.#isNearCheckmate(this.#defaultBotParams.playForcedMate, game);
        console.log('%c human logic: isNearCheckmate_ok', "color:green; font-size:14px;"); 
        if(isNearCheckmateRes) {
            const checkmateMove = await this.#makeForcedCheckmate(game);
            checkmateMove.moveInfos = moveInfos + checkmateMove.moveInfos;
            console.log('human logic: makeForcedCheckmate_ok');
            console.log('%c human logic: humanMoveLogic_ok', "color:green; font-size:14px;");
            return checkmateMove;
        }else{
            moveInfos += `Make Forced Checkmate: Le bot ne voit pas de mat en ${this.#defaultBotParams.playForcedMate} ou moins. \n\n`;
            console.log('%c human logic: notNearCheckmate_ok', "color:green; font-size:14px;");
        }
        //console.log('human logic: 2');
        


        //this.#engine.stop();
        //const stockfishBestMoves: EvalResultSimplified[] = await this.#engine.findBestMoves(game.fen(), this.#defaultBotParams.depth, this.#defaultBotParams.skillValue, 3, false);
        //const stockfishBestMoves: EvalResultSimplified[] = await this.#engine.findBestMoves(game.fen(), 10, 20, 3, false);
        //console.log(game.fen());
        //console.log(stockfishBestMoves);
        //console.log(`Sans erreurs humaines, les 3 meilleurs coups de Stockfish sont: ${stockfishBestMoves[0]?.bestMove}, ${stockfishBestMoves[1]?.bestMove}, ${stockfishBestMoves[2]?.bestMove}`);
        //console.log(newGame.ascii());
        
        console.log('%c human logic: isLastMoveDangerous_start', "color:orange; font-size:14px;");
        const {danger, dangerCases, dangerousMoveInfos} = this.#isLastMoveDangerous(game, blunderMult);
        moveInfos += dangerousMoveInfos;
        console.log('%c human logic: isLastMoveDangerous_ok', "color:green; font-size:14px;");

        //console.log("Le dernier coup est dangereux: " + danger);

        console.log('%c human logic: makeForcedExchange_start', "color:orange; font-size:14px;");
        const forcedExchangeMove = this.#makeForcedExchange(game, blunderMult);
        moveInfos += forcedExchangeMove.moveInfos;
        console.log('%c human logic: makeForcedExchange_ok', "color:green; font-size:14px;");
        if(forcedExchangeMove.type >= 0){
            this.#lastRandomMove = this.#lastRandomMove-1;
            forcedExchangeMove.moveInfos = moveInfos;
            console.log('%c human logic: humanMoveLogic_ok', "color:green; font-size:14px;");
            return forcedExchangeMove;
        }
        //console.log('human logic: 3');
    
        if(danger) {
            console.log('%c human logic: makeHumanThreatReaction_start', "color:orange; font-size:14px;");
            const reactingThreatMove = await this.#makeHumanThreatReaction(game, dangerCases, blunderMult);
            moveInfos += reactingThreatMove.moveInfos;
            console.log('%c human logic: makeHumanThreatReaction_ok', "color:green; font-size:14px;");

            if(reactingThreatMove.type >= 0 ){
                reactingThreatMove.moveInfos = moveInfos;
                console.log('%c human logic: humanMoveLogic_ok', "color:green; font-size:14px;");
                return reactingThreatMove;
            }
            //moveInfos += `Make Human Threat Reaction: Malgrès le danger, le bot n'a pas réagi dans la précipitation à la menace.\n\n`;
            //console.log('human logic: 4');
            //console.log('human logic: 5');
        }else{
            moveInfos += `Make Human Threat Reaction: Il n'y a pas de danger d'après le bot (sécurity level: ${this.#defaultBotParams.securityLvl}), donc pas de raison de réagir dans la précipitation.\n\n`;
            console.log('%c human logic: noDanger_ok', "color:green; font-size:14px;");
        }
        
        /* const tunelVisionMove = await this.#makeTunelVisionMove(game);
        moveInfos += tunelVisionMove.moveInfos;

        if(tunelVisionMove.type >= 0) {
            if(tunelVisionMove.type === 5) console.log(`Human move (${tunelVisionMove.type}): ${this.#toolbox.convertMoveLanToSan(game.fen(), tunelVisionMove.notation)}`);
            this.#lastRandomMove = this.#lastRandomMove-1;
            tunelVisionMove.moveInfos = moveInfos;
            return tunelVisionMove;
        } */

        if(useRandom && !danger && isRandomMovePlayable(this.#defaultBotParams, this.#botLevel, this.#lastRandomMove, blunderMult)) {
            this.#lastRandomMove = this.#defaultBotParams.randMoveInterval;
            console.log('%c human logic: makeRandomMove_start', "color:orange; font-size:14px;");
            const randomMove =  this.#makeRandomMove(this.#defaultBotParams.filterLevel, this.#defaultBotParams.securityLvl, game, this.#botColor);
            randomMove.moveInfos = moveInfos + randomMove.moveInfos;
            console.log('%c human logic: makeRandomMove_ok', "color:green; font-size:14px;");
            console.log('%c human logic: humanMoveLogic_ok', "color:green; font-size:14px;");
            return randomMove;
        }
        else{
            moveInfos += `Make Random Move: Le bot ne va pas jouer de coup aléatoire (use random: ${useRandom}, danger: ${danger}, last random move: ${this.#lastRandomMove}, random move interval: ${this.#defaultBotParams.randMoveInterval}).\n\n`;
            console.log('%c human logic: noRandomMove_ok', "color:green; font-size:14px;");
        }
        //console.log('human logic: 7');

        if(!danger) {
            console.log('%c human logic: ignoreOpponentMove_start', "color:orange; font-size:14px;");
            const noOpponentMove = await this.#ignoreOpponentMove(game, blunderMult);
            moveInfos += noOpponentMove.moveInfos;
            console.log('%c human logic: ignoreOpponentMove_ok', "color:green; font-size:14px;");

            if(noOpponentMove.type === 5) {
                this.#lastRandomMove = this.#lastRandomMove-1;
                noOpponentMove.moveInfos = moveInfos;
                console.log('%c human logic: humanMoveLogic_ok', "color:green; font-size:14px;"); 
                return noOpponentMove;
            }
        } else{
            moveInfos += `Le bot ${this.#username} considère le dernier coup comme dangereux donc il ne peut pas l'ignorer.\n\n`;
            console.log('%c human logic: danger_ok', "color:green; font-size:14px;");
        }
        
        //console.log('human logic: 8');

        // TODO: Faire en sorte que les débutant favorisent les coups vers l'avant et les échecs
        console.log('%c human logic: makeTunelVisionMove_start', "color:orange; font-size:14px;");
        const tunelVisionMove = await this.#makeTunelVisionMove(game, blunderMult);
        moveInfos += tunelVisionMove.moveInfos;
        console.log('%c human logic: makeTunelVisionMove_ok', "color:green; font-size:14px;");

        if(tunelVisionMove.type > 0) {
            //console.log(`Human move (${tunelVisionMove.type}): ${this.#toolbox.convertMoveLanToSan(game.fen(), tunelVisionMove.notation)}`);
            this.#lastRandomMove = this.#lastRandomMove-1;
            tunelVisionMove.moveInfos = moveInfos;
            console.log('%c human logic: humanMoveLogic_ok', "color:green; font-size:14px;");
            return tunelVisionMove;
        } 
        //console.log('human logic: 9');

        console.log('%c human logic: makeStockfishMove_start', "color:orange; font-size:14px;");
        const stockfishMove = await makeStockfishMove(this.#defaultBotParams, game, this.#engine);
        this.#lastRandomMove = this.#lastRandomMove-1;
        moveInfos += stockfishMove.moveInfos;
        stockfishMove.moveInfos = moveInfos; 
        console.log('%c human logic: makeStockfishMove_ok', "color:green; font-size:14px;");
        console.log('%c human logic: humanMoveLogic_ok', "color:green; font-size:14px;");
        //console.log('human logic: 10');
        //console.log(stockfishMove);

        return stockfishMove;
    }

    async #makeHumanMove(game: Chess, blunderMult: number): Promise<Move> {
        //console.log(`%c Bot AI (${this.#botID}): Human behaviour`, "color:green; font-size:16px;");
        //console.log('Last Random Move: ' + this.#lastRandomMove);
        let move: Move = {
            notation: '',
            type: -1,
            moveInfos: 'Aucune information'
        };

        setTimeout(() => {
            if(move.type < 0) {
                console.log('%c La fonction #makeHumanMove a sûrement rencontré un problème', 'color:red; font-size:16px;');
                move = this.#makeRandomMove(2, 2, game, this.#botColor);
                move.moveInfos += `%c Ni Stockfish, ni la méthode min-max n'ont pu générer de coup, le bot fait donc un coup aléatoire ! (${move.notation})`, 'color:blue; font-size:16px;';
                return move;
            }else{
                console.log('%c La fonction #makeHumanMove a trouvé un coup', 'color:green; font-size:16px;');
            }
        }, 7000);

        const humanMove = await this.#humanMoveLogic(game, true, true, blunderMult);
        if(humanMove.type >= 0) {
            //console.log(`humanMove: ${humanMove.notation}`);
            return humanMove;
        }

        move.moveInfos += `Erreur: Stockfish a rencontré un problème et n'a pas pu générer de coup, le bot utilise la méthode min-max pour trouver un coup ! (${move.notation})`;

        const homemadeEngineMove = await this.#homemadeEngine.findBestMove(game.fen());
        if(homemadeEngineMove.type >= 0) {
            //console.log(`homemadeEngineMove: ${homemadeEngineMove.notation}`);
            return homemadeEngineMove;
        }

        //console.log("%C Stockfish n'a pas pu générer de coup, le bot fait donc un coup aléatoire !", "color:red; font-size:16px;");

        move = this.#makeRandomMove(2, 2, game, this.#botColor);
        move.moveInfos += `Ni Stockfish, ni la méthode min-max n'ont pu générer de coup, le bot fait donc un coup aléatoire ! (${move.notation})`;
        return move;
    }

    async #pawnPusherLogic(game: Chess): Promise<Move> {
        let move: Move = {
            notation: '',
            type: -1,
            moveInfos: `Le bot ${this.#username} a trouvé un coup dans son répertoire d'ouverture '${this.#behaviour}'.\n\n`,
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
        move.moveInfos = `Le bot ${this.#username} a trouvé un coup dans son répertoire d'ouverture '${this.#behaviour}'.\n\n`

        return move;
    }

    /**
     * Joue le plus possible des coups de pions, souvent au détriment du développement de ses pièces.
     */
    async #makePawnPusherMove(game: Chess, blunderMult: number): Promise<Move> {
        //console.log('Bot AI: Pawn Pusher');

        const gimmickMove = await this.#pawnPusherLogic(game);
        if(gimmickMove.type >= 0) {
            this.#lastRandomMove = this.#lastRandomMove-1;
            return gimmickMove;
        }
        
        const humanMove = await this.#humanMoveLogic(game, true, true, blunderMult);
        humanMove.moveInfos = `Le bot ${this.#username} ne trouve pas de coup dans son répertoire d'ouverture '${this.#behaviour}'.\n\n` + humanMove.moveInfos;
        return humanMove;
    }

    async #fianchettoEnjoyerLogic(game: Chess): Promise<Move> {
        let move: Move = {
            notation: '',
            type: -1,
            moveInfos: `Le bot ${this.#username} a trouvé un coup dans son répertoire d'ouverture '${this.#behaviour}'.\n\n`,
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
    async #makeFianchettoEnjoyerMove(game: Chess, blunderMult: number): Promise<Move> {
        //console.log('Bot AI: Fianchetto Sniper');

        const gimmickMove = await this.#fianchettoEnjoyerLogic(game);
        if(gimmickMove.type >= 0) {
            this.#lastRandomMove = this.#lastRandomMove-1;
            return gimmickMove;
        }

        const humanMove = await this.#humanMoveLogic(game, true, true, blunderMult);
        humanMove.moveInfos = `Le bot ${this.#username} ne trouve pas de coup dans son répertoire d'ouverture '${this.#behaviour}'.\n\n` + humanMove.moveInfos;
        return humanMove;
    }

    async #shyLogic(game: Chess): Promise<Move> {
        let move: Move = {
            notation: '',
            type: -1,
            moveInfos: `Le bot ${this.#username} a trouvé un coup dans son répertoire d'ouverture '${this.#behaviour}'.\n\n`,
        };
        let kingRank = this.#toolbox.getKingSquare(game.fen(), this.#botColor).charCodeAt(1) - '0'.charCodeAt(0);
        kingRank = Math.min(7, Math.max(1, kingRank));

        if(game.history().length > 20) {
            return move;
        }

        let stockfishMoves: EvalResultSimplified[] = await this.#engine.findBestMoves(game.fen(), 10, this.#defaultBotParams.skillValue, 50, false);

        stockfishMoves = stockfishMoves.map((evalRes) => {
            const moveDistance = Math.abs((evalRes.bestMove.charCodeAt(3) - '0'.charCodeAt(0)) - kingRank);
            console.log(`King Rank (${kingRank}), Move (${evalRes.bestMove}), Distance: ${moveDistance}`);
            let randBonus = Math.max(0.5, 0.2 + Math.random()); 
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
    async #makeShyMove(game: Chess, blunderMult: number): Promise<Move> {
        //console.log('Bot AI: shy');

        const gimmickMove = await this.#shyLogic(game);
        if(gimmickMove.type >= 0) {
            this.#lastRandomMove = this.#lastRandomMove-1;
            return gimmickMove;
        }

        const humanMove = await this.#humanMoveLogic(game, true, true, blunderMult);
        humanMove.moveInfos = `Le bot ${this.#username} ne trouve pas de coup dans son répertoire d'ouverture '${this.#behaviour}'.\n\n` + humanMove.moveInfos;
        return humanMove;
    }

    #semiRandomLogic(game: Chess): Move {
        let move: Move = {
            notation: '',
            type: -1,
            moveInfos: `Le bot ${this.#username} a trouvé un coup qui correspond à son gimmick '${this.#behaviour}'.\n\n`,
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
            moveInfos: `Le bot ${this.#username} a trouvé un coup qui correspond à son gimmick '${this.#behaviour}'.\n\n`,
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
            moveInfos: `Le bot ${this.#username} a trouvé un coup qui correspond à son gimmick '${this.#behaviour}'.\n\n`,
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
            moveInfos: `Le bot ${this.#username} a trouvé un coup dans son répertoire d'ouverture '${this.#behaviour}'.\n\n`,
        };

        if(game.history().length > 10) {
            return move;
        }

        let openingMove = this.#queenPlayerOpenings(game);
        if(openingMove.type >= 0) {
            return openingMove;
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
    async #makeQueenPlayerMove(game: Chess, blunderMult: number): Promise<Move> {
        //console.log('Bot AI: Queen Player');

        const gimmickMove = await this.#queenPlayerLogic(game);
        if(gimmickMove.type >= 0) {
            this.#lastRandomMove = this.#lastRandomMove-1;
            return gimmickMove;
        }

        const humanMove = await this.#humanMoveLogic(game, true, true, blunderMult);
        humanMove.moveInfos = `Le bot ${this.#username} ne trouve pas de coup dans son répertoire d'ouverture '${this.#behaviour}'.\n\n` + humanMove.moveInfos;
        return humanMove;
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
            moveInfos: `Le bot ${this.#username} a trouvé un coup dans son répertoire d'ouverture '${this.#behaviour}'.\n\n`,
        };

        if(game.history().length > 8) {
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
    async #makeBotezGambitMove(game: Chess, blunderMult: number): Promise<Move> {
        //console.log('Bot AI: Botez Gambit');

        const gimmickMove = await this.#botezGambitLogic(game);
        if(gimmickMove.type >= 0) {
            this.#lastRandomMove = this.#lastRandomMove-1;
            return gimmickMove;
        }

        const humanMove = await this.#humanMoveLogic(game, true, true, blunderMult);
        humanMove.moveInfos = `Le bot ${this.#username} ne trouve pas de coup dans son répertoire d'ouverture '${this.#behaviour}'.\n\n` + humanMove.moveInfos;
        return humanMove;
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

            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.e5 Ng4 6.h3':
                move.notation = 'g4f2';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.e5 Ng4 6.h3 Nxf2 7.Kxf2':
                move.notation = 'd8d4';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.e5 Ng4 6.Be2':
                move.notation = 'd8d4';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.e5 Ng4 6.Be2 Qd4 7.O-O':
                move.notation = 'h7h5';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.e5 Ng4 6.Qe2':
                move.notation = 'f8c5';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.e5 Ng4 6.Qe2 Bc5 7.f3':
                move.notation = 'c5f2';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.e5 Ng4 6.Qe2 Bc5 7.f3 Bf2+ 8.Kd1':
                move.notation = 'g4e3';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.e5 Ng4 6.d4':
                move.notation = 'f8c5';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.e5 Ng4 6.d4 Bc5 7.dxc5':
                move.notation = 'd8d1';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.e5 Ng4 6.d4 Bc5 7.h3':
                move.notation = 'c5d4';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.e5 Ng4 6.d4 Bc5 7.h3 Bxd4 8.hxg4':
                move.notation = 'd4f2';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.e5 Ng4 6.d4 Bc5 7.h3 Bxd4 8.hxg4 Bxf2+ 9.Ke2':
                move.notation = 'c8g4';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.e5 Ng4 6.d4 Bc5 7.c3':
                move.notation = 'g4e5';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.e5 Ng4 6.d4 Bc5 7.c3 Nxe5 8.dxe5':
                move.notation = 'c5f2';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.e5 Ng4 6.d4 Bc5 7.c3 Nxe5 8.dxc5':
                move.notation = 'd8d1';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.e5 Ng4 6.d4 Bc5 7.c3 Nxe5 8.dxc5 Qxd1+ 9.Kxd1':
                move.notation = 'c8g4';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.e5 Ng4 6.d4 Bc5 7.c3 Nxe5 8.dxc5 Qxd1+ 9.Kxd1 Bg4+ 10.f3':
                move.notation = 'e5f3';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.e5 Ng4 6.d4 Bc5 7.c3 Nxe5 8.dxc5 Qxd1+ 9.Kxd1 Bg4+ 10.f3 Nxf3 11.gxf3':
                move.notation = 'g4f3';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.e5 Ng4 6.d4 Bc5 7.c3 Nxe5 8.dxc5 Qxd1+ 9.Kxd1 Bg4+ 10.f3 Nxf3 11.gxf3 Bxf3+ 12.Be2':
                move.notation = 'e8c8';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.e5 Ng4 6.d4 Bc5 7.c3 Nxe5 8.dxc5 Qxd1+ 9.Kxd1 Bg4+ 10.f3 Nxf3 11.gxf3 Bxf3+ 12.Be2 O-O-O+ 13.Ke1':
                move.notation = 'f3h1';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.e5 Ng4 6.d4 Bc5 7.c3 Nxe5 8.dxc5 Qxd1+ 9.Kxd1 Bg4+ 10.Be2':
                move.notation = 'e8c8';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.e5 Ng4 6.d4 Bc5 7.c3 Nxe5 8.dxc5 Qxd1+ 9.Kxd1 Bg4+ 10.Be2 O-O-O+ 11.Bd2':
                move.notation = 'g4e2';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nf6 3.Nxe5 Nc6 4.Nxc6 dxc6 5.e5 Ng4 6.d4 Bc5 7.c3 Nxe5 8.dxc5 Qxd1+ 9.Kxd1 Bg4+ 10.Be2 O-O-O+ 11.Bd2 Bxe2+ 12.Kxe2':
                move.notation = 'e5d3';
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
                move.notation = 'e5d4';
                move.type = 2;
                return move;

            // Scotch Game
            case '1.e4 e5 2.Nf3 Nc6 3.d4 exd4 4.Nxd4':
                move.notation = 'd8h4';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nc6 3.d4 exd4 4.Nxd4 Qh4 5.Nxc6':
                move.notation = 'h4e4';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nc6 3.d4 exd4 4.Nxd4 Qh4 5.Nc3':
                move.notation = 'f8b4';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nc6 3.d4 exd4 4.Nxd4 Qh4 5.Nc3 Bb4 6.Nxc6':
                move.notation = 'h4e4';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nc6 3.d4 exd4 4.Nxd4 Qh4 5.Nc3 Bb4 6.Nxc6 Qxe4+ 7.Qe2':
                move.notation = 'e4e2';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nc6 3.d4 exd4 4.Nxd4 Qh4 5.Nc3 Bb4 6.Nxc6 Qxe4+ 7.Qe2 Qxe2 8.Bxe2':
                move.notation = 'd7c6';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nc6 3.d4 exd4 4.Nxd4 Qh4 5.Nc3 Bb4 6.Nxc6 Qxe4+ 7.Be3':
                move.notation = 'b4c3';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nc6 3.d4 exd4 4.Nxd4 Qh4 5.Nc3 Bb4 6.Nxc6 Qxe4+ 7.Be3 Bxc3+ 8.bxc3':
                move.notation = 'd7c6';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nc6 3.d4 exd4 4.Nxd4 Qh4 5.Nc3 Bb4 6.Qd3':
                move.notation = 'g8f6';
                move.type = 2;
                return move;

            // Scotch Gambit
            case '1.e4 e5 2.Nf3 Nc6 3.d4 exd4 4.Bc4':
                move.notation = 'f8b4';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nc6 3.d4 exd4 4.Bc4 Bb4+ 5.Bd2':
                move.notation = 'c4d2';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nc6 3.d4 exd4 4.Bc4 Bb4+ 5.Bd2 Bxd2+ 6.Qxd2':
                move.notation = 'g8f6';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nc6 3.d4 exd4 4.Bc4 Bb4+ 5.c3':
                move.notation = 'd4c3';
                move.type = 2;
                return move;
            
            case '1.e4 e5 2.Nf3 Nc6 3.d4 exd4 4.Bc4 Bb4+ 5.c3 dxc3 6.Bxc3':
                move.notation = 'b4a5';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nc6 3.d4 exd4 4.Bc4 Bb4+ 5.c3 dxc3 6.O-O':
                move.notation = 'g8f6';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nc6 3.d4 exd4 4.Bc4 Bb4+ 5.c3 dxc3 6.O-O Nf6 7.e5':
                move.notation = 'd7d5';
                move.type = 2;
                return move;

            case '1.e4 e5 2.Nf3 Nc6 3.d4 exd4 4.Bc4 Bb4+ 5.c3 dxc3 6.O-O Nf6 7.bxc3':
                move.notation = 'b4c5';
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

            // King's Gambit, Muzio Gambit
            case '1.e4 e5 2.f4 exf4':
                move.notation = 'g1f3';
                move.type = 2;
                return move;
            
            case '1.e4 e5 2.f4 exf4 3.Nf3 g5':
                move.notation = 'f1c4';
                move.type = 2;
                return move; 

            case '1.e4 e5 2.f4 exf4 3.Nf3 g5 4.Bc4 g4':
                move.notation = 'e1g1';
                move.type = 2;
                return move; 

            case '1.e4 e5 2.f4 exf4 3.Nf3 g5 4.Bc4 g4 5.O-O gxf3':
                move.notation = 'd1f3';
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

            // Alekhine Defense
            case '1.e4 Nf6':
                move.notation = 'e4e5';
                move.type = 2;
                return move;
            case '1.e4 Nf6 2.e5 Nd5':
                move.notation = 'd2d4';
                move.type = 2;
                return move; 
            case '1.e4 Nf6 2.e5 Nd5 3.d4 Nc6':
                move.notation = 'g1f3';
                move.type = 2;
                return move;

            case '1.e4 Nf6 2.e5 Nd5 3.d4 Nc6 4.Nf3 d6':
                move.notation = 'e5e6';
                move.type = 2;
                return move;

            case '1.e4 Nf6 2.e5 Nd5 3.d4 Nc6 4.Nf3 d6 5.e6 Bxe6':
                move.notation = 'c2c4';
                move.type = 2;
                return move;

            case '1.e4 Nf6 2.e5 Nd5 3.d4 Nc6 4.Nf3 d6 5.e6 Bxe6 6.c4 Ndb4':
                move.notation = 'a2a3';
                move.type = 2;
                return move;

            case '1.e4 Nf6 2.e5 Nd5 3.d4 Nc6 4.Nf3 d6 5.e6 Bxe6 6.c4 Ndb4 7.a3 Na6':
                move.notation = 'd4d5';
                move.type = 2;
                return move;

            case '1.e4 Nf6 2.e5 Nd5 3.d4 Nc6 4.Nf3 d6 5.e6 Bxe6 6.c4 Nb6':
                move.notation = 'd4d5';
                move.type = 2;
                return move;

            case '1.e4 Nf6 2.e5 Nd5 3.d4 Nc6 4.Nf3 d6 5.e6 Bxe6 6.c4 Nf6':
                move.notation = 'd4d5';
                move.type = 2;
                return move;

            case '1.e4 Nf6 2.e5 Nd5 3.d4 Nc6 4.Nf3 d6 5.e6 Bxe6 6.c4 Nxd4':
                move.notation = 'f3d4';
                move.type = 2;
                return move;

            case '1.e4 Nf6 2.e5 Nd5 3.d4 Nc6 4.Nf3 d6 5.e6 Bxe6 6.c4 Nxd4 7.Nxd4 Nf6':
                move.notation = 'd4e6';
                move.type = 2;
                return move;

            case '1.e4 Nf6 2.e5 Nd5 3.d4 d6':
                move.notation = 'g1f3';
                move.type = 2;
                return move;

            case '1.e4 Nf6 2.e5 Nd5 3.d4 d6 4.Nf3 Bg4':
                move.notation = 'f1e2';
                move.type = 2;
                return move;

            case '1.e4 Nf6 2.e5 Nd5 3.d4 d6 4.Nf3 Bg4 5.Be2 Nc6':
                move.notation = 'e5e6';
                move.type = 2;
                return move;

            case '1.e4 Nf6 2.e5 Nd5 3.d4 d6 4.Nf3 Bg4 5.Be2 Nc6 6.e6 Bxe6':
                move.notation = 'c2c4';
                move.type = 2;
                return move;

            case '1.e4 Nf6 2.e5 Nd5 3.d4 d6 4.Nf3 Bg4 5.Be2 Nc6 6.e6 Bxe6 7.c4 Ndb4':
                move.notation = 'a2a3';
                move.type = 2;
                return move;

            case '1.e4 Nf6 2.e5 Nd5 3.d4 d6 4.Nf3 Bg4 5.Be2 Nc6 6.e6 Bxe6 7.c4 Ndb4 8.a3 Na6':
                move.notation = 'd4d5';
                move.type = 2;
                return move;

            case '1.e4 Nf6 2.e5 Nd5 3.d4 d6 4.Nf3 Bg4 5.Be2 Nc6 6.e6 Bxe6 7.c4 Nb6':
                move.notation = 'd4d5';
                move.type = 2;
                return move;


            case '1.e4 Nf6 2.e5 Nd5 3.d4 d6 4.Nf3 Bg4 5.Be2 Nc6 6.e6 Bxe6 7.c4 Nf6':
                move.notation = 'd4d5';
                move.type = 2;
                return move;

            case '1.e4 Nf6 2.e5 Nd5 3.d4 d6 4.Nf3 Bg4 5.Be2 Nc6 6.e6 Bxe6 7.c4 Nf4':
                move.notation = 'c1f4';
                move.type = 2;
                return move;

            case '1.e4 Nf6 2.e5 Nd5 3.d4 d6 4.Nf3 Bg4 5.Be2 Nc6 6.e6 Bxe6 7.c4 Nxd4':
                move.notation = 'f3d4';
                move.type = 2;
                return move;

            case '1.e4 Nf6 2.e5 Nd5 3.d4 d6 4.Nf3 Bg4 5.Be2 Nc6 6.e6 Bxe6 7.c4 Nxd4 8.Nxd4 Nf6':
                move.notation = 'd4e6';
                move.type = 2;
                return move;

            case '1.e4 Nf6 2.e5 Nd5 3.d4 d6 4.Nf3 Nc6':
                move.notation = 'e5e6';
                move.type = 2;
                return move;

            case '1.e4 Nf6 2.e5 Nd5 3.d4 d6 4.Nf3 Nc6 5.e6 Bxe6':
                move.notation = 'c2c4';
                move.type = 2;
                return move;

            case '1.e4 Nf6 2.e5 Nd5 3.d4 d6 4.Nf3 Nc6 5.e6 Bxe6 6.c4 Ndb4':
                move.notation = 'a2a3';
                move.type = 2;
                return move;

            case '1.e4 Nf6 2.e5 Nd5 3.d4 d6 4.Nf3 Nc6 5.e6 Bxe6 6.c4 Ndb4 7.a3 Na6':
                move.notation = 'd4d5';
                move.type = 2;
                return move;

            case '1.e4 Nf6 2.e5 Nd5 3.d4 d6 4.Nf3 Nc6 5.e6 Bxe6 6.c4 Nb6':
                move.notation = 'd4d5';
                move.type = 2;
                return move;

            case '1.e4 Nf6 2.e5 Nd5 3.d4 d6 4.Nf3 Nc6 5.e6 Bxe6 6.c4 Nf6':
                move.notation = 'd4d5';
                move.type = 2;
                return move;

            case '1.e4 Nf6 2.e5 Nd5 3.d4 d6 4.Nf3 Nc6 5.e6 Bxe6 6.c4 Nxd4':
                move.notation = 'f3d4';
                move.type = 2;
                return move;

            case '1.e4 Nf6 2.e5 Nd5 3.d4 d6 4.Nf3 Nc6 5.e6 Bxe6 6.c4 Nxd4 7.Nxd4 Nf6':
                move.notation = 'd4e6';
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
            moveInfos: `Le bot ${this.#username} a trouvé un coup dans son répertoire d'ouverture '${this.#behaviour}'.\n\n`,
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
    async #makeGambitFanaticMove(game: Chess, blunderMult: number): Promise<Move> {
        //console.log('Bot AI: Gambit Fanatic');
        
        const gimmickMove = await this.#gambitFanaticLogic(game);
        if(gimmickMove.type >= 0) {
            this.#lastRandomMove = this.#lastRandomMove-1;
            return gimmickMove;
        } 

        const humanMove = await this.#humanMoveLogic(game, true, true, blunderMult);
        humanMove.moveInfos = `Le bot ${this.#username} ne trouve pas de coup dans son répertoire d'ouverture '${this.#behaviour}'.\n\n` + humanMove.moveInfos;
        return humanMove;
    }

    async #copycatLogic(game: Chess): Promise<Move> {
        let move: Move = {
            notation: '',
            type: -1,
            moveInfos: `Le bot ${this.#username} a trouvé un coup dans son répertoire d'ouverture '${this.#behaviour}'.\n\n`,
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
    async #makeCopycatMove(game: Chess, blunderMult: number): Promise<Move> {
        //console.log('Bot AI: Copycat');

        const gimmickMove = await this.#copycatLogic(game);
        if(gimmickMove.type >= 0) {
            this.#lastRandomMove = this.#lastRandomMove-1;
            return gimmickMove;
        }

        const humanMove = await this.#humanMoveLogic(game, true, true, blunderMult);
        humanMove.moveInfos = `Le bot ${this.#username} ne trouve pas de coup dans son répertoire d'ouverture '${this.#behaviour}'.\n\n` + humanMove.moveInfos;
        return humanMove;
    }

    async #bongcloudLogic(game: Chess): Promise<Move> {
        let move: Move = {
            notation: '',
            type: -1,
            moveInfos: `Le bot ${this.#username} a trouvé un coup dans son répertoire d'ouverture '${this.#behaviour}'.\n\n`,
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
    async #makeBongcloudMove(game: Chess, blunderMult: number): Promise<Move> {
        //console.log('Bot AI: Bongcloud');

        const gimmickMove = await this.#bongcloudLogic(game);
        if(gimmickMove.type >= 0) {
            this.#lastRandomMove = this.#lastRandomMove-1;
            return gimmickMove;
        }

        const humanMove = await this.#humanMoveLogic(game, true, true, blunderMult);
        humanMove.moveInfos = `Le bot ${this.#username} ne trouve pas de coup dans son répertoire d'ouverture '${this.#behaviour}'.\n\n` + humanMove.moveInfos;
        return humanMove;
    }

    async #exchangesLoverLogic(game: Chess): Promise<Move> {
        let move: Move = {
            notation: '',
            type: -1,
            moveInfos: `Le bot ${this.#username} a trouvé un coup qui correspond à son gimmick '${this.#behaviour}'.\n\n`,
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
    async #makeExchangesLoverMove(game: Chess, blunderMult: number): Promise<Move> {
        //console.log('Bot AI: Exchange Lover');

        if(isRandomMovePlayable(this.#defaultBotParams, this.#botLevel, this.#lastRandomMove, blunderMult)) {
            this.#lastRandomMove = this.#defaultBotParams.randMoveInterval;
            return this.#makeRandomMove(this.#defaultBotParams.filterLevel, this.#defaultBotParams.securityLvl, game, this.#botColor);
        }

        const gimmickMove = await this.#exchangesLoverLogic(game);
        this.#lastRandomMove = this.#lastRandomMove-1;
        return gimmickMove;
    }

    async #exchangesHaterLogic(game: Chess): Promise<Move> {
        let move: Move = {
            notation: '',
            type: -1,
            moveInfos: `Le bot ${this.#username} a trouvé un coup dans son répertoire d'ouverture '${this.#behaviour}'.\n\n`,
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
    async #makeExchangesHaterMove(game: Chess, blunderMult: number): Promise<Move> {
        //console.log('Bot AI: Exchange Hater');

        if(isRandomMovePlayable(this.#defaultBotParams, this.#botLevel, this.#lastRandomMove, blunderMult)) {
            this.#lastRandomMove = this.#defaultBotParams.randMoveInterval;
            return this.#makeRandomMove(this.#defaultBotParams.filterLevel, this.#defaultBotParams.securityLvl, game, this.#botColor);
        }

        const gimmickMove = await this.#exchangesHaterLogic(game);
        this.#lastRandomMove = this.#lastRandomMove-1;
        return gimmickMove;
    }

    async #cowLoverLogic(game: Chess): Promise<Move> {
        let move: Move = {
            notation: '',
            type: -1,
            moveInfos: `Le bot ${this.#username} a trouvé un coup dans son répertoire d'ouverture '${this.#behaviour}'.\n\n`,
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
    async #makeCowLoverMove(game: Chess, blunderMult: number): Promise<Move> {
        //console.log('Bot AI: Cow Lover');

        const gimmickMove = await this.#cowLoverLogic(game);
        if(gimmickMove.type >= 0) {
            this.#lastRandomMove = this.#lastRandomMove-1;
            return gimmickMove;
        }

        const humanMove = await this.#humanMoveLogic(game, true, true, blunderMult);
        humanMove.moveInfos = `Le bot ${this.#username} ne trouve pas de coup dans son répertoire d'ouverture '${this.#behaviour}'.\n\n` + humanMove.moveInfos;
        return humanMove;
    }

    async #knightsDanceLogic(game: Chess): Promise<Move> {
        let move: Move = {
            notation: '',
            type: -1,
            moveInfos: `Le bot ${this.#username} a trouvé un coup dans son répertoire d'ouverture '${this.#behaviour}'.\n\n`,
        };

        if(game.history().length > 20) {
            return move;
        }
        const knightCases: Square[] = ['b1', 'g1', 'a3', 'c3', 'f3', 'h3', 'b8', 'g8', 'a6', 'c6', 'f6', 'h6'];

        let stockfishMoves: EvalResultSimplified[] = await this.#engine.findBestMoves(game.fen(), 10, 20, 50, false);

        stockfishMoves = stockfishMoves.map((evalRes) => {
            const moveDestination = this.#toolbox.getMoveDestination(evalRes.bestMove);
            const moveOrigin = this.#toolbox.getMoveOrigin(evalRes.bestMove);
            if(!moveDestination || !moveOrigin){
                evalRes.eval = (evalMove(evalRes, this.#botColor, this.#toolbox)).toString();
                return evalRes;
            }
            let randBonus = 1;

            if(this.#toolbox.getMovePiece(evalRes.bestMove, game.fen()).type === 'n' && knightCases.includes(moveDestination)) {
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
     * Joue la danse des cavaliers.
     */
    async #makeKnightsDanceMove(game: Chess, blunderMult: number): Promise<Move> {
        //console.log('Bot AI: KNights Dance');

        const gimmickMove = await this.#knightsDanceLogic(game);
        if(gimmickMove.type >= 0) {
            return gimmickMove;
        }

        const humanMove = await this.#humanMoveLogic(game, true, true, blunderMult);
        humanMove.moveInfos = `Le bot ${this.#username} ne trouve pas de coup dans son répertoire d'ouverture '${this.#behaviour}'.\n\n` + humanMove.moveInfos;
        return humanMove;
    }

    /**
     * Joue très bien les ouvertures, mais assez mal le reste de la partie.
     */
    async #makeChessableMasterMove(game: Chess, blunderMult: number): Promise<Move> {
        //console.log('Bot AI: Openings Master');
        const movesList = this.#toolbox.convertHistorySanToLan(this.#toolbox.convertPgnToHistory(game.pgn()));

        const lichessMove = await makeLichessMove(movesList, 2500, '', this.#toolbox);
        if(lichessMove.type >= 0){
            lichessMove.moveInfos = `Le bot ${this.#username} a trouvé un coup dans son répertoire d'ouverture de joueurs >2500 Élo.\n\n` + lichessMove.moveInfos;
            return lichessMove;
        }

        const humanMove = await this.#humanMoveLogic(game, false, true, blunderMult);
        humanMove.moveInfos = `Le bot ${this.#username} ne trouve pas de coup dans son répertoire d'ouverture '${this.#behaviour}'.\n\n` + humanMove.moveInfos;
        return humanMove;
    }

    /**
     * Connait très mal les ouvertures, mais assez bien le reste de la partie.
     */
    async #makeAutoDidacteMove(game: Chess, blunderMult: number): Promise<Move> {
        //console.log('Bot AI: Openings Beginner');

        const movesList = this.#toolbox.convertHistorySanToLan(this.#toolbox.convertPgnToHistory(game.pgn()));

        const lichessMove = await makeLichessMove(movesList, 500, '', this.#toolbox);
        if(lichessMove.type >= 0){
            lichessMove.moveInfos = `Le bot ${this.#username} a trouvé un coup dans son répertoire d'ouverture de joueurs <500 Élo.\n\n` + lichessMove.moveInfos;
            return lichessMove;
        }

        const humanMove = await this.#humanMoveLogic(game, false, true, blunderMult);
        humanMove.moveInfos = `Le bot ${this.#username} ne trouve pas de coup dans son répertoire d'ouverture '${this.#behaviour}'.\n\n` + humanMove.moveInfos;
        return humanMove;
    }

    #naivePlayerOpenings(game: Chess): Move {
        let move: Move = {
            notation: '',
            type: -1,
        };

        const formatedPGN = game.pgn().replaceAll(/\.\s/g, '.');
        let rand = Math.random()*100;
        console.log(`PGN: ${formatedPGN}`);

        if(game.history().length === 0) {
            move.notation = 'd2d4';
            move.type = 2;
            return move;
        }

        // London System (White)
        if(formatedPGN === '1.d4 d5') {
            move.notation = 'c1f4';
            move.type = 2;
            return move;
        }

        if(formatedPGN === '1.d4 d5 2.Bf4 h5') {
            move.notation = 'e2e3';
            move.type = 2;
            return move;
        }

        if(formatedPGN === '1.d4 d5 2.Bf4 h5 3.e3 e5') {
            move.notation = 'f4e5';
            move.type = 2;
            return move;
        }

        if(formatedPGN === '1.d4 d5 2.Bf4 h5 3.e3 e5 4.Bxe5 f6') {
            move.notation = 'e5g3';
            move.type = 2;
            return move;
        }

        if(formatedPGN === '1.d4 d5 2.Bf4 h5 3.e3 e5 4.Bxe5 f6 5.Bg3 h4') {
            move.notation = 'g3f4';
            move.type = 2;
            return move;
        }

        if(formatedPGN === '1.d4 d5 2.Bf4 h5 3.e3 e5 4.Bxe5 f6 5.Bg3 h4 6.Bf4 g5') {
            move.notation = 'f4g5';
            move.type = 2;
            return move;
        }

        // Indian Defense (White)
        if(formatedPGN === '1.d4 Nf6') {
            move.notation = 'c1f4';
            move.type = 2;
            return move;
        }

        // Benoni Style (White)
        if(formatedPGN === '1.d4 Nf6 2.Bf4 c5') {
            move.notation = 'g1f3';
            move.type = 2;
            return move;
        }

        if(formatedPGN === '1.d4 Nf6 2.Bf4 c5 3.Nf3 cxd4') {
            move.notation = 'f3d4';
            move.type = 2;
            return move;
        }

        if(formatedPGN === '1.d4 Nf6 2.Bf4 c5 3.Nf3 cxd4 4.Nxd4 e5') {
            move.notation = 'f4e5';
            move.type = 2;
            return move;
        }

        if(formatedPGN === '1.d4 Nf6 2.Bf4 c5 3.Nf3 cxd4 4.Nxd4 e5 5.Bxe5 Qa5+') {
            move.notation = 'b1c3';
            move.type = 2;
            return move;
        }

        // King's Indian (White)
        if(formatedPGN === '1.d4 Nf6 2.Bf4 g6') {
            move.notation = 'e2e3';
            move.type = 2;
            return move;
        }

        if(formatedPGN === '1.d4 Nf6 2.Bf4 g6 3.e3 Bg7') {
            move.notation = 'g1f3';
            move.type = 2;
            return move;
        }

        if(formatedPGN === '1.d4 Nf6 2.Bf4 g6 3.e3 Bg7 4.Nf3 O-O') {
            move.notation = 'f1d3';
            move.type = 2;
            return move;
        }

        if(formatedPGN === '1.d4 Nf6 2.Bf4 g6 3.e3 Bg7 4.Nf3 O-O 5.Bd3 d6') {
            move.notation = 'e1h1';
            move.type = 2;
            return move;
        }

        if(formatedPGN === '1.d4 Nf6 2.Bf4 g6 3.e3 Bg7 4.Nf3 O-O 5.Bd3 d6 6.O-O Nbd7') {
            move.notation = 'b1d2';
            move.type = 2;
            return move;
        }

        if(formatedPGN === '1.d4 Nf6 2.Bf4 g6 3.e3 Bg7 4.Nf3 O-O 5.Bd3 d6 6.O-O Nbd7 7.Nbd2 Re8') {
            move.notation = 'c2c3';
            move.type = 2;
            return move;
        }

        if(formatedPGN === '1.d4 Nf6 2.Bf4 g6 3.e3 Bg7 4.Nf3 O-O 5.Bd3 d6 6.O-O Nbd7 7.Nbd2 Re8 8.c3 e5') {
            move.notation = 'd4e5';
            move.type = 2;
            return move;
        }

        if(formatedPGN === '1.d4 Nf6 2.Bf4 g6 3.e3 Bg7 4.Nf3 O-O 5.Bd3 d6 6.O-O Nbd7 7.Nbd2 Re8 8.c3 e5 9.dxe5 dxe5') {
            move.notation = 'f4g3';
            move.type = 2;
            return move;
        }

        if(formatedPGN === '1.d4 Nf6 2.Bf4 g6 3.e3 Bg7 4.Nf3 O-O 5.Bd3 d6 6.O-O Re8') {
            move.notation = 'b1d2';
            move.type = 2;
            return move;
        }

        if(formatedPGN === '1.d4 Nf6 2.Bf4 g6 3.e3 Bg7 4.Nf3 O-O 5.Bd3 d6 6.O-O Re8 7.Nbd2 Nbd7') {
            move.notation = 'c2c3';
            move.type = 2;
            return move;
        }

        if(formatedPGN === '1.d4 Nf6 2.Bf4 g6 3.e3 Bg7 4.Nf3 O-O 5.Bd3 d6 6.O-O Re8 7.Nbd2 Nbd7 8.c3 e5') {
            move.notation = 'd4e5';
            move.type = 2;
            return move;
        }

        if(formatedPGN === '1.d4 Nf6 2.Bf4 g6 3.e3 Bg7 4.Nf3 O-O 5.Bd3 d6 6.O-O Re8 7.Nbd2 Nbd7 8.c3 e5 9.dxe5 dxe5') {
            move.notation = 'f4g3';
            move.type = 2;
            return move;
        }

        // 1.e4 (Black)
        if(formatedPGN === '1.e4') {
            move.notation = 'e7e5';
            move.type = 2;
            return move;
        }

        if(formatedPGN === '1.e4 e5 2.Nf3') {
            if(rand <= 55) {
                move.notation = 'd7d6';
                move.type = 2;
                return move;
            }
            move.notation = 'b8c6';
            move.type = 2;
            return move;
        }

        // Philidor
        if(formatedPGN === '1.e4 e5 2.Nf3 d6 3.d4') {
            move.notation = 'c8g4';
            move.type = 2;
            return move;
        }

        if(formatedPGN === '1.e4 e5 2.Nf3 d6 3.d4 Bg4 4.dxe5') {
            move.notation = 'g4f3';
            move.type = 2;
            return move;
        }

        if(formatedPGN === '1.e4 e5 2.Nf3 d6 3.d4 Bg4 4.dxe5 Bxf3 5.Qxf3') {
            move.notation = 'd6e5';
            move.type = 2;
            return move;
        }

        // Italian
        if(formatedPGN === '1.e4 e5 2.Nf3 Nc6 3.Bc4') {
            move.notation = 'g8f6';
            move.type = 2;
            return move;
        }

        if(formatedPGN === '1.e4 e5 2.Nf3 Nc6 3.Bc4 Nf6 4.Ng5') {
            move.notation = 'd7d5';
            move.type = 2;
            return move;
        }

        if(formatedPGN === '1.e4 e5 2.Nf3 Nc6 3.Bc4 Nf6 4.Ng5 d5 5.exd5') {
            move.notation = 'f6d5';
            move.type = 2;
            return move;
        }

        if(formatedPGN === '1.e4 e5 2.Nf3 Nc6 3.Bc4 Nf6 4.Ng5 d5 5.exd5 Nxd5 6.Nxf7') {
            move.notation = 'e8f7';
            move.type = 2;
            return move;
        }

        if(formatedPGN === '1.e4 e5 2.Nf3 Nc6 3.Bc4 Nf6 4.Ng5 d5 5.exd5 Nxd5 6.d4') {
            move.notation = 'e5d4';
            move.type = 2;
            return move;
        }

        if(formatedPGN === '1.e4 e5 2.Nf3 Nc6 3.Bc4 Nf6 4.Ng5 d5 5.exd5 Nxd5 6.d4 exd4 7.O-O') {
            move.notation = 'f8e7';
            move.type = 2;
            return move;
        }

        // Spanish
        if(formatedPGN === '1.e4 e5 2.Nf3 Nc6 3.Bb5') {
            move.notation = 'g8f6';
            move.type = 2;
            return move;
        }

        if(formatedPGN === '1.e4 e5 2.Nf3 Nc6 3.Bb5 Nf6 4.O-O') {
            move.notation = 'f6e4';
            move.type = 2;
            return move;
        }

        if(formatedPGN === '1.e4 e5 2.Nf3 Nc6 3.Bb5 Nf6 4.O-O Nxe4 5.d4') {
            move.notation = 'e5d4';
            move.type = 2;
            return move;
        }

        if(formatedPGN === '1.e4 e5 2.Nf3 Nc6 3.Bb5 Nf6 4.O-O Nxe4 5.d4 exd4 6.Re1') {
            move.notation = 'd7d5';
            move.type = 2;
            return move;
        }

        if(formatedPGN === '1.e4 e5 2.Nf3 Nc6 3.Bb5 Nf6 4.O-O Nxe4 5.d4 exd4 6.Re1 d5 7.Nxd4') {
            if(this.#defaultBotParams.elo < 1000) {
                move.notation = 'f8e7';
                move.type = 2;
                return move;
            }
            move.notation = 'c8d7';
            move.type = 2;
            return move;
        }

        if(formatedPGN === '1.e4 e5 2.Nf3 Nc6 3.Bb5 Nf6 4.d3') {
            move.notation = 'f8c5';
            move.type = 2;
            return move;
        }

        if(formatedPGN === '1.e4 e5 2.Nf3 Nc6 3.Bb5 Nf6 4.d3 Bc5 5.c3') {
            move.notation = 'a7a6';
            move.type = 2;
            return move;
        }

        // Scotch Game
        if(formatedPGN === '1.e4 e5 2.Nf3 Nc6 3.d4') {
            move.notation = 'e5d4';
            move.type = 2;
            return move;
        }

        if(formatedPGN === '1.e4 e5 2.Nf3 Nc6 3.d4 exd4 4.Nxd4') {
            move.notation = 'c6d4';
            move.type = 2;
            return move;
        }

        if(formatedPGN === '1.e4 e5 2.Nf3 Nc6 3.d4 exd4 4.Nxd4 Nxd4 5.Qxd4') {
            move.notation = 'g8f6';
            move.type = 2;
            return move;
        }

        if(formatedPGN === '1.e4 e5 2.Nf3 Nc6 3.d4 exd4 4.Nxd4 Nxd4 5.Qxd4 Nf6 6.e5') {
            move.notation = 'd8e7';
            move.type = 2;
            return move;
        }

        // Scotch Gambit
        if(formatedPGN === '1.e4 e5 2.Nf3 Nc6 3.d4 exd4 4.Bc4') {
            move.notation = 'g8f6';
            move.type = 2;
            return move;
        }

        if(formatedPGN === '1.e4 e5 2.Nf3 Nc6 3.d4 exd4 4.Bc4 Nf6 5.e5') {
            move.notation = 'f6g4';
            move.type = 2;
            return move;
        }

        if(formatedPGN === '1.e4 e5 2.Nf3 Nc6 3.d4 exd4 4.Bc4 Nf6 5.e5 Ng4 6.O-O') {
            move.notation = 'g4e5';
            move.type = 2;
            return move;
        }

        if(formatedPGN === '1.e4 e5 2.Nf3 Nc6 3.d4 exd4 4.Bc4 Nf6 5.e5 Ng4 6.O-O Ngxe5 7.Nxe5') {
            move.notation = 'c6e5';
            move.type = 2;
            return move;
        }

        if(formatedPGN === '1.e4 e5 2.Nf3 Nc6 3.d4 exd4 4.Bc4 Nf6 5.e5 Ng4 6.O-O Ngxe5 7.Nxe5 Nxe5 8.Re1') {
            move.notation = 'd7d6';
            move.type = 2;
            return move;
        }

        // Vienna Game
        if(formatedPGN === '1.e4 e5 2.Nc3') {
            move.notation = 'g8f6';
            move.type = 2;
            return move;
        }

        // Vienna Gambit
        if(formatedPGN === '1.e4 e5 2.Nc3 Nf6 3.f4') {
            if(rand <= 30) {
                move.notation = 'b8c6';
                move.type = 2;
                return move;
            }
            move.notation = 'e5f4';
            move.type = 2;
            return move;
        }

        if(formatedPGN === '1.e4 e5 2.Nc3 Nf6 3.f4 exf4 4.e5') {
            move.notation = 'd8e7';
            move.type = 2;
            return move;
        }

        if(formatedPGN === '1.e4 e5 2.Nc3 Nf6 3.f4 exf4 4.e5 Qe7 5.Qe2') {
            move.notation = 'f6g8';
            move.type = 2;
            return move;
        }

        if(formatedPGN === '1.e4 e5 2.Nc3 Nf6 3.f4 exf4 4.e5 Qe7 5.Qe2 Ng8 6.Nf3') {
            move.notation = 'd7d6';
            move.type = 2;
            return move;
        }

        if(formatedPGN === '1.e4 e5 2.Nc3 Nf6 3.f4 exf4 4.e5 Qe7 5.Qe2 Ng8 6.d4') {
            move.notation = 'd7d6';
            move.type = 2;
            return move;
        }

        // King's Gambit
        if(formatedPGN === '1.e4 e5 2.f4 exf4 3.Nf3 g5 4.h4 f6 5.Nxg5 fxg5') {
            move.notation = 'd7d6';
            move.type = 2;
            return move;
        }

        if(formatedPGN === '1.e4 e5 2.f4') {
            move.notation = 'e5f4';
            move.type = 2;
            return move;
        }

        if(formatedPGN === '1.e4 e5 2.f4 exf4 3.Nf3') {
            move.notation = 'g7g5';
            move.type = 2;
            return move;
        }

        if(formatedPGN === '1.e4 e5 2.f4 exf4 3.Nf3 g5 4.h4') {
            move.notation = 'f7f6';
            move.type = 2;
            return move;
        }

        if(formatedPGN === '1.e4 e5 2.f4 exf4 3.Nf3 g5 4.h4 f6 5.Nxg5') {
            move.notation = 'f6g5';
            move.type = 2;
            return move;
        }

        if(formatedPGN === '1.e4 e5 2.f4 exf4 3.Nf3 g5 4.Bc4') {
            move.notation = 'g5g4';
            move.type = 2;
            return move;
        }

        if(formatedPGN === '1.e4 e5 2.f4 exf4 3.Nf3 g5 4.Bc4 g4 5.O-O') {
            move.notation = 'g4f3';
            move.type = 2;
            return move;
        }

        if(formatedPGN === '1.e4 e5 2.f4 exf4 3.Nf3 g5 4.Bc4 g4 5.O-O gxf3 6.Qxf3') {
            move.notation = 'f8h6';
            move.type = 2;
            return move;
        }

        if(formatedPGN === '1.e4 e5 2.f4 exf4 3.Nf3 g5 4.Bc4 g4 5.O-O gxf3 6.Qxf3 Bh6 7.d4') {
            move.notation = 'd8f6';
            move.type = 2;
            return move;
        }

        if(formatedPGN === '1.e4 e5 2.f4 exf4 3.Nf3 g5 4.Bc4 g4 5.O-O gxf3 6.Qxf3 Bh6 7.d4 Qf6 8.e5') {
            move.notation = 'f6g5';
            move.type = 2;
            return move;
        }

        if(formatedPGN === '1.e4 e5 2.f4 exf4 3.Nf3 g5 4.Bc4 g4 5.O-O gxf3 6.Qxf3 Bh6 7.d4 Qf6 8.e5 Qg5 9.Nc3') {
            move.notation = 'b8c3';
            move.type = 2;
            return move;
        }

        // Danish Gambit
        if(formatedPGN === '1.e4 e5 2.d4') {
            move.notation = 'e5d4';
            move.type = 2;
            return move;
        }

        if(formatedPGN === '1.e4 e5 2.d4 exd4 3.c3') {
            move.notation = 'd4c3';
            move.type = 2;
            return move;
        }

        if(formatedPGN === '1.e4 e5 2.d4 exd4 3.c3 dxc3 4.Bc4') {
            move.notation = 'c3b2';
            move.type = 2;
            return move;
        }

        if(formatedPGN === '1.e4 e5 2.d4 exd4 3.c3 dxc3 4.Bc4 cxb2 5.Bxb2') {
            move.notation = 'f8b4';
            move.type = 2;
            return move;
        }

        if(formatedPGN === '1.e4 e5 2.d4 exd4 3.c3 dxc3 4.Bc4 cxb2 5.Bxb2 Bb4+ 6.Nc3') {
            move.notation = 'b4c3';
            move.type = 2;
            return move;
        }

        if(formatedPGN === '1.e4 e5 2.d4 exd4 3.c3 dxc3 4.Bc4 cxb2 5.Bxb2 Bb4+ 6.Nc3 Bxc3+ 7.Bxc3') {
            move.notation = 'g8f6';
            move.type = 2;
            return move;
        }

        if(formatedPGN === '1.e4 e5 2.d4 exd4 3.c3 dxc3 4.Bc4 cxb2 5.Bxb2 Bb4+ 6.Nc3 Bxc3+ 7.Bxc3 Nf6 8.e5') {
            move.notation = 'f6e4';
            move.type = 2;
            return move;
        }

        if(formatedPGN === '1.e4 e5 2.d4 exd4 3.c3 dxc3 4.Nxc3') {
            move.notation = 'f8b4';
            move.type = 2;
            return move;
        }

        if(formatedPGN === '1.e4 e5 2.d4 exd4 3.c3 dxc3 4.Nxc3 Bb4 5.Bc4') {
            move.notation = 'g8f6';
            move.type = 2;
            return move;
        }

        if(formatedPGN === '1.e4 e5 2.d4 exd4 3.c3 dxc3 4.Nxc3 Bb4 5.Bc4 Nf6 6.e5') {
            move.notation = 'f6e4';
            move.type = 2;
            return move;
        }

        // 1.d4 (Black)
        if(formatedPGN === '1.d4') {
            move.notation = 'd7d5';
            move.type = 2;
            return move;
        }

        // Queen's Gambit
        if(formatedPGN === '1.d4 d5 2.c4') {
            move.notation = 'd5c4';
            move.type = 2;
            return move;
        }

        if(formatedPGN === '1.d4 d5 2.c4 dxc4 3.e3') {
            move.notation = 'b7b5';
            move.type = 2;
            return move;
        }

        if(formatedPGN === '1.d4 d5 2.c4 dxc4 3.e3 b5 4.a4') {
            move.notation = 'c7c6';
            move.type = 2;
            return move;
        }

        if(formatedPGN === '1.d4 d5 2.c4 dxc4 3.e3 b5 4.a4 c6 5.axb5') {
            move.notation = 'c6b5';
            move.type = 2;
            return move;
        }

        if(formatedPGN === '1.d4 d5 2.c4 dxc4 3.e4') {
            move.notation = 'b7b5';
            move.type = 2;
            return move;
        }

        if(formatedPGN === '1.d4 d5 2.c4 dxc4 3.e4 b5 4.a4') {
            move.notation = 'a7a6';
            move.type = 2;
            return move;
        }

        // Jobava London
        if(formatedPGN === '1.d4 d5 2.Bf4') {
            move.notation = 'g8f6';
            move.type = 2;
            return move;
        }

        if(formatedPGN === '1.d4 d5 2.Bf4 Nf6 3.Nc3') {
            move.notation = 'b8c6';
            move.type = 2;
            return move;
        }

        if(formatedPGN === '1.d4 d5 2.Bf4 Nf6 3.Nc3 Nc6 4.Nb5') {
            move.notation = 'e7e5';
            move.type = 2;
            return move;
        }

        if(formatedPGN === '1.d4 d5 2.Bf4 Nf6 3.Nc3 Nc6 4.Nb5 e5 5.Bxe5') {
            move.notation = 'c6e5';
            move.type = 2;
            return move;
        }

        if(formatedPGN === '1.d4 d5 2.Bf4 Nf6 3.Nc3 Nc6 4.Nb5 e5 5.Bxe5 Nxe5 6.dxe5') {
            move.notation = 'f6e4';
            move.type = 2;
            return move;
        }

        if(formatedPGN === '1.d4 d5 2.Bf4 Nf6 3.Nc3 Nc6 4.Nb5 e5 5.Bxe5 Nxe5 6.dxe5 Ne4 7.Qxd5') {
            move.notation = 'd8d5';
            move.type = 2;
            return move;
        }

        return move;
    }

    async #naivePlayerLogic(game: Chess): Promise<Move> {
        let move: Move = {
            notation: '',
            type: -1,
            moveInfos: `Le bot ${this.#username} a trouvé un coup dans son répertoire d'ouverture '${this.#behaviour}'.\n\n`,
        };

        let openingMove = this.#naivePlayerOpenings(game);
        if(openingMove.type >= 0) {
            return openingMove;
        }

        return move;
    }

    /**
     * Se prend facilement les pièges d'ouverture !!!
     */
    async #makeNaivePlayerMove(game: Chess, blunderMult: number): Promise<Move> {
        //console.log('Bot AI: Botez Gambit');

        const gimmickMove = await this.#naivePlayerLogic(game);
        if(gimmickMove.type >= 0) {
            this.#lastRandomMove = this.#lastRandomMove-1;
            return gimmickMove;
        }

        let humanMove: Move = {
            notation: '',
            type: -1,
            moveInfos: `Le bot ${this.#username} n'a trouvé aucun un coup dans son répertoire d'ouverture '${this.#behaviour}'.\n\n`,
        };

        /* setTimeout(() => {
            if(humanMove.type < 0) {
                humanMove = this.#makeRandomMove(2, 2, game, this.#botColor);
                console.log(`%c La fonction #makeNaivePlayerMove a sûrement rencontré un problème et le bot joue le coup random '${humanMove.notation}'`, 'color:red; font-size:16px;');
                humanMove.moveInfos += `%c Ni Stockfish, ni la méthode min-max n'ont pu générer de coup, le bot fait donc un coup aléatoire ! (${humanMove.notation})`, 'color:blue; font-size:16px;';
                return humanMove;
            }else{
                console.log('%c La fonction #makeNaivePlayerMove a trouvé un coup', 'color:green; font-size:16px;');
                return humanMove;
            }
        }, 2000); */

        const STOCKFISH_TIMEOUT = new Promise<Move>((res) => setTimeout(() => res({notation: '', type: -1, moveInfos: 'Temps écoulé !'}), 15000));
        //humanMove = await this.#humanMoveLogic(game, true, true, blunderMult);
        let result = await Promise.race([STOCKFISH_TIMEOUT, this.#humanMoveLogic(game, true, true, blunderMult)]);

        if(result.type < 0) {
            result = await this.#makeHomemadeEngineMove(game, blunderMult);
            console.log(`%c Stockfish a dû rencontrer un problème -> (${result.notation})`, 'color:red; font-size:16px;');
        }

        result.moveInfos = `Le bot ${this.#username} ne trouve pas de coup dans son répertoire d'ouverture '${this.#behaviour}'.\n\n` + humanMove.moveInfos;
        return result;
    }

    async #sacrificeFanaticLogic(game: Chess): Promise<Move> {
        let move: Move = {
            notation: '',
            type: -1,
            moveInfos: ``,
        };

        let positionEval = await this.#engine.evalPositionFromFen(game.fen(), 12);
        let positionEvalNumber = positionEval.eval.includes('#') ? this.#engine.mateToNumber(positionEval.eval) : eval(positionEval.eval);
        let scoreAbsoluteDiff = 100;

        const isBrillant = (fen: string, movePlayed: string, scoreAbsoluteDiff: number, tolerance: number) => {
            if(scoreAbsoluteDiff > tolerance) return false;
            if(this.#toolbox.getPositionMoves(fen).length < 2) return false; // Si seul coup possible, ce n'est pas un coup brillant
            const capturesChainValue = this.#toolbox.getCapturesChainValue(fen, movePlayed);
            if(capturesChainValue > -2) return false;
            //console.log(`%c ${movePlayed} est un coup brillant !`, 'color:cyan; font-size:12px;');
            return true;
        }

        let stockfishMoves: EvalResultSimplified[] = await this.#engine.findBestMoves(game.fen(), 10, 20, 40, false);
        console.log('Find brillant move');
        stockfishMoves.forEach((sfm) => {
            let sfmEval: number = sfm.eval.includes('#') ? this.#engine.mateToNumber(sfm.eval) : eval(sfm.eval);
            if(this.#botColor === 'b') sfmEval *= -1;
            let newScoreAbsoluteDiff = Math.abs(positionEvalNumber - sfmEval);
            let sfmBrillant: boolean = isBrillant(game.fen(), sfm.bestMove, newScoreAbsoluteDiff, 1.3);
            let isCapture: boolean = this.#toolbox.isCapture(game.fen(), sfm.bestMove);

            if(sfmBrillant) {
                console.log(`%c ${sfm.bestMove} -> Position_eval: ${positionEvalNumber}, Move_eval: ${sfmEval}, Score_abs_diff: ${newScoreAbsoluteDiff}, Is_brillant: ${sfmBrillant}, Is_capture: ${isCapture}`, 'color:cyan; font-size:12px;');
            }else{
                console.log(`%c ${sfm.bestMove} -> Position_eval: ${positionEvalNumber}, Move_eval: ${sfmEval}, Score_abs_diff: ${newScoreAbsoluteDiff}, Is_brillant: ${sfmBrillant}, Is_capture: ${isCapture}`, 'color:black; font-size:12px;');
            }

            if(sfmBrillant && isCapture && newScoreAbsoluteDiff < scoreAbsoluteDiff) {
                scoreAbsoluteDiff = newScoreAbsoluteDiff;
                move.notation = sfm.bestMove;
                move.type = 5;
            }
        })

        return move;
    }

    /**
     * Aime sacrifier sa dame le plus rapidement possible !!!
     */
    async #makeSacrificeFanaticMove(game: Chess, blunderMult: number): Promise<Move> {
        //console.log('Bot AI: Botez Gambit');

        const gimmickMove = await this.#sacrificeFanaticLogic(game);
        if(gimmickMove.type >= 0) {
            this.#lastRandomMove = this.#lastRandomMove-1;
            return gimmickMove;
        }

        let humanMove: Move = {
            notation: '',
            type: -1,
            moveInfos: `Le bot ${this.#username} n'a trouvé aucun sacrifice intéressant.\n\n`,
        };

        const STOCKFISH_TIMEOUT = new Promise<Move>((res) => setTimeout(() => res({notation: '', type: -1, moveInfos: 'Temps écoulé !'}), 15000));
        //humanMove = await this.#humanMoveLogic(game, true, true, blunderMult);
        let result = await Promise.race([STOCKFISH_TIMEOUT, this.#humanMoveLogic(game, true, true, blunderMult)]);

        if(result.type < 0) {
            result = await this.#makeHomemadeEngineMove(game, blunderMult);
            console.log(`%c Stockfish a dû rencontrer un problème -> (${result.notation})`, 'color:red; font-size:16px;');
        }

        result.moveInfos = `Le bot ${this.#username} ne trouve pas de coup dans son répertoire d'ouverture '${this.#behaviour}'.\n\n` + humanMove.moveInfos;
        return result;
    }

    async #castleDestroyerLogic(game: Chess): Promise<Move> {
        let move: Move = {
            notation: '',
            type: -1,
            moveInfos: `Le bot ${this.#username} a trouvé un coup dans son répertoire d'ouverture '${this.#behaviour}'.\n\n`,
        };

        if((this.#defaultBotParams.elo <= 800 && game.history().length > 24) || (this.#defaultBotParams.elo <= 1500 && game.history().length > 30) || (this.#defaultBotParams.elo <= 1800 && game.history().length > 36) || (game.history().length > 40)) {
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

    async #castleDestroyerLogic_v2(game: Chess): Promise<Move> {
        let move: Move = {
            notation: '',
            type: -1,
            moveInfos: `Le bot ${this.#username} a trouvé un coup dans son répertoire d'ouverture '${this.#behaviour}'.\n\n`,
        };

        if((this.#defaultBotParams.elo <= 800 && game.history().length > 24) || (this.#defaultBotParams.elo <= 1500 && game.history().length > 30) || (this.#defaultBotParams.elo <= 1800 && game.history().length > 36) || (game.history().length > 40)) {
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

        // Valorise les coups de développement qui attaquent les pions devant le roi adverse
        // Valorise les captures/sacrifices sur les pions devant le roi adverse

        return move;
    }

    /**
     * Attend que l'adversaire soit roqué pour roquer du côté opposé puis lui envoyer une marée de pions sur son roque.
     */
    // TODO: À améliorer
    async #makeCastleDestroyerMove(game: Chess, blunderMult: number): Promise<Move> {
        //console.log('Bot AI: Castle Destroyer');

        const gimmickMove = await this.#castleDestroyerLogic(game);
        if(gimmickMove.type >= 0) {
            this.#lastRandomMove = this.#lastRandomMove-1;
            return gimmickMove;
        }

        const humanMove = await this.#humanMoveLogic(game, true, true, blunderMult);
        humanMove.moveInfos = `Le bot ${this.#username} ne trouve pas de coup dans son répertoire d'ouverture '${this.#behaviour}'.\n\n` + humanMove.moveInfos;
        return humanMove;
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
            moveInfos: `Le bot ${this.#username} a trouvé un coup dans son répertoire d'ouverture '${this.#behaviour}'.\n\n`,
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

        let stockfishMoves: EvalResultSimplified[] = await this.#engine.findBestMoves(game.fen(), 10, this.#defaultBotParams.skillValue, 50, false);

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
    async #makeIndianKingMove(game: Chess, blunderMult: number): Promise<Move> {
        console.log('Bot AI: Indian King');

        const gimmickMove = await this.#indianKingLogic(game);
        if(gimmickMove.type >= 0) {
            this.#lastRandomMove = this.#lastRandomMove-1;
            return gimmickMove;
        }

        const humanMove = await this.#humanMoveLogic(game, true, true, blunderMult);
        humanMove.moveInfos = `Le bot ${this.#username} ne trouve pas de coup dans son répertoire d'ouverture '${this.#behaviour}'.\n\n` + humanMove.moveInfos;
        return humanMove;
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
            moveInfos: `Le bot ${this.#username} a trouvé un coup dans son répertoire d'ouverture '${this.#behaviour}'.\n\n`,
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
    async #makeStonewallMove(game: Chess, blunderMult: number): Promise<Move> {
        //console.log('Bot AI: Stonewall');

        const gimmickMove = await this.#stonewallLogic(game);
        if(gimmickMove.type >= 0) {
            this.#lastRandomMove = this.#lastRandomMove-1;
            return gimmickMove;
        }

        const humanMove = await this.#humanMoveLogic(game, true, true, blunderMult);
        humanMove.moveInfos = `Le bot ${this.#username} ne trouve pas de coup dans son répertoire d'ouverture '${this.#behaviour}'.\n\n` + humanMove.moveInfos;
        return humanMove;
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
            moveInfos: `Le bot ${this.#username} a trouvé un coup dans son répertoire d'ouverture '${this.#behaviour}'.\n\n`,
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

        let stockfishMoves: EvalResultSimplified[] = await this.#engine.findBestMoves(game.fen(), 10, this.#defaultBotParams.skillValue, 50, false);

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
    async #makeDragonMove(game: Chess, blunderMult: number): Promise<Move> {
        //console.log('Bot AI: Dragon');

        const gimmickMove = await this.#dragonLogic(game);
        if(gimmickMove.type >= 0) {
            this.#lastRandomMove = this.#lastRandomMove-1;
            return gimmickMove;
        }

        const humanMove = await this.#humanMoveLogic(game, true, true, blunderMult);
        humanMove.moveInfos = `Le bot ${this.#username} ne trouve pas de coup dans son répertoire d'ouverture '${this.#behaviour}'.\n\n` + humanMove.moveInfos;
        return humanMove;
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
            moveInfos: `Le bot ${this.#username} a trouvé un coup dans son répertoire d'ouverture '${this.#behaviour}'.\n\n`,
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
    async #makeCaroLondonMove(game: Chess, blunderMult: number): Promise<Move> {
        //console.log('Bot AI: Caro London');

        const gimmickMove = await this.#caroLondonLogic(game);
        if(gimmickMove.type >= 0) {
            this.#lastRandomMove = this.#lastRandomMove-1;
            return gimmickMove;
        }

        const humanMove = await this.#humanMoveLogic(game, true, true, blunderMult);
        humanMove.moveInfos = `Le bot ${this.#username} ne trouve pas de coup dans son répertoire d'ouverture '${this.#behaviour}'.\n\n` + humanMove.moveInfos;
        return humanMove;
    }

    #getTimeControlDelay(game: Chess, timeStamp: Timestamp) {
        //console.log('getTimeControlDelay');
        if(timeStamp.startingTime < 0) return {
            randDelay: 300,
            blunderMult: 1.0,
        };

        let rawDelay = timeStamp.startingTime/60;
        let timePercentage = (timeStamp.startingTime - timeStamp.timeElapsed)/timeStamp.startingTime;
        let blunderMult = 1.0;
        //console.log(`Raw Delay: ${rawDelay}`);
        if(game.history().length <= 10) rawDelay =  Math.min(5,rawDelay/4); // On joue plus vite dans l'ouverture
        if(timePercentage <= 0.2){
            rawDelay/=2;
            blunderMult = 1.2;
            //console.log(`Le bot ${this.#username} 20% ou moins de son temps initial !`);
        }
        if(timePercentage <= 0.1){
            rawDelay/=2;
            blunderMult = 1.5;
            //console.log(`Le bot ${this.#username} 10% ou moins de son temps initial !`);
        }
        if(timePercentage <= 0.05 && (timeStamp.startingTime - timeStamp.timeElapsed) < 20){
            rawDelay = 0.3;
            blunderMult = 2.0;
            //console.log(`Le bot ${this.#username} n'a presque plus de temps pour jouer !`);
        }
        let randDelay = Math.max(rawDelay,Math.random()*rawDelay*2)*1000;
        //console.log(`Temps de réflexion du bot: ${Math.round(randDelay)/1000}s`);
        return {
            randDelay: randDelay,
            blunderMult: blunderMult,
        };
    }

    async makeMove(game: Chess, timeStamp: Timestamp): Promise<Move> {
        let move: Move = {
            notation: '',
            type: -1,
        };

        //console.log('Play computer move (async makeMove(game: Chess))');
        //console.log(game.fen());
        //console.log(game.moves());

        //Simulation d'un temps de réflexion du bot
        const {randDelay : thinkingDelay, blunderMult} = this.#getTimeControlDelay(game, timeStamp);

        switch (this.#behaviour) {
            case "default":
                move = await this.#makeDefaultMove(game, blunderMult);
                break;

            case "homemade-engine":
                move = await this.#makeHomemadeEngineMove(game, blunderMult);
                break;

            //TODO: Récupérer game.history({verbose: true}) et si length > 1 utiliser startingFen = history[0].before
            case "stockfish-random": // Plutôt faire puzzle bot qui utilise aussi la bdd lichess
                move = await this.#makeStockfishRandomMove(game, blunderMult);
                break;

            case "stockfish-only": // Plutôt faire puzzle bot qui utilise aussi la bdd lichess
                move = await this.#makeStockfishOnlyMove(game, blunderMult);
                break;

            case "human":
                move = await this.#makeHumanMove(game, blunderMult);
                break;
            case "pawn-pusher":
                move = await this.#makePawnPusherMove(game, blunderMult);
                break;

            case "fianchetto-sniper":
                move = await this.#makeFianchettoEnjoyerMove(game, blunderMult);
                break;

            case "shy":
                move = await this.#makeShyMove(game, blunderMult);
                break;

            case "blundering":
                move = await this.#makeBlunderMove(game);
                break;

            case "drawish":
                move = await this.#makeDrawishMove(game);
                break;

            case "queen-player":
                move = await this.#makeQueenPlayerMove(game, blunderMult);
                break;

            case "botez-gambit":
                move = await this.#makeBotezGambitMove(game, blunderMult);
                break;

            case "gambit-fanatic":
                move = await this.#makeGambitFanaticMove(game, blunderMult);
                break; //makeSacrificeFanaticMove

            case "sacrifice-fanatic":
                move = await this.#makeSacrificeFanaticMove(game, blunderMult);
                break;
            
            case "copycat":
                move = await this.#makeCopycatMove(game, blunderMult);
                break;

            case 'bongcloud':
                move = await this.#makeBongcloudMove(game, blunderMult);
                break;

            case 'exchanges-lover':
                move = await this.#makeExchangesLoverMove(game, blunderMult);
                break;

            case 'exchanges-hater':
                move = await this.#makeExchangesHaterMove(game, blunderMult);
                break;
            
            case 'cow-lover':
                move = await this.#makeCowLoverMove(game, blunderMult);
                break;

            case 'knights-dance':
                move = await this.#makeKnightsDanceMove(game, blunderMult);
                break;

            case 'random-player':
                move = this.#makeRandomMove(2, 0, game, this.#botColor);
                break;

            case 'semi-random':
                move = this.#makeSemiRandomMove(game);
                break;

            case 'chessable-master':
                initDefaultBotParams(700, '3+0');
                move = await this.#makeChessableMasterMove(game, blunderMult);
                break;

            case 'auto-didacte':
                initDefaultBotParams(1800, '3+0');
                move = await this.#makeAutoDidacteMove(game, blunderMult);
                break;

            case 'naive-player':
                move = await this.#makeNaivePlayerMove(game, blunderMult);
                break;

            case 'castle-destroyer':
                move = await this.#makeCastleDestroyerMove(game, blunderMult);
                break;

            case 'indian-king':
                move = await this.#makeIndianKingMove(game, blunderMult); 
                break;

            case 'stonewall':
                move = await this.#makeStonewallMove(game, blunderMult); 
                break;

            case 'dragon':
                move = await this.#makeDragonMove(game, blunderMult); 
                break;

            case 'caro-london':
                move = await this.#makeCaroLondonMove(game, blunderMult); 
                break;

            default:
                move = await this.#makeDefaultMove(game, blunderMult);
                break;
        }

        // TODO: Vérifier si ça peut faire match nul
        if(!move || this.#botLevel === 'Maximum') return move;
        const underPromoteMove = move.notation.match(/(?<move>.{4})[bnr]/)?.groups?.move;
        if(underPromoteMove) {
            console.log(move.notation + ' est une sous-promotion');
            move.notation = move.notation.replace(/.{4}[bnr]/, underPromoteMove + 'q');
        } 

        
        await new Promise(resolve => setTimeout(resolve, thinkingDelay));
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

        let stockfishMoves: EvalResultSimplified[] = await this.#engine.findBestMoves(game.fen(), 12, this.#defaultBotParams.skillValue, 50, false);
        
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

    getID(): number {
        return this.#botID;
    }

    getUsername(): string {
        return this.#username;
    }

    getProfilePicture(): StaticImageData {
        return this.#profilePicture;
    }

    getElo(): number {
        return this.#defaultBotParams.elo;
    }

    changeColor(newColor: Color) {
        this.#botColor = newColor;
        this.#lastRandomMove = this.#botColor === 'w' ? (-1)*Math.floor(Math.random()*3) - 1 : Math.floor(Math.random()*3) + 1;
    }

    new(newBehaviour: Behaviour, newElo: number, newColor: Color, timeControl: string, randomName: boolean) {
        //TODO: Vérifier si ça limite les crash
        this.#engine.newGame();
        //this.#engine = new Engine();
        this.#lastRandomMove = this.#botColor === 'w' ? (-1)*Math.floor(Math.random()*3) - 1 : Math.floor(Math.random()*3) + 1;
        this.#botID = generateBotID();
        this.#botColor = newColor;
        this.#botLevel = getLevelFromElo(newElo);
        this.#behaviour = newBehaviour;
        const botInfos: BotDescription = generateRandomProfile();
        this.#username = randomName ? botInfos.name : (botsInfo.get(newBehaviour)?.name || botInfos.name);
        this.#profilePicture = randomName ? botInfos.image : (botsInfo.get(newBehaviour)?.image || botInfos.image);
        //this.#engine.init();
        this.#defaultBotParams = initDefaultBotParams(newElo, timeControl);
        //console.log(`New Bot (${this.#botID}): ${this.#behaviour}`);
    }

    reset() {
        this.#engine.newGame();
        this.#botID = generateBotID();
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

