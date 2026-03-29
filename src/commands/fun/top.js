module.exports = {
    name: 'top',
    aliases: ['ranking', 'lista'],
    description: 'Top 5 de algo aleatorio',

    async execute(sock, message, args, context) {
        const { from, isGroup } = context;

        if (!isGroup) {
            return await sock.sendMessage(from, { text: '❌ Este comando solo funciona en grupos' });
        }

        const temas = [
            'Los más guapos 😎',
            'Los más inteligentes 🧠',
            'Los más graciosos 😂',
            'Los más tóxicos ☠️',
            'Los más activos 📱',
            'Los más raros 🤪',
            'Los más simpáticos 🥰'
        ];

        const tema = args.length > 0 ? args.join(' ') : temas[Math.floor(Math.random() * temas.length)];

        // Obtener miembros del grupo
        const groupMetadata = await sock.groupMetadata(from);
        const participants = groupMetadata.participants.map(p => p.id);

        // Seleccionar 5 aleatorios
        const seleccionados = participants
            .sort(() => 0.5 - Math.random())
            .slice(0, 5);

        let texto = `📊 *TOP 5: ${tema}*\n\n`;

        seleccionados.forEach((user, index) => {
            const medallas = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];
            texto += `${medallas[index]} @${user.split('@')[0]}\n`;
        });

        await sock.sendMessage(from, {
            text: texto,
            mentions: seleccionados
        });
    }
};