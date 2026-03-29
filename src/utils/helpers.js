const fs = require('fs');
const path = require('path');

const helpers = {
    // Verificar si es admin
    isAdmin: async (sock, groupId, userId) => {
        try {
            const groupMetadata = await sock.groupMetadata(groupId);
            const admins = groupMetadata.participants
                .filter(p => p.admin === 'admin' || p.admin === 'superadmin')
                .map(p => p.id);
            return admins.includes(userId);
        } catch (error) {
            return false;
        }
    },

    // Verificar si es owner del bot
    isOwner: (userId, config) => {
        return userId === config.ownerNumber;
    },

    // Formatear número
    formatNumber: (num) => {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },

    // Obtener tiempo formateado
    formatUptime: (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        return `${hours}h ${minutes}m ${secs}s`;
    },

    // Descargar imagen de URL
    downloadImage: async (url) => {
        const axios = require('axios');
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        return Buffer.from(response.data, 'binary');
    },

    // Crear directorio si no existe
    ensureDir: (dirPath) => {
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
    },

    // Limpiar texto
    cleanText: (text) => {
        return text.replace(/[^\w\s]/gi, '').trim();
    },

    // Aleatorio entre min y max
    random: (min, max) => {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    // Seleccionar aleatorio de array
    randomPick: (array) => {
        return array[Math.floor(Math.random() * array.length)];
    },

    // Delay
    delay: (ms) => new Promise(resolve => setTimeout(resolve, ms)),

    // Verificar si archivo existe
    fileExists: (filePath) => {
        return fs.existsSync(filePath);
    },

    // Leer archivo como buffer
    readFile: (filePath) => {
        if (fs.existsSync(filePath)) {
            return fs.readFileSync(filePath);
        }
        return null;
    }
};

module.exports = helpers;