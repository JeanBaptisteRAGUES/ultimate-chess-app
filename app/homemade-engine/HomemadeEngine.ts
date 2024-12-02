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

    toJSON(proto: any) {
        let jsoned = {};
        let toConvert = proto || this;
        Object.getOwnPropertyNames(toConvert).forEach((prop) => {
            const val = toConvert[prop];
            // don't include those
            if (prop === 'toJSON' || prop === 'constructor') {
                return;
            }
            if (typeof val === 'function') {
                //@ts-expect-error
                jsoned[prop] = val.bind(jsoned);
                return;
            }
            //@ts-expect-error
            jsoned[prop] = val;
        });
    
        const inherited = Object.getPrototypeOf(toConvert);
        if (inherited !== null) {
            Object.keys(this.toJSON(inherited)).forEach(key => {
                //@ts-expect-error
                if (!!jsoned[key] || key === 'constructor' || key === 'toJSON')
                    return;
                if (typeof inherited[key] === 'function') {
                    //@ts-expect-error
                    jsoned[key] = inherited[key].bind(jsoned);
                    return;
                }
                //@ts-expect-error
                jsoned[key] = inherited[key];
            });
        }
        return jsoned;
    }

    //@ts-expect-error
    deepFunctionsToStrings(obj, functionPaths = [], path = []) {
        for (let key in obj) {
            //@ts-expect-error
            path.push(key);
            let value = obj[key];
            if (typeof value === 'object' && value !== null) {
                this.deepFunctionsToStrings(value, functionPaths, path)
            } else if (typeof value === 'function') {
                obj[key] = value.toString();
                //@ts-expect-error
                functionPaths.push([...path]);
            }
            path.pop();
        }
        return functionPaths;
    }

    findBestMove(game: Chess, fen: string): Promise<Move> {
        return new Promise((resolve, reject) => {
            this.minMax.postMessage(fen);

            this.minMax.onmessage = function(event: any) {
                let move: Move = {
                    notation: '',
                    type: 5,
                };
                console.log(event.data);
                move.notation = event.data.bestMove;
                resolve(move);
            }
           //this.minMax.on(`${fen}`, (res) => resolve(res as Move));
        });
    }
}

export default HomemadeEngine;