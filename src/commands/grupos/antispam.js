const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../../../data/antispam.json');
const contadorPath = path.join(__dirname, '../../../data/spam_contador.json');

function getDB() {
    if (!fs.existsSync(path.dirname(dbPath))) fs.mkdirSync(path.dirname(dbPath), { recursive: true });
    if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, '{}');
    return JSON.parse(fs.readFileSync(dbPath));
}

function getContador() {
    if (!fs.existsSync(contadorPath)) fs.writeFileSync(contadorPath, '{}');
    return JSON.parse(fs.readFileSync(contadorPath));
}

function saveDB(db) { fs.writeFileSync(dbPath, JSON.stringify(db, null, 2)); }
function saveContador(c) { fs.writeFileSync(contadorPath, JSON.stringify(c, null, 2)); }

module.exports = {
    name: 'antispam',
    aliases: ['antis'],
    description: 'Activa/desactiva el antispam en el grupo',

    async execute(sock, message, args, context) {
        const { from, sender, isGroup } = context;

        if (!isGroup) return await sock.sendMessage(from, { text: '❌ Solo funciona en grupos.' });

        const groupMetadata = await sock.groupMetadata(from);
        const admins = groupMetadata.participants.filter(p => p.admin).map(p => p.id);

        if (!admins.includes(sender)) {
            return await sock.sendMessage(from, { text: '❌ Solo los admins pueden usar este comando.' });
        }

        const db = getDB();
        const accion = args[0]?.toLowerCase();

        if (!accion || !['on', 'off'].includes(accion)) {
            const estado = db[from]?.activo ? '✅ Activo' : '❌ Inactivo';
            return await sock.sendMessage(from, {
                text: `🚫 *Antispam*\n\nEstado: ${estado}\n\nUso: *.antispam on/off*\n\n_Expulsa a quien envíe 5 mensajes en menos de 5 segundos._`
            });
        }

        db[from] = { activo: accion === 'on' };
        saveDB(db);

        await sock.sendMessage(from, {
            text: accion === 'on'
                ? '✅ Antispam activado. Expulsaré a quien haga spam.'
                : '❌ Antispam desactivado.'
        });
    },

    getDB,
    getContador,
    saveContador
};