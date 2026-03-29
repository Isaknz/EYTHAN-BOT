const fs = require('fs');
const path = require('path');
const config = require('../../config');

// Cargar comandos dinámicamente
const commands = new Map();
const commandsPath = path.join(__dirname, '../commands');

function loadCommands() {
    const files = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));
    
    for (const file of files) {
        const command = require(path.join(commandsPath, file));
        if (command.name) {
            commands.set(command.name, command);
            if (command.aliases) {
                command.aliases.forEach(alias => commands.set(alias, command));
            }
        }
    }
    
    console.log(`📚 ${commands.size} comandos cargados`);
}

loadCommands();

async function messageHandler(sock, m) {
    try {
        const message = m.messages[0];
        if (!message || message.key.fromMe) return;

        const from = message.key.remoteJid;
        const isGroup = from.endsWith('@g.us');
        const sender = message.key.participant || from;
        const senderName = message.pushName || 'Usuario';
        
        // Obtener texto del mensaje
        let body = '';
        if (message.message?.conversation) {
            body = message.message.conversation;
        } else if (message.message?.extendedTextMessage?.text) {
            body = message.message.extendedTextMessage.text;
        } else if (message.message?.imageMessage?.caption) {
            body = message.message.imageMessage.caption;
        }

        // Verificar prefijo
        const prefix = config.prefix;
        if (!body.startsWith(prefix)) return;

        const args = body.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

        // Ejecutar comando
        if (commands.has(commandName)) {
            const command = commands.get(commandName);
            
            console.log(`⚡ Comando ejecutado: ${commandName} por ${senderName}`);
            
            await command.execute(sock, message, args, {
                from,
                sender,
                senderName,
                isGroup,
                prefix
            });
        }

    } catch (error) {
        console.error('Error en handler:', error);
    }
}

module.exports = { messageHandler, commands };