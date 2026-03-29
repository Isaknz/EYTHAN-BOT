# 🤖 IsaacDev Bot

<p align="center">
  <img src="./assets/isaacdev.png" alt="IsaacDev Logo" width="200"/>
</p>

<p align="center">
  <a href="https://github.com/TU-USUARIO/IsaacDev-Bot/stargazers"><img src="https://img.shields.io/github/stars/TU-USUARIO/IsaacDev-Bot?style=for-the-badge&color=yellow" /></a>
  <a href="https://github.com/TU-USUARIO/IsaacDev-Bot/network/members"><img src="https://img.shields.io/github/forks/TU-USUARIO/IsaacDev-Bot?style=for-the-badge&color=blue" /></a>
  <a href="https://github.com/TU-USUARIO/IsaacDev-Bot/issues"><img src="https://img.shields.io/github/issues/TU-USUARIO/IsaacDev-Bot?style=for-the-badge&color=red" /></a>
</p>

<p align="center">
  <b>Bot de WhatsApp multi-funcional basado en Baileys</b><br>
  Creado con ❤️ por IsaacDev
</p>

---

## ✨ Características

| Función | Descripción |
|---------|-------------|
| 🤖 **Presentación** | Logo personalizado al iniciar |
| 📋 **Menú Interactivo** | Imagen de menú con comandos |
| 👋 **Bienvenida** | Foto de perfil del nuevo miembro |
| 👋 **Despedida** | Imagen personalizada al salir |
| 🛡️ **Admin Tools** | Kick, promote, demote, tagall |
| 🎨 **Stickers** | Crea stickers de imágenes |
| 🎮 **Diversión** | Gay, ship, top y más |
| ⚡ **Rápido** | Conexión estable con Baileys |

---

## 🚀 Instalación

### 📱 Termux (Android)

```bash
# 1. Actualizar paquetes
pkg update -y && pkg upgrade -y

# 2. Instalar dependencias
pkg install git nodejs-lts ffmpeg wget tesseract imagemagick -y

# 3. Clonar repositorio
git clone https://github.com/TU-USUARIO/IsaacDev-Bot.git
cd IsaacDev-Bot

# 4. Instalar dependencias de Node
npm install

# 5. Crear carpeta assets y agregar imágenes
mkdir -p assets
# Copia tus imágenes: isaacdev.png, isaacdelete.png, menu.png

# 6. Iniciar bot
npm start
