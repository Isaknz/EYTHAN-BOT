const { sendAI, textFromArgs } = require('../../utils/openrouter');

module.exports = {
    name: 'responder', aliases: ['respuestaia', 'replyia'], description: 'Redacta una respuesta',
    async execute(sock, message, args, { from }) {
        const request = textFromArgs(args, '💬 Uso: *.responder mensaje al que debo responder*');
        if (request.startsWith('💬')) return sock.sendMessage(from, { text: request });
        await sendAI(sock, from, `Redacta una respuesta amable, natural y breve para este mensaje: ${request}`, '💬 *Respuesta sugerida*');
    }
};