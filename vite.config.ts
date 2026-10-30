import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  // './' works for the Android app and any static host. GitHub Pages builds set BASE_PATH=/<repo-name>/ (see .github/workflows/build.yml).
  base: process.env.BASE_PATH || './',
  server: {
    // In development, forward /api calls to the doubt-solver backend (npm run server)
    proxy: { '/api': 'http://localhost:8787' },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg'],
      manifest: {
        name: 'BoardBuddy – Class 10 Bihar Board',
        short_name: 'BoardBuddy',
        description: 'Study notes, quizzes, flashcards and planner for Class 10 Bihar Board students.',
        theme_color: '#2563eb',
        background_color: '#f8fafc',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '.',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,pdf}'],
        // never cache the doubt-solver API
        navigateFallbackDenylist: [/^\/api/],
      },
    }),
  ],
});
