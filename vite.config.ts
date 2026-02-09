import { defineConfig } from 'vite';

export default defineConfig({
    base: './', // Use relative paths for assets (supports GitHub Pages /repo-name/)
    build: {
        outDir: 'dist',
    }
});
