const database = require('../core/database');
const { generarAudioBienvenida } = require('../utils/audio-welcome');

module.exports = async (sock, update) => {
    try {
        const { id, participants, action } = update;

        if (action !== 'add') return;

        const groupSettings = database.getGroup(id);
        
        // 🛡️ Protección contra error
        if (!groupSettings || !groupSettings.welcome) return;

        const metadata = await sock.groupMetadata(id);

        for (let user of participants) {
            // =========================
            // NOMBRE REAL
            // =========================
            let participante = metadata.participants.find(p => p.id === user);
            let nombre = participante?.notify ||
                participante?.name ||
                user.split("@")[0];

            // =========================
            // FOTO PERFIL
            // =========================
            let pp;
            try {
                pp = await sock.profilePictureUrl(user, 'image');
            } catch {
                pp = "https://via.placeholder.com/300x300/4CAF50/FFFFFF?text=User";
            }

            // =========================
            // TEXTO
            // =========================
            let texto = `👋 *BIENVENIDO*\nHola @${nombre}\n🎉 Bienvenido a:\n*${metadata.subject}*\n📜 Lee las reglas\n🤖 Disfruta tu estadía`;

            await sock.sendMessage(id, {
                image: { url: pp },
                caption: texto,
                mentions: [user]
            });

            // =========================
            // AUDIO
            // =========================
            try {
                let audio = await generarAudioBienvenida(nombre, metadata.subject);
                console.log("Audio:", audio ? "SI" : "NO");
                
                if (audio) {
                    await sock.sendMessage(id, {
                        audio: audio,
                        mimetype: "audio/mpeg",
                        ptt: true
                    });
                }
            } catch (e) {
                console.error('Error generando audio:', e.message);
            }
        }
    } catch (error) {
        console.error("Error en group-handler:", error);
    }
};