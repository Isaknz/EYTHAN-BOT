const fs = require("fs");
const path = require("path");
const { OpenAI } = require("openai");

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

let handler = async (m, { conn, text, command }) => {

    try {

        // =========================
        // 🎤 .voz
        // =========================

        if (command === "voz") {

            if (!text)
                return m.reply("❌ Escribe el texto que quieres convertir en voz");

            const speech = await openai.audio.speech.create({
                model: "gpt-4o-mini-tts",
                voice: "alloy",
                input: text
            });

            const buffer = Buffer.from(await speech.arrayBuffer());

            await conn.sendMessage(
                m.chat,
                {
                    audio: buffer,
                    mimetype: "audio/mpeg",
                    ptt: true
                },
                { quoted: m }
            );

        }

        // =========================
        // 🎧 .transcribir
        // =========================

        if (command === "transcribir") {

            let q = m.quoted ? m.quoted : m;

            if (!q.msg || !q.msg.mimetype)
                return m.reply("❌ Responde a un audio");

            let mime = q.msg.mimetype;

            if (!/audio/.test(mime))
                return m.reply("❌ Debe ser un audio");

            let media = await q.download();

            let filename = `./tmp/${Date.now()}.ogg`;

            fs.writeFileSync(filename, media);

            const transcription = await openai.audio.transcriptions.create({
                file: fs.createReadStream(filename),
                model: "whisper-1"
            });

            fs.unlinkSync(filename);

            m.reply(`📝 Transcripción:\n\n${transcription.text}`);

        }

        // =========================
        // 🗣️ .voz-ia
        // =========================

        if (command === "voz-ia") {

            if (!text)
                return m.reply("❌ Escribe tu pregunta");

            const completion = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "user",
                        content: text
                    }
                ]
            });

            let respuesta = completion.choices[0].message.content;

            const speech = await openai.audio.speech.create({
                model: "gpt-4o-mini-tts",
                voice: "alloy",
                input: respuesta
            });

            const buffer = Buffer.from(await speech.arrayBuffer());

            await conn.sendMessage(
                m.chat,
                {
                    audio: buffer,
                    mimetype: "audio/mpeg",
                    ptt: true
                },
                { quoted: m }
            );

        }

    } catch (error) {

        console.error(error);

        m.reply("❌ Error en comando de audio");

    }

};

handler.command = [
    "voz",
    "transcribir",
    "voz-ia"
];

module.exports = handler;