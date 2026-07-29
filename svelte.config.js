import process from 'node:process';
import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { normalizeBasePath } from './scripts/normalize-base-path.js';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter({
			fallback: '404.html'
		}),
		paths: {
			base: normalizeBasePath(process.env.BASE_PATH)
		}
	}
};

export default config;
