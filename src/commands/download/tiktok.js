const axios = require("axios");

module.exports = {

    name: "tiktok",
    aliases: ["tt"],
    description: "Descargar video de TikTok",

    async execute(sock, message, args, ctx) {

        const { from } = ctx;

        if (!args[0]) {
            return sock.sendMessage(from, {
                text: "❌ Envia el link de TikTok\n\nEjemplo:\n.tiktok https://vm.tiktok.com/xxxxx/"
            });
        }

        const url = args[0];

        try {

            await sock.sendMessage(from, {
                text: "⬇️ Descargando TikTok..."
            });

            const api = `https://tikwm.com/api/?url=${url}`;

            const { data } = await axios.get(api);

            if (!data || !data.data) {
                return sock.sendMessage(from, {
                    text: "❌ No se pudo descargar el video"
                });
            }

            const videoUrl = data.data.play;

            await sock.sendMessage(from, {
                video: { url: videoUrl },
                mimetype: "video/mp4",
                caption: "🎵 TikTok descargado"
            });

        } catch (error) {

            console.error(error);

            await sock.sendMessage(from, {
                text: "❌ Error descargando TikTok"
            });

        }

    }

};