module.exports = {
    name: 'ship',
    aliases: ['pareja', 'amor', 'compatibilidad'],
    description: 'Calcula compatibilidad entre dos personas',

    async execute(sock, message, args, context) {
        const { from, sender, senderName } = context;

        const mentionedJid = message.message?.extendedTextMessage?.contextInfo?.mentionedJid;

        if (!mentionedJid || mentionedJid.length < 1) {
            return await sock.sendMessage(from, {
                text: '❌ Menciona a alguien para calcular compatibilidad\n\nEjemplo: *.ship @usuario*'
            });
        }

        const target = mentionedJid[0];
        const porcentaje = Math.floor(Math.random() * 101);

        const corazones = '❤️'.repeat(Math.floor(porcentaje / 20)) + '🖤'.repeat(5 - Math.floor(porcentaje / 20));

        let mensaje = '';
        if (porcentaje < 20) mensaje = '💔 Mejor ni intentarlo...';
        else if (porcentaje < 40) mensaje = '😅 Hay algo pero no mucho';
        else if (porcentaje < 60) mensaje = '💕 Podría funcionar';
        else if (porcentaje < 80) mensaje = '💖 Buena pareja';
        else mensaje = '💍 ¡Alta!';

        const texto = `
💞 *Shippeando...* 💞

@${sender.split('@')[0]} ❌ @${target.split('@')[0]}

Compatibilidad: ${porcentaje}%
${corazones}

${mensaje}
`;

        await sock.sendMessage(from, {
            text: texto,
            mentions: [sender, target]
        });
    }
};