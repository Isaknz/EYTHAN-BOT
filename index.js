const { connectToWhatsApp } = require('./src/core/connection');
require("dotenv").config(); // Cargar variables de entorno
const pino = require('pino');
const chalk = require('chalk');

const logger = pino({ level: 'silent' });

// Diseño mejorado para la consola
console.log(chalk.bold.bgBlueBright(`
╔═══════════════════════════════════════════════════════════════════════════════╗
║                                                                          ║
║   ${chalk.bold.green('🤖 EYTHAN BOT v1.0 🤖')}                                      ║
║                                                                          ║
║   ${chalk.bold.cyan('Creador:')} ${chalk.bold.yellow('Fred Isaac')}                              ║
║                                                                          ║
║   ${chalk.bold.magenta('Iniciando conexión a WhatsApp...')}                          ║
║                                                                          ║
║   ${chalk.bold.blue('⚡ Powered by IsaacDev')}                                      ║
║                                                                          ║
╚═══════════════════════════════════════════════════════════════════════════════╝
`));

console.log(chalk.bold.green('✅ Iniciando servicios...'));

connectToWhatsApp().catch(err => {
    logger.error('Error fatal:', err);
    console.log(chalk.bold.red('❌ Error fatal al iniciar el bot:'), err.message);
    process.exit(1);
});