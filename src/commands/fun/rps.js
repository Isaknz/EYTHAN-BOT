module.exports = {
    name: 'rps',
    aliases: ['ppt', 'piedrapapeltijera'],
    description: 'Piedra, papel o tijera contra el bot',

    async execute(sock, message, args, context) {
        const { from, senderName } = context;

        const opciones = ['piedra', 'papel', 'tijera'];
        const emojis = { piedra: '🪨', papel: '📄', tijera: '✂️' };

        const eleccionUsuario = args[0]?.toLowerCase();

        if (!opciones.includes(eleccionUsuario)) {
            return await sock.sendMessage(from, {
                text: '✂️ Uso: *.rps [piedra/papel/tijera]*\nEj: *.rps piedra*'
            });
        }

        const eleccionBot = opciones[Math.floor(Math.random() * 3)];

        let resultado;
        if (eleccionUsuario === eleccionBot) {
            resultado = '🤝 ¡Empate!';
        } else if (
            (eleccionUsuario === 'piedra' && eleccionBot === 'tijera') ||
            (eleccionUsuario === 'papel' && eleccionBot === 'piedra') ||
            (eleccionUsuario === 'tijera' && eleccionBot === 'papel')
        ) {
            resultado = '🏆 ¡Ganaste!';
        } else {
            resultado = '😈 ¡Gané yo!';
        }

        await sock.sendMessage(from, {
            text: `✂️ *Piedra, Papel o Tijera*\n\n${senderName}: ${emojis[eleccionUsuario]} *${eleccionUsuario}*\nBot: ${emojis[eleccionBot]} *${eleccionBot}*\n\n${resultado}`
        });
    }
};