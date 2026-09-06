const fs = require('fs');
const path = require('path');
const config = require('../../config');
const database = require('./database');
const { isAdmin, isOwner } = require('../utils/helpers');
const { recordMessage, recordCommand } = require('../utils/progreso');

const commands = new Map();
const commandsPath = path.join(__dirname, '../commands');
const chatsNuevos = new Set();
let commandCount = 0;

function loadCommandsFromDir(dir) {
    const items = fs.readdirSync(dir);
    for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            loadCommandsFromDir(fullPath);
        } else if (item.endsWith('.js')) {
            try {
                delete require.cache[require.resolve(fullPath)];
                const command = require(fullPath);
                
                if (command.name) {
                    commands.set(command.name, command);
                    
                    if (command.aliases) {
                        command.aliases.forEach(alias => commands.set(alias, command));
                    }
                    
                    commandCount++;
                }
            } catch (e) {
                console.error(`❌ Error cargando ${item}:`, e.message);
            }
        }
    }
}

function loadCommands() {
    loadCommandsFromDir(commandsPath);
    console.log(`📚 ${commandCount} comandos cargados (${commands.size} nombres registrados con aliases)`);
}

loadCommands();

// ============ INICIAR SCHEDULER DE ANUNCIOS ============
let schedulerIniciado = false;

function iniciarAnuncios(sock) {
    if (!schedulerIniciado) {
        try {
            const anuncioCmd = require('../commands/anuncio');
            if (anuncioCmd.iniciarScheduler) {
                anuncioCmd.iniciarScheduler(sock);
                schedulerIniciado = true;
                console.log('⏰ Scheduler de anuncios iniciado');
            }
        } catch (e) {
            console.log('ℹ️ Módulo de anuncios no disponible');
        }
    }
}

// =======================================================

