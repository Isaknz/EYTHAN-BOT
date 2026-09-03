const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../../../data/autorespuestas.json');

function getDB() {
    if (!fs.existsSync(path.dirname(dbPath))) fs.mkdirSync(path.dirname(dbPath), { recursive: true });
    if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, '{}');
    return JSON.parse(fs.readFileSync(dbPath));
}

function saveDB(db) {
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
}

module.exports = {
    name: 'autorespuesta',
    aliases: ['ar', 'autoreply'],
    description: 'Gestiona respuestas automáticas por palabras clave',
    getDB,

    async execute(sock, message, args, context) {
        const { from, sender, isGroup } = context;

        // Verificar permisos — solo owner o admin del grupo
        const config = require('../../../config');
        const ownerClean = config.ownerNumber.replace(/:.*@/, '@');
        const senderClean = sender.replace(/:.*@/, '@');
        const esOwner = senderClean === ownerClean;

        if (isGroup) {
            const meta = await sock.groupMetadata(from);
            const admins = meta.participants.filter(p => p.admin).map(p => p.id);
            if (!admins.includes(sender) && !esOwner) {
                return await sock.sendMessage(from, { text: '❌ Solo los admins pueden gestionar autorespuestas.' });
            }
        } else if (!esOwner) {
            return await sock.sendMessage(from, { text: '❌ Solo el owner puede gestionar autorespuestas en chats privados.' });
        }

        const subcomando = args[0]?.toLowerCase();
        const db = getDB();
        const chatId = from;

        if (!db[chatId]) db[chatId] = {};

        // .autorespuesta ver
        if (!subcomando || subcomando === 'ver' || subcomando === 'list') {
            const respuestas = Object.entries(db[chatId]);
            if (!respuestas.length) {
                return await sock.sendMessage(from, {
                    text: '📋 No hay autorespuestas configuradas.\n\nUsa *.ar agregar [palabra] | [respuesta]*'
                });
            }
            let texto = '📋 *Autorespuestas configuradas:*\n\n';
            respuestas.forEach(([palabra, respuesta], i) => {
                texto += `${i + 1}. *${palabra}* → ${respuesta}\n`;
            });
            return await sock.sendMessage(from, { text: texto });
        }

        // .autorespuesta agregar hola | ¡Hola! ¿En qué te ayudo?
        if (subcomando === 'agregar' || subcomando === 'add') {
            const resto = args.slice(1).join(' ');
            const partes = resto.split('|').map(p => p.trim());

            if (partes.length < 2) {
                return await sock.sendMessage(from, {
                    text: '❌ Uso: *.ar agregar [palabra clave] | [respuesta]*\nEj: *.ar agregar hola | ¡Hola! ¿En qué te ayudo?*'
                });
            }

            const palabra = partes[0].toLowerCase();
            const respuesta = partes[1];

            db[chatId][palabra] = respuesta;
            saveDB(db);

            return await sock.sendMessage(from, {
                text: `✅ Autorespuesta agregada:\n\n*${palabra}* → ${respuesta}`
            });
        }

        // .autorespuesta borrar hola
        if (subcomando === 'borrar' || subcomando === 'delete' || subcomando === 'remove') {
            const palabra = args.slice(1).join(' ').toLowerCase();
            if (!palabra) {
                return await sock.sendMessage(from, { text: '❌ Uso: *.ar borrar [palabra clave]*' });
            }
            if (!db[chatId][palabra]) {
                return await sock.sendMessage(from, { text: `❌ No existe la autorespuesta para: *${palabra}*` });
            }
            delete db[chatId][palabra];
            saveDB(db);
            return await sock.sendMessage(from, { text: `✅ Autorespuesta *${palabra}* eliminada.` });
        }

        // .autorespuesta limpiar
        if (subcomando === 'limpiar' || subcomando === 'clear') {
            db[chatId] = {};
            saveDB(db);
            return await sock.sendMessage(from, { text: '🧹 Todas las autorespuestas fueron eliminadas.' });
        }

        await sock.sendMessage(from, {
            text: `📋 *Comandos de Autorespuesta*\n\n*.ar ver* — Ver todas\n*.ar agregar [palabra] | [respuesta]* — Agregar\n*.ar borrar [palabra]* — Eliminar una\n*.ar limpiar* — Eliminar todas`
        });
    }
};