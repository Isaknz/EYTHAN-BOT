const { sendAI, textFromArgs } = require('../../utils/openrouter');

module.exports = {
    name: 'documento', aliases: ['document', 'preguntardoc'], description: 'Analiza texto de un documento',
    async execute(sock, message, args, { from }) {
        const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const quotedText = quoted?.conversation || quoted?.extendedTextMessage?.text;
        const text = quotedText || args.join(' ').trim();
        if (!text) return sock.sendMessage(from, { text: '📄 Responde a un documento de texto o escribe su contenido.' });
        await sendAI(sock, from, `Analiza este documento. Resume, extrae puntos clave y responde según su contenido sin inventar: ${text}`, '📄 *Análisis de documento*', { maxTokens: 1000 });
    }
};