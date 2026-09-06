const { sendAI, textFromArgs } = require('../../utils/openrouter');

module.exports = {
    name: 'agente', aliases: ['agent', 'asistente'], description: 'Interpreta tareas y usa funciones seguras',
    async execute(sock, message, args, context) {
        const { from } = context;
        const request = textFromArgs(args, '🤖 Uso: *.agente recuérdame llamar a Isaac en 2h*');
        if (request.startsWith('🤖')) return sock.sendMessage(from, { text: request });

        const reminderMatch = /^recu[eé]rdame\s+(.+)\s+en\s+([1-9]\d*[smhd])$/i.exec(request);
        if (reminderMatch) {
            const recordar = require('../tools/recordar');
            return recordar.execute(sock, message, [reminderMatch[2], reminderMatch[1]], context);
        }

        await sendAI(sock, from, `Actúa como un agente prudente. Analiza esta tarea: ${request}. Devuelve: objetivo, pasos, datos que faltan y qué comando del bot usarías. No ejecutes acciones ni inventes resultados.`, '🤖 *Plan del agente*', { maxTokens: 900 });
    }
};