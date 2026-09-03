module.exports = {
    name: 'clima',
    aliases: ['weather', 'tiempo'],
    description: 'Clima actual de una ciudad',

    async execute(sock, message, args, context) {
        const { from } = context;

        if (!args.length) {
            return await sock.sendMessage(from, { text: '🌤️ Uso: *.clima [ciudad]*\nEj: *.clima Lima*' });
        }

        const ciudad = args.join(' ');

        try {
            const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(ciudad)}&count=1&language=es`);
            const geoData = await geoRes.json();

            if (!geoData.results?.length) {
                return await sock.sendMessage(from, { text: `❌ No encontré la ciudad: *${ciudad}*` });
            }

            const { latitude, longitude, name, country } = geoData.results[0];

            const weatherRes = await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`
            );
            const weatherData = await weatherRes.json();
            const c = weatherData.current;

            const codigos = {
                0: '☀️ Despejado', 1: '🌤️ Mayormente despejado', 2: '⛅ Parcialmente nublado',
                3: '☁️ Nublado', 45: '🌫️ Niebla', 61: '🌧️ Lluvia leve',
                63: '🌧️ Lluvia moderada', 65: '🌧️ Lluvia intensa', 80: '🌦️ Chubascos',
                95: '⛈️ Tormenta'
            };

            const desc = codigos[c.weather_code] || '🌡️ Sin descripción';

            await sock.sendMessage(from, {
                text: `🌤️ *Clima en ${name}, ${country}*\n\n${desc}\n🌡️ Temperatura: *${c.temperature_2m}°C*\n💧 Humedad: *${c.relative_humidity_2m}%*\n💨 Viento: *${c.wind_speed_10m} km/h*`
            });
        } catch (e) {
            await sock.sendMessage(from, { text: '❌ Error al obtener el clima.' });
        }
    }
};