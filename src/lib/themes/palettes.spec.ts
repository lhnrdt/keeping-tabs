import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { contrast } from './contrast';
import { themesCss } from './css';
import { MEANING, PALETTES, THEME_IDS } from './palettes';

/** WCAG 2.1 AA for normal text */
const AA = 4.5;

describe.each(THEME_IDS.flatMap((id) => (['light', 'dark'] as const).map((mode) => [id, mode])))(
	'the %s theme, %s',
	(id, mode) => {
		const p = PALETTES[id as (typeof THEME_IDS)[number]][mode as 'light' | 'dark'];
		const meaning = MEANING[mode as 'light' | 'dark'];
		// Filled buttons: paper on the accent in light mode, the background in dark mode
		const onAccent = mode === 'light' ? p.surface : p.canvas;

		it.each([
			['text on the background', p.ink, p.canvas],
			['text on cards', p.ink, p.surface],
			['secondary text on the background', p.inkMuted, p.canvas],
			['secondary text on cards', p.inkMuted, p.surface],
			['secondary text on quiet surfaces', p.inkMuted, p.surfaceMuted],
			['links on the background', p.accent, p.canvas],
			['links on cards', p.accent, p.surface],
			['text on filled buttons', onAccent, p.accent],
			["the header's text", p.heroFg, p.heroBg],
			['"owed to you" on cards', meaning.positive, p.surface],
			['"owed to you" in the header', meaning.positive, p.heroBg],
			['"you owe" on cards', meaning.negative, p.surface],
			['"you owe" in the header', meaning.negative, p.heroBg],
			['delete on cards', meaning.destructive, p.surface]
		])('%s reads well', (_, foreground, background) => {
			expect(contrast(foreground, background)).toBeGreaterThanOrEqual(AA);
		});
	}
);

describe('themes.css', () => {
	it('is generated from the palettes (run `pnpm themes` after changing them)', () => {
		const file = readFileSync(new URL('../styles/themes.css', import.meta.url), 'utf8');
		const normalize = (css: string) => css.replace(/\s+/g, ' ').trim();
		expect(normalize(file)).toBe(normalize(themesCss()));
	});
});
