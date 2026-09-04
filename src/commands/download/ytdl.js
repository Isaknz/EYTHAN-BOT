const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

module.exports = {

    name: "ytdl",
    aliases: ["ytmp4"],
    description: "Descargar video de YouTube",

    async execute(sock, message, args, ctx) {

        const { from } = ctx;

        if (!args[0]) {
            return sock.sendMessage(from, {
                text: "❌ Escribe el link de YouTube\n\nEjemplo:\n.ytdl https://youtu.be/xxxx"
            });
        }

        const url = args[0];

        if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
            return sock.sendMessage(from, {
                text: "❌ Link inválido"
            });
        }

        const tempFile = path.join(__dirname, `ytdl_${Date.now()}.mp4`);

        try {

            await sock.sendMessage(from, {
                text: "⬇️ Descargando video..."
            });

            // --extractor-args fuerza el cliente "android" de YouTube, que evita el
            // bloqueo 403 que YouTube aplica al cliente "web" por defecto (exige PO Token).
            await new Promise((resolve, reject) => {
                const command = `yt-dlp -f "mp4" --extractor-args "youtube:player_client=android" -o "${tempFile}" "${url}"`;

                const child = exec(command, { timeout: 120000 }, (error, stdout, stderr) => {
                    if (error) {
                        console.error("yt-dlp error (ytdl):", stderr || error.message);
                        return reject(error);
                    }
                    resolve();
                });

                setTimeout(() => {
                    child.kill();
                    reject(new Error('Download timeout'));
                }, 120000);
            });

            if (!fs.existsSync(tempFile) || fs.statSync(tempFile).size === 0) {
                throw new Error('Archivo no descargado');
            }

            const buffer = fs.readFileSync(tempFile);

            await sock.sendMessage(from, {
                video: buffer,
                mimetype: "video/mp4"
            });

        } catch (error) {

            console.error(error);

            let errorMsg = "Error descargando video";
            if (error.message.includes('403')) errorMsg = "🚫 YouTube bloqueó la descarga (403). Actualiza yt-dlp con: winget upgrade yt-dlp";
            if (error.message.includes('Timeout') || error.message.includes('timeout')) errorMsg = "⏱️ La descarga tardó demasiado.";

            await sock.sendMessage(from, {
                text: `❌ ${errorMsg}`
            });

        } finally {
            if (fs.existsSync(tempFile)) {
                try { fs.unlinkSync(tempFile); } catch (e) {}
            }
        }

    }

};