const config = require('../../../config');

module.exports = {
    name: 'insultar',
    aliases: ['insult', 'roast'],
    description: 'El bot te insulta 😂',

    async execute(sock, message, args, context) {

        const { from, senderName } = context;

        const insultos = [
            `${senderName}, eres tan lento que hasta una tortuga te adelanta 🐢💨`,
            `${senderName}, eres más feo que unas bragas marrones 😂`,
            `${senderName}, eres más vago que el sastre de Tarzán 🤖❌`,
            `${senderName}, ni pa que gastar palabras en ti`,
            `${senderName}, tu cerebro tiene más bugs que un código roto 🐛💻`
        ];

        const imagenes = [
            'https://i.imgur.com/W4OUEPP.gif',
            'https://i.imgur.com/s7gEDJD.gif',
            'https://i.imgur.com/QHxsTqn.gif',
            'https://i.imgur.com/zAJ7GqX.gif'
        ];

        const insulto =
            insultos[Math.floor(Math.random() * insultos.length)];

        const imagen =
            imagenes[Math.floor(Math.random() * imagenes.length)];

        try {

            await sock.sendMessage(from, {

                video: { url: imagen },

                gifPlayback: true,

                caption:
`💀 *INSULTO DEL DÍA* 💀

${insulto}

_con cariño, IsaacDev 🤖_`

            });

        } catch (e) {

            console.log("Error enviando imagen:", e);

            await sock.sendMessage(from, {

                text:
`💀 *INSULTO DEL DÍA* 💀

${insulto}

_con cariño, IsaacDev 🤖_`

            });

        }

    }

};