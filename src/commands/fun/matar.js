module.exports = {

name: "matar",
aliases: [],
description: "Atacar jugador",

async execute(sock, message, args, ctx) {

const { from } = ctx;

const mentioned =
message.message?.extendedTextMessage?.contextInfo?.mentionedJid;

if (!mentioned) {

return sock.sendMessage(from, {
text: "❌ Menciona a alguien"
});

}

const user = mentioned[0];

const ataques = [
"💣 lanzó una bomba",
"🔪 atacó con cuchillo",
"🔥 quemó",
"⚡ electrocutó",
"💥 explotó"
];

const ataque =
ataques[Math.floor(Math.random() * ataques.length)];

await sock.sendMessage(from, {
text: `⚔️ @${user.split("@")[0]} ${ataque}`,
mentions: [user]
});

}

};