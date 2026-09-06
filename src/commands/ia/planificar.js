const { sendAI, textFromArgs } = require('../../utils/openrouter');

module.exports = {
    name: 'planificar', aliases: ['plan', 'planear'], description: 'Crea un plan con IA',
    async execute(sock, message, args, { from }) {
        const task = textFromArgs(args, '📅 Uso: *.planificar objetivo*');
        if (task.startsWith('📅')) return sock.sendMessage(from, { text: task });
        await sendAI(sock, from, `Crea un plan práctico, ordenado y realista para: ${task}. Incluye pasos, prioridades y una lista de verificación.`, '📅 *Plan*');
    }
};