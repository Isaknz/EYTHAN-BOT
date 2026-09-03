const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const play = require("play-dl");

module.exports = {
    name: "play",
    aliases: ["musica", "song", "mp3"],
    description: "Buscar y descargar música de YouTube",
    
    async execute(sock, message, args, ctx) {
        const { from } = ctx;
        
        if (!args.length) {
            return sock.sendMessage(from, {
                text: "❌ Escribe el nombre de la canción\n\nEjemplo:\n.play bad bunny"
            });
        }

        const query = args.join(" ");
        const tempFile = path.join(__dirname, `temp_${Date.now()}.mp3`);
        let video = null;

        try {
            await sock.sendMessage(from, {
                text: "🔎 Buscando canción..."
            });

            // Buscar video con timeout
            const searchPromise = play.search(query, {
                limit: 1,
                source: { youtube: "video" }
            });
            
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Timeout')), 10000)
            );
            
            const search = await Promise.race([searchPromise, timeoutPromise]);

            if (!search || search.length === 0) {
                return sock.sendMessage(from, {
                    text: "❌ No se encontró la canción. Intenta con otro nombre."
                });
            }

            video = search[0];
            console.log("Video encontrado:", video.title);

            await sock.sendMessage(from, {
                text: `⬇️ Descargando: *${video.title}*\n⏱️ Esto puede tardar unos segundos...`
            });

            // Descargar con yt-dlp
            await new Promise((resolve, reject) => {
                const command = `yt-dlp -x --audio-format mp3 --audio-quality 0 -o "${tempFile}" "${video.url}"`;
                
                const child = exec(command, { timeout: 120000 }, (error, stdout, stderr) => {
                    if (error) {
                        console.error("yt-dlp error:", stderr || error.message);
                        return reject(error);
                    }
                    resolve();
                });
                
                // Timeout de seguridad
                setTimeout(() => {
                    child.kill();
                    reject(new Error('Download timeout'));
                }, 120000);
            });

            // Verificar archivo
            if (!fs.existsSync(tempFile)) {
                throw new Error('Archivo no descargado');
            }

            const stats = fs.statSync(tempFile);
            if (stats.size === 0) {
                throw new Error('Archivo vacío');
            }

            // Limitar tamaño (WhatsApp tiene límite de 100MB para audios)
            if (stats.size > 50 * 1024 * 1024) {
                fs.unlinkSync(tempFile);
                return sock.sendMessage(from, {
                    text: "❌ El archivo es demasiado grande (>50MB)"
                });
            }

            const buffer = fs.readFileSync(tempFile);

            // Enviar audio
            await sock.sendMessage(from, {
                audio: buffer,
                mimetype: "audio/mpeg",
                ptt: false,
                fileName: `${video.title}.mp3`
            }, { quoted: message });

            await sock.sendMessage(from, {
                text: `✅ *${video.title}*\n⏱️ ${video.durationRaw || "N/A"}\n📦 ${(stats.size / 1024 / 1024).toFixed(2)} MB`
            }, { quoted: message });

        } catch (error) {
            console.error("Error en play:", error);
            
            let errorMsg = "Error descargando la música";
            if (error.message.includes('Timeout')) errorMsg = "⏱️ La descarga tardó demasiado. Intenta con otra canción.";
            if (error.message.includes('not found')) errorMsg = "❌ No se encontró el video.";
            if (error.message.includes('copyright')) errorMsg = "🚫 El video tiene restricciones de copyright.";
            
            await sock.sendMessage(from, {
                text: `❌ ${errorMsg}`
            });
            
        } finally {
            // Limpiar archivo si existe
            if (fs.existsSync(tempFile)) {
                try {
                    fs.unlinkSync(tempFile);
                } catch (e) {
                    console.error('Error borrando archivo:', e);
                }
            }
        }
    }
};