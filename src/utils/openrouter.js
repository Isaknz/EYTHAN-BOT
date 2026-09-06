const axios = require('axios');
const config = require('../../config');

async function askOpenRouter(prompt, options = {}) {
    if (!config.openrouterKey) {
        throw new Error('No está configurada la clave de OpenRouter.');
    }

    const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
            model: options.model || 'openrouter/free',
            messages: options.messages || [{ role: 'user', content: prompt }],
            max_tokens: options.maxTokens || 800,
            temperature: options.temperature ?? 0.4
        },
        {
            headers: {
                Authorization: `Bearer ${config.openrouterKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://github.com/Isaknz/EYTHAN-BOT',
                'X-Title': 'EYTHAN-BOT'
            },
            timeout: options.timeout || 30000
        }
    );

    const text = response.data.choices?.[0]?.message?.content;
    if (!text) throw new Error('OpenRouter no devolvió una respuesta.');
    return text;
}

async function sendAI(sock, from, prompt, title, options) {
    try {
        const answer = await askOpenRouter(prompt, options);
        await sock.sendMessage(from, { text: `${title}\n\n${answer}` });
    } catch (error) {
        console.error('OpenRouter:', error.response?.data || error.message);
        await sock.sendMessage(from, { text: `❌ ${error.message}` });
    }
}

function textFromArgs(args, usage) {
    const text = args.join(' ').trim();
    return text || usage;
}

module.exports = { askOpenRouter, sendAI, textFromArgs };