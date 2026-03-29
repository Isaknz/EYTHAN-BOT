const { connectToWhatsApp } = require('./src/core/connection');
const pino = require('pino');

const logger = pino({ level: 'silent' });

console.log(`
╔════════════════════════════════════╗
║                                    ║
║     🤖 ISAACDEV BOT v1.0 🤖       ║
║                                    ║
║   Iniciando conexión...           ║
║                                    ║
╚════════════════════════════════════╝
`);

connectToWhatsApp().catch(err => {
    logger.error('Error fatal:', err);
    process.exit(1);
});