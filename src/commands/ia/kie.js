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
        try {
            const response = await axios.post(config.kieUrl, {
                model: process.env.KIE_MODEL || 'gpt-4o-mini',
                input: { prompt }
            }, {
                headers: {
                    Authorization: `Bearer ${config.kieKey}`,
                    'Content-Type': 'application/json'
                },
                timeout: 60000
            });
            const data = response.data;
            const taskId = data.taskId || data.task_id || data.data?.taskId || data.data?.task_id;
            if (taskId) {
                return sock.sendMessage(from, { text: `⚙️ Tarea Kie creada.\n\nID: ${taskId}\n\nKie procesa esta solicitud de forma asíncrona. Revisa el panel de tareas o configura un endpoint de consulta.` });
            }
            const text = data.output || data.result || data.text || data.message || data.data?.output || data.data?.result;
            if (!text) throw new Error('Kie no devolvió taskId ni texto. Revisa KIE_MODEL y el endpoint configurado.');
            await sock.sendMessage(from, { text: `⚙️ *Kie AI*\n\n${typeof text === 'string' ? text : JSON.stringify(text)}` });
        } catch (error) {
            console.error('Kie AI:', error.response?.data || error.message);
            const detail = error.response?.data?.msg || error.response?.data?.message || error.message;
            await sock.sendMessage(from, { text: `❌ Error de Kie AI: ${detail}` });
        }
    }
};