module.exports = {
    name: 'revocar',
    aliases: ['revoke', 'resetlink'],
    description: 'Revoca el link de invitación del grupo',

    async execute(sock, message, args, context) {
        const { from, sender, isGroup } = context;

        if (!isGroup) return await sock.sendMessage(from, { text: '❌ Solo funciona en grupos.' });

        try {
            const groupMetadata = await sock.groupMetadata(from);
            const admins = groupMetadata.participants.filter(p => p.admin).map(p => p.id);

            if (!admins.includes(sender)) {
                return await sock.sendMessage(from, { text: '❌ Solo los admins pueden revocar el link.' });
            }

            await sock.groupRevokeInvite(from);
            await sock.sendMessage(from, { text: '🔒 Link revocado. El link anterior ya no funciona.' });
        } catch (e) {
            await sock.sendMessage(from, { text: '❌ Necesito ser admin para revocar el link.' });
        }
    }
};