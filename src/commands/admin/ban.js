module.exports = {

    name: "ban",
    aliases: [],
    description: "Banear usuario",

    async execute(sock, message, args, ctx) {

        const { from, isGroup } = ctx;

        if (!isGroup) {
            return sock.sendMessage(from, {
                text: "❌ Solo en grupos"
            });
        }

        try {

            const mentioned = message.message?.extendedTextMessage?.contextInfo?.mentionedJid;

            if (!mentioned) {
                return sock.sendMessage(from, {
                    text: "❌ Menciona usuario"
                });
            }

            await sock.groupParticipantsUpdate(from, mentioned, "remove");

            await sock.sendMessage(from, {
                text: "🚫 Usuario expulsado"
            });

        } catch (error) {

            console.error(error);

            await sock.sendMessage(from, {
                text: "❌ No tengo permisos"
            });

        }

    }

};