const database = require('../../core/database');

function status(value) {
    return value ? '✅ Activado' : '❌ Desactivado';
}

module.exports = {
    name: 'config',
    aliases: ['configuracion', 'ajustes'],
    description: 'Consulta y actualiza la configuración del grupo',

    async execute(sock, message, args, { from, isGroup, isAdmin }) {
        if (!isGroup) {
            return sock.sendMessage(from, { text: '❌ Solo funciona en grupos.' });
        }

        const group = database.getGroup(from);
        const action = args[0]?.toLowerCase();

        if (!action || action === 'ver' || action === 'mostrar') {
            return sock.sendMessage(from, {
                text: `⚙️ *Configuración del grupo*\n\n` +
                    `🔹 Prefijo: *${group.prefix}*\n` +
                    `👋 Bienvenida: ${status(group.welcome)}\n` +
                    `🚪 Despedida: ${status(group.goodbye)}\n` +
                    `📜 Reglas: *${group.rules.length}*\n\n` +
                    `_Usa .config ayuda para ver las opciones._`
            });
        }

        if (action === 'ayuda' || action === 'help') {
            return sock.sendMessage(from, {
                text: '⚙️ *Configuración*\n\n' +
                    '`.config ver` - Ver estado\n' +
                    '`.config prefijo !` - Cambiar prefijo\n' +
                    '`.config bienvenida on/off` - Activar o desactivar\n' +
                    '`.config despedida on/off` - Activar o desactivar'
            });
        }

        if (!isAdmin) {
            return sock.sendMessage(from, {
                text: '❌ Solo los administradores pueden cambiar la configuración.'
            });
        }

        if (action === 'prefijo' || action === 'prefix') {
            const prefix = args[1];

            if (!prefix || prefix.length > 3 || /\s/.test(prefix)) {
                return sock.sendMessage(from, {
                    text: '❌ El prefijo debe tener entre 1 y 3 caracteres, sin espacios.'
                });
            }

            database.updateGroup(from, { prefix });
            return sock.sendMessage(from, { text: `✅ Prefijo actualizado a *${prefix}*.` });
        }

        const settingNames = {
            bienvenida: 'welcome',
            welcome: 'welcome',
            despedida: 'goodbye',
            goodbye: 'goodbye'
        };
        const setting = settingNames[action];
        const value = args[1]?.toLowerCase();

        if (setting && ['on', 'off'].includes(value)) {
            const enabled = value === 'on';
            database.updateGroup(from, { [setting]: enabled });
            return sock.sendMessage(from, {
                text: `✅ ${setting === 'welcome' ? 'Bienvenida' : 'Despedida'} ${enabled ? 'activada' : 'desactivada'}.`
            });
        }

        return sock.sendMessage(from, {
            text: '❌ Opción no válida. Usa *.config ayuda*.'
        });
    }
};