require("dotenv").config();
const axios = require('axios');

const historiales = {};
const MAX_HISTORIAL = 10;

module.exports = {
    name: 'ia',
    aliases: [],
    
    async handleMention(sock, message, pregunta, { from, sender, senderName }) {
        if (!process.env.VENICE_API_KEY) {
            await sock.sendMessage(from, {
                text: `❌ *Error:* No se ha configurado la clave de Venice.`,
                mentions: [sender]
            }, { quoted: message });
            return;
        }

        if (!pregunta || pregunta.trim() === '') {
            await sock.sendMessage(from, {
                text: `🤖 Hola @${senderName}! ¿En qué te puedo ayudar?`,
                mentions: [sender]
            }, { quoted: message });
            return;
        }

        if (!historiales[sender]) historiales[sender] = [];
        historiales[sender].push({ role: 'user', content: pregunta });
        
        if (historiales[sender].length > MAX_HISTORIAL) {
            historiales[sender] = historiales[sender].slice(-MAX_HISTORIAL);
        }

        try {
            await sock.sendMessage(from, { text: `⏳ Pensando...` }, { quoted: message });

            const response = await axios.post(
                'https://api.venice.ai/api/v1/chat/completions',
                {
                    model: 'kimi-k2-5',
                    messages: [
                        {
                            role: 'system',
                            content: `Eres EYTHAN-BOT, un asistente inteligente en WhatsApp. 
                            Respondes de forma clara, directa y en español. 
                            Eres útil, entretenido y respetuoso.
                            El usuario que te habla se llama ${senderName}.`
                        },
                        ...historiales[sender]
                    ],
                    max_tokens: 500,
                    temperature: 0.8
                },
                {
                    headers: {
                        'Authorization': `Bearer ${process.env.VENICE_API_KEY}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            const respuesta = response.data.choices[0].message.content;
            historiales[sender].push({ role: 'assistant', content: respuesta });

            await sock.sendMessage(from, {
                text: `🤖 *EYTHAN-BOT IA*\n\n${respuesta}`,
                mentions: [sender]
            }, { quoted: message });

        } catch (e) {
            console.error('Error IA:', e.response?.data || e.message);
            await sock.sendMessage(from, {
                text: `❌ *Error:* ${e.response?.data?.error?.message || e.message}`,
                mentions: [sender]
            }, { quoted: message });
        }
    }
};