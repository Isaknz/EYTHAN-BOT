const { isAdmin } = require('../../utils/helpers');

module.exports = {
    name: 'kick',
    aliases: ['expulsar', 'ban', 'sacar'],
    description: 'Expulsa a un usuario del grupo',

    async execute(sock, message, args, context) {
        const { from, sender, isGroup } = context;

        if (!isGroup) {
            return await sock.sendMessage(from, { text: '❌ Este comando solo funciona en grupos' });
        }

        // Verificar si es admin
        const isSenderAdmin = await isAdmin(sock, from, sender);
        if (!isSenderAdmin) {
            return await sock.sendMessage(from, { text: '❌ Solo admins pueden usar este comando' });
        }

        // Obtener usuario a expulsar
        const mentionedJid = message.message?.extendedTextMessage?.contextInfo?.mentionedJid;
        const quotedParticipant = message.message?.extendedTextMessage?.contextInfo?.participant;

        let target = mentionedJid?.[0] || quotedParticipant;

        if (!target) {
            return await sock.sendMessage(from, { text: '❌ Menciona o responde al mensaje del usuario a expulsar' });
        }

        try {
            await sock.groupParticipantsUpdate(from, [target], 'remove');
            await sock.sendMessage(from, {
                text: `✅ @${target.split('@')[0]} ha sido expulsado`,
                mentions: [target]
            });
        } catch (error) {
            await sock.sendMessage(from, { text: '❌ No se pudo expulsar al usuario' });
        }
    }
};