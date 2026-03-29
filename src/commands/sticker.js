const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'sticker',
    aliases: ['s', 'stiker', 'stick'],
    description: 'Convierte imagen/video en sticker',

    async execute(sock, message, args, context) {
        const { from, senderName } = context;

        try {
            // Verificar si es imagen o video
            const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            const targetMsg = quotedMsg || message.message;

            const isImage = targetMsg?.imageMessage;
            const isVideo = targetMsg?.videoMessage;

            if (!isImage && !isVideo) {
                return await sock.sendMessage(from, {
                    text: '❌ Responde a una imagen o video con *.sticker*'
                });
            }

            await sock.sendMessage(from, { text: '⏳ Creando sticker...' });

            // Descargar media
            const buffer = await downloadMediaMessage(
                { key: message.key, message: targetMsg },
                'buffer',
                {},
                { logger: console }
            );

            if (isImage) {
                // Procesar imagen
                const stickerBuffer = await sharp(buffer)
                    .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
                    .webp()
                    .toBuffer();

                await sock.sendMessage(from, {
                    sticker: stickerBuffer
                });
            } else {
                // Para video (simplificado - requiere ffmpeg)
                await sock.sendMessage(from, {
                    text: '⚠️ Los stickers de video requieren configuración adicional'
                });
            }

        } catch (error) {
            console.error('Error sticker:', error);
            await sock.sendMessage(from, { text: '❌ Error al crear sticker' });
        }
    }
};