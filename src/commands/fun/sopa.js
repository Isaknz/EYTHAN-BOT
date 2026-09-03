const palabras = [
"gato",
"perro",
"codigo",
"bot",
"node"
];

module.exports = {

name: "sopa",
aliases: ["wordsearch"],
description: "Sopa de letras",

async execute(sock, message, args, ctx) {

const { from } = ctx;

const palabra =
palabras[Math.floor(Math.random() * palabras.length)];

let grid = "";

for (let i = 0; i < 5; i++) {

let fila = "";

for (let j = 0; j < 5; j++) {

const let ra =
String.fromCharCode(
65 + Math.floor(Math.random() * 26)
);

fila += letra + " ";

}

grid += fila + "\n";

}

await sock.sendMessage(from, {
text: `🔤 Encuentra la palabra:\n${palabra}\n\n${grid}`
});

}

};