const axios = require("axios");

module.exports = {

    name: "spotify",
    aliases: ["sp"],
    description: "Buscar canción en Spotify",

    async execute(sock, message, args, ctx) {

        const { from } = ctx;

        if (!args.length) {
            return sock.sendMessage(from, {
                text: "❌ Escribe nombre de canción\n\nEjemplo:\n.spotify bad bunny"
            });
        }

        try {

            const query = args.join(" ");

            await sock.sendMessage(from, {
                text: "🔎 Buscando en Spotify..."
            });

            const api = `https://api.popcat.xyz/spotify?q=${encodeURIComponent(query)}`;

            const { data } = await axios.get(api);

            if (!data || !data.title) {
                return sock.sendMessage(from, {
                    text: "❌ No encontrado"
                });
            }

            const text = `
🎵 *${data.title}*

👤 Artista: ${data.artist}

💿 Album: ${data.album}

⏱️ Duración: ${data.duration}

🔗 ${data.url}
            `;

            await sock.sendMessage(from, {
                image: { url: data.image },
                caption: text
            });

        } catch (error) {

            console.error(error);

            await sock.sendMessage(from, {
                text: "❌ Error en Spotify"
            });

        }

    }

};