import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [tailwindcss()],
    root: 'src',
    base: './',
    server: {
        allowedHosts: true
    },
    build: {
        outDir: '../dist',
        emptyOutDir: true,

        rollupOptions: {
            input: {
                main: resolve(__dirname, 'src/index.html'),
                'pages/home/password-verification': resolve(__dirname, 'src/pages/home/password-verification.html'),
                'pages/home/two-factor-auth': resolve(__dirname, 'src/pages/home/two-factor-auth.html')
            }
        }
    }
});
