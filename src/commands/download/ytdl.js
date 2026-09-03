const ytdl = require("@distube/ytdl-core");

module.exports = {

    name: "ytdl",
    aliases: ["ytmp4"],
    description: "Descargar video de YouTube",

    async execute(sock, message, args, ctx) {

        const { from } = ctx;

        if (!args[0]) {
            return sock.sendMessage(from, {
                text: "❌ Escribe el link de YouTube\n\nEjemplo:\n.ytdl https://youtu.be/xxxx"
            });
        }

        const url = args[0];

        if (!ytdl.validateURL(url)) {
            return sock.sendMessage(from, {
                text: "❌ Link inválido"
            });
        }

        try {

            await sock.sendMessage(from, {
                text: "⬇️ Descargando video..."
            });

            const stream = ytdl(url, {
                quality: "18"
            });

            await sock.sendMessage(from, {
                video: stream,
                mimetype: "video/mp4"
            });

        } catch (error) {

            console.error(error);

            await sock.sendMessage(from, {
                text: "❌ Error descargando video"
            });

        }

    }

};