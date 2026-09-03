module.exports = {

    name: "everyone",
    aliases: ["tagall"],
    description: "Mencionar a todos",

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

            let text = "📢 *Todos*\n\n";

            members.forEach(user => {

                text += `@${user.split("@")[0]}\n`;

            });

            await sock.sendMessage(from, {
                text,
                mentions: members
            });

        } catch (error) {

            console.error(error);

        }

    }

};