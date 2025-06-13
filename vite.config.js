import tailwindcss from '@tailwindcss/vite';
import { writeFile } from 'fs/promises';
import { resolve } from 'path';
import { defineConfig } from 'vite';
export default defineConfig({
    plugins: [
        tailwindcss(),
        {
            name: 'create-redirects',
            apply: 'build',

            closeBundle: async () => {
                const filePath = resolve(__dirname, 'dist', '_redirects');
                const content = '/*    /index.html    200';
                try {
                    await writeFile(filePath, content);
                } catch (err) {
                    console.error(err);
                }
            }
        }
    ],
    base: './',
    server: {
        allowedHosts: true
    },
    build: {
        outDir: './dist',
        emptyOutDir: true
    }
});
