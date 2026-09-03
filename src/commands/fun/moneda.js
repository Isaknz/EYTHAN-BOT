module.exports = {
    name: 'moneda',
    aliases: ['coin', 'flip', 'cara'],
    description: 'Lanza una moneda',

    async execute(sock, message, args, context) {
        const { from, senderName } = context;

        const resultado = Math.random() < 0.5 ? '🪙 CARA' : '🪙 SELLO';

        await sock.sendMessage(from, {
            text: `🪙 *${senderName}* lanzó una moneda...\n\n¡Cayó: *${resultado}*!`
        });
    }
};