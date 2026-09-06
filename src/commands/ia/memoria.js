const fs = require('fs-extra');
const path = require('path');

const DB_PATH = path.join(__dirname, '../../../data/ia-memoria.json');
function getDB() { if (!fs.existsSync(DB_PATH)) fs.writeJsonSync(DB_PATH, {}); return fs.readJsonSync(DB_PATH); }
function saveDB(db) { fs.writeJsonSync(DB_PATH, db, { spaces: 2 }); }

module.exports = {
    name: 'memoria', aliases: ['preferencia', 'recordardato'], description: 'Guarda preferencias simples para la IA',
    async execute(sock, message, args, { from, sender }) {
        const db = getDB(); const action = args[0]?.toLowerCase();
        if (action === 'borrar' || action === 'limpiar') { delete db[sender]; saveDB(db); return sock.sendMessage(from, { text: '🧠 Memoria personal borrada.' }); }
        if (!args.length || action === 'ver') return sock.sendMessage(from, { text: db[sender]?.join('\n') || '🧠 No tienes datos guardados.' });
        db[sender] = db[sender] || []; const value = args.join(' '); if (!db[sender].includes(value)) db[sender].push(value); saveDB(db);
        return sock.sendMessage(from, { text: '✅ Lo recordaré para futuras consultas.' });
    }
};