module.exports = {
    name: 'ruleta',
    aliases: ['roulette'],
    description: 'Ruleta rusa — elimina a alguien random del grupo',

    async execute(sock, message, args, context) {
        const { from, sender, isGroup } = context;

        if (!isGroup) {
            return await sock.sendMessage(from, { text: '❌ Este comando solo funciona en grupos.' });
        }

        try {
            const groupMetadata = await sock.groupMetadata(from);
            const participants = groupMetadata.participants.filter(p => !p.admin);

            if (participants.length === 0) {
                return await sock.sendMessage(from, { text: '😅 No hay usuarios sin admin para eliminar.' });
            }

            const victima = participants[Math.floor(Math.random() * participants.length)];

            await sock.sendMessage(from, {
                text: `🔫 *Ruleta Rusa*\n\n🎯 La bala apuntó a... @${victima.id.split('@')[0]}!\n\n💀 ¡Hasta luego!`,
                mentions: [victima.id]
            });

            // Esperar 2 segundos antes de expulsar
            await new Promise(r => setTimeout(r, 2000));
            await sock.groupParticipantsUpdate(from, [victima.id], 'remove');

        } catch (e) {
            await sock.sendMessage(from, { text: '❌ Necesito ser admin para expulsar usuarios.' });
        }
    }
};