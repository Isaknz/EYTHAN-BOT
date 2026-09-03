module.exports = {
    name: 'verdadoreto',
    aliases: ['vor', 'tod'],
    description: 'Verdad o reto aleatorio',

    async execute(sock, message, args, context) {
        const { from, senderName } = context;

        const tipo = args[0]?.toLowerCase();

        const verdades = [
            '¿Cuál es tu mayor miedo?',
            '¿Alguna vez has mentido a tu mejor amigo?',
            '¿De quién estás enamorado/a en este grupo?',
            '¿Cuál es lo más vergonzoso que te ha pasado?',
            '¿Cuánto tiempo llevas sin bañarte? 👀',
            '¿Alguna vez has stalkeado a alguien en redes?',
            '¿Cuál es tu secreto más oscuro?',
            '¿A quién de este grupo le darías un beso?',
        ];

        const retos = [
            'Envía una foto de tu cara sin filtros ahora mismo.',
            'Escribe un mensaje de amor a la última persona de tu lista de contactos.',
            'Haz 10 sentadillas y manda el video.',
            'Escribe algo vergonzoso en tu estado de WhatsApp por 10 minutos.',
            'Llama a alguien del grupo y canta una canción.',
            'Deja que alguien del grupo escriba un mensaje desde tu celular.',
            'Confiesa algo que nunca le hayas dicho a nadie en el grupo.',
            'Escribe un piropo a cada miembro del grupo.',
        ];

        if (!tipo || !['verdad', 'reto'].includes(tipo)) {
            const esverdad = Math.random() < 0.5;
            const lista = esverdad ? verdades : retos;
            const seleccion = lista[Math.floor(Math.random() * lista.length)];
            return await sock.sendMessage(from, {
                text: `🎲 *${senderName}* le tocó...\n\n${esverdad ? '💬 *VERDAD*' : '🔥 *RETO*'}\n\n${seleccion}`
            });
        }

        const lista = tipo === 'verdad' ? verdades : retos;
        const seleccion = lista[Math.floor(Math.random() * lista.length)];

        await sock.sendMessage(from, {
            text: `${tipo === 'verdad' ? '💬 *VERDAD*' : '🔥 *RETO*'}\n\n${seleccion}`
        });
    }
};