const ia = require('./ia');

module.exports = {
    name: 'olvidar',
    aliases: ['resetia', 'nuevaconversacion'],
    description: 'Borra la memoria de conversación con la IA',

    async execute(sock, message, args, { from, sender }) {
        ia.clearHistory(from, sender);
        await sock.sendMessage(from, {
            text: '🧠 Conversación reiniciada. Empezamos desde cero.'
        });
    }
};