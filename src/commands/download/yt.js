const yts = require("yt-search");

module.exports = {
    name: "yt",
    aliases: ["youtube", "buscar"],
    description: "Buscar video en YouTube",
    
    async execute(sock, message, args, ctx) {
        const { from } = ctx;
        
        if (!args.length) {
            return sock.sendMessage(from, {
                text: "❌ Escribe qué quieres buscar\n\nEjemplo:\n.yt bad bunny"
            });
        }

        try {
            const query = args.join(" ");
            
            await sock.sendMessage(from, {
                text: "🔎 Buscando..."
            });

            // Buscar con timeout
            const searchPromise = yts(query);
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Timeout')), 15000)
            );
            
            const search = await Promise.race([searchPromise, timeoutPromise]);

            if (!search || !search.videos || search.videos.length === 0) {
                return sock.sendMessage(from, {
                    text: "❌ No se encontraron resultados."
                });
            }

            const video = search.videos[0];
            
            const text = `
🎬 *${video.title}*
👤 Canal: ${video.author.name}
⏱️ Duración: ${video.timestamp}
👁️ Vistas: ${video.views.toLocaleString()}
📅 Subido: ${video.ago}
🔗 ${video.url}
            `.trim();

            await sock.sendMessage(from, {
                image: { url: video.thumbnail },
                caption: text
            }, { quoted: message });

        } catch (error) {
            console.error("Error en yt:", error);
            
            let errorMsg = "Error en búsqueda";
            if (error.message === 'Timeout') errorMsg = "⏱️ La búsqueda tardó demasiado. Intenta de nuevo.";
            
            await sock.sendMessage(from, {
                text: `❌ ${errorMsg}`
            });
        }
    }
};