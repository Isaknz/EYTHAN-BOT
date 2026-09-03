const config = require('../../../config');

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
                    messages: [{ role: 'user', content: `Resume este texto de forma clara y concisa en español:\n\n${texto}` }]
                })
            });

            const data = await res.json();
            const resumen = data.content?.[0]?.text || 'No pude resumir el texto.';

            await sock.sendMessage(from, {
                text: `📝 *Resumen*\n\n${resumen}`
            });
        } catch (e) {
            await sock.sendMessage(from, { text: '❌ Error al resumir.' });
        }
    }
};