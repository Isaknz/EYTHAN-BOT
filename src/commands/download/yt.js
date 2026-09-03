const yts = require("yt-search");

module.exports = {

    name: "yt",
    aliases: ["youtube"],
    description: "Buscar video en YouTube",

    async execute(sock, message, args, ctx) {

        const { from } = ctx;

        if (!args.length) {
            return sock.sendMessage(from, {
                text: "❌ Escribe qué quieres buscar\n\nEjemplo:\n.yt bad bunny"
            });
        }

        try {

            const query = args.join(" ");

            const search = await yts(query);
            const video = search.videos[0];

            if (!video) {
                return sock.sendMessage(from, {
                    text: "❌ No encontrado"
                });
            }

            const text = `
🎬 *${video.title}*

⏱️ Duración: ${video.timestamp}
👁️ Vistas: ${video.views}

🔗 ${video.url}
            `;

            await sock.sendMessage(from, {
                text
            });

        } catch (error) {

            console.error(error);

            await sock.sendMessage(from, {
                text: "❌ Error en búsqueda"
            });

        }

    }

};