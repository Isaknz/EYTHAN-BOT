module.exports = {
    name: 'rate',
    aliases: ['calificar', 'puntuar'],
    description: 'Califica a un usuario del 1 al 10',

    async execute(sock, message, args, context) {
        const { from, isGroup } = context;

        const mencionado = message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];

        if (!mencionado) {
            return await sock.sendMessage(from, { text: '❓ Menciona a alguien. Ej: *.rate @usuario*' });
        }

        const puntuacion = Math.floor(Math.random() * 10) + 1;
        const nombre = `@${mencionado.split('@')[0]}`;

        const comentarios = {
            1: '😬 Mejor que no salga de casa...',
            2: '😅 Necesita mucho trabajo...',
            3: '🤔 Le falta bastante...',
            4: '😐 Está por debajo del promedio.',
            5: '🙂 Justo en la media.',
            6: '😊 No está mal del todo.',
            7: '👍 Bastante bien!',
            8: '🔥 Muy bien! Destacable.',
            9: '⭐ Excelente! Casi perfecto.',
            10: '🏆 ¡PERFECTO! ¡10/10!'
        };

        await sock.sendMessage(from, {
            text: `⭐ *Rating*\n\n${nombre} obtuvo: *${puntuacion}/10*\n\n${comentarios[puntuacion]}`,
            mentions: [mencionado]
        });
    }
};