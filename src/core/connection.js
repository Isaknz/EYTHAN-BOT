const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason,
    fetchLatestBaileysVersion 
} = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const pino = require('pino');
const { Boom } = require('@hapi/boom');
const { messageHandler } = require('./handler');
const config = require('../../config');

const logger = pino({ level: 'silent' });

async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('./session');
    const { version } = await fetchLatestBaileysVersion();
    
    const sock = makeWASocket({
        version,
        logger,
        printQRInTerminal: true,
        auth: state,
        browser: ['IsaacDev Bot', 'Chrome', '1.0.0']
    });

    // Guardar credenciales
    sock.ev.on('creds.update', saveCreds);

    // Manejar conexión
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            console.log('📱 Escanea el código QR para conectar...');
        }

        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error instanceof Boom) && 
                lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut;
            
            console.log('⚠️ Conexión cerrada:', shouldReconnect ? 'Reconectando...' : 'Sesión cerrada');
            
            if (shouldReconnect) {
                connectToWhatsApp();
            }
        } else if (connection === 'open') {
            console.log('✅ IsaacDev Bot conectado exitosamente!');
            
            // Enviar mensaje de presentación al owner
            await sock.sendMessage(config.ownerNumber, { 
                text: `🤖 *IsaacDev Bot* está en línea!\n\nVersión: 1.0.0\nEstado: ✅ Activo`,
                image: { url: config.assets.logo }
            });
        }
    });

    // Manejar mensajes entrantes
    sock.ev.on('messages.upsert', async (m) => {
        await messageHandler(sock, m);
    });

    // Manejar actualizaciones de grupos (bienvenida/despedida)
    sock.ev.on('group-participants.update', async (update) => {
        const { groupParticipantsUpdateHandler } = require('../events/group-handler');
        await groupParticipantsUpdateHandler(sock, update);
    });

    return sock;
}

module.exports = { connectToWhatsApp };