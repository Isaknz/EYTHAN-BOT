const axios = require('axios');
const config = require('../../../config');

module.exports = {
    name: 'venice',
    aliases: ['veniceia', 'vchat'],
    description: 'Consulta directamente Venice AI',

    async execute(sock, message, args, { from, senderName }) {
        const prompt = args.join(' ').trim();

        if (!prompt) {
            return sock.sendMessage(from, {
                text: '🌐 Uso: *.venice pregunta*'
            });
        }

        if (!config.veniceKey) {
            return sock.sendMessage(from, {
                text: '❌ No está configurada la API de Venice.'
            });
        }

        try {
            const response = await axios.post(
                'https://api.venice.ai/api/v1/chat/completions',
                {
                    model: process.env.VENICE_MODEL || 'llama-3.3-70b',
                    messages: [
                        {
                            role: 'system',
                            content: `Eres Eythan, un asistente claro y útil. Responde en español. El usuario se llama ${senderName}.`
                        },
                        { role: 'user', content: prompt }
                    ],
                    max_tokens: 800,
                    temperature: 0.7
                },
                {
                    headers: {
                        Authorization: `Bearer ${config.veniceKey}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 30000
                }
            );

            const text = response.data.choices?.[0]?.message?.content;
            if (!text) throw new Error('Venice no devolvió una respuesta.');

            await sock.sendMessage(from, {
                text: `🌐 *Venice AI*\n\n${text}`
            });
        } catch (error) {
            console.error('Venice chat:', error.response?.data || error.message);
            const status = error.response?.status;
            const detail = status === 401
                ? 'Venice rechazó la clave o el modelo requiere acceso Pro. Revisa tu API key, saldo y permisos del modelo.'
                : status === 402
                    ? 'Venice requiere saldo o créditos para este modelo.'
                    : error.response?.data?.error?.message || error.response?.data?.message || error.message;
            await sock.sendMessage(from, { text: `❌ Error de Venice${status ? ` (${status})` : ''}: ${detail}` });
        }
    }
};