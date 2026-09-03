const pino = require('pino');
const fs = require('fs-extra');
const path = require('path');

const LOG_DIR = path.join(__dirname, '../../logs');

// Asegurar directorio existe
fs.ensureDirSync(LOG_DIR);

const logger = pino({
    level: process.env.LOG_LEVEL || 'info',
    transport: {
        targets: [
            // Consola con colores
            {
                target: 'pino-pretty',
                options: {
                    colorize: true,
                    translateTime: 'SYS:standard',
                    ignore: 'pid,hostname',
                    messageFormat: '{levelLabel} {msg}'
                },
                level: 'debug'
            },
            // Archivo de logs general
            {
                target: 'pino/file',
                options: {
                    destination: path.join(LOG_DIR, 'bot.log'),
                    mkdir: true
                },
                level: 'info'
            },
            // Archivo solo errores
            {
                target: 'pino/file',
                options: {
                    destination: path.join(LOG_DIR, 'error.log'),
                    mkdir: true
                },
                level: 'error'
            }
        ]
    },
    base: {
        env: process.env.NODE_ENV || 'development'
    }
});

// Helpers personalizados
logger.command = (command, user, group) => {
    logger.info({ command, user, group }, 'Command executed');
};

logger.message = (type, from, size) => {
    logger.debug({ type, from, size }, 'Message received');
};

logger.errorDetails = (err, context = {}) => {
    logger.error({
        err: err.message,
        stack: err.stack,
        ...context
    }, 'Error occurred');
};

logger.db = (operation, collection, id) => {
    logger.debug({ operation, collection, id }, 'Database operation');
};

// Rotación de logs diaria
setInterval(async () => {
    const files = ['bot.log', 'error.log'];
    const today = new Date().toISOString().split('T')[0];
    
    for (const file of files) {
        const filePath = path.join(LOG_DIR, file);
        if (await fs.pathExists(filePath)) {
            const stat = await fs.stat(filePath);
            const fileDate = stat.mtime.toISOString().split('T')[0];
            
            if (fileDate !== today) {
                const newName = `${file}.${fileDate}.old`;
                await fs.move(filePath, path.join(LOG_DIR, newName));
            }
        }
    }
}, 3600000); // Revisar cada hora

module.exports = logger;