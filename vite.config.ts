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
        // teacher files / tests are owner-published content: never bundled into the app shell cache
        globIgnores: ['**/teacher-notes/**', '**/tests/**'],
        // never cache the doubt-solver API
        navigateFallbackDenylist: [/^\/api/],
        runtimeCaching: [
          // JSON lists: always try the network first so new notes/tests appear, fall back to the last copy offline
          { urlPattern: ({ url }) => /\/(teacher-notes|tests)\/[^/]+\.json$/.test(url.pathname), handler: 'NetworkFirst', options: { cacheName: 'bb-published-json', networkTimeoutSeconds: 4, expiration: { maxEntries: 40 } } },
          // note photos / PDFs: cached after first view, capped so storage cannot grow without limit
          { urlPattern: ({ url }) => /\/teacher-notes\/[^/]+\.(png|jpe?g|webp|pdf)$/i.test(url.pathname), handler: 'CacheFirst', options: { cacheName: 'bb-published-files', expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30 }, cacheableResponse: { statuses: [200] } } },
        ],
      },
    }),
  ],
});
