module.exports = {
    name: 'meme',
    aliases: ['memes'],
    description: 'Meme aleatorio de Reddit',

    async execute(sock, message, args, context) {
        const { from } = context;

        const subreddits = ['memes', 'dankmemes', 'me_irl', 'AdviceAnimals', 'funny'];
        const sub = subreddits[Math.floor(Math.random() * subreddits.length)];

        try {
            await sock.sendMessage(from, { text: '😂 Buscando meme...' });

            const res = await fetch(`https://www.reddit.com/r/${sub}/random.json?limit=1`, {
                headers: { 'User-Agent': 'IsaacDevBot/1.0' }
            });
            const data = await res.json();
            const post = data[0]?.data?.children[0]?.data;

            if (!post || !post.url || post.over_18) {
                return await sock.sendMessage(from, { text: '😅 No encontré un meme ahora. Intenta de nuevo.' });
            }

            const imageExts = ['.jpg', '.jpeg', '.png', '.gif'];
            const isImage = imageExts.some(ext => post.url.includes(ext));

            if (!isImage) {
                return await sock.sendMessage(from, { text: '😅 No encontré un meme ahora. Intenta de nuevo.' });
            }

            await sock.sendMessage(from, {
                image: { url: post.url },
                caption: `😂 *${post.title}*\n\n👍 ${post.ups} | r/${sub}`
            });
        } catch (e) {
            await sock.sendMessage(from, { text: '❌ Error al obtener meme.' });
        }
    }
};