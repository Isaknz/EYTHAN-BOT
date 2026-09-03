const fs = require("fs");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");

ffmpeg.setFfmpegPath(ffmpegPath);

module.exports = {

    name: "toptt",
    aliases: ["ptt"],
    description: "Audio a nota de voz",

    async execute(sock, message, args, ctx) {

        const { from } = ctx;

        try {

            const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;

            if (!quoted) {
                return sock.sendMessage(from, {
                    text: "❌ Responde a un audio"
                });
            }

            await sock.sendMessage(from, {
                text: "🎙️ Convirtiendo audio..."
            });

            const buffer = await sock.downloadMediaMessage({
                key: message.message.extendedTextMessage.contextInfo.stanzaId,
                message: quoted
            });

            const input = "./audio.mp3";
            const output = "./voice.ogg";

            fs.writeFileSync(input, buffer);

            ffmpeg(input)
                .toFormat("ogg")
                .save(output)
                .on("end", async () => {

                    await sock.sendMessage(from, {
                        audio: fs.readFileSync(output),
                        mimetype: "audio/ogg",
                        ptt: true
                    });

                    fs.unlinkSync(input);
                    fs.unlinkSync(output);

                });

        } catch (error) {

            console.error(error);

            await sock.sendMessage(from, {
                text: "❌ Error convirtiendo audio"
            });

        }

    }

};