module.exports = {
    name: 'calc',
    aliases: ['calcular', 'matematica'],
    description: 'Calculadora',

    async execute(sock, message, args, context) {
        const { from } = context;

        if (!args.length) {
            return await sock.sendMessage(from, { text: '🔢 Uso: *.calc [operación]*\nEj: *.calc 5 * 8 + 2*' });
        }

        try {
            const operacion = args.join(' ');
            // Solo permitir caracteres seguros
            if (!/^[0-9+\-*/.() %]+$/.test(operacion)) {
                return await sock.sendMessage(from, { text: '❌ Operación no válida. Solo usa números y operadores: + - * / ( )' });
            }

            const resultado = eval(operacion);

            await sock.sendMessage(from, {
                text: `🔢 *Calculadora*\n\n📝 Operación: \`${operacion}\`\n✅ Resultado: *${resultado}*`
            });
        } catch (e) {
            await sock.sendMessage(from, { text: '❌ Operación inválida.' });
        }
    }
};