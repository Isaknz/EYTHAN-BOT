const fs = require("fs");

module.exports = {

    name: "setppgc",
    aliases: ["setpp"],
    description: "Cambiar foto del grupo",

    async execute(sock, message, args, ctx) {

        const { from, isGroup } = ctx;

        if (!isGroup) {
            return sock.sendMessage(from, {
                text: "❌ Solo en grupos"
            });
        }

        try {

            const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;

            if (!quoted || !quoted.imageMessage) {
                return sock.sendMessage(from, {
                    text: "❌ Responde a una imagen"
                });
            }

            const buffer = await sock.downloadMediaMessage({
                key: message.message.extendedTextMessage.contextInfo.stanzaId,
                message: quoted
            });

            const file = "./group.jpg";

            fs.writeFileSync(file, buffer);

            await sock.updateProfilePicture(from, {
                url: file
            });

            fs.unlinkSync(file);

            await sock.sendMessage(from, {
                text: "✅ Foto actualizada"
            });

        } catch (error) {

            console.error(error);

            await sock.sendMessage(from, {
                text: "❌ Error cambiando foto"
            });

        }

    }

};