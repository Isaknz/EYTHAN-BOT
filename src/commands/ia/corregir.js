const config = require('../../../config');

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

        try {
            const res = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': config.anthropicKey,
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify({
                    model: 'claude-haiku-4-5-20251001',
                    max_tokens: 300,
                    messages: [{ role: 'user', content: `Corrige la ortografía y gramática del siguiente texto. Muestra primero el texto corregido y luego una lista breve de los errores encontrados:\n\n${texto}` }]
                })
            });

            const data = await res.json();
            const correccion = data.content?.[0]?.text || 'No pude corregir el texto.';

            await sock.sendMessage(from, {
                text: `✏️ *Corrección*\n\n${correccion}`
            });
        } catch (e) {
            await sock.sendMessage(from, { text: '❌ Error al corregir.' });
        }
    }
};