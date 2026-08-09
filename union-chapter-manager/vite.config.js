import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Union Chapter Manager',
        short_name: 'Chapter',
        description: 'Track members, worksites, contacts, and grievances for your union local.',
        theme_color: '#1f3a5f',
        background_color: '#f4f6f9',
        display: 'standalone',
        start_url: '/',
        scope: '/',
      },
      workbox: {
        skipWaiting: true,
        clientsClaim: true,
        globPatterns: ['**/*.{js,css,html,svg,woff2}'],
        navigateFallback: '/index.html',
      },
    }),
  ],
})
