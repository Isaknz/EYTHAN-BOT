module.exports = {
    name: 'delete',
    aliases: ['del', 'borrar', 'eliminar'],
    description: 'Elimina un mensaje del bot',

    async execute(sock, message, args, context) {
        const { from, sender } = context;

        const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const quotedKey = message.message?.extendedTextMessage?.contextInfo?.stanzaId;
        const quotedParticipant = message.message?.extendedTextMessage?.contextInfo?.participant;

        if (!quotedMsg || !quotedKey) {
            return await sock.sendMessage(from, {
                text: '❌ Responde al mensaje que quieres eliminar'
            });
        }

        try {
            await sock.sendMessage(from, {
                delete: {
                    remoteJid: from,
                    fromMe: quotedParticipant === sender,
                    id: quotedKey,
                    participant: quotedParticipant
                }
            });
        } catch (error) {
            await sock.sendMessage(from, {
                text: '❌ No se pudo eliminar el mensaje'
            });
        }
    }
};