const axios = require("axios");

module.exports = {

    name: "instagram",
    aliases: ["ig"],
    description: "Descargar video de Instagram",

    async execute(sock, message, args, ctx) {

        const { from } = ctx;

        if (!args[0]) {
            return sock.sendMessage(from, {
                text: "❌ Envia link de Instagram\n\nEjemplo:\n.instagram https://instagram.com/reel/xxxxx"
            });
        }

        const url = args[0];

        try {

            await sock.sendMessage(from, {
                text: "⬇️ Descargando Instagram..."
            });

            const api = `https://api.douyin.wtf/api/ig?url=${url}`;

            const { data } = await axios.get(api);

            if (!data || !data.video) {
                return sock.sendMessage(from, {
                    text: "❌ No se pudo descargar"
                });
            }

            await sock.sendMessage(from, {
                video: { url: data.video },
                mimetype: "video/mp4"
            });

        } catch (error) {

            console.error(error);

            await sock.sendMessage(from, {
                text: "❌ Error descargando Instagram"
            });

        }

    }

};