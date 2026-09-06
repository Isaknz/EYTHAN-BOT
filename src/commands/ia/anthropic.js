const axios = require('axios');
const config = require('../../../config');

module.exports = {
    name: 'anthropic', aliases: ['claude'], description: 'Consulta directamente Claude',
    async execute(sock, message, args, { from }) {
        const prompt = args.join(' ').trim();
        if (!prompt) return sock.sendMessage(from, { text: '🧠 Uso: *.anthropic pregunta*' });
        if (!config.anthropicKey) return sock.sendMessage(from, { text: '❌ No está configurada la API de Anthropic.' });
        try {
            const response = await axios.post('https://api.anthropic.com/v1/messages', {
                model: process.env.ANTHROPIC_MODEL || 'claude-3-5-haiku-latest',
                max_tokens: 800,
                messages: [{ role: 'user', content: prompt }]
            }, {
                headers: {
                    'x-api-key': config.anthropicKey,
                    'anthropic-version': '2023-06-01',
                    'Content-Type': 'application/json'
                },
                timeout: 30000
            });
            const text = response.data.content?.[0]?.text;
            if (!text) throw new Error('Anthropic no devolvió una respuesta.');
            await sock.sendMessage(from, { text: `🧠 *Anthropic*\n\n${text}` });
        } catch (error) {
            console.error('Anthropic:', error.response?.data || error.message);
            await sock.sendMessage(from, { text: `❌ Error de Anthropic: ${error.response?.data?.error?.message || error.message}` });
        }
    }
};