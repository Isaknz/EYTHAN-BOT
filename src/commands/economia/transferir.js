const { getDB, saveDB, getUser } = require('../../utils/economia');

module.exports = {
    name: 'transferir',
    aliases: ['dar', 'send', 'pagar'],
    description: 'Transfiere monedas a otro usuario',

    async execute(sock, message, args, context) {
        const { from, sender, senderName } = context;

        const mencionado = message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
        const cantidad = parseInt(args[args.length - 1]);

        if (!mencionado || isNaN(cantidad) || cantidad <= 0) {
            return await sock.sendMessage(from, {
                text: '💸 Uso: *.transferir @usuario [cantidad]*\nEj: *.transferir @juan 100*'
            });
        }

        const db = getDB();
        const emisor = getUser(db, sender, senderName);
        const receptor = getUser(db, mencionado, `@${mencionado.split('@')[0]}`);

        if (emisor.coins < cantidad) {
            return await sock.sendMessage(from, {
                text: `❌ No tienes suficientes monedas.\n💰 Tienes: *${emisor.coins} 🪙*`
            });
        }

        emisor.coins -= cantidad;
        receptor.coins += cantidad;
        saveDB(db);

        await sock.sendMessage(from, {
            text: `💸 *Transferencia exitosa*\n\n✅ Enviaste *${cantidad} 🪙* a @${mencionado.split('@')[0]}\n\n💰 Tu saldo: *${emisor.coins} 🪙*`,
            mentions: [mencionado]
        });
    }
};