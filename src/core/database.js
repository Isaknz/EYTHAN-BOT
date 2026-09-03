const fs = require('fs-extra');
const path = require('path');

const DB_PATH = path.join(__dirname, '../../database.json');

// Inicializar DB si no existe
if (!fs.existsSync(DB_PATH)) {
    fs.writeJsonSync(DB_PATH, {
        groups: {},
        users: {},
        settings: {}
    });
}

const database = {
    // Obtener datos
    get: () => {
        return fs.readJsonSync(DB_PATH);
    },
    
    // Guardar datos
    save: (data) => {
        fs.writeJsonSync(DB_PATH, data, { spaces: 2 });
    },
    
    // Configuración de grupo
    getGroup: (groupId) => {
        const db = database.get();
        
        if (!db.groups[groupId]) {
            db.groups[groupId] = {
                welcome: true,
                goodbye: true,
                antilink: false,
                antispam: false,
                prefix: '.'
            };
            database.save(db);
        }
        
        return db.groups[groupId];
    },
    
    updateGroup: (groupId, settings) => {
        const db = database.get();
        db.groups[groupId] = { ...db.groups[groupId], ...settings };
        database.save(db);
    },
    
    // Usuarios
    getUser: (userId) => {
        const db = database.get();
        
        if (!db.users[userId]) {
            db.users[userId] = {
                xp: 0,
                level: 1,
                warnings: 0,
                messages: 0
            };
            database.save(db);
        }
        
        return db.users[userId];
    },
    
    updateUser: (userId, data) => {
        const db = database.get();
        db.users[userId] = { ...db.users[userId], ...data };
        database.save(db);
    }
};

module.exports = database;