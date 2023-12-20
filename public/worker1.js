onmessage = function (event) {
    if(event.data === "Salut"){
        postMessage("Bonjour !");
    }else {
        postMessage("Tu pourrais dire bonjour !");
    }
}