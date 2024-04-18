//https://en.wikibooks.org/w/api.php?titles=Chess_Opening_Theory/1._e4/1...c5/2._Nf3/2...d6/3._d4&redirects&origin=*&action=query&prop=extracts&formatversion=2&format=json&exchars=1200

async function isTheory(moves: Array<String>): Promise<boolean> {
    

    const movesFormated = moves.map((move, i) => i%2 === 0 ? `/${Math.ceil((i+1)/2)}._${move}` : `/${Math.ceil((i+1)/2)}...${move}`).join('').replaceAll('#', '');
    let req = `https://en.wikibooks.org/w/api.php?titles=Chess_Opening_Theory${movesFormated}&redirects&origin=*&action=query&prop=extracts&formatversion=2&format=json&exchars=1200`;

    const res = moves.length < 5 ? await fetch(req, {signal: AbortSignal.timeout(1000)}) : await fetch(req, {signal: AbortSignal.timeout(500)});
    const data = await res.json();

    console.log(data);
    console.log('Book Move ? ' + data.query.pages[0]?.pageid !== undefined);

    return data.query.pages[0]?.pageid !== undefined;
}

export async function safeFetchTheory(moves: string[]): Promise<boolean> {
    try{
       const isTheoryResponse = await isTheory(moves);
       console.log(isTheoryResponse);
       return isTheoryResponse;
    } catch (error) {
        console.log(error);
        return false;
    }
} 