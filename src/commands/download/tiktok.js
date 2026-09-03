const axios = require('axios');

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
        
        // Validar URL
        if (!url.includes('tiktok.com') && !url.includes('vm.tiktok.com')) {
            return sock.sendMessage(from, {
                text: "❌ Eso no parece ser un link de TikTok válido."
            });
        }

        try {
            await sock.sendMessage(from, {
                text: "⏳ Descargando video..."
            });

            // Usar API pública para TikTok
            const apiUrl = `https://api.tiklydown.eu.org/api/download?url=${encodeURIComponent(url)}`;
            
            const response = await axios.get(apiUrl, { timeout: 30000 });
            
            if (!response.data || !response.data.video) {
                throw new Error('No se pudo obtener el video');
            }

            const videoUrl = response.data.video;
            
            // Descargar video
            const videoResponse = await axios.get(videoUrl, {
                responseType: 'arraybuffer',
                timeout: 60000
            });
            
            const buffer = Buffer.from(videoResponse.data);

            await sock.sendMessage(from, {
                video: buffer,
                caption: "✅ Descargado con éxito"
            }, { quoted: message });

        } catch (error) {
            console.error("Error en tiktok:", error);
            
            let errorMsg = "Error descargando el video";
            if (error.code === 'ECONNABORTED') errorMsg = "⏱️ Tiempo de espera agotado";
            if (error.response?.status === 404) errorMsg = "❌ Video no encontrado o privado";
            
            await sock.sendMessage(from, {
                text: `❌ ${errorMsg}`
            });
        }
    }
};