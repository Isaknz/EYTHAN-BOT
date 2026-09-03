module.exports = {
    name: 'listar',
    aliases: ['lista', 'miembros', 'members'],
    description: 'Lista todos los miembros del grupo',

    async execute(sock, message, args, context) {
        const { from, isGroup } = context;

        if (!isGroup) return await sock.sendMessage(from, { text: '❌ Solo funciona en grupos.' });

        try {
            const groupMetadata = await sock.groupMetadata(from);
            const participants = groupMetadata.participants;

            const admins = participants.filter(p => p.admin);
            const miembros = participants.filter(p => !p.admin);

            let texto = `👥 *Miembros de ${groupMetadata.subject}*\n`;
            texto += `📊 Total: *${participants.length}* personas\n\n`;

            if (admins.length) {
                texto += `👑 *Administradores (${admins.length})*\n`;
                admins.forEach((a, i) => {
                    texto += `  ${i + 1}. @${a.id.split('@')[0]}\n`;
                });
            }

            texto += `\n👤 *Miembros (${miembros.length})*\n`;
            miembros.forEach((m, i) => {
                texto += `  ${i + 1}. @${m.id.split('@')[0]}\n`;
            });

            await sock.sendMessage(from, {
                text: texto,
                mentions: participants.map(p => p.id)
            });
        } catch (e) {
            await sock.sendMessage(from, { text: '❌ Error al listar miembros.' });
        }
    }
};