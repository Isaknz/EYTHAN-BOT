const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../../../data/horario.json');

function getDB() {
    if (!fs.existsSync(path.dirname(dbPath))) fs.mkdirSync(path.dirname(dbPath), { recursive: true });
    if (!fs.existsSync(dbPath)) {
        fs.writeFileSync(dbPath, JSON.stringify({
            activo: true,
            inicio: 9,
            fin: 18,
            mensaje: '⏰ Estamos fuera de horario. Atendemos de {inicio}:00 a {fin}:00. Te responderemos pronto.',
            timezone: 'America/Lima'
        }));
    }
    return JSON.parse(fs.readFileSync(dbPath));
}

function saveDB(db) {
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
}

function estaEnHorario(db) {
    const ahora = new Date().toLocaleString('es-PE', { timeZone: db.timezone, hour: '2-digit', hour12: false });
    const hora = parseInt(ahora);
    return hora >= db.inicio && hora < db.fin;
}

module.exports = {
    name: 'horario',
    aliases: ['schedule', 'horas'],
    description: 'Configura respuesta automática fuera de horario',
    getDB,
    estaEnHorario,

    async execute(sock, message, args, context) {
        const { from, sender } = context;

        const config = require('../../../config');
        const ownerClean = config.ownerNumber.replace(/:.*@/, '@');
        const senderClean = sender.replace(/:.*@/, '@');

        if (senderClean !== ownerClean) {
            return await sock.sendMessage(from, { text: '❌ Solo el owner puede configurar el horario.' });
        }

        const subcomando = args[0]?.toLowerCase();
        const db = getDB();

        if (!subcomando || subcomando === 'ver') {
            return await sock.sendMessage(from, {
                text: `🕐 *Configuración de horario*\n\nEstado: ${db.activo ? '✅ Activo' : '❌ Inactivo'}\nHorario: *${db.inicio}:00 - ${db.fin}:00*\nZona horaria: *${db.timezone}*\n\nMensaje fuera de horario:\n_${db.mensaje}_\n\n*.horario activar/desactivar*\n*.horario inicio [hora]* — Ej: *.horario inicio 9*\n*.horario fin [hora]* — Ej: *.horario fin 18*\n*.horario mensaje [texto]* — Usa {inicio} y {fin} para las horas`
            });
        }

        if (subcomando === 'activar') {
            db.activo = true;
            saveDB(db);
            return await sock.sendMessage(from, { text: '✅ Respuesta fuera de horario activada.' });
        }

        if (subcomando === 'desactivar') {
            db.activo = false;
            saveDB(db);
            return await sock.sendMessage(from, { text: '❌ Respuesta fuera de horario desactivada.' });
        }

        if (subcomando === 'inicio') {
            const hora = parseInt(args[1]);
            if (isNaN(hora) || hora < 0 || hora > 23) {
                return await sock.sendMessage(from, { text: '❌ Hora inválida. Usa números del 0 al 23.' });
            }
            db.inicio = hora;
            saveDB(db);
            return await sock.sendMessage(from, { text: `✅ Horario de inicio: *${hora}:00*` });
        }

        if (subcomando === 'fin') {
            const hora = parseInt(args[1]);
            if (isNaN(hora) || hora < 0 || hora > 23) {
                return await sock.sendMessage(from, { text: '❌ Hora inválida. Usa números del 0 al 23.' });
            }
            db.fin = hora;
            saveDB(db);
            return await sock.sendMessage(from, { text: `✅ Horario de fin: *${hora}:00*` });
        }

        if (subcomando === 'mensaje') {
            const msg = args.slice(1).join(' ');
            if (!msg) return await sock.sendMessage(from, { text: '❌ Uso: *.horario mensaje [texto]*' });
            db.mensaje = msg;
            saveDB(db);
            return await sock.sendMessage(from, { text: `✅ Mensaje actualizado:\n_${msg}_` });
        }
    }
};