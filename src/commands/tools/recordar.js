const reminders = new Map();
let nextId = 1;

const UNIT_MS = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000
};

function parseDuration(value) {
    const match = /^([1-9]\d*)(s|m|h|d)$/i.exec(value || '');
    if (!match) return null;

    const duration = Number(match[1]) * UNIT_MS[match[2].toLowerCase()];
    return duration <= 7 * 24 * 60 * 60 * 1000 ? duration : null;
}

function formatDuration(milliseconds) {
    const seconds = Math.ceil(milliseconds / 1000);
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.ceil(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.ceil(seconds / 3600)}h`;
    return `${Math.ceil(seconds / 86400)}d`;
}

module.exports = {
    name: 'recordar',
    aliases: ['recordatorio', 'recordatorios'],
    description: 'Programa recordatorios temporales',

    async execute(sock, message, args, { from, sender }) {
        const action = args[0]?.toLowerCase();

        if (!action || action === 'listar' || action === 'lista' || action === 'ver') {
            const userReminders = [...reminders.values()]
                .filter(reminder => reminder.from === from && reminder.sender === sender);

            if (!userReminders.length) {
                return sock.sendMessage(from, { text: '📋 No tienes recordatorios pendientes.' });
            }

            const text = userReminders
                .map(reminder => `${reminder.id}. ${reminder.text} (${formatDuration(reminder.dueAt - Date.now())})`)
                .join('\n');

            return sock.sendMessage(from, { text: `📋 *Tus recordatorios*\n\n${text}` });
        }

        if (action === 'cancelar' || action === 'cancel') {
            const id = Number(args[1]);
            const reminder = reminders.get(id);

            if (!reminder || reminder.from !== from || reminder.sender !== sender) {
                return sock.sendMessage(from, { text: '❌ No encontré ese recordatorio.' });
            }

            clearTimeout(reminder.timer);
            reminders.delete(id);
            return sock.sendMessage(from, { text: `✅ Recordatorio ${id} cancelado.` });
        }

        const duration = parseDuration(args[0]);
        const text = args.slice(1).join(' ').trim();

        if (!duration || !text) {
            return sock.sendMessage(from, {
                text: '⏰ Uso: *.recordar 30m mensaje*\nUnidades: s, m, h, d. Máximo: 7 días.'
            });
        }

        const id = nextId++;
        const reminder = {
            id,
            from,
            sender,
            text,
            dueAt: Date.now() + duration,
            timer: null
        };

        reminder.timer = setTimeout(async () => {
            reminders.delete(id);
            try {
                await sock.sendMessage(from, {
                    text: `⏰ *Recordatorio ${id}*\n\n${text}`
                });
            } catch (error) {
                console.error('Error enviando recordatorio:', error.message);
            }
        }, duration);

        reminder.timer.unref?.();
        reminders.set(id, reminder);

        return sock.sendMessage(from, {
            text: `✅ Recordatorio ${id} creado para dentro de ${formatDuration(duration)}.`
        });
    }
};