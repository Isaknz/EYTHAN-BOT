module.exports = {
    botName: 'IsaacDev',
    prefix: '.',
    owner: 'Isaac',
    ownerNumber: '51983569753@s.whatsapp.net',
    botNumber: '', // ← Se llena automáticamente al conectar

    // Claves de API (se cargan desde el archivo .env, nunca las pongas aquí en texto plano)
    anthropicKey: process.env.ANTHROPIC_API_KEY,
    veniceKey: process.env.VENICE_API_KEY,
    openrouterKey: process.env.OPENROUTER_API_KEY,

    // Configuración de imágenes
    assets: {
        logo: './assets/logo.jpeg',
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
        welcome: false,
        goodbye: false,
        antilink: false,
        antispam: false
    }
};