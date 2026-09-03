module.exports = {
    name: 'hora',
    aliases: ['time', 'tiempo'],
    description: 'Hora actual en cualquier ciudad/país',

    async execute(sock, message, args, context) {
        const { from } = context;

        if (!args.length) {
            return await sock.sendMessage(from, { text: '🕐 Uso: *.hora [ciudad o país]*\nEj: *.hora Lima*' });
        }

        const lugar = args.join(' ');

        try {
            const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(lugar)}&count=1&language=es`);
            const geoData = await geoRes.json();

            if (!geoData.results?.length) {
                return await sock.sendMessage(from, { text: `❌ No encontré: *${lugar}*` });
            }

            const { timezone, name, country } = geoData.results[0];

            const ahora = new Date().toLocaleString('es-PE', {
                timeZone: timezone,
                hour: '2-digit', minute: '2-digit', second: '2-digit',
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
            });

            await sock.sendMessage(from, {
                text: `🕐 *Hora en ${name}, ${country}*\n\n📅 ${ahora}\n🌍 Zona horaria: `${timezone}``
            });
        } catch (e) {
            await sock.sendMessage(from, { text: '❌ Error al obtener la hora.' });
        }
    }
};