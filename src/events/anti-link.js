const database = require('../core/database');
const { isAdmin } = require('../utils/helpers');

async function antiLinkHandler(sock, message, context) {
    const { from, sender, isGroup } = context;

    if (!isGroup) return;

    const groupSettings = database.getGroup(from);
    if (!groupSettings.antilink) return;

    // Verificar si es admin (los admins pueden enviar links)
    const isSenderAdmin = await isAdmin(sock, from, sender);
    if (isSenderAdmin) return;

    const body = message.message?.conversation || 
                 message.message?.extendedTextMessage?.text || '';

    // Detectar links
    const linkRegex = /(https?:\/\/|www\.)[^\s]+/gi;
    
    if (linkRegex.test(body)) {
        // Eliminar mensaje
        await sock.sendMessage(from, {
            delete: message.key
        });

        // Advertir
        await sock.sendMessage(from, {
            text: `⚠️ @${sender.split('@')[0]} Los links no están permitidos aquí.`,
            mentions: [sender]
        });

        // Incrementar advertencias
        const user = database.getUser(sender);
        database.updateUser(sender, { warnings: user.warnings + 1 });

        // Si tiene 3 advertencias, expulsar
        if (user.warnings >= 3) {
            await sock.groupParticipantsUpdate(from, [sender], 'remove');
            await sock.sendMessage(from, {
                text: `🚫 @${sender.split('@')[0]} fue expulsado por enviar links repetidamente.`,
                mentions: [sender]
            });
        }
    }
}

module.exports = { antiLinkHandler };