const juegos = {};

const palabras = [
    "gato",
    "perro",
    "javascript",
    "computadora",
    "internet",
    "teclado",
    "pantalla",
    "celular"
];

module.exports = {

    name: "ahorcado",
    aliases: [],
    description: "Juego del ahorcado",

    async execute(sock, message, args, ctx) {

        const { from } = ctx;

        if (!juegos[from]) {

            const palabra = palabras[Math.floor(Math.random() * palabras.length)];

            juegos[from] = {
                palabra,
                letras: [],
                intentos: 6
            };

            const oculto = palabra.replace(/./g, "_ ");

            return sock.sendMessage(from, {
                text: `🎮 *Ahorcado iniciado*\n\n${oculto}\n\nIntentos: 6`
            });

        }

        const juego = juegos[from];

        if (!args[0]) {
            return sock.sendMessage(from, {
                text: "✏️ Escribe una letra"
            });
        }

        const let ra = args[0].toLowerCase();

        if (juego.letras.includes(letra)) {
            return sock.sendMessage(from, {
                text: "⚠️ Ya usaste esa letra"
            });
        }

        juego.letras.push(letra);

        if (!juego.palabra.includes(letra)) {
            juego.intentos--;
        }

        let palabraOculta = "";

        for (let l of juego.palabra) {

            if (juego.letras.includes(l)) {
                palabraOculta += l + " ";
            } else {
                palabraOculta += "_ ";
            }

        }

        if (!palabraOculta.includes("_")) {

            delete juegos[from];

            return sock.sendMessage(from, {
                text: `🎉 Ganaste!\nPalabra: ${juego.palabra}`
            });

        }

        if (juego.intentos <= 0) {

            delete juegos[from];

            return sock.sendMessage(from, {
                text: `💀 Perdiste\nPalabra: ${juego.palabra}`
            });

        }

        await sock.sendMessage(from, {
            text: `
${palabraOculta}

Intentos restantes: ${juego.intentos}
            `
        });

    }

};