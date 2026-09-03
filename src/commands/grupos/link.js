module.exports = {
    name: 'link',
    aliases: ['invitar', 'invite'],
    description: 'Obtiene el link de invitación del grupo',

    async execute(sock, message, args, context) {
        const { from, sender, isGroup } = context;

        if (!isGroup) return await sock.sendMessage(from, { text: '❌ Solo funciona en grupos.' });

        try {
            const groupMetadata = await sock.groupMetadata(from);
            const admins = groupMetadata.participants.filter(p => p.admin).map(p => p.id);

            if (!admins.includes(sender)) {
                return await sock.sendMessage(from, { text: '❌ Solo los admins pueden obtener el link.' });
            }

            const code = await sock.groupInviteCode(from);
            await sock.sendMessage(from, {
                text: `🔗 *Link de invitación*\n\nhttps://chat.whatsapp.com/${code}`
            });
        } catch (e) {
            await sock.sendMessage(from, { text: '❌ Necesito ser admin para obtener el link.' });
        }
    }
};