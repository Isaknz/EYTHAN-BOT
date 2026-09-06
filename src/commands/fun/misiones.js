const { getUserProgress } = require('../../utils/progreso');

const missions = [
    { key: 'messages', label: 'Enviar 10 mensajes', target: 10, emoji: '💬' },
    { key: 'commands', label: 'Usar 3 comandos', target: 3, emoji: '⚡' },
    { key: 'games', label: 'Jugar 1 minijuego', target: 1, emoji: '🎮' }
];

module.exports = {
    name: 'misiones',
    aliases: ['mision', 'quests'],
    description: 'Muestra tus misiones diarias',

    async execute(sock, message, args, { from, sender }) {
        const progress = getUserProgress(sender);
        const text = missions.map(mission => {
            const current = Math.min(progress[mission.key], mission.target);
            const done = current >= mission.target;
            return `${done ? '✅' : mission.emoji} ${mission.label}: ${current}/${mission.target}`;
        }).join('\n');

        await sock.sendMessage(from, {
            text: `🎯 *Misiones de hoy*\n\n${text}\n\n_Se reinician cada día._`
        });
    }
};