async function messageHandler(sock, m) {
    try {
        const message = m.messages[0];
        if (!message || message.key.fromMe) return;

        const from = message.key.remoteJid;
        const isGroup = from.endsWith('@g.us');
        const sender = message.key.participant || from;
        const senderName = message.pushName || 'Usuario';
        const groupSettings = isGroup ? database.getGroup(from) : null;
        const prefix = groupSettings?.prefix || config.prefix;
        const senderIsOwner = isOwner(sender, config);

        try {
            recordMessage(sender);
        } catch (error) {
            console.error('Error registrando progreso:', error.message);
        }

        // Iniciar scheduler de anuncios (solo una vez)
        iniciarAnuncios(sock);

        let body = '';
        
        if (message.message?.conversation) {
            body = message.message.conversation;
        } else if (message.message?.extendedTextMessage?.text) {
            body = message.message.extendedTextMessage.text;
        } else if (message.message?.imageMessage?.caption) {
            body = message.message.imageMessage.caption;
        }

        // ============ ANTILINK ============
        if (isGroup && body) {
            try {
                const antilinkCmd = commands.get('antilink');
                if (antilinkCmd && antilinkCmd.getDB && antilinkCmd.checkLink) {
                    const db = antilinkCmd.getDB();
                    if (db[from]?.activo && antilinkCmd.checkLink(body)) {
                        const groupMetadata = await sock.groupMetadata(from);
                        const admins = groupMetadata.participants.filter(p => p.admin).map(p => p.id);
                        
                        if (!admins.includes(sender)) {
                            try {
                                await sock.sendMessage(from, {
                                    text: `⚠️ @${sender.split('@')[0]} los links no están permitidos en este grupo. Fuiste expulsado.`,
                                    mentions: [sender]
                                });
                                await sock.groupParticipantsUpdate(from, [sender], 'remove');
                            } catch (e) {
                                await sock.sendMessage(from, {
                                    text: `⚠️ @${sender.split('@')[0]} los links no están permitidos aquí.`,
                                    mentions: [sender]
                                });
                            }
                            return;
                        }
                    }
                }
            } catch (e) {
                console.error('Error en antilink:', e.message);
            }
        }
        // ==================================

        // ============ ANTISPAM ============
        if (isGroup && body) {
            try {
                const antispamCmd = commands.get('antispam');
                if (antispamCmd && antispamCmd.getDB && antispamCmd.getContador) {
                    const db = antispamCmd.getDB();
                    if (db[from]?.activo) {
                        const contador = antispamCmd.getContador();
                        const key = `${from}_${sender}`;
                        const ahora = Date.now();
                        
                        if (!contador[key]) contador[key] = { count: 0, first: ahora };
                        
                        if (ahora - contador[key].first > 5000) {
                            contador[key] = { count: 1, first: ahora };
                        } else {
                            contador[key].count++;
                        }
                        
                        antispamCmd.saveContador(contador);
                        
                        if (contador[key].count >= 5) {
                            const groupMetadata = await sock.groupMetadata(from);
                            const admins = groupMetadata.participants.filter(p => p.admin).map(p => p.id);
                            
                            if (!admins.includes(sender)) {
                                contador[key] = { count: 0, first: ahora };
                                antispamCmd.saveContador(contador);
                                
                                try {
                                    await sock.sendMessage(from, {
                                        text: `⚠️ @${sender.split('@')[0]} detectado haciendo spam. Expulsado.`,
                                        mentions: [sender]
                                    });
                                    await sock.groupParticipantsUpdate(from, [sender], 'remove');
                                } catch (e) {
                                    await sock.sendMessage(from, {
                                        text: `⚠️ @${sender.split('@')[0]} para con el spam.`,
                                        mentions: [sender]
                                    });
                                }
                                return;
                            }
                        }
                    }
                }
            } catch (e) {
                console.error('Error en antispam:', e.message);
            }
        }
        // ==================================

        // ============ FUERA DE HORARIO ============
        // (Código comentado o simplificado - estaba incompleto)
        // ==========================================

        // ============ AUTORESPUESTAS ============
        if (body && !body.startsWith(prefix)) {
            try {
                const arCmd = commands.get('autorespuesta');
                if (arCmd && arCmd.getDB) {
                    const db = arCmd.getDB();
                    const respuestas = db[from] || {};
                    const bodyLower = body.toLowerCase();
                    
                    for (const [palabra, respuesta] of Object.entries(respuestas)) {
                        if (bodyLower.includes(palabra)) {
                            await sock.sendMessage(from, { text: respuesta });
                            return;
                        }
                    }
                }
            } catch (e) {
                console.error('Error en autorespuesta:', e.message);
            }
        }
        // ========================================

        // ============ IA POR MENCIÓN ============
        if (body) {
            const botId = sock.user?.id?.replace(/:.*@/, '@');
            const mencionados = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
            const esMencionado = botId && mencionados.some(id => id.replace(/:.*@/, '@') === botId);
            
            if (esMencionado) {
                try {
                    const iaCmd = require('../commands/ia');
                    if (iaCmd.handleMention) {
                        const pregunta = body.replace(/@\d+/g, '').trim();
                        await iaCmd.handleMention(sock, message, pregunta, { from, sender, senderName, isGroup });
                        return;
                    }
                } catch (e) {
                    console.error('Error en IA:', e.message);
                }
            }
        }
        // ========================================

        if (!body.startsWith(prefix)) return;

        const args = body.slice(prefix.length).trim().split(/\s+/);
        const commandName = args.shift().toLowerCase();

        if (commands.has(commandName)) {
            const command = commands.get(commandName);
            const senderIsAdmin = isGroup ? await isAdmin(sock, from, sender) : false;
            try {
                recordCommand(sender, commandName);
            } catch (error) {
                console.error('Error registrando comando:', error.message);
            }
            console.log(`⚡ Comando ejecutado: ${commandName} por ${senderName}`);
            
            await command.execute(sock, message, args, {
                from,
                sender,
                senderName,
                isGroup,
                isAdmin: senderIsAdmin,
                isOwner: senderIsOwner,
                prefix,
                commands
            });
        }

    } catch (error) {
        console.error('Error en handler:', error);
    }
}

module.exports = { messageHandler, commands };