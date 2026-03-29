const config = require('../../config');

module.exports = {
    formatMenu: (commands) => {
        let menu = `🤖 *${config.botName}* 🤖\n\n`;
        menu += `👤 Owner: ${config.owner}\n`;
        menu += `📅 Fecha: ${new Date().toLocaleDateString()}\n\n`;
        menu += `*COMANDOS:*\n\n`;
        
        commands.forEach((cmd, name) => {
            menu += `• *${config.prefix}${name}* - ${cmd.description || 'Sin descripción'}\n`;
        });
        
        return menu;
    },
    
    isAdmin: async (sock, groupId, userId) => {
        try {
            const groupMetadata = await sock.groupMetadata(groupId);
            const admins = groupMetadata.participants
                .filter(p => p.admin)
                .map(p => p.id);
            return admins.includes(userId);
        } catch {
            return false;
        }
    }
};