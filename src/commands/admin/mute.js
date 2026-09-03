const fs = require("fs");

const FILE = "./mute.json";

function load() {

    if (!fs.existsSync(FILE)) {
        fs.writeFileSync(FILE, JSON.stringify({}));
    }

    return JSON.parse(fs.readFileSync(FILE));
}

function save(data) {

    fs.writeFileSync(FILE, JSON.stringify(data, null, 2));

}

module.exports = {

    name: "mute",
    aliases: [],
    description: "Silenciar usuario",

    async execute(sock, message, args, ctx) {

        const { from } = ctx;

        try {

            const mentioned = message.message?.extendedTextMessage?.contextInfo?.mentionedJid;

            if (!mentioned) {
                return sock.sendMessage(from, {
                    text: "❌ Menciona usuario"
                });
            }

            const user = mentioned[0];

            const db = load();

            db[user] = true;

            save(db);

            await sock.sendMessage(from, {
                text: "🔇 Usuario silenciado"
            });

        } catch (error) {

            console.error(error);

        }

    }

};