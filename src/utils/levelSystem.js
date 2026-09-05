const fs = require('fs-extra');
const path = require('path');

const DB_PATH = path.join(__dirname, '../../data/levels.json');

class LevelSystem {
    constructor() {
        this.data = {};
        this.cooldowns = new Map();
        this.init();
    }

    async init() {
        try {
            await fs.ensureFile(DB_PATH);
            const content = await fs.readFile(DB_PATH, 'utf8');
            this.data = content ? JSON.parse(content) : {};
        } catch (e) {
            this.data = {};
            await this.save();
        }
    }

    async save() {
        await fs.writeFile(DB_PATH, JSON.stringify(this.data, null, 2));
    }

    calculateLevel(xp) {
        return Math.floor(Math.sqrt(xp / 100));
    }

    calculateXPForLevel(level) {
        return Math.pow(level, 2) * 100;
    }

    getXPRange(level) {
        const min = this.calculateXPForLevel(level);
        const max = this.calculateXPForLevel(level + 1);
        return { min, max, current: 0 };
    }

    async addXP(userId, groupId, amount = 10) {
        const cooldownKey = `${userId}:${groupId}`;
        const now = Date.now();
        
        // Cooldown de 30 segundos para evitar spam
        if (this.cooldowns.has(cooldownKey)) {
            const last = this.cooldowns.get(cooldownKey);
            if (now - last < 30000) return null;
        }
        this.cooldowns.set(cooldownKey, now);

        // Inicializar datos
        if (!this.data[groupId]) this.data[groupId] = {};
        if (!this.data[groupId][userId]) {
            this.data[groupId][userId] = { xp: 0, level: 0, messages: 0 };
        }

        const userData = this.data[groupId][userId];
        const oldLevel = userData.level;
        
        userData.xp += amount;
        userData.messages++;
        
        const newLevel = this.calculateLevel(userData.xp);
        
        let leveledUp = false;
        if (newLevel > oldLevel) {
            userData.level = newLevel;
            leveledUp = true;
        }

        await this.save();
        
        return {
            userId,
            xp: userData.xp,
            level: userData.level,
            leveledUp,
            oldLevel,
            newLevel,
            messages: userData.messages,
            nextLevelXP: this.calculateXPForLevel(newLevel + 1),
            progress: Math.floor((userData.xp / this.calculateXPForLevel(newLevel + 1)) * 100)
        };
    }

    getUserData(userId, groupId) {
        if (!this.data[groupId] || !this.data[groupId][userId]) {
            return { xp: 0, level: 0, messages: 0, progress: 0 };
        }
        
        const user = this.data[groupId][userId];
        const nextLevelXP = this.calculateXPForLevel(user.level + 1);
        
        return {
            ...user,
            nextLevelXP,
            progress: Math.floor((user.xp / nextLevelXP) * 100)
        };
    }

    getLeaderboard(groupId, limit = 10) {
        if (!this.data[groupId]) return [];
        
        return Object.entries(this.data[groupId])
            .map(([userId, data]) => ({ userId, ...data }))
            .sort((a, b) => b.xp - a.xp)
            .slice(0, limit);
    }

    getGlobalLeaderboard(limit = 10) {
        const global = {};
        
        for (const [groupId, users] of Object.entries(this.data)) {
            for (const [userId, data] of Object.entries(users)) {
                if (!global[userId]) {
                    global[userId] = { userId, xp: 0, level: 0, messages: 0 };
                }
                global[userId].xp += data.xp;
                global[userId].messages += data.messages;
                global[userId].level = Math.max(global[userId].level, data.level);
            }
        }
        
        return Object.values(global)
            .sort((a, b) => b.xp - a.xp)
            .slice(0, limit);
    }

    getRank(userId, groupId) {
        const leaderboard = this.getLeaderboard(groupId, 9999);
        const index = leaderboard.findIndex(u => u.userId === userId);
        return index === -1 ? null : index + 1;
    }

    async resetUser(userId, groupId) {
        if (this.data[groupId] && this.data[groupId][userId]) {
            delete this.data[groupId][userId];
            await this.save();
            return true;
        }
        return false;
    }

    async addBonusXP(userId, groupId, amount) {
        if (!this.data[groupId] || !this.data[groupId][userId]) return false;
        
        this.data[groupId][userId].xp += amount;
        const newLevel = this.calculateLevel(this.data[groupId][userId].xp);
        this.data[groupId][userId].level = newLevel;
        
        await this.save();
        return this.getUserData(userId, groupId);
    }
}

module.exports = new LevelSystem();