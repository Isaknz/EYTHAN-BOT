const fs = require('fs-extra');
const path = require('path');
const config = require('../../../config');
const { isAdmin: checkIsAdmin, isOwner: checkIsOwner } = require('../../utils/helpers');

const WARN_DB = path.join(__dirname, '../../../data/warns.json');

class WarnSystem {
    constructor() {
        this.warns = {};
        this.init();
    }

    async init() {
        try {
            await fs.ensureFile(WARN_DB);
            const content = await fs.readFile(WARN_DB, 'utf8');
            this.warns = content ? JSON.parse(content) : {};
        } catch (e) {
            this.warns = {};
            await this.save();
        }
    }

    async save() {
        await fs.writeFile(WARN_DB, JSON.stringify(this.warns, null, 2));
    }

    async addWarn(groupId, userId, reason, warnedBy) {
        if (!this.warns[groupId]) this.warns[groupId] = {};
        if (!this.warns[groupId][userId]) this.warns[groupId][userId] = [];
        
        const warn = {
            id: Date.now().toString(36),
            reason,
            warnedBy,
            date: new Date().toISOString()
        };
        
        this.warns[groupId][userId].push(warn);
        await this.save();
        
        return {
            warn,
            total: this.warns[groupId][userId].length
        };
    }

    getWarns(groupId, userId) {
        if (!this.warns[groupId] || !this.warns[groupId][userId]) return [];
        return this.warns[groupId][userId];
    }

    async removeWarn(groupId, userId, warnId) {
        if (!this.warns[groupId] || !this.warns[groupId][userId]) return false;
        
        const initial = this.warns[groupId][userId].length;
        this.warns[groupId][userId] = this.warns[groupId][userId].filter(w => w.id !== warnId);
        
        if (this.warns[groupId][userId].length < initial) {
            await this.save();
            return true;
        }
        return false;
    }

    async clearWarns(groupId, userId) {
        if (!this.warns[groupId] || !this.warns[groupId][userId]) return false;
        
        delete this.warns[groupId][userId];
        await this.save();
        return true;
    }

    getGroupStats(groupId) {
        if (!this.warns[groupId]) return { totalUsers: 0, totalWarns: 0 };
        
        const users = Object.keys(this.warns[groupId]);
        const totalWarns = users.reduce((acc, uid) => acc + this.warns[groupId][uid].length, 0);
        
        return { totalUsers: users.length, totalWarns };
    }
}

const warnSystem = new WarnSystem();

module.exports = {
    name: 'warn',
    aliases: ['advertencia', 'warning'],
    
    async execute(sock, message, args, context) {
        const { from, sender } = context;
        const isAdmin = context.isAdmin ?? await checkIsAdmin(sock, from, sender);
        const isOwner = context.isOwner ?? checkIsOwner(sender, config);

        if (!isAdmin) {
            await sock.sendMessage(from, {
                text: '❌ Solo administradores pueden usar este comando.'
            }, { quoted: message });
            return;
        }

        const mentioned = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
        const quoted = message.message?.extendedTextMessage?.contextInfo?.participant;
        const target = mentioned[0] || quoted || args[0]?.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
        
        if (!target || target === sender) {
            await sock.sendMessage(from, {
                text: '❌ Menciona a un usuario o responde a su mensaje.\n\nUso: .warn @usuario [razón]'
            }, { quoted: message });
            return;
        }

        const subcommand = args[0]?.toLowerCase();
        
        // Subcomandos para admins
        if (subcommand === 'list' || subcommand === 'lista') {
            const targetList = mentioned[0] || quoted || args[1]?.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
            const warns = warnSystem.getWarns(from, targetList);
            
            if (warns.length === 0) {
                await sock.sendMessage(from, {
                    text: `✅ @${targetList.split('@')[0]} no tiene advertencias.`,
                    mentions: [targetList]
                }, { quoted: message });
                return;
            }
            
            const list = warns.map((w, i) => 
                `${i + 1}. ${w.reason}\n   📅 ${new Date(w.date).toLocaleDateString()}\n   👮 Por: @${w.warnedBy.split('@')[0]}`
            ).join('\n\n');
            
            await sock.sendMessage(from, {
                text: `⚠️ *Advertencias de @${targetList.split('@')[0]}* (${warns.length}/3)\n\n${list}`,
                mentions: [targetList, ...warns.map(w => w.warnedBy)]
            }, { quoted: message });
            return;
        }

        if (subcommand === 'clear' || subcommand === 'limpiar') {
            if (!isOwner) {
                await sock.sendMessage(from, {
                    text: '❌ Solo el owner puede limpiar advertencias.'
                }, { quoted: message });
                return;
            }
            
            const targetClear = mentioned[0] || quoted || args[1]?.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
            const cleared = await warnSystem.clearWarns(from, targetClear);
            
            await sock.sendMessage(from, {
                text: cleared 
                    ? `✅ Se limpiaron todas las advertencias de @${targetClear.split('@')[0]}`
                    : '❌ Ese usuario no tiene advertencias.',
                mentions: [targetClear]
            }, { quoted: message });
            return;
        }

        if (subcommand === 'remove' || subcommand === 'quitar') {
            const targetRemove = mentioned[0] || quoted || args[1]?.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
            const warnId = args[2];
            
            if (!warnId) {
                await sock.sendMessage(from, {
                    text: '❌ Especifica el ID de la advertencia.\nUso: .warn remove @usuario <id>'
                }, { quoted: message });
                return;
            }
            
            const removed = await warnSystem.removeWarn(from, targetRemove, warnId);
            await sock.sendMessage(from, {
                text: removed
                    ? `✅ Advertencia eliminada.`
                    : '❌ No se encontró esa advertencia.'
            }, { quoted: message });
            return;
        }

        // Agregar advertencia normal
        const reason = args.slice(mentioned.length || quoted ? 0 : 1).join(' ') || 'Sin razón especificada';
        const result = await warnSystem.addWarn(from, target, reason, sender);
        
        const text = `⚠️ *ADVERTENCIA ${result.total}/3*\n\n` +
            `👤 Usuario: @${target.split('@')[0]}\n` +
            `📋 Razón: ${reason}\n` +
            `👮 Por: @${sender.split('@')[0]}\n` +
            `🆔 ID: ${result.warn.id}`;
        
        await sock.sendMessage(from, {
            text,
            mentions: [target, sender]
        }, { quoted: message });

        // Auto-kick en 3 advertencias
        if (result.total >= 3) {
            setTimeout(async () => {
                try {
                    await sock.groupParticipantsUpdate(from, [target], 'remove');
                    await sock.sendMessage(from, {
                        text: `🚫 @${target.split('@')[0]} fue expulsado por acumular 3 advertencias.`,
                        mentions: [target]
                    });
                    await warnSystem.clearWarns(from, target);
                } catch (e) {
                    await sock.sendMessage(from, {
                        text: '❌ No pude expulsar al usuario. Verifica que soy admin.'
                    });
                }
            }, 1000);
        }
    }
};