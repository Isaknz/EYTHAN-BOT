const { createBackup, listBackups, restoreBackup } = require('../../utils/backups');

module.exports = {
    name: 'backup',
    aliases: ['respaldo', 'copiaseguridad'],
    description: 'Crea y restaura copias de seguridad',

    async execute(sock, message, args, { from, isOwner }) {
        if (!isOwner) {
            return sock.sendMessage(from, { text: '❌ Solo el owner puede gestionar backups.' });
        }

        const action = args[0]?.toLowerCase() || 'crear';

        if (action === 'crear' || action === 'create') {
            const backup = createBackup();
            return sock.sendMessage(from, {
                text: `✅ Backup creado.\nID: ${backup.id}\nArchivos: ${Object.keys(backup.files).length}`
            });
        }

        if (action === 'listar' || action === 'list') {
            const backups = listBackups();
            return sock.sendMessage(from, {
                text: backups.length
                    ? `📦 *Backups disponibles*\n\n${backups.map(id => `• ${id}`).join('\n')}`
                    : '📦 No hay backups disponibles.'
            });
        }

        if (action === 'restaurar' || action === 'restore') {
            const id = args[1];
            if (!id) return sock.sendMessage(from, { text: 'Uso: *.backup restaurar ID*' });

            const restored = restoreBackup(id);
            return sock.sendMessage(from, {
                text: restored ? '✅ Backup restaurado. Reinicia el bot para aplicar todo.' : '❌ Backup no encontrado.'
            });
        }

        return sock.sendMessage(from, { text: 'Uso: *.backup crear* | *.backup listar* | *.backup restaurar ID*' });
    }
};