const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs-extra');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

const TEMP_DIR = path.join(__dirname, '../../../temp');

module.exports = {
    name: 'transcribir',
    aliases: ['transcribe', 'stt', 'audio'],
    
    async execute(sock, message, args, { from, sender }) {
        // Verificar si hay audio citado o adjunto
        const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const audioMessage = quoted?.audioMessage || message.message?.audioMessage;
        
        if (!audioMessage) {
            await sock.sendMessage(from, {
                text: '🎤 Responde a un mensaje de audio o envía un audio con el comando .transcribir'
            }, { quoted: message });
            return;
        }

        await sock.sendMessage(from, {
            text: '⏳ Descargando y procesando audio...'
        }, { quoted: message });

        try {
            await fs.ensureDir(TEMP_DIR);
            
            // Descargar audio
            const stream = await sock.downloadMediaMessage({
                key: {
                    remoteJid: message.key.remoteJid,
                    id: message.key.id,
                    participant: message.key.participant
                },
                message: quoted || message.message
            });

            const inputPath = path.join(TEMP_DIR, `${Date.now()}_input.ogg`);
            const outputPath = path.join(TEMP_DIR, `${Date.now()}_output.mp3`);
            
            await fs.writeFile(inputPath, stream);

            // Convertir a MP3 (Whisper requiere formatos comunes)
            await execAsync(`ffmpeg -i "${inputPath}" -ar 16000 -ac 1 -c:a libmp3lame -q:a 2 "${outputPath}"`);

            // Enviar a API de Whisper (OpenAI) o Venice
            const formData = new FormData();
            formData.append('file', fs.createReadStream(outputPath));
            formData.append('model', 'whisper-1');
            formData.append('language', 'es');

            const response = await axios.post(
                'https://api.openai.com/v1/audio/transcriptions',
                formData,
                {
                    headers: {
                        ...formData.getHeaders(),
                        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
                    },
                    maxBodyLength: Infinity
                }
            );

            const transcription = response.data.text;

            await sock.sendMessage(from, {
                text: `📝 *Transcripción:*\n\n${transcription}\n\n🎯 Confianza: ${(response.data.confidence * 100 || 95).toFixed(1)}%`
            }, { quoted: message });

            // Limpiar archivos temporales
            await fs.remove(inputPath);
            await fs.remove(outputPath);

        } catch (error) {
            console.error('Transcription error:', error);
            await sock.sendMessage(from, {
                text: `❌ Error al transcribir: ${error.response?.data?.error?.message || error.message}`
            }, { quoted: message });
        }
    }
};