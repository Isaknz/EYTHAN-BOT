const os = require('os');
const config = require('../../config');

module.exports = {
    name: 'info',
    aliases: ['botinfo', 'status', 'estado'],
    description: 'Información del bot y sistema',

    async execute(sock, message, args, context) {
        const { from } = context;

        const uptime = process.uptime();
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = Math.floor(uptime % 60);

        const info = `
🤖 *${config.botName} - Información*

📊 *Estadísticas:*
⏱️ Uptime: ${hours}h ${minutes}m ${seconds}s
💾 RAM: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB
🖥️ Plataforma: ${os.platform()}
⚡ Node.js: ${process.version}

👤 *Owner:* ${config.owner}
🔧 *Prefijo:* ${config.prefix}
📅 *Fecha:* ${new Date().toLocaleString()}

_Powered by IsaacDev_
`;

        await sock.sendMessage(from, { text: info });
    }
};