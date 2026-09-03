const fs = require('fs');
const config = require('../../../config');

module.exports = {
    name: 'start',
    aliases: ['inicio', 'hola', 'presentacion'],
    description: 'Presentación del bot con logo',
    
    async execute(sock, message, args, context) {
        const { from, senderName } = context;
        
        try {
            const presentationText = config.messages.presentation;
            
            // Enviar logo del bot
            if (fs.existsSync(config.assets.logo)) {
                await sock.sendMessage(from, {
                    image: fs.readFileSync(config.assets.logo),
                    caption: `¡Hola *${senderName}*! 👋\n\n${presentationText}\n\nEscribe *.menu* para ver todos mis comandos.`,
                    footer: config.botName
                });
            } else {
                await sock.sendMessage(from, {
                    text: `¡Hola *${senderName}*!\n\n${presentationText}`
                });
            }
            
        } catch (error) {
            console.error('Error en comando start:', error);
        }
    }
};