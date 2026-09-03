const { getDB, getUser } = require('../../utils/economia');

module.exports = {
    name: 'perfil',
    aliases: ['profile', 'stats', 'yo'],
    description: 'Ver tu perfil y estadísticas',

    async execute(sock, message, args, context) {
        const { from, sender, senderName } = context;

        const db = getDB();
        const user = getUser(db, sender, senderName);

        const barraXP = '█'.repeat(Math.floor(user.xp / 10)) + '░'.repeat(10 - Math.floor(user.xp / 10));

        await sock.sendMessage(from, {
            text: `👤 *Perfil de ${user.name}*\n\n🏅 Nivel: *${user.level}*\n⚡ XP: [${barraXP}] ${user.xp}/100\n🪙 Monedas: *${user.coins}*\n\n_Usa .daily para ganar monedas diarias_`
        });
    }
};