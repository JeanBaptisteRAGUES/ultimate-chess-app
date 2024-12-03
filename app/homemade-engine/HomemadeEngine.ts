import { Chess } from "chess.js";
import { Move } from "../bots-ai/BotsAI";
//import { Worker, isMainThread, parentPort, workerData } from 'worker_threads';

class HomemadeEngine {
    minMax: Worker;

    constructor() {
        //this.minMax = new Worker('minMaxWorker.mjs');
        //this.minMax = new Worker('/app/homemade-engine/homemadeEngineWorker.js');
        //const myWorker = new Worker(new URL("homemadeEngineWorker.js", import.meta.url));
        //this.minMax = new Worker('/workers/homemade-engine/engine.ts', {type: 'module'});
        this.minMax = new Worker(
            new URL('./homemadeEngineWorker.ts', import.meta.url), {
              name: "engine",
              type: "module",
        });
    }

    findBestMove(fen: string): Promise<Move> {
        return new Promise((resolve, reject) => {
            this.minMax.postMessage(fen);

            this.minMax.onmessage = function(event: any) {
                let move: Move = {
                    notation: '',
                    type: 5,
                };
                console.log(event.data);
                move.notation = event.data.bestMove;
                move.moveInfos = `makeHomemadeEngineMove: Le moteur d'échecs fait maison choisit le coup ${move.notation}.\n\n`;
                resolve(move);
            }
           //this.minMax.on(`${fen}`, (res) => resolve(res as Move));
        });
    }
}

export default HomemadeEngine;