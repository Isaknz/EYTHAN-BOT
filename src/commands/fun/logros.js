const { getDB: getProgressDB, getUserProgress } = require('../../utils/progreso');
const { getDB: getEconomyDB } = require('../../utils/economia');

const achievements = [
    { key: 'first_message', label: 'Primer mensaje', test: progress => progress.messages >= 1 },
    { key: 'command_user', label: 'Usuario activo', test: progress => progress.commands >= 10 },
    { key: 'game_player', label: 'Jugador', test: progress => progress.games >= 5 },
    { key: 'rich', label: 'Ahorrista', test: (_, user) => user?.coins >= 1000 },
    { key: 'level_three', label: 'Nivel 3', test: (_, user) => user?.level >= 3 }
];

module.exports = {
    name: 'logros',
    aliases: ['logro', 'achievements'],
    description: 'Muestra tus logros desbloqueados',

    async execute(sock, message, args, { from, sender }) {
        const progress = getUserProgress(sender);
        const economy = getEconomyDB()[sender];
        const unlocked = achievements.filter(achievement => achievement.test(progress, economy));
        const locked = achievements.length - unlocked.length;
        const text = unlocked.length
            ? unlocked.map(achievement => `🏅 ${achievement.label}`).join('\n')
            : 'Todavía no tienes logros desbloqueados.';

        await sock.sendMessage(from, {
            text: `🏆 *Tus logros*\n\n${text}\n\n🔒 Pendientes: ${locked}`
        });
    }
};