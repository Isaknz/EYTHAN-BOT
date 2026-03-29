module.exports = {
    name: 'ping',
    aliases: ['p', 'speed', 'velocidad'],
    description: 'Mide la velocidad de respuesta del bot',

    async execute(sock, message, args, context) {
        const { from } = context;

        const start = Date.now();
        const sent = await sock.sendMessage(from, { text: '🏓 Calculando...' });
        const end = Date.now();

        const latency = end - start;

        await sock.sendMessage(from, {
            text: `🏓 *Pong!*\n\n📡 Latencia: ${latency}ms\n⏱️ Tiempo de respuesta: ${latency}ms`
        });
    }
};