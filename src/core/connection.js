const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion
} = require('@whiskeysockets/baileys');

const qrcode = require('qrcode-terminal');
const pino = require('pino');
const fs = require('fs');
const { Boom } = require('@hapi/boom');
const { messageHandler } = require('./handler');
const config = require('../../config');

const logger = pino({ level: 'silent' });

// Silenciar errores de sesión Bad MAC (no son críticos)
const originalConsoleError = console.error;
console.error = (...args) => {
    const msg = args.join(' ');
    if (
        msg.includes('Bad MAC') ||
        msg.includes('Failed to decrypt') ||
        msg.includes('Session error')
    ) return;
    originalConsoleError(...args);
};

// Memoria temporal de mensajes (para detectar eliminados)
const mensajesGuardados = {};

async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('./session');
    const { version } = await fetchLatestBaileysVersion();
    
    const sock = makeWASocket({
        version,
        logger,
        auth: state,
        browser: ['IsaacDev Bot', 'Chrome', '1.0.0']
    });

    // Guardar credenciales
    sock.ev.on('creds.update', saveCreds);

    // Manejar conexión
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        // Mostrar QR en terminal
        if (qr) {
            console.log('\n📱 Escanea el código QR para conectar:\n');
            qrcode.generate(qr, { small: true });
        }

        if (connection === 'close') {
            const error = lastDisconnect?.error;
            const statusCode = error?.output?.statusCode;
            const shouldReconnect = (error instanceof Boom) &&
                statusCode !== DisconnectReason.loggedOut;

            console.log('⚠️ Conexión cerrada:', shouldReconnect ? 'Reconectando...' : 'Sesión cerrada');

            // Limpiar sesión corrupta automáticamente
            if (error?.message?.includes('Bad MAC') || statusCode === 401) {
                console.log('🧹 Sesión corrupta detectada. Limpiando sesión...');
                try {
                    fs.rmSync('./session', { recursive: true, force: true });
                    console.log('✅ Sesión limpiada. Reiniciando...');
                } catch (e) {
                    originalConsoleError('Error al limpiar sesión:', e.message);
                }
            }

            if (shouldReconnect) {
                connectToWhatsApp();
            }
        } else if (connection === 'open') {
            // Guardar número del bot automáticamente
            config.botNumber = sock.user.id.replace(/:.*@/, '@');
            console.log('🤖 Número del bot:', config.botNumber);

            // Mensaje al owner
            try {
                await sock.sendMessage(config.ownerNumber, {
                    text: `🤖 *IsaacDev Bot* está en línea!\n\nVersión: 1.0.0\nEstado: ✅ Activo`
                });
                
                if (config.assets?.logo && fs.existsSync(config.assets.logo)) {
                    await sock.sendMessage(config.ownerNumber, {
                        image: fs.readFileSync(config.assets.logo),
                        caption: '🤖 IsaacDev Bot activo y listo!'
                    });
                }
            } catch (e) {
                originalConsoleError('⚠️ Error al notificar al owner:', e.message);
            }

            // Presentación solo en grupos donde el bot es admin — solo una vez
            try {
                const registroPath = './data/presentacion.json';
                
                if (!fs.existsSync('./data')) fs.mkdirSync('./data');
                
                let registro = {};
                if (fs.existsSync(registroPath)) {
                    registro = JSON.parse(fs.readFileSync(registroPath));
                }

                if (registro.presentado) {
                    console.log('ℹ️ Ya me presenté anteriormente. Saltando...');
                } else {
                    const groups = await sock.groupFetchAllParticipating();
                    const groupIds = Object.keys(groups);

                    // Filtrar solo grupos donde el bot es admin
                    const botId = sock.user.id.replace(/:.*@/, '@');
                    const gruposAdmin = [];

                    for (const groupId of groupIds) {
                        try {
                            const meta = groups[groupId];
                            const botParticipant = meta.participants.find(p =>
                                p.id.replace(/:.*@/, '@') === botId
                            );
                            
                            if (botParticipant?.admin) {
                                gruposAdmin.push(groupId);
                            }
                        } catch (e) {
                            originalConsoleError(`⚠️ Error revisando grupo ${groupId}:`, e.message);
                        }
                    }

                    console.log(`📢 Soy admin en ${gruposAdmin.length} de ${groupIds.length} grupos. Presentándome...`);

                    for (const groupId of gruposAdmin) {
                        try {
                            if (config.assets?.logo && fs.existsSync(config.assets.logo)) {
                                await sock.sendMessage(groupId, {
                                    image: fs.readFileSync(config.assets.logo),
                                    caption: `${config.messages.presentation}\n\nEscribe *.menu* para ver todos mis comandos.`
                                });
                            } else {
                                await sock.sendMessage(groupId, {
                                    text: `${config.messages.presentation}\n\nEscribe *.menu* para ver todos mis comandos.`
                                });
                            }
                            
                            await new Promise(r => setTimeout(r, 3000));
                        } catch (e) {
                            originalConsoleError(`⚠️ Error presentándome en grupo ${groupId}:`, e.message);
                        }
                    }

                    fs.writeFileSync(registroPath, JSON.stringify({ presentado: true }));
                    console.log('✅ Presentación completada. No volveré a hacerlo automáticamente.');
                }
            } catch (e) {
                originalConsoleError('⚠️ Error en presentación de grupos:', e.message);
            }
        }
    });

    // Manejar mensajes entrantes + guardar para detectar eliminados
    sock.ev.on('messages.upsert', async (m) => {
        // Guardar cada mensaje en memoria antes de procesarlo
        for (const msg of m.messages) {
            if (!msg.message) continue;
            
            mensajesGuardados[msg.key.id] = {
                from: msg.key.remoteJid,
                sender: msg.key.participant || msg.key.remoteJid,
                mensaje: msg.message?.conversation ||
                    msg.message?.extendedTextMessage?.text ||
                    '[multimedia o sticker]',
                hora: new Date().toLocaleTimeString('es-PE')
            };
        }
        
        await messageHandler(sock, m);
    });

    // Detectar mensajes eliminados
    sock.ev.on('messages.update', async (updates) => {
        for (const update of updates) {
            if (update.update?.messageStubType === 68) {
                const guardado = mensajesGuardados[update.key.id];
                
                if (guardado) {
                    const numero = guardado.sender.split('@')[0].split(':')[0];
                    const texto = `🗑️ *Mensaje eliminado detectado*\n\n` +
                        `👤 *De:* @${numero}\n` +
                        `🕐 *Hora:* ${guardado.hora}\n` +
                        `💬 *Mensaje:* ${guardado.mensaje}`;
                    
                    await sock.sendMessage(guardado.from, {
                        text: texto,
                        mentions: [guardado.sender]
                    });
                    
                    delete mensajesGuardados[update.key.id];
                }
            }
        }
    });

    // Manejar actualizaciones de grupos (bienvenida/despedida)
    sock.ev.on('group-participants.update', async (update) => {
        const groupHandler = require('../events/group-handler');
        await groupHandler(sock, update);
    });

    return sock;
}

module.exports = { connectToWhatsApp };