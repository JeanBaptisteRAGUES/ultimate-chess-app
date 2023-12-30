function randomIntFromInterval(min: number, max: number) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min)
}

// https://explorer.lichess.ovh/lichess?variant=standard&fen=rnbqkbnr%2Fpppppppp%2F8%2F8%2F8%2F8%2FPPPPPPPP%2FRNBQKBNR+w+KQkq+-+0+1&play=e2e4%2Ce7e5%2Cg1f3&since=2012-01&until=2022-12&speeds=bullet%2Cblitz%2Crapid%2Cclassical&ratings=1600%2C1800%2C2000

const ratings = new Map([
    ['Beginner', '400%2C1000%2C1200'],
    ['Casual', '1200%2C1400%2C1600'],
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
    console.log("Coup choisi : %s (%s)", data.moves[moveIndex]?.san,  data.moves[moveIndex]?.uci);

    return {
        san: data.moves[moveIndex]?.san,
        uci: data.moves[moveIndex]?.uci,
        winrate: calculateWinrate(data)
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