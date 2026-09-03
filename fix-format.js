const fs = require('fs');
const path = require('path');

// Patrones a corregir
const patterns = [
    // Declaraciones const sin espacio
    { regex: /const([a-zA-Z_][a-zA-Z0-9_]*)(?=\s*=)/g, replacement: 'const $1' },
    
    // Declaraciones let sin espacio  
    { regex: /let([a-zA-Z_][a-zA-Z0-9_]*)(?=\s*=)/g, replacement: 'let $1' },
    
    // Declaraciones var sin espacio
    { regex: /var([a-zA-Z_][a-zA-Z0-9_]*)(?=\s*=)/g, replacement: 'var $1' },
    
    // async function sin espacio
    { regex: /async([a-zA-Z_][a-zA-Z0-9_]*)(?=\()/g, replacement: 'async $1' },
    
    // await sin espacio
    { regex: /await([a-zA-Z_][a-zA-Z0-9_]*)(?=\()/g, replacement: 'await $1' },
    
    // new Promise sin espacio
    { regex: /new([A-Z][a-zA-Z0-9_]*)/g, replacement: 'new $1' },
    
    // typeof sin espacio
    { regex: /typeof([a-zA-Z_][a-zA-Z0-9_]*)/g, replacement: 'typeof $1' },
    
    // instanceof sin espacio
    { regex: /instanceof([a-zA-Z_][a-zA-Z0-9_]*)/g, replacement: 'instanceof $1' },
    
    // delete sin espacio
    { regex: /delete([a-zA-Z_][a-zA-Z0-9_]*)/g, replacement: 'delete $1' },
    
    // return sin espacio
    { regex: /return([a-zA-Z_][a-zA-Z0-9_]*)/g, replacement: 'return $1' },
    
    // throw sin espacio
    { regex: /throw([a-zA-Z_][a-zA-Z0-9_]*)/g, replacement: 'throw $1' },
    
    // case sin espacio
    { regex: /case([a-zA-Z_][a-zA-Z0-9_]*):/g, replacement: 'case $1:' },
    
    // typeof sin espacio antes de paréntesis
    { regex: /typeof\s*\(/g, replacement: 'typeof (' },
    
    // await sin espacio antes de paréntesis
    { regex: /await\s*\(/g, replacement: 'await (' }
];

function fixFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    let changes = 0;
    
    patterns.forEach(({ regex, replacement }) => {
        const matches = content.match(regex);
        if (matches) {
            changes += matches.length;
            content = content.replace(regex, replacement);
        }
    });
    
    // Corregir backslashes escapados innecesariamente
    content = content.replace(/\\\\n/g, '\\n');
    content = content.replace(/\\\\t/g, '\\t');
    
    // Corregir templates strings mal formateados
    content = content.replace(/\\`([^`]*?)\\`/g, '`$1`');
    
    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Corregido: ${filePath} (${changes} cambios)`);
        return changes;
    }
    
    return 0;
}

function walkDir(dir, callback) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            // Ignorar node_modules y session
            if (file !== 'node_modules' && file !== 'session' && file !== '.git') {
                walkDir(filePath, callback);
            }
        } else if (file.endsWith('.js')) {
            callback(filePath);
        }
    }
}

// Ejecutar
console.log('🔧 Corrigiendo archivos JS...\n');

let totalChanges = 0;
let totalFiles = 0;

walkDir('./src', (filePath) => {
    const changes = fixFile(filePath);
    if (changes > 0) {
        totalFiles++;
        totalChanges += changes;
    }
});

console.log(`\n✅ Listo! ${totalFiles} archivos corregidos con ${totalChanges} cambios totales.`);