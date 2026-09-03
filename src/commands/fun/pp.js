module.exports = {
    name: 'pp',
    aliases: ['pene', 'tamaño'],
    description: 'Medidor de pp 😂',

    async execute(sock, message, args, context) {
        const { from, senderName } = context;

        const mencionado = message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
        const nombre = mencionado ? `@${mencionado.split('@')[0]}` : senderName;
        const size = Math.floor(Math.random() * 25);
        const barra = '8' + '='.repeat(size) + 'D';

        await sock.sendMessage(from, {
            text: `📏 *Medidor de PP*\n\n${nombre}: ${barra}\n\n📊 Tamaño: *${size} cm*`,
            mentions: mencionado ? [mencionado] : []
        });
    }
};