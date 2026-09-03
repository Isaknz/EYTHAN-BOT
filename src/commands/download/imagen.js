const { google } = require("google-img-scrap");

module.exports = {

    name: "imagen",
    aliases: ["img"],
    description: "Buscar imágenes en Google",

    async execute(sock, message, args, ctx) {

        const { from } = ctx;

        if (!args.length) {
            return sock.sendMessage(from, {
                text: "❌ Escribe qué imagen buscar\n\nEjemplo:\n.imagen perro"
            });
        }

        try {

            const query = args.join(" ");

            await sock.sendMessage(from, {
                text: "🔎 Buscando imágenes..."
            });

            const result = await google({
                search: query,
                limit: 1
            });

            if (!result || !result.result.length) {
                return sock.sendMessage(from, {
                    text: "❌ No se encontraron imágenes"
                });
            }

            const image = result.result[0].url;

            await sock.sendMessage(from, {
                image: { url: image },
                caption: `🖼️ Resultado: ${query}`
            });

        } catch (error) {

            console.error(error);

            await sock.sendMessage(from, {
                text: "❌ Error buscando imagen"
            });

        }

    }

};