module.exports = {
    name: 'chiste',
    aliases: ['joke', 'humor'],
    description: 'Chiste aleatorio',

    async execute(sock, message, args, context) {
        const { from } = context;

        const chistes = [
            '¿Por qué los pájaros vuelan hacia el sur en invierno?\n👉 ¡Porque caminar es muy lejos!',
            '¿Qué le dice un jardinero a otro?\n👉 ¡Que te mejores!',
            '¿Por qué el libro de matemáticas estaba triste?\n👉 ¡Tenía demasiados problemas!',
            '¿Qué hace una abeja en el gimnasio?\n👉 ¡Zum-ba!',
            '¿Cómo se despiden los químicos?\n👉 ¡Ácido un placer!',
            '¿Qué le dijo el océano a la playa?\n👉 ¡Nada!',
            '¿Por qué el espantapájaros ganó un premio?\n👉 ¡Porque era sobresaliente en su campo!',
            'Mi perro se comió todos mis ahorros.\n👉 Literalmente, dólares.',
            '¿Qué hace un pez cuando está aburrido?\n👉 ¡Nada!',
            '¿Cómo llamas a un cinturón de asteroides?\n👉 ¡Un desperdicio del espacio!',
            '¿Por qué los programadores usan gafas oscuras?\n👉 ¡Porque no les gusta Java!',
            '¿Qué le dice un bit al otro?\n👉 ¡Nos vemos en el bus!',
        ];

        const chiste = chistes[Math.floor(Math.random() * chistes.length)];

        await sock.sendMessage(from, {
            text: `😂 *Chiste del momento*\n\n${chiste}`
        });
    }
};