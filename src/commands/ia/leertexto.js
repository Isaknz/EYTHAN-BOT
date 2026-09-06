const { sendAI } = require('../../utils/openrouter');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const config = require('../../../config');

module.exports = {
    name: 'leertexto', aliases: ['ocr', 'extraertexto'], description: 'Lee texto de una imagen',
    async execute(sock, message, args, { from }) {
        const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const image = quoted?.imageMessage || message.message?.imageMessage;
        if (!image) return sock.sendMessage(from, { text: '🔤 Responde a una imagen con *.leertexto*.' });
        if (!config.openrouterKey) return sock.sendMessage(from, { text: '❌ No está configurada la clave de OpenRouter.' });
        try {
            const buffer = await downloadMediaMessage({ key: message.key, message: quoted || message.message }, 'buffer', {}, { logger: console });
            const content = [{ type: 'text', text: 'Extrae exactamente todo el texto visible de esta imagen. Si no hay texto, dilo.' }, { type: 'image_url', image_url: { url: `data:${image.mimetype || 'image/jpeg'};base64,${buffer.toString('base64')}` } }];
            await sendAI(sock, from, '', '🔤 *Texto extraído*', { messages: [{ role: 'user', content }], maxTokens: 1200 });
        } catch (error) {
            console.error('OCR:', error.message);
            await sock.sendMessage(from, { text: '❌ No pude leer el texto de la imagen.' });
        }
    }
};