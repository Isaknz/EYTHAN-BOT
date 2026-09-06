const { sendAI, textFromArgs } = require('../../utils/openrouter');

module.exports = {
    name: 'convertir', aliases: ['formato', 'format'], description: 'Convierte texto entre formatos',
    async execute(sock, message, args, { from }) {
        const request = textFromArgs(args, '🔄 Uso: *.convertir json lista de productos*');
        if (request.startsWith('🔄')) return sock.sendMessage(from, { text: request });
        await sendAI(sock, from, `Convierte lo siguiente al formato solicitado. No añadas datos inventados. Petición: ${request}`, '🔄 *Conversión*', { temperature: 0.1 });
    }
};