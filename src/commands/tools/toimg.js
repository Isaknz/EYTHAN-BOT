module.exports = {
    name: 'toimg',
    aliases: ['stickertoimg', 'stimg'],
    description: 'Convierte un sticker a imagen',

    async execute(sock, message, args, context) {
        const { from } = context;

        const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const stickerMsg = quoted?.stickerMessage;

        if (!stickerMsg) {
            return await sock.sendMessage(from, { 
                text: '🖼️ Responde a un sticker con *.toimg* para convertirlo a imagen.' 
            });
        }

        try {
            const { downloadMediaMessage } = require('@whiskeysockets/baileys');
            const buffer = await downloadMediaMessage(
                { message: quoted, key: message.key },
                'buffer',
                {}
            );

            await sock.sendMessage(from, {
                image: buffer,
                caption: '🖼️ Aquí está tu imagen!'
            });
        } catch (e) {
            await sock.sendMessage(from, { text: '❌ Error al convertir el sticker.' });
        }
    }
};