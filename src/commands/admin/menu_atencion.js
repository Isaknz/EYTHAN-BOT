const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../../../data/menu_atencion.json');

function getDB() {
    if (!fs.existsSync(path.dirname(dbPath))) fs.mkdirSync(path.dirname(dbPath), { recursive: true });
    if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, '{}');
    return JSON.parse(fs.readFileSync(dbPath));
}

function saveDB(db) {
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
}

const estadoUsuarios = new Map(); // guarda en qué paso está cada usuario

module.exports = {
    name: 'menuatencion',
    aliases: ['atencion', 'menu_bot'],
    description: 'Configura el menú de atención al cliente',
    getDB,
    estadoUsuarios,

    async execute(sock, message, args, context) {
        const { from, sender } = context;

        const config = require('../../../config');
        const ownerClean = config.ownerNumber.replace(/:.*@/, '@');
        const senderClean = sender.replace(/:.*@/, '@');

        if (senderClean !== ownerClean) {
            return await sock.sendMessage(from, { text: '❌ Solo el owner puede configurar el menú de atención.' });
        }

        const subcomando = args[0]?.toLowerCase();
        const db = getDB();

        if (!subcomando || subcomando === 'ver') {
            const opciones = db.opciones || [];
            if (!opciones.length) {
                return await sock.sendMessage(from, {
                    text: `📋 No hay menú de atención configurado.\n\nComandos:\n*.atencion activar* — Activa el menú\n*.atencion desactivar* — Desactiva el menú\n*.atencion agregar [opción] | [respuesta]* — Agrega opción\n*.atencion borrar [número]* — Borra opción\n*.atencion titulo [texto]* — Cambia el título`
                });
            }
            let texto = `📋 *Menú actual:*\n\n${db.titulo || 'Menú de atención'}\n\n`;
            opciones.forEach((op, i) => {
                texto += `${i + 1}️⃣ ${op.opcion}\n`;
            });
            texto += `\nEstado: ${db.activo ? '✅ Activo' : '❌ Inactivo'}`;
            return await sock.sendMessage(from, { text: texto });
        }

        if (subcomando === 'activar') {
            db.activo = true;
            saveDB(db);
            return await sock.sendMessage(from, { text: '✅ Menú de atención activado.' });
        }

        if (subcomando === 'desactivar') {
            db.activo = false;
            saveDB(db);
            return await sock.sendMessage(from, { text: '❌ Menú de atención desactivado.' });
        }

        if (subcomando === 'titulo') {
            const titulo = args.slice(1).join(' ');
            if (!titulo) return await sock.sendMessage(from, { text: '❌ Uso: *.atencion titulo [texto]*' });
            db.titulo = titulo;
            saveDB(db);
            return await sock.sendMessage(from, { text: `✅ Título actualizado: *${titulo}*` });
        }

        if (subcomando === 'agregar' || subcomando === 'add') {
            const resto = args.slice(1).join(' ');
            const partes = resto.split('|').map(p => p.trim());
            if (partes.length < 2) {
                return await sock.sendMessage(from, {
                    text: '❌ Uso: *.atencion agregar [opción] | [respuesta]*\nEj: *.atencion agregar Precios | Nuestros precios son...*'
                });
            }
            if (!db.opciones) db.opciones = [];
            db.opciones.push({ opcion: partes[0], respuesta: partes[1] });
            saveDB(db);
            return await sock.sendMessage(from, { text: `✅ Opción agregada: *${partes[0]}*` });
        }

        if (subcomando === 'borrar' || subcomando === 'delete') {
            const num = parseInt(args[1]) - 1;
            if (isNaN(num) || !db.opciones?.[num]) {
                return await sock.sendMessage(from, { text: '❌ Número de opción inválido.' });
            }
            const eliminada = db.opciones.splice(num, 1);
            saveDB(db);
            return await sock.sendMessage(from, { text: `✅ Opción *${eliminada[0].opcion}* eliminada.` });
        }
    }
};