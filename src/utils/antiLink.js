const config = require('../../config');

const URL_REGEX = /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,})/gi;
const WHITELIST = [
    'whatsapp.com',
    'wa.me',
    'github.com',
    'youtube.com',
    'youtu.be',
    'google.com'
];

class AntiLink {
    constructor() {
        this.warnings = new Map();
        this.maxWarnings = 3;
    }

    containsLink(text) {
        if (!text) return false;
        return URL_REGEX.test(text);
    }

    extractLinks(text) {
        if (!text) return [];
        const matches = text.match(URL_REGEX) || [];
        return matches.filter(link => {
            const domain = link.replace(/https?:\/\//, '').replace(/www\./, '').split('/')[0];
            return !WHITELIST.includes(domain.toLowerCase());
        });
    }

    async handleMessage(sock, message, groupMetadata, isAdmin) {
        const text = message.message?.conversation || 
                     message.message?.extendedTextMessage?.text || '';
        
        const from = message.key.remoteJid;
        const sender = message.key.participant || message.key.remoteJid;
        
        // Ignorar admins si está configurado
        if (isAdmin && config.groupOptions.antilinkAllowAdmin !== false) {
            return { action: 'allow', reason: 'admin' };
        }

        if (!this.containsLink(text)) {
            return { action: 'allow', reason: 'no_link' };
        }

        const links = this.extractLinks(text);
        if (links.length === 0) {
            return { action: 'allow', reason: 'whitelisted' };
        }

        // Sistema de advertencias
        const userKey = `${from}:${sender}`;
        const currentWarnings = this.warnings.get(userKey) || 0;
        const newWarnings = currentWarnings + 1;

        if (newWarnings >= this.maxWarnings) {
            this.warnings.delete(userKey);
            
            try {
                await sock.groupParticipantsUpdate(from, [sender], 'remove');
                await sock.sendMessage(from, {
                    text: `🚫 @${sender.split('@')[0]} fue expulsado por enviar ${this.maxWarnings} enlaces.\n\nLinks detectados: ${links.join(', ')}`,
                    mentions: [sender]
                });
                return { action: 'kick', links };
            } catch (e) {
                await sock.sendMessage(from, {
                    text: `⚠️ No pude expulsar a @${sender.split('@')[0]} (necesito ser admin)`,
                    mentions: [sender]
                });
                return { action: 'warn', warning: newWarnings, links };
            }
        }

        this.warnings.set(userKey, newWarnings);
        
        // Borrar mensaje si es posible
        try {
            await sock.sendMessage(from, { delete: message.key });
        } catch (e) {
            // No se pudo borrar
        }

        await sock.sendMessage(from, {
            text: `⚠️ @${sender.split('@')[0]} \n\n*Advertencia ${newWarnings}/${this.maxWarnings}*\nNo se permiten enlaces aquí.\n\nLinks detectados: ${links.join(', ')}`,
            mentions: [sender]
        });

        return { action: 'warn', warning: newWarnings, links };
    }

    getWarnings(userId, groupId) {
        const key = `${groupId}:${userId}`;
        return this.warnings.get(key) || 0;
    }

    resetWarnings(userId, groupId) {
        const key = `${groupId}:${userId}`;
        this.warnings.delete(key);
    }

    resetAllGroup(groupId) {
        for (const key of this.warnings.keys()) {
            if (key.startsWith(`${groupId}:`)) {
                this.warnings.delete(key);
            }
        }
    }
}

module.exports = new AntiLink();