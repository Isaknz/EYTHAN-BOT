const fs = require('fs');
const path = require('path');
const database = require('../core/database');
const { generarAudioBienvenida } = require('../utils/audio-welcome');

const FALLBACK_PROFILE_IMAGE = path.join(__dirname, '../../assets/perfil.jpg');

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
            let profileImage;
            try {
                profileImage = { url: await sock.profilePictureUrl(user, 'image') };
            } catch {
                profileImage = fs.readFileSync(FALLBACK_PROFILE_IMAGE);
            }

            // =========================
            // TEXTO
            // =========================
            const storedRules = groupSettings.rules || [];
            const descriptionRules = metadata.desc || metadata.description;
            const rulesText = storedRules.length || descriptionRules
                ? `\n\n📜 *Reglas del grupo*\n${descriptionRules ? `${descriptionRules}\n` : ''}${storedRules.map((rule, index) => `${index + 1}. ${rule}`).join('\n')}`
                : '\n📜 Este grupo todavía no tiene reglas configuradas.';
            let texto = `👋 *BIENVENIDO*\nHola @${nombre}\n🎉 Bienvenido a:\n*${metadata.subject}*${rulesText}\n\n🤖 Disfruta tu estadía`;

            await sock.sendMessage(id, {
                image: profileImage,
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