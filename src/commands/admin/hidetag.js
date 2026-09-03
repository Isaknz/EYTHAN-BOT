module.exports = {

    name: "hidetag",
    aliases: ["h"],
    description: "Mencionar oculto",

    async execute(sock, message, args, ctx) {

        const { from, isGroup } = ctx;

        if (!isGroup) {
            return sock.sendMessage(from, {
                text: "❌ Solo en grupos"
            });
        }

        try {

            const metadata = await sock.groupMetadata(from);

            const members = metadata.participants.map(p => p.id);

            const text = args.join(" ") || "📢 Mensaje oculto";

            await sock.sendMessage(from, {
                text,
                mentions: members
            });

        } catch (error) {

            console.error(error);

            await sock.sendMessage(from, {
                text: "❌ Error en hidetag"
            });

        }

    }

};