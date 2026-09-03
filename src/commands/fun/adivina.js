const juegos = {};

module.exports = {

    name: "adivina",
    aliases: [],
    description: "Adivina el número",

    async execute(sock, message, args, ctx) {

        const { from } = ctx;

        if (!juegos[from]) {

            juegos[from] = {
                numero: Math.floor(Math.random() * 10) + 1
            };

            return sock.sendMessage(from, {
                text: "🎯 Adivina un número del 1 al 10"
            });

        }

        const numero = parseInt(args[0]);

        if (!numero) {
            return sock.sendMessage(from, {
                text: "❌ Escribe un número"
            });
        }

        if (numero === juegos[from].numero) {

            delete juegos[from];

            return sock.sendMessage(from, {
                text: "🎉 ¡Correcto!"
            });

        }

        await sock.sendMessage(from, {
            text: "❌ Incorrecto, intenta otra vez"
        });

    }

};