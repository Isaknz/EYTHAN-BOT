const database = require('../../core/database');

module.exports = {
    name: 'reglas',
    aliases: ['rules'],
    description: 'Consulta y administra las reglas del grupo',

    async execute(sock, message, args, { from, isGroup, isAdmin }) {
        if (!isGroup) {
            return sock.sendMessage(from, { text: '❌ Solo funciona en grupos.' });
        }

        const group = database.getGroup(from);
        const action = args[0]?.toLowerCase();

        if (!action || action === 'ver') {
            if (!group.rules.length) {
                return sock.sendMessage(from, {
                    text: '📜 Este grupo todavía no tiene reglas configuradas.'
                });
            }

            const text = group.rules
                .map((rule, index) => `${index + 1}. ${rule}`)
                .join('\n');

            return sock.sendMessage(from, {
                text: `📜 *Reglas del grupo*\n\n${text}`
            });
        }

        if (!isAdmin) {
            return sock.sendMessage(from, {
                text: '❌ Solo los administradores pueden modificar las reglas.'
            });
        }

        if (action === 'agregar' || action === 'add') {
            const rule = args.slice(1).join(' ').trim();

            if (!rule) {
                return sock.sendMessage(from, {
                    text: '📜 Uso: *.reglas agregar texto de la regla*'
                });
            }

            if (rule.length > 300) {
                return sock.sendMessage(from, {
                    text: '❌ La regla no puede superar 300 caracteres.'
                });
            }

            group.rules.push(rule);
            database.updateGroup(from, { rules: group.rules });

            return sock.sendMessage(from, {
                text: `✅ Regla ${group.rules.length} agregada.`
            });
        }

        if (action === 'borrar' || action === 'delete') {
            const index = Number(args[1]) - 1;

            if (!Number.isInteger(index) || index < 0 || index >= group.rules.length) {
                return sock.sendMessage(from, {
                    text: '❌ Indica un número de regla válido. Ejemplo: *.reglas borrar 2*'
                });
            }

            group.rules.splice(index, 1);
            database.updateGroup(from, { rules: group.rules });

            return sock.sendMessage(from, { text: '✅ Regla eliminada.' });
        }

        if (action === 'limpiar' || action === 'clear') {
            database.updateGroup(from, { rules: [] });
            return sock.sendMessage(from, { text: '✅ Todas las reglas fueron eliminadas.' });
        }

        return sock.sendMessage(from, {
            text: '📜 Uso: *.reglas* | *.reglas agregar texto* | *.reglas borrar número* | *.reglas limpiar*'
        });
    }
};