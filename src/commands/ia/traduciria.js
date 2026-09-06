const { sendAI, textFromArgs } = require('../../utils/openrouter');

module.exports = {
    name: 'traduciria', aliases: ['traduciriaia', 'translateia'], description: 'Traduce con contexto usando IA',
    async execute(sock, message, args, { from }) {
        const request = textFromArgs(args, '🌍 Uso: *.traduciria inglés texto*');
        if (request.startsWith('🌍')) return sock.sendMessage(from, { text: request });
        await sendAI(sock, from, `Traduce este texto al idioma indicado, conservando tono y formato: ${request}. Devuelve solo la traducción.`, '🌍 *Traducción IA*', { temperature: 0.1 });
    }
};