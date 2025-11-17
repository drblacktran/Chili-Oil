// @ts-check
/**
 * Astro Configuration
 * PWA, React, and TailwindCSS setup
 *
 * TODO [PHASE 2 - PWA]: Production PWA Icons
 * - Generate PNG icons (192x192, 512x512) from SVG
 * - Add Apple Touch icons for iOS
 * - Create app screenshots for install prompt
 * - See /public/PWA_ICONS_README.md for instructions
 *
 * TODO [PHASE 3 - BUILD]: Production Optimizations
 * - Enable Astro output: 'hybrid' or 'server' for backend
 * - Configure image optimization (@astrojs/image)
 * - Add sitemap generation (@astrojs/sitemap)
 * - Implement compression (Brotli/Gzip)
 *
 * TODO [PHASE 3 - PWA]: Advanced Service Worker
 * - Implement background sync for offline actions
 * - Add push notification support
 * - Cache API responses more intelligently
 * - Implement cache versioning strategy
 * - Add offline fallback page
 *
 * TODO [PHASE 3 - SECURITY]: Security Headers
 * - Add CSP (Content Security Policy)
 * - Configure CORS for API calls
 * - Add security middleware
 * - Implement rate limiting
 *
 * TODO [PHASE 4 - PERFORMANCE]: Performance Monitoring
 * - Integrate Sentry for error tracking
 * - Add Web Vitals monitoring
 * - Configure CDN for assets
 * - Implement lazy loading for heavy components
 */
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import AstroPWA from '@vite-pwa/astro';

// https://astro.build/config
export default defineConfig({
  integrations: [
    react(),
    AstroPWA({
      registerType: 'autoUpdate',
      manifest: {
        name: "Benjamin's Chili Oil - Inventory Management",
        short_name: "BK Chili",
        description: "Inventory and distribution management for Benjamin's Chili Oil",
        theme_color: "#DC2626",
        background_color: "#FFFFFF",
        display: "standalone",
        scope: "/",
        start_url: "/",
        icons: [
          {
            src: "/pwa-icon.svg",
            sizes: "192x192 512x512",
            type: "image/svg+xml",
            purpose: "any maskable"
          }
        ],
        categories: ["business", "productivity"]
        // Note: Add PNG icons and screenshots for production
        // See /public/PWA_ICONS_README.md for instructions
      },
      workbox: {
        // Cache inventory data for offline access
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\/api\/.*/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 // 1 hour
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
              }
            }
          }
        ],
        navigateFallback: null,
        cleanupOutdatedCaches: true
      },
      devOptions: {
        enabled: true,
        type: 'module'
      }
    })
  ],

  vite: {
    plugins: [tailwindcss()]
  }
});