import { Piece } from "chess.js"
import GameToolBox from "../game-toolbox/GameToolbox"
import { Move } from "../bots-ai/BotsAI"

export type Winrate = {
    white: number,
    draws: number,
    black: number
}

export type LichessMove = {
    uci: string,
    san: string,
    averageRating: number,
    white: number,
    draws: number,
    black: number,
    game: {
        id: string,
        winner: string,
        speed: string,
        mode: string,
        black: {
        name: string,
        rating: number
        },
        white: {
        name: string,
        rating: number
        },
        year: number,
        month: string
    }
}

function randomIntFromInterval(min: number, max: number) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min)
}

// https://explorer.lichess.ovh/lichess?variant=standard&fen=rnbqkbnr%2Fpppppppp%2F8%2F8%2F8%2F8%2FPPPPPPPP%2FRNBQKBNR+w+KQkq+-+0+1&play=e2e4%2Ce7e5%2Cg1f3&since=2012-01&until=2022-12&speeds=bullet%2Cblitz%2Crapid%2Cclassical&ratings=1600%2C1800%2C2000

const ratings = new Map([
    ['Beginner', '400%2C1000'],
    ['Casual', '1200%2C1400'],
    ['Intermediate', '1600%2C1800%2C2000'],
    ['Advanced', '2200%2C2500'],
])

function calculateWinrate(data: any) {
    const gamesTotal = data.white + data.draws + data.black;

    return {
        white: Math.round((data.white/gamesTotal)*100),
        draws: Math.round((data.draws/gamesTotal)*100),
        black: Math.round((data.black/gamesTotal)*100),
    }
}

export async function fetchLichessDatabase(moves: Array<String>, level: string, fen = "") {
    if(!ratings.has(level)) level = 'Master';
    if(fen === "") {
        fen = "rnbqkbnr%2Fpppppppp%2F8%2F8%2F8%2F8%2FPPPPPPPP%2FRNBQKBNR+w+KQkq+-+0+1";
    } else{
        fen = fen.replaceAll('/', '%2F');
        fen = fen.replaceAll(' ', '+');
    }

    const movesFormated = moves.join("%2C");
    let req = "";

    if(level === 'Master') {
        req = `https://explorer.lichess.ovh/masters?variant=standard&fen=${fen}&play=${movesFormated}&source=analysis`
    }else {
        const eloRange = ratings.get(level);
        req = `https://explorer.lichess.ovh/lichess?variant=standard&fen=${fen}&play=${movesFormated}&since=2012-01&until=2022-12&speeds=rapid%2Cclassical&ratings=${eloRange}`;
    }

    const res = await fetch(req);
    const data = await res.json();

    const gamesTotal = data.white + data.draws + data.black;
    let randMove = randomIntFromInterval(0, gamesTotal);
    let moveIndex = -1;
    let gamesArray: any[] = [];

    data.moves.map((move: any, i: number, array: Array<any>) => (
        gamesArray.push(array.slice(0,i+1).reduce((acc: number, curr: any) => acc + curr.white + curr.draws + curr.black, 0))
    ));

    moveIndex = gamesArray.length - gamesArray.filter(value => value > randMove).length;
    //console.log("Coup choisi : %s (%s)", data.moves[moveIndex]?.san,  data.moves[moveIndex]?.uci);

    return {
        san: data.moves[moveIndex]?.san,
        uci: data.moves[moveIndex]?.uci,
        winrate: calculateWinrate(data)
    }
}

export async function getHandMoveFromLichessDB(selectedPiece: string, moves: Array<String>, level: string, fen = ""): Promise<Move> {
    if(!ratings.has(level)) level = 'Master';
    const startingFen = "rnbqkbnr%2Fpppppppp%2F8%2F8%2F8%2F8%2FPPPPPPPP%2FRNBQKBNR+w+KQkq+-+0+1";

    const movesFormated = moves.join("%2C");
    let req = "";

    if(level === 'Master') {
        req = `https://explorer.lichess.ovh/masters?variant=standard&fen=${startingFen}&play=${movesFormated}&source=analysis`
    }else {
        const eloRange = ratings.get(level);
        req = `https://explorer.lichess.ovh/lichess?variant=standard&fen=${startingFen}&play=${movesFormated}&since=2012-01&until=2022-12&speeds=rapid%2Cclassical&ratings=${eloRange}`;
    }

    const res = await fetch(req);
    const data = await res.json();
    const toolbox = new GameToolBox();
    const selectedPieceMoves: LichessMove[] = data.moves.filter((move: LichessMove) => {
        return toolbox.getMovePiece(move.uci, fen).type === selectedPiece;
    });

    const gamesTotalWithSelectedPiece: number = selectedPieceMoves.reduce((acc: number, curr: LichessMove) => acc + curr.white + curr.draws + curr.black, 0);

    let randMove = randomIntFromInterval(0, gamesTotalWithSelectedPiece);
    let moveIndex = -1;
    let gamesArray: number[] = [];

    selectedPieceMoves.map((move: LichessMove, i: number, array: Array<any>) => (
        gamesArray.push(array.slice(0,i+1).reduce((acc: number, curr: LichessMove) => acc + curr.white + curr.draws + curr.black, 0))
    ));

    //moveIndex = gamesArray.length - gamesArray.filter(value => value > randMove).length;
    moveIndex = gamesArray.findIndex(value => value > randMove);

    if(moveIndex < 0) return {
        type: -1,
        notation: '',
    }

    return {
        notation: selectedPieceMoves[moveIndex].uci,
        type: 1,
    }
}

