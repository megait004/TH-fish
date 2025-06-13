import fs from 'fs/promises';
import JScrewIt from 'jscrewit';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const convertString2Unicode = (s) => {
    return s
        .split('')
        .map((char) => {
            const hexVal = char.charCodeAt(0).toString(16);
            return '\\u' + ('000' + hexVal).slice(-4);
        })
        .join('');
};
const processFile = async (filePath) => {
    try {
        const content = await fs.readFile(filePath, 'utf8');
        const template = `document.write('__UNI__')`;
        const unicodeJs = template.replace(/__UNI__/, convertString2Unicode(content));
        const jsfuckCode = JScrewIt.encode(unicodeJs);
        const scriptTag = `<!-- https://t.me/@Giapzech -->\n<script type="text/javascript">${jsfuckCode}</script>`;
        await fs.writeFile(filePath, scriptTag);
        console.log(`Processed: ${filePath}`);
    } catch (err) {
        console.error(`Error processing ${filePath}:`, err);
    }
};

async function main() {
    try {
        const file = path.join(__dirname, 'dist', 'index.html');
        await processFile(file);
    } catch (err) {
        console.error('Fatal error:', err);
    }
}

main();
