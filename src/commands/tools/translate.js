module.exports = {
    name: 'translate',
    aliases: ['traducir', 'tr'],
    description: 'Traduce texto a otro idioma',

    async execute(sock, message, args, context) {
        const { from } = context;

        if (args.length < 2) {
            return await sock.sendMessage(from, {
                text: '🌐 Uso: *.translate [idioma] [texto]*\nEj: *.translate en Hola mundo*\n\nIdiomas: en, es, fr, pt, de, it, ja, zh, ko, ru'
            });
        }

        const idioma = args[0];
        const texto = args.slice(1).join(' ');

        try {
            const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${idioma}&dt=t&q=${encodeURIComponent(texto)}`;
            const res = await fetch(url);
            const data = await res.json();
            const traduccion = data[0].map(t => t[0]).join('');

            await sock.sendMessage(from, {
                text: `🌐 *Traducción*\n\n📝 Original: ${texto}\n✅ Traducido (${idioma}): *${traduccion}*`
            });
        } catch (e) {
            await sock.sendMessage(from, { text: '❌ Error al traducir. Verifica el código de idioma.' });
        }
    }
};