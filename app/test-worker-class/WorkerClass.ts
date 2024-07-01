//let testWorker = new Worker('worker1.js');
let testWorker: Worker;

class WorkerClass {
    monWorker: Worker;

    constructor() {
        this.monWorker = new Worker('worker1.js');
        testWorker = new Worker('worker1.js');
    }

    testWorker() {
        if(!this.monWorker) return ;

        console.log('Post message: Salut');
        this.monWorker.postMessage('Salut');

        this.monWorker.onmessage = function (e: any) {
            console.log(e.data);
            console.log('Réponse bien reçue !');
        }

        this.monWorker.onerror = function(e: ErrorEvent) {
            e.stopPropagation();
            e.stopImmediatePropagation();
            console.log('Le worker a rencontré un problème');
        }
    }

    testWorker2() {
        return new Promise((resolve, reject) => {
            //console.log('Post message: Salut');
            testWorker.postMessage('Salut');

            testWorker.onmessage = function (e: any) {
                resolve(e.data);
            }

            testWorker.onerror = function(e: ErrorEvent) {
                e.stopPropagation();
                e.stopImmediatePropagation();
                console.log('Le worker a rencontré un problème: réinitialisation du worker...');
                testWorker = new Worker('worker1.js');
                testWorker.postMessage('Salut');
                testWorker.onmessage = function (e: any) {
                    resolve(e.data);
                }
            }
        })
    }
}

export default WorkerClass;