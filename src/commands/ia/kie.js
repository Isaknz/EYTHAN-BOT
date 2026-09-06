const axios = require('axios');
const config = require('../../../config');

module.exports = {
    name: 'kie', aliases: ['kieai'], description: 'Consulta un endpoint compatible de Kie AI',
    async execute(sock, message, args, { from }) {
        const prompt = args.join(' ').trim();
        if (!prompt) return sock.sendMessage(from, { text: '⚙️ Uso: *.kie descripción o pregunta*' });
        if (!config.kieKey || !config.kieUrl) {
            return sock.sendMessage(from, { text: '❌ Configura KIE_AI_API_KEY y KIE_API_URL en .env.' });
        }
        try {
            const response = await axios.post(config.kieUrl, {
                prompt,
                model: process.env.KIE_MODEL || undefined
            }, {
                headers: {
                    Authorization: `Bearer ${config.kieKey}`,
                    'Content-Type': 'application/json'
                },
                timeout: 60000
            });
            const data = response.data;
            const text = data.output || data.result || data.text || data.message || data.data?.output || data.data?.result;
            if (!text) throw new Error('La respuesta de Kie no tiene un campo de texto reconocido. Revisa el formato de su API.');
            await sock.sendMessage(from, { text: `⚙️ *Kie AI*\n\n${typeof text === 'string' ? text : JSON.stringify(text)}` });
        } catch (error) {
            console.error('Kie AI:', error.response?.data || error.message);
            await sock.sendMessage(from, { text: `❌ Error de Kie AI: ${error.response?.data?.message || error.message}` });
        }
    }
};