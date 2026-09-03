module.exports = {
    name: 'encuesta',
    aliases: ['poll', 'votacion'],
    description: 'Crea una encuesta en el grupo',

    async execute(sock, message, args, context) {
        const { from, isGroup } = context;

        if (!isGroup) return await sock.sendMessage(from, { text: '❌ Solo funciona en grupos.' });

        // Formato: .encuesta pregunta | opcion1 | opcion2 | opcion3
        const texto = args.join(' ');
        const partes = texto.split('|').map(p => p.trim());

        if (partes.length < 3) {
            return await sock.sendMessage(from, {
                text: '📊 Uso: *.encuesta pregunta | opción1 | opción2 | opción3*\nEj: *.encuesta ¿Cuál es tu color favorito? | Rojo | Azul | Verde*'
            });
        }

        const pregunta = partes[0];
        const opciones = partes.slice(1).slice(0, 12); // máximo 12 opciones

        try {
            await sock.sendMessage(from, {
                poll: {
                    name: pregunta,
                    values: opciones,
                    selectableCount: 1
                }
            });
        } catch (e) {
            await sock.sendMessage(from, { text: '❌ Error al crear la encuesta.' });
        }
    }
};