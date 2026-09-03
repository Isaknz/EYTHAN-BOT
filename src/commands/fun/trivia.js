const juegos = {};

const preguntas = [
{
pregunta: "¿Capital de Perú?",
opciones: ["A) Lima", "B) Cusco", "C) Arequipa"],
correcta: "a"
},
{
pregunta: "¿Cuánto es 5 x 5?",
opciones: ["A) 10", "B) 25", "C) 20"],
correcta: "b"
},
{
pregunta: "¿Lenguaje de JavaScript?",
opciones: ["A) Backend", "B) Frontend", "C) Ambos"],
correcta: "c"
}
];

module.exports = {

name: "trivia",
aliases: [],
description: "Juego trivia",

async execute(sock, message, args, ctx) {

const { from } = ctx;

if (!juegos[from]) {

const data =
preguntas[Math.floor(Math.random() * preguntas.length)];

juegos[from] = data;

let text = `🧠 *TRIVIA*\n\n${data.pregunta}\n\n`;

data.opciones.forEach(op => {
text += op + "\n";
});

text += "\nResponde con: A / B / C";

return sock.sendMessage(from, {
text
});

}

const respuesta = args[0]?.toLowerCase();

if (!respuesta) {
return sock.sendMessage(from, {
text: "❌ Responde A, B o C"
});
}

const juego = juegos[from];

if (respuesta === juego.correcta) {

delete juegos[from];

return sock.sendMessage(from, {
text: "🎉 Correcto!"
});

}

delete juegos[from];

await sock.sendMessage(from, {
text: "❌ Incorrecto"
});

}

};