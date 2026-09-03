const gtts = require("gtts");
const fs = require("fs");
const path = require("path");

// limpiar texto
function limpiarTexto(texto) {

    return texto
        .replace(/[@0-9]/g, "") // quita números y @
        .replace(/[_\-\.]/g, " ") // reemplaza símbolos
        .replace(/\s+/g, " ") // espacios dobles
        .trim();

}

async function generarAudioBienvenida(nombre, grupo) {

    try {

        // limpiar nombre y grupo
        const nombreLimpio =
            limpiarTexto(nombre);

        const grupoLimpio =
            limpiarTexto(grupo);

        const texto =
`Hola ${nombreLimpio}...
Te damos la bienvenida al grupo ${grupoLimpio}...
Soy Eythan, tu asistente virtual 🤖...
Lee las reglas y disfruta tu estadía.`;

        console.log("🎤 Generando audio limpio...");

        const filePath =
            path.join(
                __dirname,
                "../../media",
                `bienvenida-${Date.now()}.mp3`
            );

        return new Promise((resolve) => {

            const tts =
                new gtts(texto, "es");

            tts.save(filePath, () => {

                try {

                    const buffer =
                        fs.readFileSync(filePath);

                    fs.unlinkSync(filePath);

                    console.log("✅ Audio limpio generado");

                    resolve(buffer);

                } catch (err) {

                    console.error(
                        "❌ Error leyendo audio:",
                        err
                    );

                    resolve(null);

                }

            });

        });

    } catch (error) {

        console.error(
            "❌ Error generando audio:",
            error
        );

        return null;

    }

}

module.exports = {
    generarAudioBienvenida
};