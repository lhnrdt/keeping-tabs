// A theme of your own (#330), made from one colour you pick: the background, cards, header, text
// and accent, light and dark, all in its hue and as vivid as it is, laid out as light and dark as
// a nature theme's. Whatever then doesn't read well enough (WCAG AA, as every nature theme is
// checked) is made darker or lighter.
import { clampChroma, converter, formatHex, type Oklch } from 'culori';
import { contrast } from './contrast';
import { NAMES } from './css';
import { PALETTES, type Palette } from './palettes';
import { AA, colorOf, readingPairs, type Mode } from './reading';

/** The theme whose lightness each colour keeps, so it's laid out like the others */
const TEMPLATE = PALETTES.forest;
const STEP = 0.01;

const oklch = (hex: string): Oklch => converter('oklch')(hex) ?? { mode: 'oklch', l: 0.5, c: 0 };
const hex = (color: Oklch) => formatHex(clampChroma(color, 'oklch'));

/**
 * How much of the picked colour's vividness each part gets: a bright, saturated pick makes a
 * bright, saturated theme, a soft one a soft theme. The light header is the picked colour itself.
 */
const SHARE: Record<Mode, Record<keyof Palette, number>> = {
	light: {
		canvas: 0.12,
		surface: 0.03,
		surfaceMuted: 0.18,
		ink: 0.12,
		inkMuted: 0.18,
		accent: 1,
		accentSoft: 0.6,
		heroBg: 1,
		heroFg: 0.4
	},
	dark: {
		canvas: 0.14,
		surface: 0.12,
		surfaceMuted: 0.15,
		ink: 0.06,
		inkMuted: 0.1,
		accent: 1,
		accentSoft: 0.5,
		heroBg: 0.6,
		heroFg: 0.3
	}
};

/** How light each part is: the template's, but the accent and the light header are the pick's */
function lightness(mode: Mode, key: keyof Palette, template: number, picked: number) {
	if (key === 'accent') return picked;
	if (mode === 'light' && key === 'heroBg') return Math.min(Math.max(picked, 0.7), 0.93);
	if (mode === 'dark' && key === 'heroBg') return Math.min(Math.max(picked * 0.5, 0.25), 0.4);
	return template;
}

/** Lighter or darker, a step at a time, until it reads against the other side */
function nudge(color: string, against: string, lighter: boolean) {
	const base = oklch(color);
	for (let l = base.l; l >= 0 && l <= 1; l += lighter ? STEP : -STEP) {
		const next = hex({ ...base, l });
		if (contrast(next, against) >= AA) return next;
	}
	return lighter ? '#ffffff' : '#000000';
}

function themeIn(mode: Mode, picked: Oklch): Palette {
	const palette = Object.fromEntries(
		Object.entries(TEMPLATE[mode]).map(([key, value]) => {
			const part = key as keyof Palette;
			const l = lightness(mode, part, oklch(value).l, picked.l);
			return [part, hex({ mode: 'oklch', l, c: picked.c * SHARE[mode][part], h: picked.h ?? 0 })];
		})
	) as Palette;
	// A few rounds: a change for one pair can touch another
	for (let round = 0; round < 3; round++) {
		for (const { foreground, background, adjust } of readingPairs(mode)) {
			const fg = colorOf(palette, mode, foreground);
			const bg = palette[background];
			if (contrast(fg, bg) >= AA) continue;
			const key = adjust === 'foreground' ? foreground : background;
			const other = adjust === 'foreground' ? bg : fg;
			// Away from the other: darker in light mode for text, lighter in dark mode
			const lighter = oklch(other).l < 0.5;
			(palette as Record<string, string>)[key] = nudge(
				(palette as Record<string, string>)[key],
				other,
				lighter
			);
		}
	}
	return palette;
}

/** Your theme, light and dark, from the colour you picked */
export function ownTheme(picked: string): Record<Mode, Palette> {
	const color = oklch(picked);
	return { light: themeIn('light', color), dark: themeIn('dark', color) };
}

/** As custom properties, the way themes.css names them, e.g. on <html> */
export function ownThemeProperties(picked: string): Record<string, string> {
	const { light, dark } = ownTheme(picked);
	const properties = (palette: Palette, suffix: string) =>
		Object.entries(palette).map(([key, value]) => [
			`--${NAMES[key as keyof Palette]}${suffix}`,
			value
		]);
	return Object.fromEntries([...properties(light, ''), ...properties(dark, '-night')]);
}

/** As an inline style */
export const styleOf = (properties: Record<string, string> | null) =>
	properties
		? Object.entries(properties)
				.map(([name, value]) => `${name}: ${value}`)
				.join('; ')
		: '';
