const fs = require('fs');
const config = require('../../config');

module.exports = {
    name: 'menu',
    aliases: ['help', 'comandos', 'isaac'],
    description: 'Muestra el menú de comandos',
    
    async execute(sock, message, args, context) {
        const { from } = context;
        
        try {
            // Verificar si existe la imagen del menú
            if (fs.existsSync(config.assets.menu)) {
                // Enviar menú con imagen
                await sock.sendMessage(from, {
                    image: fs.readFileSync(config.assets.menu),
                    caption: `🤖 *${config.botName}* - Menú de Comandos

📋 *Comandos Disponibles:*

🎛️ *GENERALES*
• *.menu* - Muestra este menú
• *.start* - Presentación del bot
• *.info* - Información del bot

👥 *GRUPOS*
• *.welcome* - Activa/desactiva bienvenida
• *.goodbye* - Activa/desactiva despedida

⚙️ *ADMIN*
• *.kick @usuario* - Expulsar usuario
• *.promote @usuario* - Dar admin
• *.demote @usuario* - Quitar admin

📱 *Contacto:* ${config.owner}

_Powered by IsaacDev_`,
                    footer: 'IsaacDev Bot v1.0'
                });
            } else {
                // Si no hay imagen, enviar solo texto
                await sock.sendMessage(from, {
                    text: `🤖 *${config.botName}*\n\nMenú de comandos cargado...`
                });
            }
            
        } catch (error) {
            console.error('Error en comando menu:', error);
            await sock.sendMessage(from, { text: '❌ Error al cargar el menú' });
        }
    }
};