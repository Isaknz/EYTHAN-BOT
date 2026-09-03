module.exports = {

    name: "setdesc",
    aliases: [],
    description: "Cambiar descripción",

    async execute(sock, message, args, ctx) {

        const { from, isGroup } = ctx;

        if (!isGroup) {
            return sock.sendMessage(from, {
                text: "❌ Solo en grupos"
            });
        }

        if (!args.length) {
            return sock.sendMessage(from, {
                text: "❌ Escribe nueva descripción"
            });
        }

        try {

            const desc = args.join(" ");

            await sock.groupUpdateDescription(from, desc);

            await sock.sendMessage(from, {
                text: "✅ Descripción actualizada"
            });

        } catch (error) {

            console.error(error);

            await sock.sendMessage(from, {
                text: "❌ No tengo permisos"
            });

        }

    }

};