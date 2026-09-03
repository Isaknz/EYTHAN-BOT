const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

const TEMP_DIR = path.join(__dirname, '../../../temp');

module.exports = {
    name: 'imagen',
    aliases: ['img', 'gen', 'generate', 'draw'],
    
    async handleCommand(sock, message, args, { from, sender }) {
        const prompt = args.join(' ');
        
        if (!prompt) {
            await sock.sendMessage(from, {
                text: '🎨 *Generador de Imágenes*\n\nUso: .imagen <descripción>\n\nEjemplos:\n.imagen un dragón rojo volando sobre una ciudad\n.imagen retrato de un gato astronauta, estilo anime\n\n⚡ Powered by Venice AI'
            }, { quoted: message });
            return;
        }

        if (!process.env.VENICE_API_KEY) {
            await sock.sendMessage(from, {
                text: '❌ No está configurada la API de Venice.'
            }, { quoted: message });
            return;
        }

        await sock.sendMessage(from, {
            text: '⏳ Generando imagen... Esto puede tardar 10-30 segundos.'
        }, { quoted: message });

        try {
            const response = await axios.post(
                'https://api.venice.ai/api/v1/image/generate',
                {
                    prompt: prompt,
                    model: 'chroma',
                    width: 1024,
                    height: 1024,
                    steps: 20,
                    cfg_scale: 7.5
                },
                {
                    headers: {
                        'Authorization': `Bearer ${process.env.VENICE_API_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 60000
                }
            );

            if (!response.data.images || response.data.images.length === 0) {
                throw new Error('No se generó ninguna imagen');
            }

            // La imagen viene en base64
            const imageBuffer = Buffer.from(response.data.images[0], 'base64');
            
            await fs.ensureDir(TEMP_DIR);
            const tempPath = path.join(TEMP_DIR, `gen_${Date.now()}.png`);
            await fs.writeFile(tempPath, imageBuffer);

            await sock.sendMessage(from, {
                image: { url: tempPath },
                caption: `🎨 *Prompt:* ${prompt}\n\n✨ Generado por Venice AI`
            }, { quoted: message });

            // Limpiar después de enviar
            setTimeout(() => fs.remove(tempPath).catch(() => {}), 60000);

        } catch (error) {
            console.error('Image generation error:', error.response?.data || error);
            
            let errorMsg = 'Error al generar la imagen';
            if (error.response?.data?.error) {
                errorMsg = error.response.data.error;
            } else if (error.message.includes('timeout')) {
                errorMsg = 'Tiempo de espera agotado. Intenta con una descripción más simple.';
            }
            
            await sock.sendMessage(from, {
                text: `❌ ${errorMsg}`
            }, { quoted: message });
        }
    }
};