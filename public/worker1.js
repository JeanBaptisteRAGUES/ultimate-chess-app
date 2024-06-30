onmessage = function (event) {
    if(event.data === "Salut"){
        postMessage("Bonjour !");
    }else {
        // Crée une erreur
        const tab = [];
        let test = tab[5].truc;
        postMessage(tab[5]);
    }
}