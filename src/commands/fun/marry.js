module.exports = {

    name: "marry",
    aliases: ["casar"],
    description: "Casarse con alguien",

    async execute(sock, message, args, ctx) {

        const { from } = ctx;

        const mentioned =
            message.message?.extendedTextMessage?.contextInfo?.mentionedJid;

        if (!mentioned) {
            return sock.sendMessage(from, {
                text: "❌ Menciona a alguien"
            });
        }

        const user = mentioned[0];

        await sock.sendMessage(from, {
            text: `💍 @${user.split("@")[0]} ahora está casado contigo`,
            mentions: [user]
        });

    }

};