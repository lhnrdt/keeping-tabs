// Writes src/lib/styles/themes.css from the theme palettes (#60): `pnpm themes`.
import { writeFileSync } from 'node:fs';
import { themesCss } from '../src/lib/themes/css.ts';

const target = new URL('../src/lib/styles/themes.css', import.meta.url);
writeFileSync(target, themesCss());
console.log(`Wrote ${target.pathname}`);
