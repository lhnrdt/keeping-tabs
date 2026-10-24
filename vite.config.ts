import { paraglideVitePlugin } from '@inlang/paraglide-js';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';
import adapter from '@sveltejs/adapter-cloudflare';
import { sveltekit } from '@sveltejs/kit/vite';

// Set by the deploy workflow (see scripts/version.ts); local builds are "0.0.0-dev"
const appVersion = process.env.APP_VERSION || '0.0.0-dev';
if (!/^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?(\+[0-9A-Za-z.-]+)?$/.test(appVersion)) {
	throw new Error(`APP_VERSION is not a semantic version: ${appVersion}`);
}

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			// The adapter reads a build-only config; wrangler.jsonc's entry wraps its output.
			// The dev server still needs wrangler.jsonc's bindings (D1) and .env secrets.
			adapter: adapter({
				config: 'wrangler.adapter.jsonc',
				platformProxy: { configPath: 'wrangler.jsonc' }
			}),
			// Also sent as the x-sveltekit-version header and in /_app/version.json
			version: { name: appVersion },
			// Content Security Policy (#133): only the app's own files; SvelteKit adds nonces for
			// its inline scripts, and app.html's theme script uses %sveltekit.nonce%
			csp: {
				mode: 'auto',
				directives: {
					'default-src': ['self'],
					'script-src': ['self'],
					'style-src': ['self'],
					// style="…" attributes (e.g. view transition names) in server-rendered markup
					'style-src-attr': ['unsafe-inline'],
					'img-src': ['self', 'data:'],
					'font-src': ['self'],
					'connect-src': ['self'],
					'manifest-src': ['self'],
					'worker-src': ['self'],
					'object-src': ['none'],
					'base-uri': ['self'],
					'form-action': ['self'],
					// No framing anywhere: no clickjacking
					'frame-ancestors': ['none']
				}
			}
		}),

		paraglideVitePlugin({
			project: './project.inlang',
			outdir: './src/lib/paraglide',
			emitTsDeclarations: true,
			// A chosen language (cookie) wins, then the browser's languages, then English
			strategy: ['cookie', 'preferredLanguage', 'baseLocale']
		})
	],
	test: {
		expect: { requireAssertions: true },
		projects: [
			{
				extends: './vite.config.ts',
				test: {
					name: 'client',
					browser: {
						enabled: true,
						provider: playwright(),
						instances: [{ browser: 'chromium', headless: true }]
					},
					include: ['src/**/*.svelte.{test,spec}.{js,ts}'],
					exclude: ['src/lib/server/**']
				}
			},

			{
				extends: './vite.config.ts',
				test: {
					name: 'server',
					environment: 'node',
					include: ['src/**/*.{test,spec}.{js,ts}', 'scripts/**/*.spec.ts'],
					exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
				}
			}
		]
	}
});
