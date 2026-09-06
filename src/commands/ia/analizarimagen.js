const axios = require('axios');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const config = require('../../../config');

module.exports = {
    name: 'analizarimagen',
    aliases: ['vision', 'verimagen', 'describeimagen'],
    description: 'Analiza una imagen con IA',

    async execute(sock, message, args, { from }) {
        const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const imageMessage = quoted?.imageMessage || message.message?.imageMessage;

        if (!imageMessage) {
            return sock.sendMessage(from, {
                text: '🖼️ Responde a una imagen con *.analizarimagen [pregunta opcional]*.'
            });
        }

        if (!config.openrouterKey) {
            return sock.sendMessage(from, {
                text: '❌ No está configurada la clave de OpenRouter.'
            });
        }

        await sock.sendMessage(from, { text: '🔎 Analizando imagen...' });

        try {
            const buffer = await downloadMediaMessage(
                { key: message.key, message: quoted || message.message },
                'buffer',
                {},
                { logger: console }
            );
            const question = args.join(' ') || 'Describe esta imagen con detalle y menciona los elementos importantes.';
            const response = await axios.post(
                'https://openrouter.ai/api/v1/chat/completions',
                {
                    model: 'openrouter/free',
                    messages: [{
                        role: 'user',
                        content: [
                            { type: 'text', text: question },
                            { type: 'image_url', image_url: { url: `data:${imageMessage.mimetype || 'image/jpeg'};base64,${buffer.toString('base64')}` } }
                        ]
                    }],
                    max_tokens: 600
                },
                {
                    headers: {
                        Authorization: `Bearer ${config.openrouterKey}`,
                        'Content-Type': 'application/json',
                        'HTTP-Referer': 'https://github.com/Isaknz/EYTHAN-BOT',
                        'X-Title': 'EYTHAN-BOT'
                    },
                    timeout: 45000
                }
            );

            const result = response.data.choices?.[0]?.message?.content;
            if (!result) throw new Error('La IA no devolvió una respuesta');

            await sock.sendMessage(from, { text: `🔎 *Análisis de imagen*\n\n${result}` });
        } catch (error) {
            console.error('Error analizando imagen:', error.response?.data || error.message);
            await sock.sendMessage(from, { text: '❌ No pude analizar la imagen. Inténtalo de nuevo.' });
        }
    }
};