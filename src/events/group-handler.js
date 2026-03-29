const fs = require('fs');
const config = require('../../config');
const axios = require('axios');

async function groupParticipantsUpdateHandler(sock, update) {
    const { id, participants, action } = update;
    
    try {
        // Obtener información del grupo
        const groupMetadata = await sock.groupMetadata(id);
        const groupName = groupMetadata.subject;
        
        for (const participant of participants) {
            const userNumber = participant.split('@')[0];
            
            if (action === 'add' && config.groupOptions.welcome) {
                // BIENVENIDA - Usar foto de perfil del usuario
                await handleWelcome(sock, id, participant, groupName);
                
            } else if ((action === 'remove' || action === 'leave') && config.groupOptions.goodbye) {
                // DESPEDIDA - Usar isaacdelete.png
                await handleGoodbye(sock, id, participant, groupName);
            }
        }
        
    } catch (error) {
        console.error('Error en group handler:', error);
    }
}

async function handleWelcome(sock, groupId, participant, groupName) {
    try {
        // Intentar obtener foto de perfil del usuario
        let profilePic;
        try {
            profilePic = await sock.profilePictureUrl(participant, 'image');
        } catch {
            profilePic = null;
        }
        
        const welcomeText = config.messages.welcome(
            `@${participant.split('@')[0]}`, 
            groupName
        );
        
        if (profilePic) {
            // Descargar y enviar foto de perfil con mensaje
            const response = await axios.get(profilePic, { responseType: 'arraybuffer' });
            const buffer = Buffer.from(response.data, 'binary');
            
            await sock.sendMessage(groupId, {
                image: buffer,
                caption: welcomeText,
                mentions: [participant]
            });
        } else {
            // Si no tiene foto, enviar solo texto
            await sock.sendMessage(groupId, {
                text: welcomeText,
                mentions: [participant]
            });
        }
        
        console.log(`👋 Bienvenida enviada a ${participant}`);
        
    } catch (error) {
        console.error('Error en bienvenida:', error);
    }
}

async function handleGoodbye(sock, groupId, participant, groupName) {
    try {
        const goodbyeText = config.messages.goodbye(`@${participant.split('@')[0]}`);
        
        // Verificar si existe isaacdelete.png
        if (fs.existsSync(config.assets.delete)) {
            await sock.sendMessage(groupId, {
                image: fs.readFileSync(config.assets.delete),
                caption: goodbyeText,
                mentions: [participant]
            });
        } else {
            await sock.sendMessage(groupId, {
                text: goodbyeText,
                mentions: [participant]
            });
        }
        
        console.log(`👋 Despedida enviada a ${participant}`);
        
    } catch (error) {
        console.error('Error en despedida:', error);
    }
}

module.exports = { groupParticipantsUpdateHandler };