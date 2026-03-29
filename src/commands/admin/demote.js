const { isAdmin } = require('../../utils/helpers');

module.exports = {
    name: 'demote',
    aliases: ['quitaradmin', 'demitir', 'removeadmin'],
    description: 'Quita admin a un usuario',

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
            return await sock.sendMessage(from, { text: '❌ Menciona al usuario a quitar admin' });
        }

        try {
            await sock.groupParticipantsUpdate(from, [target], 'demote');
            await sock.sendMessage(from, {
                text: `✅ @${target.split('@')[0]} ya no es admin`,
                mentions: [target]
            });
        } catch (error) {
            await sock.sendMessage(from, { text: '❌ No se pudo quitar admin' });
        }
    }
};