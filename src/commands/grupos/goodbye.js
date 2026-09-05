const database = require('../../core/database');

module.exports = {
    name: 'goodbye',
    aliases: ['despedida'],

    async execute(sock, message, args, { from, isGroup }) {
        if (!isGroup) {
            return sock.sendMessage(from, {
                text: '❌ Este comando solo funciona en grupos.'
            });
        }

        const group = database.getGroup(from);
        group.goodbye = !group.goodbye;
        database.updateGroup(from, { goodbye: group.goodbye });

        await sock.sendMessage(from, {
            text: group.goodbye ? '👋 Despedida activada.' : '👋 Despedida desactivada.'
        });
    }
};