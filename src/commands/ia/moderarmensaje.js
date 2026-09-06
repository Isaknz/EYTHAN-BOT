const { sendAI, textFromArgs } = require('../../utils/openrouter');

module.exports = {
    name: 'moderarmensaje', aliases: ['moderar', 'moderacionia'], description: 'Evalúa un mensaje con IA',
    async execute(sock, message, args, { from }) {
        const request = textFromArgs(args, '🛡️ Uso: *.moderarmensaje texto*');
        if (request.startsWith('🛡️')) return sock.sendMessage(from, { text: request });
        await sendAI(sock, from, `Evalúa este mensaje para moderación. Devuelve: seguro, revisar o peligroso; categoría; razón breve. Mensaje: ${request}`, '🛡️ *Moderación IA*', { temperature: 0.1 });
    }
};