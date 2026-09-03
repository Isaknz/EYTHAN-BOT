module.exports = {
    name: 'cerrar',
    aliases: ['close', 'lock'],
    description: 'Cierra el grupo (solo admins pueden escribir)',

    async execute(sock, message, args, context) {
        const { from, sender, isGroup } = context;

        if (!isGroup) return await sock.sendMessage(from, { text: '❌ Solo funciona en grupos.' });

        try {
            const groupMetadata = await sock.groupMetadata(from);
            const admins = groupMetadata.participants.filter(p => p.admin).map(p => p.id);

            if (!admins.includes(sender)) {
                return await sock.sendMessage(from, { text: '❌ Solo los admins pueden usar este comando.' });
            }

            await sock.groupSettingUpdate(from, 'announcement');
            await sock.sendMessage(from, { text: '🔒 Grupo cerrado. Solo los admins pueden escribir.' });
        } catch (e) {
            await sock.sendMessage(from, { text: '❌ Necesito ser admin para cerrar el grupo.' });
        }
    }
};