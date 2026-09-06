const axios = require('axios');
const config = require('../../../config');

module.exports = {
    name: 'kie', aliases: ['kieai'], description: 'Consulta un endpoint compatible de Kie AI',
    async execute(sock, message, args, { from }) {
        const prompt = args.join(' ').trim();
        if (!prompt) return sock.sendMessage(from, { text: '⚙️ Uso: *.kie descripción o pregunta*' });
        if (!config.kieKey) {
            return sock.sendMessage(from, { text: '❌ Configura KIE_AI_API_KEY en .env.' });
        }
        const model = process.env.KIE_MODEL;
        if (!model) {
            return sock.sendMessage(from, {
                text: '❌ Configura KIE_MODEL en .env con el identificador exacto del modelo elegido en Kie.'
            });
        }
        try {
            const response = await axios.post(config.kieUrl, {
                model,
                input: { prompt }
            }, {
                headers: {
                    Authorization: `Bearer ${config.kieKey}`,
                    'Content-Type': 'application/json'
                },
                timeout: 60000
            });
            const data = response.data;
            if (data.code && ![0, 200].includes(Number(data.code))) {
                throw new Error(data.msg || data.message || `Kie respondió con código ${data.code}`);
            }

            const payload = data.data && typeof data.data === 'object' ? data.data : data;
            const taskId = payload.taskId || payload.task_id || payload.recordId || payload.record_id;
            if (taskId) {
                return sock.sendMessage(from, { text: `⚙️ Tarea Kie creada.\n\nID: ${taskId}\n\nKie procesa esta solicitud de forma asíncrona. Revisa el panel de tareas o configura un endpoint de consulta.` });
            }
            const text = payload.output || payload.result || payload.text || payload.message;
            if (!text) {
                const fields = Object.keys(payload).join(', ') || 'ninguno';
                throw new Error(`Kie no devolvió un identificador. Campos recibidos: ${fields}`);
            }
            await sock.sendMessage(from, { text: `⚙️ *Kie AI*\n\n${typeof text === 'string' ? text : JSON.stringify(text)}` });
        } catch (error) {
            console.error('Kie AI:', error.response?.data || error.message);
            const detail = error.response?.data?.msg || error.response?.data?.message || error.message;
            await sock.sendMessage(from, { text: `❌ Error de Kie AI con el modelo *${model}*: ${detail}` });
        }
    }
};