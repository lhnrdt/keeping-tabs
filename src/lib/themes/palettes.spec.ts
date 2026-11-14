import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { contrast } from './contrast';
import { themesCss } from './css';
import { PALETTES, THEME_IDS } from './palettes';
import { AA, colorOf, readingPairs, type Mode } from './reading';

describe.each(THEME_IDS.flatMap((id) => (['light', 'dark'] as const).map((mode) => [id, mode])))(
	'the %s theme, %s',
	(id, mode) => {
		const theme = PALETTES[id as (typeof THEME_IDS)[number]][mode as Mode];
		it.each(readingPairs(mode as Mode).map((pair) => [pair.what, pair] as const))(
			'%s reads well',
			(_, { foreground, background }) => {
				expect(
					contrast(colorOf(theme, mode as Mode, foreground), theme[background])
				).toBeGreaterThanOrEqual(AA);
			}
		);
	}
);

describe('themes.css', () => {
	it('is generated from the palettes (run `pnpm themes` after changing them)', () => {
		const file = readFileSync(new URL('../styles/themes.css', import.meta.url), 'utf8');
		const normalize = (css: string) => css.replace(/\s+/g, ' ').trim();
		expect(normalize(file)).toBe(normalize(themesCss()));
	});
});
