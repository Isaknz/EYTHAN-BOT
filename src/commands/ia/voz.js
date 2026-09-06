const axios = require('axios');
const config = require('../../../config');

module.exports = {
    name: 'voz', aliases: ['tts', 'elevenlabs'], description: 'Convierte texto a voz con ElevenLabs',
    async execute(sock, message, args, { from }) {
        const text = args.join(' ').trim();
        if (!text) return sock.sendMessage(from, { text: '🔊 Uso: *.voz texto para convertir a audio*' });
        if (!config.elevenLabsKey) return sock.sendMessage(from, { text: '❌ No está configurada la API de ElevenLabs.' });
        try {
            const response = await axios.post(`https://api.elevenlabs.io/v1/text-to-speech/${config.elevenLabsVoiceId}`, {
                text,
                model_id: process.env.ELEVENLABS_MODEL || 'eleven_multilingual_v2',
                voice_settings: { stability: 0.5, similarity_boost: 0.75 }
            }, {
                headers: { 'xi-api-key': config.elevenLabsKey, Accept: 'audio/mpeg', 'Content-Type': 'application/json' },
                responseType: 'arraybuffer',
                timeout: 60000
            });
            await sock.sendMessage(from, { audio: Buffer.from(response.data), mimetype: 'audio/mpeg', ptt: true });
        } catch (error) {
            console.error('ElevenLabs:', error.response?.data || error.message);
            await sock.sendMessage(from, { text: `❌ Error de ElevenLabs: ${error.message}` });
        }
    }
};