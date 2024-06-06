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

function getClosestLichessRating(chessComElo: number) {
    const lichessEloBase = Math.min(3200, chessComElo + 300);
    const eloRanges = [400, 1000, 1200, 1400, 1600, 1800, 2000, 2200, 2500];
    let isMaster = false;
    let lichessElo = lichessEloBase;

    if(lichessEloBase >= 2500) isMaster = true;

    if(!isMaster) {
        let closestElo = 400;
        let closestDiff = Math.abs(closestElo - lichessElo);

        eloRanges.forEach((eloRange) => {
            if(Math.abs(eloRange - lichessElo) <= closestDiff) {
                closestDiff = Math.abs(eloRange - lichessElo);
                closestElo = eloRange;
            }
        });

        lichessElo = closestElo;
    }

    console.log(`Le bot d'Élo Lichess (${lichessElo}) est un maître ? -> ${isMaster}`);

    return {
        isMaster: isMaster,
        lichessElo: lichessElo,
    }
}

export async function fetchLichessDatabase(moves: Array<String>, chessComElo: number, fen = "") {
    try {
        if(fen === "") {
            fen = "rnbqkbnr%2Fpppppppp%2F8%2F8%2F8%2F8%2FPPPPPPPP%2FRNBQKBNR+w+KQkq+-+0+1";
        } else{
            fen = fen.replaceAll('/', '%2F');
            fen = fen.replaceAll(' ', '+');
        }

        const movesFormated = moves.join("%2C");
        const lichessRating = getClosestLichessRating(chessComElo);
        let req = "";

        if(lichessRating.isMaster) {
            req = `https://explorer.lichess.ovh/masters?variant=standard&fen=${fen}&play=${movesFormated}&source=analysis`
        }else {
            req = `https://explorer.lichess.ovh/lichess?variant=standard&fen=${fen}&play=${movesFormated}&since=2012-01&until=2022-12&speeds=rapid%2Cclassical&ratings=${lichessRating.lichessElo}`;
        }

        console.log(req);

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
    } catch (error) {
        console.log('fetchLichessDatabase error: ' + error);
        return {
            san: '',
            uci: '',
            winrate: {
                white: 0,
                draws: 0,
                black: 0
            }
        }
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
async function fetchPlayerLichessDB(username: string, playerColor: string, moves: Array<String>, level: string, fen = ""): Promise<Move> {
    console.log('fetchPlayerLichessDB');
    playerColor = playerColor === 'w' ? 'white' : 'black';
    if(fen === "") {
        fen = "rnbqkbnr%2Fpppppppp%2F8%2F8%2F8%2F8%2FPPPPPPPP%2FRNBQKBNR+w+KQkq+-+0+1";
    } else{
        fen = fen.replaceAll('/', '%2F');
        fen = fen.replaceAll(' ', '+');
    }

    const movesFormated = moves.join("%2C");
    let req = `https://explorer.lichess.ovh/player?variant=standard&fen=${fen}&play=${movesFormated}&speeds=rapid%2Cclassical&player=${username}&color=${playerColor}&modes=casual%2Crated&source=analysis`;


    const res = await fetch(req, {signal: AbortSignal.timeout(30000)});
    const data = await res.json();

    console.log('Résultat requête: ');
    console.log(data);

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

    console.log('Coup choisi: ' + data.moves[moveIndex].uci);

    return {
        notation: data.moves[moveIndex].uci,
        type: 1,
    }
}

export async function safeFetchPlayerLichessDB(username: string, playerColor: string, moves: Array<String>, level: string, fen = ""): Promise<Move> {
    try{
       const lichessPlayerMove = await fetchPlayerLichessDB(username, playerColor, moves, level, fen);
       return lichessPlayerMove;
    } catch (error) {
        console.log(error);
        return {
            type: -1,
            notation: '',
        };
    }
} 

//https://www.chess.com/callback/explorer/move

/*
{
    "_token":"d15a875d9871ec05540c4a8.dnF3yJfo2gxhPkG5R9gDMscPTvzXHpL9ENF4kzT6dyM.BxMfv66Po0ARW3jtDrk3avNWAq6EU_mVYrQo4XezJUkGIyac9d3rZ1NNIg",
    "ply":1,
    "gameSource":"other",
    "nextFen":"rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1",
    "moveList":[
        {
            "activeColor":"b",
            "encodedMove":"mC",
            "nextFen":"rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1",
            "sanMove":"e4"
        }
    ],
    "sanMove":"e4",
    "gameType":"all",
    "color":"white",
    "username":"Hikaru"
}
*/

// TODO: Error -> POST https://www.chess.com/callback/explorer/move net::ERR_BLOCKED_BY_RESPONSE.NotSameOriginAfterDefaultedToSameOriginByCoep 200 (OK)
export async function fetchChessDotComDB() {
    let reqURL = "https://www.chess.com/callback/explorer/move";
    let reqBody = {
        "_token":"d15a875d9871ec05540c4a8.dnF3yJfo2gxhPkG5R9gDMscPTvzXHpL9ENF4kzT6dyM.BxMfv66Po0ARW3jtDrk3avNWAq6EU_mVYrQo4XezJUkGIyac9d3rZ1NNIg",
        "ply":1,
        "gameSource":"other",
        "nextFen":"rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1",
        "moveList":[
            {
                "activeColor":"b",
                "encodedMove":"mC",
                "nextFen":"rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1",
                "sanMove":"e4"
            }
        ],
        "sanMove":"e4",
        "gameType":"all",
        "color":"white",
        "username":"Hikaru"
    }

    try {
        const res = await fetch(reqURL, {
            method: 'POST',
            mode: "no-cors", // no-cors, *cors, same-origin
            cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
            credentials: "omit", // include, *same-origin, omit
            headers: {
                "Content-Type": "application/json",
                // 'Content-Type': 'application/x-www-form-urlencoded',
                "Cross-Origin-Ressource-Policy": "cross-origin"
            },
            body: JSON.stringify(reqBody),
            signal: AbortSignal.timeout(5000)
        });
        const data = await res.json();

        console.log('Résultat requête Chess.com: ');
        console.log(data);
    } catch (error) {
        console.log('Erreur lors de la requête aux serveurs de Chess.com: ' + error);
    }
}

//console.log(pgnRaw.replaceAll(/\[[^\]]*\]/g, '').replaceAll(/\{|\}/g, '').replaceAll(/[0-9]*\.{3}/g, '').replaceAll(/\s{1,99}/g, ' ').replaceAll(/\.\s/g, '.').split(/1-0|0-1|½-½/));

//const pgnRaw = '[Event "Live Chess"][Site "Chess.com"][Date "2024.01.11"][Round"-"][White "PhosgeneOxime2"][Black "will_thrash"][Result "1-0"][CurrentPosition "2r2k1b/1pqn1p1p/p2Qp1p1/8/4P3/1P2BP2/P5PP/3RR1K1 b - -"][Timezone "UTC"][ECO "B52"][ECOUrl "https://www.chess.com/openings/Sicilian-Defense-Canal-Main-Line-Sokolsky-Variation...7.Nxd4-Nf6-8.Nc3-g6"][UTCDate "2024.01.11"][UTCTime "00:15:15"][WhiteElo "1335"][BlackElo "1366"][TimeControl "600"][Termination "PhosgeneOxime2 won by resignation"][StartTime "00:15:15"][EndDate "2024.01.11"][EndTime "00:22:19"][Link "https://www.chess.com/game/live/98670943993"]1. e4 {[%clk 0:10:00]} 1... c5 {[%clk 0:10:00]} 2. Nf3 {[%clk 0:09:59]} 2... d6 {[%clk 0:09:59.3]} 3. Bb5+ {[%clk 0:09:57.3]} 3... Bd7 {[%clk 0:09:55.4]} 4. Bxd7+ {[%clk 0:09:56.8]} 4... Qxd7 {[%clk 0:09:54.8]} 5. c4 {[%clk 0:09:56.5]} 5... Nc6 {[%clk 0:09:52.5]} 6. d4 {[%clk 0:09:51.3]} 6... cxd4 {[%clk 0:09:50.3]} 7. Nxd4 {[%clk 0:09:50.7]} 7... Nf6 {[%clk 0:09:46]} 8. Nc3 {[%clk 0:09:46.3]} 8... g6 {[%clk 0:09:40.7]} 9. O-O {[%clk 0:09:25]} 9... Bg7 {[%clk 0:09:39.3]} 10. Nxc6 {[%clk 0:09:16.1]} 10... Qxc6 {[%clk 0:09:35.9]} 11. Re1 {[%clk 0:09:13.6]} 11... Qxc4 {[%clk 0:09:29.5]} 12. Be3 {[%clk 0:08:41.3]} 12... O-O {[%clk 0:09:17.5]} 13. f3 {[%clk 0:08:28.8]} 13... a6 {[%clk 0:09:09.6]} 14. Qd2 {[%clk 0:08:28]} 14... Rfd8 {[%clk 0:08:59.3]} 15. Rad1 {[%clk 0:08:19.9]} 15... Rac8 {[%clk 0:08:56.2]} 16. Bh6 {[%clk 0:07:48.9]} 16... Bh8 {[%clk 0:08:52.7]} 17. Bf4 {[%clk 0:07:29.1]} 17... Nd7 {[%clk 0:07:56.2]} 18. Nd5 {[%clk 0:07:21.9]} 18... e6 {[%clk 0:07:44.7]} 19. Ne7+ {[%clk 0:07:19.1]} 19... Kf8 {[%clk 0:07:33.6]} 20. Nxc8 {[%clk 0:07:17.5]} 20... Rxc8 {[%clk 0:07:33.3]} 21. b3 {[%clk 0:06:56]} 21... Qc5+ {[%clk 0:06:53]} 22. Be3 {[%clk 0:06:52.1]} 22... Qc7 {[%clk 0:06:44.9]} 23. Qxd6+ {[%clk 0:06:49.3]} 1-0 [Event "Live Chess"][Site "Chess.com"][Date "2024.01.07"][Round "-"][White "PhosgeneOxime2"][Black "Stout7483"][Result "1-0"][CurrentPosition "8/8/1p3ppp/1Pk5/n7/1K2P1PP/8/5B2 b - -"][Timezone "UTC"][ECO "B01"][ECOUrl "https://www.chess.com/openings/Scandinavian-Defense-Mieses-Kotrc-Variation-3.Nc3-Qd8-4.d4-c6"][UTCDate "2024.01.07"][UTCTime "20:39:10"][WhiteElo "1325"][BlackElo "1355"][TimeControl "600"][Termination "PhosgeneOxime2 won by resignation"][StartTime "20:39:10"][EndDate "2024.01.07"][EndTime "20:48:21"][Link "https://www.chess.com/game/live/98399075131"]1. e4 {[%clk 0:09:59.3]} 1... d5 {[%clk 0:09:59.3]} 2. exd5 {[%clk 0:09:57.2]} 2... Qxd5 {[%clk 0:09:58.4]} 3. Nc3 {[%clk 0:09:57.1]} 3... Qd8 {[%clk 0:09:57.4]} 4. d4 {[%clk 0:09:56.4]} 4... c6 {[%clk 0:09:56.8]} 5. Nf3 {[%clk 0:09:55.7]} 5... Bg4 {[%clk 0:09:54.8]} 6. h3 {[%clk 0:09:55.2]} 6... Bxf3 {[%clk 0:09:53.8]} 7. Qxf3 {[%clk 0:09:54.9]} 7... Nf6 {[%clk 0:09:52.1]} 8. Bg5 {[%clk 0:09:52.3]} 8... Nbd7 {[%clk 0:09:51.4]} 9. Bd3 {[%clk 0:09:35.8]} 9... h6 {[%clk 0:09:49.1]} 10. Bf4 {[%clk 0:09:33.1]} 10... e6 {[%clk 0:09:47.7]} 11. O-O {[%clk 0:09:19.3]} 11... Bb4 {[%clk 0:09:45.9]} 12. Bd2 {[%clk 0:09:15.2]} 12... O-O {[%clk 0:09:44.5]} 13. a3 {[%clk 0:09:13.4]} 13... Bd6 {[%clk 0:09:40.3]} 14. Rfe1 {[%clk 0:09:07.3]} 14... Nd5 {[%clk 0:09:38.9]} 15. Nxd5 {[%clk 0:08:59.7]} 15... cxd5 {[%clk 0:09:37.9]} 16. c4 {[%clk 0:08:49.5]} 16... dxc4 {[%clk 0:09:36.3]} 17. Bxc4 {[%clk 0:08:48.1]} 17... Nf6 {[%clk 0:09:35.2]} 18. b4 {[%clk 0:08:28]} 18... b6 {[%clk 0:09:33.3]} 19. Bc3 {[%clk 0:08:17.7]} 19... Be7 {[%clk 0:09:29.6]} 20. Bb3 {[%clk 0:08:14.6]} 20... Nh7 {[%clk 0:09:28.1]} 21. Bd2 {[%clk 0:07:53.4]} 21... Bf6 {[%clk 0:09:26.1]} 22. Be3 {[%clk 0:07:43.6]} 22... Bxd4 {[%clk 0:09:24.5]} 23. Rad1 {[%clk 0:07:41.2]} 23... e5 {[%clk 0:09:09.6]} 24. Bxd4 {[%clk 0:07:30.1]} 24... exd4 {[%clk 0:09:08.3]} 25. Rd2 {[%clk 0:07:16.8]} 25... Qf6 {[%clk 0:09:03.5]} 26. Qxf6 {[%clk 0:07:08.5]} 26... Nxf6 {[%clk 0:09:01.5]} 27. Rxd4 {[%clk 0:07:07.4]} 27... Rfd8 {[%clk 0:09:00.1]} 28. Red1 {[%clk 0:06:49.4]} 28... Rxd4 {[%clk 0:08:57.7]} 29. Rxd4 {[%clk 0:06:48.2]} 29... Re8 {[%clk 0:08:56.6]} 30. Kf1 {[%clk 0:06:26.5]} 30... Re7 {[%clk 0:08:55.3]} 31. g3 {[%clk 0:06:19.2]} 31... g6 {[%clk 0:08:53.1]} 32. b5 {[%clk 0:06:08]} 32... Kg7 {[%clk 0:08:51.6]} 33. a4 {[%clk 0:06:06.8]} 33... Ne4 {[%clk 0:08:20.9]} 34. Rd3 {[%clk 0:05:43.8]} 34... Nc5 {[%clk 0:08:19]} 35. Rf3 {[%clk 0:05:35.4]} 35... a6 {[%clk 0:08:14]} 36. Bc4 {[%clk 0:05:27.4]} 36... axb5 {[%clk 0:08:09]} 37. axb5 {[%clk 0:05:22.9]} 37... Ra7 {[%clk 0:08:03.5]} 38. Kg2 {[%clk 0:05:08.1]} 38... Na4 {[%clk 0:08:01.2]} 39. Rf4 {[%clk 0:04:59.2]} 39... Nb2 {[%clk 0:07:58.2]} 40. Bf1 {[%clk 0:04:40.7]} 40... Re7 {[%clk 0:07:47.2]} 41. Rf3 {[%clk 0:04:31.9]} 41... Na4 {[%clk 0:07:37.8]} 42. Re3 {[%clk 0:04:27]} 42... Rxe3 {[%clk 0:07:33.1]} 43. fxe3 {[%clk 0:04:26.9]} 43... Kf6 {[%clk 0:07:32.1]} 44. Kf3 {[%clk 0:04:26.1]} 44... Ke5 {[%clk 0:07:31.4]} 45. Ke2 {[%clk 0:04:20]} 45... f6 {[%clk 0:07:28.5]} 46. Kd2 {[%clk 0:04:19.1]} 46... Kd6 {[%clk 0:07:27.4]} 47. Kc2 {[%clk 0:04:16.4]} 47... Kc5 {[%clk 0:07:26.1]} 48. Kb3 {[%clk 0:04:13.6]} 1-0'

export async function getLichessWinrate(moves: Array<String>, level: string, fen = ""): Promise<Winrate> {
    try {
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
    } catch (error) {
        console.log('getLichessWinrate error: ' + error);
        return {
            white: 0,
            draws: 0,
            black: 0
        }
    }
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