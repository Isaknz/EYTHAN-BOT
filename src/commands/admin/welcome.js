const database = require('../../core/database');

module.exports = {
    name: 'welcome',
    aliases: ['bienvenida', 'entrada'],
    description: 'Activa/desactiva mensajes de bienvenida',

    async execute(sock, message, args, context) {
        const { from, sender, isGroup } = context;

        if (!isGroup) {
            return await sock.sendMessage(from, { text: '❌ Este comando solo funciona en grupos' });
        }

        const groupSettings = database.getGroup(from);
        const newState = !groupSettings.welcome;

        database.updateGroup(from, { welcome: newState });

        await sock.sendMessage(from, {
            text: newState
                ? '✅ Bienvenida activada\n\nSe enviará la foto de perfil de cada nuevo miembro.'
                : '❌ Bienvenida desactivada'
        });
    }
};