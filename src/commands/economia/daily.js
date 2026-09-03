const { getDB, saveDB, getUser } = require('../../utils/economia');

module.exports = {
    name: 'daily',
    aliases: ['diario', 'recompensa'],
    description: 'Recompensa diaria de monedas',

    async execute(sock, message, args, context) {
        const { from, sender, senderName } = context;

        const db = getDB();
        const user = getUser(db, sender, senderName);

        const ahora = Date.now();
        const unDia = 24 * 60 * 60 * 1000;

        if (user.daily && ahora - user.daily < unDia) {
            const restante = unDia - (ahora - user.daily);
            const horas = Math.floor(restante / 3600000);
            const minutos = Math.floor((restante % 3600000) / 60000);
            return await sock.sendMessage(from, {
                text: `⏳ Ya reclamaste tu recompensa hoy.\n\nVuelve en: *${horas}h ${minutos}m*`
            });
        }

        const ganadas = Math.floor(Math.random() * 200) + 100; // 100-300 monedas
        user.coins += ganadas;
        user.xp = Math.min(100, user.xp + 10);
        if (user.xp >= 100) { user.level++; user.xp = 0; }
        user.daily = ahora;
        saveDB(db);

        await sock.sendMessage(from, {
            text: `🎁 *Recompensa Diaria*\n\n✅ Recibiste *${ganadas} 🪙 monedas*!\n\n💰 Total: *${user.coins} monedas*\n⭐ Nivel: *${user.level}*`
        });
    }
};