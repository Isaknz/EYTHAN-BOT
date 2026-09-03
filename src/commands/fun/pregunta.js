const preguntas = [
    "¿Prefieres pizza o hamburguesa?",
    "¿Te gusta programar?",
    "¿Cuál es tu videojuego favorito?",
    "¿Qué harías si ganaras dinero hoy?"
];

module.exports = {

    name: "pregunta",
    aliases: [],
    description: "Pregunta aleatoria",

    async execute(sock, message, args, ctx) {

        const { from } = ctx;

        const pregunta = preguntas[
            Math.floor(Math.random() * preguntas.length)
        ];

        await sock.sendMessage(from, {
            text: `❓ ${pregunta}`
        });

    }

};