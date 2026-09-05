const database = require('../../core/database');

module.exports = {
    name: 'welcome',
    aliases: ['bienvenida'],

    async execute(sock, message, args, { from, isGroup }) {
        if (!isGroup) {
            return sock.sendMessage(from, {
                text: '❌ Este comando solo funciona en grupos.'
            });
        }

        const group = database.getGroup(from);
        group.welcome = !group.welcome;
        database.updateGroup(from, { welcome: group.welcome });

        await sock.sendMessage(from, {
            text: group.welcome ? '👋 Bienvenida activada.' : '👋 Bienvenida desactivada.'
        });
    }
};