const { sendAI } = require('../../utils/openrouter');

module.exports = {
    name: 'corregir',
    aliases: ['ortografia', 'fix'],
    description: 'Corrige ortografía y gramática',

    async execute(sock, message, args, context) {
        const { from } = context;

        const textoContexto = message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation
            || message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.extendedTextMessage?.text;

        const texto = textoContexto || args.join(' ');

        if (!texto) {
            return await sock.sendMessage(from, {
                text: '✏️ Uso: Responde un mensaje con *.corregir* o escribe *.corregir [texto]*'
            });
        }

        await sendAI(sock, from, `Corrige la ortografía y gramática. Muestra el texto corregido y una lista breve de errores:\n\n${texto}`, '✏️ *Corrección*', { maxTokens: 400 });
    }
};