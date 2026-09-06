const { sendAI, textFromArgs } = require('../../utils/openrouter');

module.exports = {
    name: 'debug', aliases: ['depurar', 'errorcodigo'], description: 'Analiza errores de código',
    async execute(sock, message, args, { from }) {
        const request = textFromArgs(args, '🐞 Uso: *.debug error y código*');
        if (request.startsWith('🐞')) return sock.sendMessage(from, { text: request });
        await sendAI(sock, from, `Analiza este error o código: ${request}. Identifica la causa, explica la solución y muestra el parche corregido.`, '🐞 *Diagnóstico*', { maxTokens: 1200 });
    }
};