//TODO: à finir
//https://explorer.lichess.ovh/player?variant=standard&fen=rnbqkbnr%2Fpppppppp%2F8%2F8%2F8%2F8%2FPPPPPPPP%2FRNBQKBNR+w+KQkq+-+0+1&play=e2e4&speeds=rapid%2Cclassical&player=Hippo31&color=white&modes=casual%2Crated&source=analysis
export async function fetchPlayerLichessDB(username: string, playerColor: string, moves: Array<String>, level: string, fen = ""): Promise<Move> {
    playerColor = playerColor === 'w' ? 'white' : 'black';
    if(fen === "") {
        fen = "rnbqkbnr%2Fpppppppp%2F8%2F8%2F8%2F8%2FPPPPPPPP%2FRNBQKBNR+w+KQkq+-+0+1";
    } else{
        fen = fen.replaceAll('/', '%2F');
        fen = fen.replaceAll(' ', '+');
    }

    const movesFormated = moves.join("%2C");
    let req = `https://explorer.lichess.ovh/player?variant=standard&fen=${fen}&play=${movesFormated}&speeds=rapid%2Cclassical&player=${username}&color=${playerColor}&modes=casual%2Crated&source=analysis`;


    const res = await fetch(req);
    const data = await res.json();

    const gamesTotal = data.white + data.draws + data.black;
    let randMove = randomIntFromInterval(0, gamesTotal);
    let moveIndex = -1;
    let gamesArray: any[] = [];

    data.moves.map((move: LichessMove, i: number, array: Array<any>) => (
        gamesArray.push(array.slice(0,i+1).reduce((acc: number, curr: LichessMove) => acc + curr.white + curr.draws + curr.black, 0))
    ));

    moveIndex = gamesArray.length - gamesArray.filter(value => value > randMove).length;
    //console.log("Coup choisi : %s (%s)", data.moves[moveIndex]?.san,  data.moves[moveIndex]?.uci);

    if(moveIndex < 0) return {
        type: -1,
        notation: '',
    }

    return {
        notation: data.moves[moveIndex].uci,
        type: 1,
    }
}

/* export function getLichessWinrate(moves: Array<String>, level: string, fen = ""): Promise<Winrate> {
    return new Promise((resolve, reject) => {
        if(!ratings.has(level)) level = 'Master';
        console.log("Database Level: " + level);
        if(fen === "") {
            fen = "rnbqkbnr%2Fpppppppp%2F8%2F8%2F8%2F8%2FPPPPPPPP%2FRNBQKBNR+w+KQkq+-+0+1";
        } else{
            console.log(fen);
            fen = fen.replaceAll('/', '%2F');
            fen = fen.replaceAll(' ', '+');
            console.log(fen);
        }

        const movesFormated = moves.join("%2C");
        let req = "";

        if(level === 'Master') {
            req = `https://explorer.lichess.ovh/masters?variant=standard&fen=${fen}&play=${movesFormated}&source=analysis`
        }else {
            const eloRange = ratings.get(level);
            req = `https://explorer.lichess.ovh/lichess?variant=standard&fen=${fen}&play=${movesFormated}&since=2012-01&until=2022-12&speeds=rapid%2Cclassical&ratings=${eloRange}`;
        }

        fetch(req).then((res) => {
            console.log(res);
            const data = res.json();
            console.log(data);
            //@ts-ignore
            console.log(data.black);

            resolve(calculateWinrate(data));
        });
    });
} */

export async function getLichessWinrate(moves: Array<String>, level: string, fen = ""): Promise<Winrate> {
    if(!ratings.has(level)) level = 'Master';
    if(fen === "") {
        fen = "rnbqkbnr%2Fpppppppp%2F8%2F8%2F8%2F8%2FPPPPPPPP%2FRNBQKBNR+w+KQkq+-+0+1";
    } else{
        fen = fen.replaceAll('/', '%2F');
        fen = fen.replaceAll(' ', '+');
    }

    const movesFormated = moves.join("%2C");
    let req = "";

    if(level === 'Master') {
        req = `https://explorer.lichess.ovh/masters?variant=standard&fen=${fen}&play=${movesFormated}&source=analysis`
    }else {
        const eloRange = ratings.get(level);
        req = `https://explorer.lichess.ovh/lichess?variant=standard&fen=${fen}&play=${movesFormated}&since=2012-01&until=2022-12&speeds=rapid%2Cclassical&ratings=${eloRange}`;
    } 
    
    const res = await fetch(req);
    const data = await res.json();

    return calculateWinrate(data as Winrate);
}

export async function fetchLichessCloudEval(fen: string) {
    fen = fen.replaceAll('/', '%2F');
    fen = fen.replaceAll(' ', '+');

    let req = `https://lichess.org/api/cloud-eval?fen=${fen}`;
    let evaluation = "???";
    console.log(req);

    try {
        const res = await fetch(req);
        const data = await res.json();
        console.log(data);

        if(data?.pvs[0]?.cp || data?.pvs[0]?.cp === 0) evaluation = (data.pvs[0].cp/100).toString();
        if(data?.pvs[0]?.mate) evaluation =  data.pvs[0].mate < 0 ? `-M${Math.abs(data.pvs[0].mate)}` : `M${Math.abs(data.pvs[0].mate)}`;
    } catch (error) {
        console.log(error);
    } finally {
        return evaluation;
    }
}

//export default {fetchLichessDatabase, fetchLichessCloudEval};