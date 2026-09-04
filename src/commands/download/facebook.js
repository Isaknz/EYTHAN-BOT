const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

module.exports = {
    name: "facebook",
    aliases: ["fb", "fbdl"],
    description: "Descargar video de Facebook",

    async execute(sock, message, args, ctx) {
        const { from } = ctx;

        if (!args.length) {
            return sock.sendMessage(from, {
                text: "❌ Envía el link de Facebook\n\nEjemplo:\n.fb https://www.facebook.com/..."
            });
        }

        const url = args[0];

        if (!url.includes('facebook.com') && !url.includes('fb.watch')) {
            return sock.sendMessage(from, {
                text: "❌ Eso no parece ser un link de Facebook válido."
            });
        }

        const tempFile = path.join(__dirname, `fb_${Date.now()}.mp4`);

        try {
            await sock.sendMessage(from, {
                text: "⏳ Procesando video..."
            });

            // Requiere que yt-dlp esté instalado en el sistema (pkg/apt/pip install yt-dlp)
            await new Promise((resolve, reject) => {
                const command = `yt-dlp -f "mp4" -o "${tempFile}" "${url}"`;

                const child = exec(command, { timeout: 90000 }, (error, stdout, stderr) => {
                    if (error) {
                        console.error("yt-dlp error (facebook):", stderr || error.message);
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
                caption: "✅ Descargado de Facebook"
            }, { quoted: message });

        } catch (error) {
            console.error("Error en facebook:", error);

            await sock.sendMessage(from, {
                text: "❌ No se pudo descargar el video de Facebook.\n\nEl video puede ser privado, requerir login, o \"yt-dlp\" no está instalado en el servidor (pkg install yt-dlp / pip install -U yt-dlp)."
            });
        } finally {
            if (fs.existsSync(tempFile)) {
                try { fs.unlinkSync(tempFile); } catch (e) {}
            }
        }
    }
};