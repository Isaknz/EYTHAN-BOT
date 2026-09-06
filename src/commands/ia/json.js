const { sendAI, textFromArgs } = require('../../utils/openrouter');

module.exports = {
    name: 'json', aliases: ['estructurar'], description: 'Estructura texto como JSON',
    async execute(sock, message, args, { from }) {
        const request = textFromArgs(args, '🧾 Uso: *.json nombre Isaac edad 25*');
        if (request.startsWith('🧾')) return sock.sendMessage(from, { text: request });
        await sendAI(sock, from, `Convierte este texto a JSON válido. Responde únicamente con JSON sin markdown: ${request}`, '🧾 *JSON*', { temperature: 0.1, maxTokens: 1000 });
    }
};