const fs = require('fs');
const path = require('path');
const config = require('../../config');

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
const anuncioCmd = require('../commands/anuncio');
let schedulerIniciado = false;

function iniciarAnuncios(sock) {
    if (!schedulerIniciado) {
        anuncioCmd.iniciarScheduler(sock);
        schedulerIniciado = true;
        console.log('⏰ Scheduler de anuncios iniciado');
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
            const antilinkCmd = commands.get('antilink');
            if (antilinkCmd) {
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
        }
        // ==================================

        // ============ ANTISPAM ============
        if (isGroup && body) {
            const antispamCmd = commands.get('antispam');
            if (antispamCmd) {
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
        }
        // ==================================

        // ============ FUERA DE HORARIO ============
        if (!isGroup && body) {
            const horarioCmd = commands.get('horario');
            if (horarioCmd) {
                const db = horarioCmd.getDB();
                if (db.activo && !horarioCmd.estaEnHorario(db)) {
                    const chatKey = `horario_${from}`;
                    if (!chatsNuevos.has(chatKey)) {
                        chatsNuevos.add(chatKey);
                        setTimeout(() => chatsNuevos.delete(chatKey), 60 * 60 * 1000);
                        const msg = db.mensaje
                            .replace('{inicio}', db.inicio)
                            .replace('{fin}', db.fin);
                        await sock.sendMessage(from, { text: msg });
                    }
                }
            }
        }
        // ==========================================

        // ============ MENÚ DE ATENCIÓN ============
        if (!isGroup && body) {
            const menuCmd = commands.get('menuatencion');
            if (menuCmd) {
                const db = menuCmd.getDB();
                if (db.activo && db.opciones?.length) {
                    const estadoUsuarios = menuCmd.estadoUsuarios;
                    const num = parseInt(body.trim());

                    if (!estadoUsuarios.has(from)) {
                        if (!num || num < 1 || num > db.opciones.length) {
                            let menuTexto = `${db.titulo || '👋 ¡Hola! ¿En qué te puedo ayudar?'}\n\n`;
                            db.opciones.forEach((op, i) => {
                                menuTexto += `${i + 1}️⃣ ${op.opcion}\n`;
                            });
                            menuTexto += `\n_Escribe el número de tu opción_`;
                            estadoUsuarios.set(from, 'esperando');
                            await sock.sendMessage(from, { text: menuTexto });
                            return;
                        }
                    }

                    if (estadoUsuarios.get(from) === 'esperando' && num >= 1 && num <= db.opciones.length) {
                        const opcion = db.opciones[num - 1];
                        estadoUsuarios.delete(from);
                        await sock.sendMessage(from, { text: opcion.respuesta });
                        setTimeout(async () => {
                            let menuTexto = `${db.titulo || '👋 ¿Hay algo más en lo que pueda ayudarte?'}\n\n`;
                            db.opciones.forEach((op, i) => {
                                menuTexto += `${i + 1}️⃣ ${op.opcion}\n`;
                            });
                            menuTexto += `\n_Escribe el número de tu opción_`;
                            estadoUsuarios.set(from, 'esperando');
                            await sock.sendMessage(from, { text: menuTexto });
                        }, 2000);
                        return;
                    }
                }
            }
        }
        // ==========================================

        // ============ AUTORESPUESTAS ============
        if (body && !body.startsWith(config.prefix)) {
            const arCmd = commands.get('autorespuesta');
            if (arCmd) {
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
        }
        // ========================================

        // ============ IA POR MENCIÓN ============
        if (body) {
            const botId = sock.user?.id?.replace(/:.*@/, '@');
            const mencionados = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
            const esMencionado = botId && mencionados.some(id => id.replace(/:.*@/, '@') === botId);

            if (esMencionado) {
                const iaCmd = require('../commands/ia');
                // Extraer la pregunta quitando la mención del texto
                const pregunta = body.replace(/@\d+/g, '').trim();
                await iaCmd.handleMention(sock, message, pregunta, { from, sender, senderName, isGroup });
                return;
            }
        }
        // ========================================

        const prefix = config.prefix;
        if (!body.startsWith(prefix)) return;

        const args = body.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

        if (commands.has(commandName)) {
            const command = commands.get(commandName);
            console.log(`⚡ Comando ejecutado: ${commandName} por ${senderName}`);
            await command.execute(sock, message, args, {
                from,
                sender,
                senderName,
                isGroup,
                prefix,
                commands
            });
        }

    } catch (error) {
        console.error('Error en handler:', error);
    }
}

module.exports = { messageHandler, commands };