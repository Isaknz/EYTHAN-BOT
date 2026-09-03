const juegos = {};

const palabras = [
"gato",
"mesa",
"luna",
"sol",
"casa"
];

module.exports = {

name: "wordle",
aliases: [],
description: "Juego Wordle",

async execute(sock, message, args, ctx) {

const { from } = ctx;

if (!juegos[from]) {

const palabra =
palabras[Math.floor(Math.random() * palabras.length)];

juegos[from] = {
palabra,
intentos: 6
};

return sock.sendMessage(from, {
text: "🟩 Wordle iniciado\nEscribe palabra de 4 letras"
});

}

const intento = args[0]?.toLowerCase();

if (!intento) {
return sock.sendMessage(from, {
text: "❌ Escribe palabra"
});
}

const juego = juegos[from];

let resultado = "";

for (let i = 0; i < intento.length; i++) {

if (intento[i] === juego.palabra[i]) {
resultado += "🟩";
}
else if (juego.palabra.includes(intento[i])) {
resultado += "🟨";
}
else {
resultado += "⬛";
}

}

juego.intentos--;

if (intento === juego.palabra) {

delete juegos[from];

return sock.sendMessage(from, {
text: `🎉 Ganaste\n${resultado}`
});

}

if (juego.intentos <= 0) {

delete juegos[from];

return sock.sendMessage(from, {
text: `💀 Perdiste\nPalabra: ${juego.palabra}`
});

}

await sock.sendMessage(from, {
text: `${resultado}\nIntentos: ${juego.intentos}`
});

}

};