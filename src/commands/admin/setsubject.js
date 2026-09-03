module.exports = {

    name: "setsubject",
    aliases: ["setname"],
    description: "Cambiar nombre del grupo",

    async execute(sock, message, args, ctx) {

        const { from, isGroup } = ctx;

        if (!isGroup) {
            return sock.sendMessage(from, {
                text: "❌ Solo en grupos"
            });
        }

        if (!args.length) {
            return sock.sendMessage(from, {
                text: "❌ Escribe nuevo nombre"
            });
        }

        try {

            const name = args.join(" ");

            await sock.groupUpdateSubject(from, name);

            await sock.sendMessage(from, {
                text: "✅ Nombre actualizado"
            });

        } catch (error) {

            console.error(error);

            await sock.sendMessage(from, {
                text: "❌ No tengo permisos"
            });

        }

    }

};