const axios = require("axios");

module.exports = {

    name: "facebook",
    aliases: ["fb"],
    description: "Descargar video de Facebook",

    async execute(sock, message, args, ctx) {

        const { from } = ctx;

        if (!args[0]) {
            return sock.sendMessage(from, {
                text: "❌ Envia link de Facebook\n\nEjemplo:\n.facebook https://fb.watch/xxxxx"
            });
        }

        const url = args[0];

        try {

            await sock.sendMessage(from, {
                text: "⬇️ Descargando Facebook..."
            });

            const api = `https://api.douyin.wtf/api/fb?url=${url}`;

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
                text: "❌ Error descargando Facebook"
            });

        }

    }

};