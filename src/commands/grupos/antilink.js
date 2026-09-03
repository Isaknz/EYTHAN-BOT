const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../../../data/antilink.json');

function getDB() {
    if (!fs.existsSync(path.dirname(dbPath))) fs.mkdirSync(path.dirname(dbPath), { recursive: true });
    if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, '{}');
    return JSON.parse(fs.readFileSync(dbPath));
}

function saveDB(db) {
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
}

module.exports = {
    name: 'antilink',
    aliases: ['antlink', 'nolink'],
    description: 'Activa/desactiva el antilink en el grupo',

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
                text: `🚫 *Antilink*\n\nEstado actual: ${estado}\n\nUso: *.antilink on/off*`
            });
        }

        db[from] = { activo: accion === 'on' };
        saveDB(db);

        await sock.sendMessage(from, {
            text: accion === 'on'
                ? '✅ Antilink activado. Eliminaré cualquier link y expulsaré al que lo envíe.'
                : '❌ Antilink desactivado.'
        });
    },

    // Función para verificar links — se llama desde el handler
    checkLink(text) {
        const linkRegex = /(https?:\/\/|www\.|chat\.whatsapp\.com\/)[^\s]*/gi;
        return linkRegex.test(text);
    },

    getDB
};