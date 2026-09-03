const fs = require("fs");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");

ffmpeg.setFfmpegPath(ffmpegPath);

module.exports = {

    name: "tovideo",
    aliases: ["sticker2video"],
    description: "Sticker animado a video",

    async execute(sock, message, args, ctx) {

        const { from } = ctx;

        try {

            const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;

            if (!quoted || !quoted.stickerMessage) {
                return sock.sendMessage(from, {
                    text: "❌ Responde a un sticker animado"
                });
            }

            await sock.sendMessage(from, {
                text: "🎬 Convirtiendo sticker..."
            });

            const buffer = await sock.downloadMediaMessage({
                key: message.message.extendedTextMessage.contextInfo.stanzaId,
                message: quoted
            });

            const input = "./sticker.webp";
            const output = "./video.mp4";

            fs.writeFileSync(input, buffer);

            ffmpeg(input)
                .outputOptions([
                    "-movflags faststart",
                    "-pix_fmt yuv420p"
                ])
                .toFormat("mp4")
                .save(output)
                .on("end", async () => {

                    await sock.sendMessage(from, {
                        video: fs.readFileSync(output)
                    });

                    fs.unlinkSync(input);
                    fs.unlinkSync(output);

                });

        } catch (error) {

            console.error(error);

            await sock.sendMessage(from, {
                text: "❌ Error convirtiendo sticker"
            });

        }

    }

};