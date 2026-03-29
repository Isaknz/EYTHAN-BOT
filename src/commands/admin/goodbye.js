const database = require('../../core/database');

module.exports = {
    name: 'goodbye',
    aliases: ['despedida', 'salida', 'bye'],
    description: 'Activa/desactiva mensajes de despedida',

    async execute(sock, message, args, context) {
        const { from, isGroup } = context;

        if (!isGroup) {
            return await sock.sendMessage(from, { text: '❌ Este comando solo funciona en grupos' });
        }

        const groupSettings = database.getGroup(from);
        const newState = !groupSettings.goodbye;

        database.updateGroup(from, { goodbye: newState });

        await sock.sendMessage(from, {
            text: newState 
                ? '✅ Despedida activada\n\nSe enviará isaacdelete.png cuando alguien salga.' 
                : '❌ Despedida desactivada'
        });
    }
};