const GifSearch = require("gif-search");

const gif = new GifSearch();

module.exports = {

    name: "gif",
    aliases: ["giphy"],
    description: "Buscar GIF",

    async execute(sock, message, args, ctx) {

        const { from } = ctx;

        if (!args.length) {
            return sock.sendMessage(from, {
                text: "❌ Escribe algo para buscar\n\nEjemplo:\n.gif gato"
            });
        }

        try {

            const query = args.join(" ");

            await sock.sendMessage(from, {
                text: "🔎 Buscando GIF..."
            });

            const result = await gif.search(query);

            if (!result || !result.url) {
                return sock.sendMessage(from, {
                    text: "❌ No se encontró GIF"
                });
            }

            await sock.sendMessage(from, {
                video: { url: result.url },
                gifPlayback: true,
                caption: `🎞️ GIF: ${query}`
            });

        } catch (error) {

            console.error(error);

            await sock.sendMessage(from, {
                text: "❌ Error buscando GIF"
            });

        }

    }

};