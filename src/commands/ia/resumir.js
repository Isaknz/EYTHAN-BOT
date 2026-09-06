const { sendAI } = require('../../utils/openrouter');

module.exports = {
    name: 'resumir',
    aliases: ['resume', 'summary'],
    description: 'Resume un texto largo',

    async execute(sock, message, args, context) {
        const { from } = context;

        // Verificar si responde a un mensaje
        const textoContexto = message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation
            || message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.extendedTextMessage?.text;

        const texto = textoContexto || args.join(' ');

        if (!texto || texto.length < 50) {
            return await sock.sendMessage(from, {
                text: '📝 Uso: Responde un mensaje con *.resumir* o escribe *.resumir [texto largo]*'
            });
        }

        await sock.sendMessage(from, { text: '📝 Resumiendo...' });
        await sendAI(sock, from, `Resume este texto de forma clara y concisa en español:\n\n${texto}`, '📝 *Resumen*', { maxTokens: 300 });
    }
};