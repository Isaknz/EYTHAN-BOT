const QRCode = require('qrcode');

module.exports = {
    name: 'qr',
    aliases: ['qrcode', 'generarqr'],
    description: 'Genera un código QR de un texto o link',

    async execute(sock, message, args, context) {
        const { from } = context;

        if (!args.length) {
            return await sock.sendMessage(from, { text: '📷 Uso: *.qr [texto o link]*\nEj: *.qr https://google.com*' });
        }

        try {
            const texto = args.join(' ');
            const buffer = await QRCode.toBuffer(texto, { width: 512 });

            await sock.sendMessage(from, {
                image: buffer,
                caption: `📷 *Código QR generado*\n\n📝 Contenido: ${texto}`
            });
        } catch (e) {
            await sock.sendMessage(from, { text: '❌ Error al generar el QR.' });
        }
    }
};