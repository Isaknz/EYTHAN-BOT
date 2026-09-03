module.exports = {
    name: 'tagall',
    aliases: ['todos', 'mencionartodos', 'all'],
    description: 'Menciona a todos los miembros del grupo',

    async execute(sock, message, args, context) {
        const { from, sender, isGroup } = context;

        if (!isGroup) return await sock.sendMessage(from, { text: '❌ Solo funciona en grupos.' });

        try {
            const groupMetadata = await sock.groupMetadata(from);
            const participants = groupMetadata.participants;
            const admins = participants.filter(p => p.admin).map(p => p.id);

            if (!admins.includes(sender)) {
                return await sock.sendMessage(from, { text: '❌ Solo los admins pueden usar este comando.' });
            }

            const menciones = participants.map(p => p.id);
            const texto = args.length ? args.join(' ') : '📢 Atención a todos!';
            const lista = menciones.map(m => `@${m.split('@')[0]}`).join(' ');

            await sock.sendMessage(from, {
                text: `📢 *${texto}*\n\n${lista}`,
                mentions: menciones
            });
        } catch (e) {
            await sock.sendMessage(from, { text: '❌ Error al mencionar a todos.' });
        }
    }
};