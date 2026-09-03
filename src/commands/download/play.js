const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const play = require("play-dl"); // solo para buscar

module.exports = {
    name: "play",
    aliases: ["musica", "song"],
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

        try {
            await sock.sendMessage(from, {
                text: "🔎 Buscando y descargando canción..."
            });

            // Buscar video
            const search = await play.search(query, {
                limit: 1,
                source: { youtube: "video" }
            });

            if (!search || search.length === 0) {
                return sock.sendMessage(from, {
                    text: "❌ No se encontró la canción"
                });
            }

            const video = search[0];
            console.log("Video:", video.title);
            console.log("URL:", video.url);

            // Descargar con yt-dlp
            await new Promise((resolve, reject) => {
                const command = `yt-dlp -x --audio-format mp3 --audio-quality 0 -o "${tempFile}" "${video.url}"`;

                exec(command, (error, stdout, stderr) => {
                    if (error) {
                        console.error("yt-dlp error:", stderr || error.message);
                        return reject(error);
                    }
                    resolve();
                });
            });

            // Verificar que el archivo existe
            if (!fs.existsSync(tempFile)) {
                return sock.sendMessage(from, {
                    text: "❌ No se pudo descargar el audio"
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
                text: `🎵 *${video.title}*\n⏱️ ${video.durationRaw || "N/A"}`
            }, { quoted: message });

            // Borrar archivo temporal
            fs.unlinkSync(tempFile);

        } catch (error) {
            console.error("Error en play:", error.message || error);

            // Limpiar archivo si existe
            if (fs.existsSync(tempFile)) {
                fs.unlinkSync(tempFile);
            }

            await sock.sendMessage(from, {
                text: "❌ Error descargando la música."
            });
        }
    }
};