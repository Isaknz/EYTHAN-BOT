const { sendAI, textFromArgs } = require('../../utils/openrouter');

module.exports = {
    name: 'clasificar', aliases: ['clasifica', 'categoria'], description: 'Clasifica un texto',
    async execute(sock, message, args, { from }) {
        const request = textFromArgs(args, '🏷️ Uso: *.clasificar texto*');
        if (request.startsWith('🏷️')) return sock.sendMessage(from, { text: request });
        await sendAI(sock, from, `Clasifica este mensaje en una categoría breve y explica la prioridad: ${request}`, '🏷️ *Clasificación*');
    }
};