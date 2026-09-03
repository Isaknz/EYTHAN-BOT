const fs = require('fs');
const path = require('path');
const { DateTime } = require('luxon');

const DB_PATH = path.join(__dirname, '../../../data/anuncios.json');

function getDB() {
    if (!fs.existsSync(DB_PATH)) {
        fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
        fs.writeFileSync(DB_PATH, JSON.stringify([]));
    }
    return JSON.parse(fs.readFileSync(DB_PATH));
}

function saveDB(data) {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

function limpiarAnunciosAntiguos() {
    const anuncios = getDB();
    const unAnoAtras = new Date();
    unAnoAtras.setFullYear(unAnoAtras.getFullYear() - 1);

    const anunciosFiltrados = anuncios.filter(a => {
        const fechaCreacion = new Date(a.creadoEn);
        return fechaCreacion >= unAnoAtras;
    });

    if (anunciosFiltrados.length < anuncios.length) {
        saveDB(anunciosFiltrados);
        console.log(`Se eliminaron ${anuncios.length - anunciosFiltrados.length} anuncios antiguos.`);
    }
}

// Iniciar scheduler al cargar el módulo
let sock_ref = null;

function iniciarScheduler(sock) {
    sock_ref = sock;
    setInterval(async () => {
        const ahora = new Date();
        const horaActual = `${String(ahora.getHours()).padStart(2, '0')}:${String(ahora.getMinutes()).padStart(2, '0')}`;
        const diaActual = ahora.toLocaleDateString('es-PE', { weekday: 'long' }).toLowerCase();

        const anuncios = getDB();
        for (const anuncio of anuncios) {
            if (anuncio.hora === horaActual) {
                // Verificar día si tiene programación por días
                if (anuncio.dias && anuncio.dias.length > 0) {
                    if (!anuncio.dias.includes(diaActual)) continue;
                }
                try {
                    if (anuncio.imagen) {
                        await sock_ref.sendMessage(anuncio.grupo, {
                            image: { url: anuncio.imagen },
                            caption: `📢 *Anuncio programado*\n\n${anuncio.mensaje}`
                        });
                    } else {
                        await sock_ref.sendMessage(anuncio.grupo, {
                            text: `📢 *Anuncio programado*\n\n${anuncio.mensaje}`
                        });
                    }
                } catch (e) {
                    console.error('Error enviando anuncio:', e.message);
                    // Notificar al administrador
                    if (anuncio.creadoPor) {
                        try {
                            await sock_ref.sendMessage(anuncio.creadoPor, {
                                text: `⚠️ *Error al enviar tu anuncio programado:*\n` +
                                      `🕐 *Hora:* ${anuncio.hora}\n` +
                                      `💬 *Mensaje:* ${anuncio.mensaje}\n` +
                                      `📌 *Grupo afectado:* ${anuncio.grupo}\n` +
                                      `🔹 *Error:* ${e.message}`
                            });
                        } catch (err) {
                            console.error('Error notificando al administrador:', err.message);
                        }
                    }
                }
            }
        }
    }, 60000); // Revisar cada minuto
}

module.exports = {
    name: 'anuncio',
    aliases: ['anuncios', 'programar'],
    description: 'Programar anuncios automáticos en el grupo',
    iniciarScheduler,

    async execute(sock, message, args, { from, sender, senderName, isGroup }) {
        const subcomando = args[0]?.toLowerCase();

        // .anuncio nuevo HH:MM mensaje [dias:lunes,miércoles] [imagen:url]
        if (subcomando === 'nuevo') {
            const hora = args[1];
            const mensajeParts = args.slice(2);
            let mensaje = '';
            let dias = [];
            let imagen = null;

            // Procesar argumentos para extraer días e imagen
            for (let i = 0; i < mensajeParts.length; i++) {
                if (mensajeParts[i].startsWith('dias:')) {
                    dias = mensajeParts[i].replace('dias:', '').split(',').map(d => d.trim().toLowerCase());
                    mensajeParts.splice(i, 1);
                    i--;
                } else if (mensajeParts[i].startsWith('imagen:')) {
                    imagen = mensajeParts[i].replace('imagen:', '');
                    mensajeParts.splice(i, 1);
                    i--;
                }
            }
            mensaje = mensajeParts.join(' ');

            if (!hora || !mensaje) {
                await sock.sendMessage(from, {
                    text: `📢 *Cómo programar un anuncio:*\n\n` +
                          `*.anuncio nuevo HH:MM "tu mensaje aquí" [dias:lunes,miércoles] [imagen:url_de_la_imagen]*\n\n` +
                          `Ejemplo:\n` +
                          `_.anuncio nuevo 08:00 "¡Buenos días a todos! 🌞" dias:lunes,miércoles imagen:https://ejemplo.com/imagen.jpg_\n\n` +
                          `_Si no especificas días, el anuncio se enviará todos los días._`
                });
                return;
            }

            // Validar formato de hora
            const horaRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
            if (!horaRegex.test(hora)) {
                await sock.sendMessage(from, {
                    text: `❌ Formato de hora inválido. Usa *HH:MM* (ejemplo: 08:00, 14:30)`
                });
                return;
            }

            const anuncios = getDB();
            const nuevoAnuncio = {
                id: Date.now(),
                grupo: from,
                creadoPor: sender,
                creadoPorNombre: senderName,
                hora,
                mensaje,
                dias: dias.length > 0 ? dias : [], // vacío = todos los días
                imagen,
                creadoEn: new Date().toISOString()
            };

            anuncios.push(nuevoAnuncio);
            saveDB(anuncios);
            limpiarAnunciosAntiguos();

            let respuesta = `✅ *Anuncio programado exitosamente!*\n\n` +
                            `🕐 *Hora:* ${hora}\n` +
                            `💬 *Mensaje:* ${mensaje}\n` +
                            `🆔 *ID:* ${nuevoAnuncio.id}\n`;

            if (dias.length > 0) {
                respuesta += `📅 *Días:* ${dias.join(', ')}\n`;
            }
            if (imagen) {
                respuesta += `🖼️ *Imagen:* Programada\n`;
            } else {
                respuesta += `📅 *Frecuencia:* Todos los días\n`;
            }

            respuesta += `_Para cancelarlo usa: .anuncio cancelar ${nuevoAnuncio.id}_`;

            await sock.sendMessage(from, { text: respuesta });
            return;
        }

        // .anuncio lista
        if (subcomando === 'lista') {
            const anuncios = getDB().filter(a => a.grupo === from);

            if (anuncios.length === 0) {
                await sock.sendMessage(from, {
                    text: `📋 No hay anuncios programados en este grupo.\n\nUsa *.anuncio nuevo HH:MM "mensaje"* para crear uno.`
                });
                return;
            }

            let texto = `📋 *Anuncios programados en este grupo:*\n\n`;
            anuncios.forEach((a, i) => {
                texto += `*${i + 1}.* 🕐 ${a.hora} — ${a.mensaje}\n`;
                texto += `   🆔 ID: ${a.id} | 👤 Por: ${a.creadoPorNombre}\n`;
                if (a.dias.length > 0) {
                    texto += `   📅 Días: ${a.dias.join(', ')}\n`;
                } else {
                    texto += `   📅 Frecuencia: Todos los días\n`;
                }
                if (a.imagen) {
                    texto += `   🖼️ Con imagen\n`;
                }
                texto += '\n';
            });
            texto += `_Para cancelar uno: .anuncio cancelar ID_`;

            await sock.sendMessage(from, { text: texto });
            return;
        }

        // .anuncio cancelar ID
        if (subcomando === 'cancelar') {
            const id = parseInt(args[1]);
            if (!id) {
                await sock.sendMessage(from, {
                    text: `❌ Debes indicar el ID del anuncio.\nEjemplo: *.anuncio cancelar 1234567890*\n\nVer IDs con *.anuncio lista*`
                });
                return;
            }

            const anuncios = getDB();
            const index = anuncios.findIndex(a => a.id === id && a.grupo === from);

            if (index === -1) {
                await sock.sendMessage(from, {
                    text: `❌ No encontré un anuncio con ID *${id}* en este grupo.`
                });
                return;
            }

            const anuncioCancelado = anuncios[index];
            anuncios.splice(index, 1);
            saveDB(anuncios);

            await sock.sendMessage(from, {
                text: `✅ Anuncio cancelado exitosamente.\n` +
                      `🆔 *ID:* ${anuncioCancelado.id}\n` +
                      `🕐 *Hora:* ${anuncioCancelado.hora}\n` +
                      `💬 *Mensaje:* ${anuncioCancelado.mensaje}`
            });
            return;
        }

        // Ayuda general
        await sock.sendMessage(from, {
            text: `📢 *Sistema de Anuncios Programados*\n\n` +
                  `*.anuncio nuevo HH:MM "mensaje" [dias:lunes,miércoles] [imagen:url]* — Programar un anuncio\n` +
                  `*.anuncio lista* — Ver anuncios de este grupo\n` +
                  `*.anuncio cancelar ID* — Cancelar un anuncio\n\n` +
                  `_Ejemplo:\n` +
                  `_.anuncio nuevo 20:00 "¡Buenas noches a todos! 🌙" dias:lunes,viernes imagen:https://ejemplo.com/imagen.jpg_`
        });
    }
};