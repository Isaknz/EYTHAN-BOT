module.exports = {

    name: "sorteo",
    aliases: [],
    description: "Elegir ganador aleatorio",

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

            const ganador =
                members[Math.floor(Math.random() * members.length)];

            await sock.sendMessage(from, {
                text: `🎉 Ganador: @${ganador.split("@")[0]}`,
                mentions: [ganador]
            });

        } catch (error) {

            console.error(error);

        }

    }

};