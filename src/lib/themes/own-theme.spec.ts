import { converter } from 'culori';
import { describe, expect, it } from 'vitest';
import { contrast } from './contrast';
import { ownTheme, ownThemeProperties } from './own-theme';
import { AA, colorOf, readingPairs, type Mode } from './reading';

const PICKED = [
	'#ffff00',
	'#ffffff',
	'#000000',
	'#ff0000',
	'#00ffff',
	'#e05aa0',
	'#2c6d42',
	'#0000ff',
	'#ff8800',
	'#808080'
];

describe.each(PICKED)('a theme of your own from %s (#330)', (picked) => {
	const theme = ownTheme(picked);
	it.each(
		(['light', 'dark'] as Mode[]).flatMap((mode) =>
			readingPairs(mode).map((pair) => [mode, pair.what, pair] as const)
		)
	)('%s: %s reads well', (mode, _, { foreground, background }) => {
		const palette = theme[mode];
		expect(
			contrast(colorOf(palette, mode, foreground), palette[background])
		).toBeGreaterThanOrEqual(AA);
	});
});

it('is in the hue of what was picked, backgrounds too', () => {
	const hue = (hex: string) => converter('oklch')(hex)?.h ?? 0;
	const { light } = ownTheme('#e05aa0');
	for (const color of [light.canvas, light.heroBg, light.accent]) {
		expect(Math.abs(hue(color) - hue('#e05aa0'))).toBeLessThan(15);
	}
});

it('is as vivid as what was picked: a bright green makes a bright green theme', () => {
	const chroma = (hex: string) => converter('oklch')(hex)?.c ?? 0;
	const bright = ownTheme('#3ddc5a');
	const soft = ownTheme('#8fa894');
	expect(chroma(bright.light.heroBg)).toBeGreaterThan(0.15);
	expect(chroma(bright.light.canvas)).toBeGreaterThan(chroma(soft.light.canvas) * 2);
});

it('names its colours the way themes.css does, light and dark', () => {
	const properties = ownThemeProperties('#e05aa0');
	expect(Object.keys(properties)).toContain('--canvas');
	expect(Object.keys(properties)).toContain('--hero-bg-night');
	expect(Object.keys(properties)).toHaveLength(18);
});
