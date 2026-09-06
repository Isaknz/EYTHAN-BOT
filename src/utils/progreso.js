const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../../data/progreso.json');

function getDB() {
    if (!fs.existsSync(DB_PATH)) {
        fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
        fs.writeFileSync(DB_PATH, '{}');
    }

    return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
}

function saveDB(db) {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

function getToday() {
    return new Date().toISOString().slice(0, 10);
}

function getProgress(db, userId) {
    if (!db[userId] || db[userId].date !== getToday()) {
        db[userId] = { date: getToday(), messages: 0, commands: 0, games: 0, achievements: [] };
    }

    return db[userId];
}

function recordMessage(userId) {
    const db = getDB();
    const progress = getProgress(db, userId);
    progress.messages++;
    saveDB(db);
}

function recordCommand(userId, commandName) {
    const db = getDB();
    const progress = getProgress(db, userId);
    progress.commands++;
    if (['8ball', 'dado', 'moneda', 'trivia', 'wordle', 'sopa', 'ahorcado'].includes(commandName)) {
        progress.games++;
    }
    saveDB(db);
}

function getUserProgress(userId) {
    const db = getDB();
    return getProgress(db, userId);
}

module.exports = { getDB, saveDB, getUserProgress, recordMessage, recordCommand };