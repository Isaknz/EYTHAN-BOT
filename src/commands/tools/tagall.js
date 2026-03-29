const { isAdmin } = require('../../utils/helpers');

module.exports = {
    name: 'tagall',
    aliases: ['todos', 'marcar', 'all'],
    description: 'Menciona a todos los miembros del grupo',

    async execute(sock, message, args, context) {
        const { from, sender, isGroup } = context;

        if (!isGroup) {
            return await sock.sendMessage(from, { text: '❌ Este comando solo funciona en grupos' });
        }

        const isSenderAdmin = await isAdmin(sock, from, sender);
        if (!isSenderAdmin) {
            return await sock.sendMessage(from, { text: '❌ Solo admins pueden usar este comando' });
        }

        const groupMetadata = await sock.groupMetadata(from);
        const participants = groupMetadata.participants.map(p => p.id);

        const texto = args.length > 0 ? args.join(' ') : '👥 ¡Atención a todos!';

        let mensaje = `📢 *${texto}*\n\n`;
        mensaje += participants.map(p => `@${p.split('@')[0]}`).join('\n');

        await sock.sendMessage(from, {
            text: mensaje,
            mentions: participants
        });
    }
};