const fs = require('fs');
const path = require('path');
const config = require('../../../config');

module.exports = {
    name: 'menu',
    aliases: ['help', 'comandos'],

    async execute(sock, message, args, context) {
        const { from, senderName, prefix } = context;

        const menuText = `╔══════════════════════════════╗
║     🤖 *${config.botName} Bot* 🤖        
╚══════════════════════════════╝

👋 Hola *${senderName}*!

🎛️ *GENERALES*
◦ ${prefix}menu — Muestra este menú
◦ ${prefix}start — Presentación del bot
◦ ${prefix}info — Información del bot
◦ ${prefix}ping — Ver latencia del bot

🎮 *DIVERSIÓN*
◦ ${prefix}blackjack — Juega contra el dealer 🃏
◦ ${prefix}misiones — Misiones diarias 🎯
◦ ${prefix}logros — Logros desbloqueados 🏆
◦ ${prefix}8ball — Bola mágica 🎱
◦ ${prefix}Insultar — El bot te insulta 😂
◦ ${prefix}adivina — Adivina el número 🔢
◦ ${prefix}ahorcado — Juego del ahorcado 💀
◦ ${prefix}chiste — Chiste aleatorio 😂
◦ ${prefix}dado — Tira un dado 🎲
◦ ${prefix}gay — Medidor gay 🏳️‍🌈
◦ ${prefix}hug @usuario — Abrazar 🤗
◦ ${prefix}kiss @usuario — Besar 💋
◦ ${prefix}marry @usuario — Casarse 💍
◦ ${prefix}matar @usuario — Matar 🔫
◦ ${prefix}meme — Meme aleatorio 😂
◦ ${prefix}moneda — Cara o sello 🪙
◦ ${prefix}pp — Medidor de pp 😂
◦ ${prefix}pregunta — Pregunta aleatoria 🤔
◦ ${prefix}rate @usuario — Califica a alguien ⭐
◦ ${prefix}rps — Piedra papel tijera ✂️
◦ ${prefix}ruleta — Ruleta rusa 🔫
◦ ${prefix}ship @usuario — Compatibilidad 💕
◦ ${prefix}slap @usuario — Abofetear 👋
◦ ${prefix}sopa — Sopa de letras 🔤
◦ ${prefix}sorteo — Sorteo aleatorio 🎉
◦ ${prefix}trivia — Trivia 🧠
◦ ${prefix}verdadoreto — Verdad o reto 🎯
◦ ${prefix}wordle — Wordle 🟩

🎵 *DESCARGAS*
◦ ${prefix}play [canción] — Audio de YouTube 🎵
◦ ${prefix}yt [video] — Video de YouTube 📹
◦ ${prefix}ytdl [url] — Descargar YouTube ⬇️
◦ ${prefix}spotify [canción] — Buscar en Spotify 🎧
◦ ${prefix}tiktok [url] — Descargar TikTok 🎵
◦ ${prefix}instagram [url] — Descargar Instagram 📸
◦ ${prefix}facebook [url] — Descargar Facebook 📘
◦ ${prefix}imagen [búsqueda] — Buscar imagen 🖼️
◦ ${prefix}gif [búsqueda] — Buscar GIF 🎞️

🛠️ *HERRAMIENTAS*
◦ ${prefix}recordar 30m mensaje — Recordatorio ⏰
◦ ${prefix}recordatorios — Ver tus recordatorios 📋
◦ ${prefix}cancelarrecordatorio ID — Cancelar recordatorio ❌
◦ ${prefix}sticker — Imagen a sticker 🖼️
◦ ${prefix}toimg — Sticker a imagen 🖼️
◦ ${prefix}calc — Calculadora 🔢
◦ ${prefix}qr [texto] — Código QR 📷
◦ ${prefix}translate [idioma] [texto] — Traductor 🌐
◦ ${prefix}clima [ciudad] — Clima actual 🌤️
◦ ${prefix}hora [ciudad] — Hora actual 🕐
◦ ${prefix}delete — Borrar mensaje 🗑️

🤖 *INTELIGENCIA ARTIFICIAL*
◦ ${prefix}ia [pregunta] — Pregunta a la IA 🧠
◦ ${prefix}planificar objetivo — Crea un plan 📅
◦ ${prefix}codigo petición — Genera código 💻
◦ ${prefix}debug error — Depura código 🐞
◦ ${prefix}convertir formato texto — Convierte formatos 🔄
◦ ${prefix}json texto — Estructura JSON 🧾
◦ ${prefix}clasificar texto — Clasifica mensajes 🏷️
◦ ${prefix}moderarmensaje texto — Revisa contenido 🛡️
◦ ${prefix}responder mensaje — Sugiere una respuesta 💬
◦ ${prefix}traduciria idioma texto — Traduce con contexto 🌍
◦ ${prefix}documento texto — Analiza documentos 📄
◦ ${prefix}leertexto — Extrae texto de imagen 🔤
◦ ${prefix}memoria dato — Guarda una preferencia 🧠
◦ ${prefix}agente tarea — Planifica tareas 🤖
◦ ${prefix}olvidar — Reinicia la memoria de la IA 🧹
◦ ${prefix}analizarimagen — Analiza una imagen con IA 🔎
◦ ${prefix}resumir — Resume un texto 📝
◦ ${prefix}corregir — Corrige ortografía ✏️

📊 *ECONOMÍA*
◦ ${prefix}perfil — Ver tu perfil 👤
◦ ${prefix}daily — Recompensa diaria 🎁
◦ ${prefix}ranking — Top de monedas 🏆
◦ ${prefix}transferir @usuario [monto] — Enviar monedas 💸

👥 *GRUPOS* _(solo admins)_
◦ ${prefix}backup — Crear backup (owner) 💾
◦ ${prefix}config — Ver configuración del grupo ⚙️
◦ ${prefix}reglas — Ver reglas del grupo 📜
◦ ${prefix}tagall [mensaje] — Mencionar a todos 📢
◦ ${prefix}listar — Lista de miembros 👥
◦ ${prefix}encuesta pregunta | op1 | op2 — Encuesta 📊
◦ ${prefix}cerrar — Cerrar grupo 🔒
◦ ${prefix}abrir — Abrir grupo 🔓
◦ ${prefix}link — Link de invitación 🔗
◦ ${prefix}revocar — Revocar link 🚫
◦ ${prefix}antilink on/off — Antilink 🚫
◦ ${prefix}antispam on/off — Antispam 🛡️
◦ ${prefix}kick @usuario — Expulsar 🦵
◦ ${prefix}promote @usuario — Dar admin 👑
◦ ${prefix}demote @usuario — Quitar admin ⬇️
◦ ${prefix}welcome — Bienvenida 👋
◦ ${prefix}goodbye — Despedida 👋
◦ ${prefix}warn @usuario — Advertir ⚠️
◦ ${prefix}mute @usuario — Silenciar 🔇
◦ ${prefix}ban @usuario — Banear 🔨
◦ ${prefix}everyone — Mencionar todos 📢
◦ ${prefix}hidetag — Mencionar oculto 👻
◦ ${prefix}setdesc — Cambiar descripción 📝
◦ ${prefix}setsubject — Cambiar nombre 📛
◦ ${prefix}setppgc — Cambiar foto del grupo 🖼️
◦ ${prefix}sorteo — Sorteo en grupo 🎉

🤝 *ATENCIÓN AL CLIENTE*
◦ ${prefix}ar agregar [palabra] | [respuesta]
◦ ${prefix}ar ver — Ver autorespuestas
◦ ${prefix}ar borrar [palabra] — Borrar
◦ ${prefix}atencion activar — Menú de atención
◦ ${prefix}horario activar — Fuera de horario

📱 *Contacto:* ${config.owner}
_Powered by IsaacDev_`;

        try {
            const menuPath = path.resolve(config.assets.menu);
            if (fs.existsSync(menuPath)) {
                await sock.sendMessage(from, {
                    image: fs.readFileSync(menuPath),
                    caption: menuText
                });
            } else {
                await sock.sendMessage(from, { text: menuText });
            }
        } catch (error) {
            console.error('Error enviando menu:', error);
            await sock.sendMessage(from, { text: menuText });
        }
    }
};