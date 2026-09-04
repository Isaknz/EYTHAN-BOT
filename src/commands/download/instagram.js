const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

module.exports = {
    name: "instagram",
    aliases: ["ig", "insta"],
    description: "Descargar video/foto de Instagram",

    async execute(sock, message, args, ctx) {
        const { from } = ctx;

        if (!args.length) {
            return sock.sendMessage(from, {
                text: "❌ Envía el link de Instagram\n\nEjemplo:\n.ig https://www.instagram.com/p/..."
            });
        }

        const url = args[0];

        if (!url.includes('instagram.com')) {
            return sock.sendMessage(from, {
                text: "❌ Eso no parece ser un link de Instagram válido."
            });
        }

        const tempFile = path.join(__dirname, `ig_${Date.now()}.mp4`);

        try {
            await sock.sendMessage(from, {
                text: "⏳ Descargando..."
            });

            // Requiere que yt-dlp esté instalado en el sistema (pkg/apt/pip install yt-dlp)
            // Nota: posts privados o que requieran login no se podrán descargar sin cookies.
            await new Promise((resolve, reject) => {
                const command = `yt-dlp -f "mp4" -o "${tempFile}" "${url}"`;

                const child = exec(command, { timeout: 90000 }, (error, stdout, stderr) => {
                    if (error) {
                        console.error("yt-dlp error (instagram):", stderr || error.message);
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
                caption: "✅ Descargado de Instagram"
            }, { quoted: message });

        } catch (error) {
            console.error("Error en instagram:", error);

            await sock.sendMessage(from, {
                text: "❌ No se pudo descargar el contenido.\n\nPosibles causas:\n• El post es privado o requiere login\n• El link es inválido\n• \"yt-dlp\" no está instalado en el servidor (pkg install yt-dlp / pip install -U yt-dlp)"
            });
        } finally {
            if (fs.existsSync(tempFile)) {
                try { fs.unlinkSync(tempFile); } catch (e) {}
            }
        }
    }
};