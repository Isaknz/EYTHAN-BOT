require("dotenv").config();
const axios = require('axios');
const config = require('../../../config');

const historiales = {};
const MAX_HISTORIAL = 10;

// Modelo gratuito de OpenRouter. Cámbialo si prefieres uno de pago (ej: "openai/gpt-4o-mini").
// Lista completa de modelos: https://openrouter.ai/models
const MODEL = "openrouter/free";

module.exports = {
    name: 'ia',
    aliases: ['ai', 'venice'],

    async handleMention(sock, message, pregunta, { from, sender, senderName }) {
        // Verificar API key
        if (!config.openrouterKey) {
            await sock.sendMessage(from, {
                text: `❌ *Error:* No se ha configurado la clave de OpenRouter.\n\nContacta al administrador.`,
                mentions: [sender]
            }, { quoted: message });
            return;
        }

        // Validar pregunta
        if (!pregunta || pregunta.trim() === '') {
            await sock.sendMessage(from, {
                text: `🤖 Hola @${senderName}! ¿En qué te puedo ayudar?\n\nMencióname y escribe tu pregunta.`,
                mentions: [sender]
            }, { quoted: message });
            return;
        }

        // Inicializar historial
        if (!historiales[sender]) historiales[sender] = [];
        historiales[sender].push({ role: 'user', content: pregunta });

        // Limitar historial
        if (historiales[sender].length > MAX_HISTORIAL) {
            historiales[sender] = historiales[sender].slice(-MAX_HISTORIAL);
        }

        try {
            await sock.sendMessage(from, {
                text: `⏳ Pensando...`
            }, { quoted: message });

            const response = await axios.post(
                'https://openrouter.ai/api/v1/chat/completions',
                {
                    model: MODEL,
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
                    max_tokens: 800,
                    temperature: 0.8
                },
                {
                    headers: {
                        'Authorization': `Bearer ${config.openrouterKey}`,
                        'Content-Type': 'application/json',
                        // Opcionales, pero recomendados por OpenRouter para identificar tu app:
                        'HTTP-Referer': 'https://github.com/Isaknz/EYTHAN-BOT',
                        'X-Title': 'EYTHAN-BOT'
                    },
                    timeout: 30000
                }
            );

            const respuesta = response.data.choices[0].message.content;

            // Guardar respuesta en historial
            historiales[sender].push({ role: 'assistant', content: respuesta });

            await sock.sendMessage(from, {
                text: `🤖 *EYTHAN-BOT IA*\n\n${respuesta}`,
                mentions: [sender]
            }, { quoted: message });

        } catch (e) {
            console.error('Error IA:', e.response?.data || e.message);

            let errorMsg = e.response?.data?.error?.message || e.message;
            if (e.code === 'ECONNABORTED') errorMsg = 'Tiempo de espera agotado';
            if (e.response?.status === 401) errorMsg = 'API key inválida';
            if (e.response?.status === 429) errorMsg = 'Demasiadas solicitudes o sin créditos. Espera un momento o revisa tu saldo en openrouter.ai/settings/credits';

            await sock.sendMessage(from, {
                text: `❌ *Error:* ${errorMsg}`,
                mentions: [sender]
            }, { quoted: message });
        }
    },

    // Comando directo .ia
    async execute(sock, message, args, { from, sender, senderName }) {
        const pregunta = args.join(' ');
        await this.handleMention(sock, message, pregunta, { from, sender, senderName });
    }
};