import { headers } from 'next/headers';

const TestPage = () => {
    const buffer = new SharedArrayBuffer(4096);
    console.log(headers());
    
    //console.log(crossOriginIsolated);
    /* const myWorker = new Worker('/worker1.js');

    myWorker.postMessage('uci');

    myWorker.onmessage = function(event: any) {
        console.log(event.data);
    } */
    return (
        <div>TestPage</div>
    )
}

export default TestPage;