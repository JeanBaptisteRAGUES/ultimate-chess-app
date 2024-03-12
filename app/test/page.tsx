'use client'

import { useEffect, useRef } from 'react';
import Engine from '../chess/engine/Engine';
import GameToolBox from '../chess/game-toolbox/GameToolbox';

const TestPage = ({searchParams}: any) => {
    const engine = useRef<Engine>();
    const toolbox = new GameToolBox();

    useEffect(() => {
        engine.current = new Engine();
        engine.current.init().then(() => {
            console.log('Launch PGN analysis');
            const movesList = toolbox.convertHistorySanToUci(toolbox.convertPgnToHistory(searchParams.search));
            console.log(movesList);
            engine.current?.launchGameAnalysis(movesList, 12).then((res) => console.log(res));
        })
    }, []);
    
    
    return (
        <div className="flex flex-row justify-stretch items-start bg-cyan-900 h-screen w-full overflow-auto" >
            PGN to analyse : {searchParams.search}
        </div>
)
}

export default TestPage;