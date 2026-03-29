module.exports = {
    botName: 'IsaacDev',
    prefix: '.',
    owner: 'Isaac',
    ownerNumber: '51983569753@s.whatsapp.net',
    
    // Configuración de imágenes
    assets: {
        logo: './assets/isaacdev.png',
        delete: './assets/isaacdelete.png',
        menu: './assets/menu.png'
    },
    
    // Mensajes personalizados
    messages: {
        welcome: (name, group) => `¡Bienvenido/a *${name}* al grupo *${group}*! 🎉\n\nSoy *IsaacDev*, tu asistente virtual. Escribe *.menu* para ver mis comandos.`,
        goodbye: (name) => `Adiós *${name}* 👋\n\nEsperamos verte pronto.`,
        presentation: `¡Hola! Soy *IsaacDev* 🤖\n\nTu bot de WhatsApp personalizado.`
    },
    
    // Opciones de grupo
    groupOptions: {
        welcome: true,
        goodbye: true,
        antilink: false,
        antispam: false
    }
};