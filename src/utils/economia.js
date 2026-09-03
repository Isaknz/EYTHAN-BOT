const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../../../data/economia.json');

function getDB() {
    if (!fs.existsSync(path.dirname(dbPath))) fs.mkdirSync(path.dirname(dbPath), { recursive: true });
    if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, '{}');
    return JSON.parse(fs.readFileSync(dbPath));
}

function saveDB(db) {
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
}

function getUser(db, id, name) {
    if (!db[id]) {
        db[id] = { name, coins: 0, level: 1, xp: 0, daily: null };
    }
    return db[id];
}

module.exports = { getDB, saveDB, getUser };