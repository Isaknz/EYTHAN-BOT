const { getDB } = require('../../utils/economia');

module.exports = {
    name: 'ranking',
    aliases: ['top', 'leaderboard', 'clasificacion'],
    description: 'Top de usuarios con más monedas',

    async execute(sock, message, args, context) {
        const { from } = context;

        const db = getDB();
        const usuarios = Object.values(db).sort((a, b) => b.coins - a.coins).slice(0, 10);

        if (!usuarios.length) {
            return await sock.sendMessage(from, { text: '📊 Aún no hay datos de economía.' });
        }

        const medallas = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
        let texto = '🏆 *Ranking de Monedas*\n\n';
        usuarios.forEach((u, i) => {
            texto += `${medallas[i]} *${u.name}* — ${u.coins} 🪙 | Nv.${u.level}\n`;
        });

        await sock.sendMessage(from, { text: texto });
    }
};