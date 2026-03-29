const { isAdmin } = require('../../utils/helpers');

module.exports = {
    name: 'promote',
    aliases: ['admin', 'dadmin', 'daradmin'],
    description: 'Da admin a un usuario',

    async execute(sock, message, args, context) {
        const { from, sender, isGroup } = context;

        if (!isGroup) {
            return await sock.sendMessage(from, { text: '❌ Este comando solo funciona en grupos' });
        }

        const isSenderAdmin = await isAdmin(sock, from, sender);
        if (!isSenderAdmin) {
            return await sock.sendMessage(from, { text: '❌ Solo admins pueden usar este comando' });
        }

        const mentionedJid = message.message?.extendedTextMessage?.contextInfo?.mentionedJid;
        const target = mentionedJid?.[0];

        if (!target) {
            return await sock.sendMessage(from, { text: '❌ Menciona al usuario a dar admin' });
        }

        try {
            await sock.groupParticipantsUpdate(from, [target], 'promote');
            await sock.sendMessage(from, {
                text: `✅ @${target.split('@')[0]} ahora es admin`,
                mentions: [target]
            });
        } catch (error) {
            await sock.sendMessage(from, { text: '❌ No se pudo dar admin' });
        }
    }
};