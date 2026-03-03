import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit(),
		VitePWA({
			registerType: 'autoUpdate',
			includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'icons/icon-192.png', 'icons/icon-512.png'],
			manifest: {
				name: 'ポケモンリボン制覇トラッカー',
				short_name: 'リボントラッカー',
				description: 'ポケモンのリボンコンプリートを効率よく管理・計画するツール',
				lang: 'ja',
				theme_color: '#3b4cca',
				background_color: '#ffffff',
				display: 'standalone',
				display_override: ['window-controls-overlay', 'standalone', 'minimal-ui'],
				orientation: 'portrait-primary',
				start_url: '/',
				scope: '/',
				categories: ['games', 'utilities'],
				icons: [
					{
						src: 'icons/icon-192.png',
						sizes: '192x192',
						type: 'image/png',
						purpose: 'any'
					},
					{
						src: 'icons/icon-512.png',
						sizes: '512x512',
						type: 'image/png',
						purpose: 'any'
					},
					{
						src: 'icons/icon-512.png',
						sizes: '512x512',
						type: 'image/png',
						purpose: 'maskable'
					}
				]
			},
			workbox: {
				globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff2}'],
				navigateFallback: '/index.html',
				navigateFallbackDenylist: [/^\/api\//],
				runtimeCaching: [
					{
						urlPattern: /^https:\/\/raw\.githubusercontent\.com\/.*/i,
						handler: 'CacheFirst',
						options: {
							cacheName: 'pokemon-images',
							expiration: { maxEntries: 1000, maxAgeSeconds: 60 * 60 * 24 * 30 }
						}
					}
				]
			},
			devOptions: { enabled: false }
		})
	]
});
