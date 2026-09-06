const axios = require('axios');
const config = require('../../../config');

module.exports = {
    name: 'openai', aliases: ['gpt', 'chatgpt'], description: 'Consulta directamente OpenAI',
    async execute(sock, message, args, { from }) {
        const prompt = args.join(' ').trim();
        if (!prompt) return sock.sendMessage(from, { text: '🤖 Uso: *.openai pregunta*' });
        if (!config.openAIKey) return sock.sendMessage(from, { text: '❌ No está configurada la API de OpenAI.' });
        try {
            const response = await axios.post('https://api.openai.com/v1/chat/completions', {
                model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 800
            }, {
                headers: { Authorization: `Bearer ${config.openAIKey}`, 'Content-Type': 'application/json' },
                timeout: 30000
            });
            const text = response.data.choices?.[0]?.message?.content;
            if (!text) throw new Error('OpenAI no devolvió una respuesta.');
            await sock.sendMessage(from, { text: `🤖 *OpenAI*\n\n${text}` });
        } catch (error) {
            console.error('OpenAI:', error.response?.data || error.message);
            await sock.sendMessage(from, { text: `❌ Error de OpenAI: ${error.response?.data?.error?.message || error.message}` });
        }
    }
};