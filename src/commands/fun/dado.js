module.exports = {
    name: 'dado',
    aliases: ['dice', 'roll'],
    description: 'Tira un dado',

    async execute(sock, message, args, context) {
        const { from, senderName } = context;

        const caras = args[0] ? parseInt(args[0]) : 6;
        if (isNaN(caras) || caras < 2 || caras > 100) {
            return await sock.sendMessage(from, { text: '🎲 Uso: *.dado [caras]*  Ej: *.dado 20*' });
        }

        const resultado = Math.floor(Math.random() * caras) + 1;

        await sock.sendMessage(from, {
            text: `🎲 *${senderName}* tiró un dado de ${caras} caras\n\n¡Salió el número: *${resultado}*!`
        });
    }
};