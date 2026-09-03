const axios = require('axios');

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

        try {
            await sock.sendMessage(from, {
                text: "⏳ Descargando..."
            });

            // API alternativa para Instagram
            const apiUrl = `https://api.instagram.com/oembed?url=${encodeURIComponent(url)}`;
            
            // Intentar con savefrom o similar
            const saveFromUrl = `https://savefrom.net/api/instagram?url=${encodeURIComponent(url)}`;
            
            const response = await axios.get(saveFromUrl, { 
                timeout: 30000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });

            if (!response.data || !response.data.url) {
                throw new Error('No se pudo obtener el contenido');
            }

            const mediaUrl = response.data.url;
            
            // Descargar media
            const mediaResponse = await axios.get(mediaUrl, {
                responseType: 'arraybuffer',
                timeout: 60000
            });
            
            const buffer = Buffer.from(mediaResponse.data);
            const isVideo = mediaUrl.includes('.mp4');

            if (isVideo) {
                await sock.sendMessage(from, {
                    video: buffer,
                    caption: "✅ Descargado de Instagram"
                }, { quoted: message });
            } else {
                await sock.sendMessage(from, {
                    image: buffer,
                    caption: "✅ Descargado de Instagram"
                }, { quoted: message });
            }

        } catch (error) {
            console.error("Error en instagram:", error);
            
            await sock.sendMessage(from, {
                text: "❌ No se pudo descargar el contenido.\n\nPosibles causas:\n• El post es privado\n• Requiere login\n• El link es inválido"
            });
        }
    }
};