const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const upload = {
    // Subir imagen a imgbb (necesita API key)
    imgbb: async (filePath, apiKey) => {
        try {
            const form = new FormData();
            form.append('image', fs.createReadStream(filePath));
            
            const response = await axios.post(
                `https://api.imgbb.com/1/upload?key=${apiKey}`,
                form,
                { headers: form.getHeaders() }
            );
            
            return response.data.data.url;
        } catch (error) {
            console.error('Error uploading to imgbb:', error);
            return null;
        }
    },

    // Subir a catbox (sin API key)
    catbox: async (filePath) => {
        try {
            const form = new FormData();
            form.append('fileToUpload', fs.createReadStream(filePath));
            form.append('reqtype', 'fileupload');
            
            const response = await axios.post(
                'https://litterbox.catbox.moe/resources/internals/api.php',
                form,
                { headers: form.getHeaders() }
            );
            
            return response.data;
        } catch (error) {
            console.error('Error uploading to catbox:', error);
            return null;
        }
    },

    // Subir buffer temporal
    uploadBuffer: async (buffer, filename = 'file') => {
        const tempPath = `./temp_${Date.now()}_${filename}`;
        fs.writeFileSync(tempPath, buffer);
        
        try {
            const url = await upload.catbox(tempPath);
            fs.unlinkSync(tempPath);
            return url;
        } catch (error) {
            if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
            return null;
        }
    }
};

module.exports = upload;