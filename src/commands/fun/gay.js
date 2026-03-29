module.exports = {
    name: 'gay',
    aliases: ['gei', ' homosexual'],
    description: 'Mide tu nivel de gay 🏳️‍🌈',

    async execute(sock, message, args, context) {
        const { from, sender, senderName } = context;

        const porcentaje = Math.floor(Math.random() * 101);
        const barra = '█'.repeat(Math.floor(porcentaje / 10)) + '░'.repeat(10 - Math.floor(porcentaje / 10));

        const texto = `
🏳️‍🌈 *Medidor Gay* 🏳️‍🌈

@${sender.split('@')[0]}
Nivel: ${barra} ${porcentaje}%

${porcentaje < 30 ? '😎 Muy hetero' : porcentaje < 70 ? '🤔 En duda' : '💅 Super gay'}
`;

        await sock.sendMessage(from, {
            text: texto,
            mentions: [sender]
        });
    }
};