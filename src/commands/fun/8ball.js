module.exports = {
    name: '8ball',
    aliases: ['bola', 'magia'],
    description: 'La bola mágica responde tu pregunta',

    async execute(sock, message, args, context) {
        const { from, senderName } = context;

        if (!args.length) {
            return await sock.sendMessage(from, { text: '❓ Escribe una pregunta. Ej: *.8ball ¿Me irá bien hoy?*' });
        }

        const respuestas = [
            '✅ Sí, definitivamente.',
            '✅ Todo indica que sí.',
            '✅ Sin duda alguna.',
            '✅ Puedes contar con ello.',
            '✅ Las señales dicen que sí.',
            '🤔 Pregunta de nuevo más tarde.',
            '🤔 No puedo predecirlo ahora.',
            '🤔 Mejor no te digo...',
            '🤔 Concéntrate y pregunta de nuevo.',
            '❌ No cuentes con ello.',
            '❌ Las señales dicen que no.',
            '❌ Definitivamente no.',
            '❌ Mis fuentes dicen que no.',
            '❌ El futuro no se ve bien para eso.'
        ];

        const respuesta = respuestas[Math.floor(Math.random() * respuestas.length)];
        const pregunta = args.join(' ');

        await sock.sendMessage(from, {
            text: `🎱 *Bola Mágica*\n\n❓ *Pregunta:* ${pregunta}\n\n🔮 *Respuesta:* ${respuesta}`
        });
    }
};