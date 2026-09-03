const axios = require('axios');

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

        try {
            await sock.sendMessage(from, {
                text: "⏳ Procesando video..."
            });

            // API para Facebook
            const apiUrl = `https://api.savefrom.net/api/facebook?url=${encodeURIComponent(url)}`;
            
            const response = await axios.get(apiUrl, { 
                timeout: 30000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });

            if (!response.data || !response.data.url) {
                throw new Error('No se pudo obtener el video');
            }

            const videoUrl = response.data.url;
            
            const videoResponse = await axios.get(videoUrl, {
                responseType: 'arraybuffer',
                timeout: 60000
            });
            
            const buffer = Buffer.from(videoResponse.data);

            await sock.sendMessage(from, {
                video: buffer,
                caption: "✅ Descargado de Facebook"
            }, { quoted: message });

        } catch (error) {
            console.error("Error en facebook:", error);
            
            await sock.sendMessage(from, {
                text: "❌ No se pudo descargar el video de Facebook.\n\nEl video puede ser privado o requerir login."
            });
        }
    }
};