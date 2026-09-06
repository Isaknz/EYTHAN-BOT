const { sendAI, textFromArgs } = require('../../utils/openrouter');

module.exports = {
    name: 'codigo', aliases: ['code', 'programar'], description: 'Genera código con IA',
    async execute(sock, message, args, { from }) {
        const request = textFromArgs(args, '💻 Uso: *.codigo javascript crea una calculadora*');
        if (request.startsWith('💻')) return sock.sendMessage(from, { text: request });
        await sendAI(sock, from, `Actúa como ingeniero senior. Resuelve esta petición de programación: ${request}. Devuelve código funcional en un bloque y una explicación breve.`, '💻 *Código generado*', { maxTokens: 1200 });
    }
};