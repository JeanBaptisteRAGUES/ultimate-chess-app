onmessage = function (event) {
    if(event.data === "Salut"){
        postMessage("Coucou !");
    }else {
        postMessage("Tu pourrais dire coucou !");
    }
}