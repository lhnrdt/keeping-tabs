// Renders the app icon (icon.svg) to the favicon and the PWA / home screen icons.
// Run with `pnpm icons:generate` after changing icon.svg.
import { chromium } from '@playwright/test';
import { readFile, writeFile } from 'node:fs/promises';

const source = await readFile(new URL('./icon.svg', import.meta.url), 'utf8');

/** Rounded for browsers and "any" icons; square where the OS applies its own mask */
const ROUNDED = '112';
const SQUARE = '0';

const svgWith = (radius: string) =>
	source.replace(/<!--[\s\S]*?-->\s*/, '').replace('RADIUS', radius);
const out = (path: string) => new URL(`../../${path}`, import.meta.url);

const PNGS = [
	{ path: 'static/icons/icon-192.png', size: 192, radius: ROUNDED },
	{ path: 'static/icons/icon-512.png', size: 512, radius: ROUNDED },
	{ path: 'static/icons/icon-maskable-512.png', size: 512, radius: SQUARE },
	{ path: 'static/icons/apple-touch-icon.png', size: 180, radius: SQUARE }
];

await writeFile(out('src/lib/assets/favicon.svg'), svgWith(ROUNDED));

const browser = await chromium.launch();
for (const { path, size, radius } of PNGS) {
	const page = await browser.newPage({ viewport: { width: size, height: size } });
	await page.setContent(
		`<body style="margin:0">${svgWith(radius).replace('<svg ', `<svg width="${size}" height="${size}" `)}</body>`
	);
	await writeFile(out(path), await page.screenshot({ omitBackground: true }));
	await page.close();
	console.log(`Wrote ${path}`);
}
await browser.close();
