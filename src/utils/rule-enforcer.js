const fs = require('fs-extra');
const path = require('path');

const DB_PATH = path.join(__dirname, '../../data/rule-warnings.json');

function normalize(text) {
    return text
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
}

function getDB() {
    if (!fs.existsSync(DB_PATH)) {
        fs.ensureFileSync(DB_PATH);
        fs.writeJsonSync(DB_PATH, {});
    }

    return fs.readJsonSync(DB_PATH);
}

function saveDB(db) {
    fs.writeJsonSync(DB_PATH, db, { spaces: 2 });
}

function getBannedTerms(rule) {
    const normalized = normalize(rule);
    const matches = [
        normalized.match(/(?:palabra|palabras)\s+([^,.!?]+)/),
        normalized.match(/(?:prohibido|prohibida|prohibidos|prohibidas)\s+(?:decir|usar|escribir|mencionar)?\s*([^,.!?]+)/),
        normalized.match(/no\s+(?:se permite|permitido|permiten)\s+([^,.!?]+)/)
    ].filter(Boolean);

    if (!matches.length) return [];

    return matches
        .map(match => match[1].replace(/^(la|el|los|las)\s+/, '').trim())
        .filter(term => term.length >= 2 && term.length <= 80);
}

function findViolation(rules, text, description = '') {
    const normalizedText = normalize(text);
    const allRules = [...(rules || []), ...String(description).split(/[\n;]+/).map(rule => rule.trim()).filter(Boolean)];

    for (const rule of allRules) {
        for (const term of getBannedTerms(rule)) {
            if (normalizedText.includes(term)) {
                return { rule, term };
            }
        }
    }

    return null;
}

function registerWarning(groupId, userId, violation) {
    const db = getDB();
    db[groupId] = db[groupId] || {};
    const current = db[groupId][userId] || { count: 0, violations: [] };
    current.count++;
    current.violations.push({ ...violation, at: new Date().toISOString() });
    db[groupId][userId] = current;
    saveDB(db);
    return current.count;
}

function clearWarnings(groupId, userId) {
    const db = getDB();
    if (db[groupId]) delete db[groupId][userId];
    saveDB(db);
}

module.exports = { findViolation, registerWarning, clearWarnings };