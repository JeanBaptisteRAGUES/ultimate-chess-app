let index = 0;
const personnes = [
    {prenom: 'Pierre', age: 22},
    {prenom: 'Paul', age: 19},
    {prenom: 'Jacques', age: 54}
];

onmessage = function (event) {
    if(event.data === "Salut"){
        postMessage("Bonjour ! Je m'appelle " + personnes[index].prenom);
        index++;
    }
}