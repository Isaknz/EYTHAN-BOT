const fs = require('fs-extra');
const path = require('path');

const ROOT = path.join(__dirname, '../..');
const BACKUP_DIR = path.join(ROOT, 'backups');

function getJsonFiles() {
    const files = [];
    const databaseFile = path.join(ROOT, 'database.json');

    if (fs.existsSync(databaseFile)) files.push(databaseFile);

    const dataDir = path.join(ROOT, 'data');
    if (fs.existsSync(dataDir)) {
        for (const name of fs.readdirSync(dataDir)) {
            if (name.endsWith('.json')) files.push(path.join(dataDir, name));
        }
    }

    return files;
}

function createBackup() {
    fs.ensureDirSync(BACKUP_DIR);
    const files = {};

    for (const file of getJsonFiles()) {
        const relativePath = path.relative(ROOT, file);
        try {
            files[relativePath] = fs.readJsonSync(file);
        } catch (error) {
            files[relativePath] = {
                __raw: fs.readFileSync(file, 'utf8'),
                __warning: `JSON inválido: ${error.message}`
            };
        }
    }

    const id = new Date().toISOString().replace(/[:.]/g, '-');
    const backup = { id, createdAt: new Date().toISOString(), files };
    fs.writeJsonSync(path.join(BACKUP_DIR, `${id}.json`), backup, { spaces: 2 });
    return backup;
}

function listBackups() {
    if (!fs.existsSync(BACKUP_DIR)) return [];
    return fs.readdirSync(BACKUP_DIR)
        .filter(name => name.endsWith('.json'))
        .map(name => name.replace(/\.json$/, ''))
        .sort()
        .reverse();
}

function restoreBackup(id) {
    if (!/^[\w-]+$/.test(id)) return false;
    const file = path.join(BACKUP_DIR, `${id}.json`);
    if (!fs.existsSync(file)) return false;

    const backup = fs.readJsonSync(file);
    for (const [relativePath, data] of Object.entries(backup.files || {})) {
        const target = path.resolve(ROOT, relativePath);
        if (!target.startsWith(`${ROOT}${path.sep}`) && target !== ROOT) {
            throw new Error('Ruta de backup no permitida');
        }
        if (data && typeof data === 'object' && Object.prototype.hasOwnProperty.call(data, '__raw')) {
            fs.writeFileSync(target, data.__raw);
        } else {
            fs.writeJsonSync(target, data, { spaces: 2 });
        }
    }

    return true;
}

module.exports = { createBackup, listBackups, restoreBackup };