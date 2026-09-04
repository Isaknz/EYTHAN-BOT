const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

module.exports = {
    name: "tiktok",
    aliases: ["tt", "tktk"],
    description: "Descargar video de TikTok",

    async execute(sock, message, args, ctx) {
        const { from } = ctx;

        if (!args.length) {
            return sock.sendMessage(from, {
                text: "❌ Envía el link de TikTok\n\nEjemplo:\n.tiktok https://vm.tiktok.com/..."
            });
        }

        const url = args[0];

        if (!url.includes('tiktok.com')) {
            return sock.sendMessage(from, {
                text: "❌ Eso no parece ser un link de TikTok válido."
            });
        }

        const tempFile = path.join(__dirname, `tt_${Date.now()}.mp4`);

        try {
            await sock.sendMessage(from, {
                text: "⏳ Descargando video..."
            });

            // Requiere que yt-dlp esté instalado en el sistema (pkg/apt/pip install yt-dlp)
            await new Promise((resolve, reject) => {
                const command = `yt-dlp -f "mp4" -o "${tempFile}" "${url}"`;

                const child = exec(command, { timeout: 90000 }, (error, stdout, stderr) => {
                    if (error) {
                        console.error("yt-dlp error (tiktok):", stderr || error.message);
                        return reject(error);
                    }
                    resolve();
                });

                setTimeout(() => {
                    child.kill();
                    reject(new Error('Download timeout'));
                }, 90000);
            });

            if (!fs.existsSync(tempFile) || fs.statSync(tempFile).size === 0) {
                throw new Error('Archivo no descargado');
            }

            const buffer = fs.readFileSync(tempFile);

            await sock.sendMessage(from, {
                video: buffer,
                caption: "✅ Descargado con éxito"
            }, { quoted: message });

        } catch (error) {
            console.error("Error en tiktok:", error);

            let errorMsg = "Error descargando el video";
            if (error.message.includes('Timeout') || error.message.includes('timeout')) errorMsg = "⏱️ Tiempo de espera agotado";
            if (error.message.toLowerCase().includes('private')) errorMsg = "❌ Video no encontrado o privado";

            await sock.sendMessage(from, {
                text: `❌ ${errorMsg}\n\n💡 Verifica que "yt-dlp" esté instalado en el servidor (pkg install yt-dlp / pip install -U yt-dlp).`
            });
        } finally {
            if (fs.existsSync(tempFile)) {
                try { fs.unlinkSync(tempFile); } catch (e) {}
            }
        }
    }
};