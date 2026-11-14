// A theme of your own (#330), made from one colour you pick: every colour of a nature theme (the
// background, cards, header, text and accent, light and dark) turned to its hue, as bright as
// it is, with each colour's lightness kept, so it's as calm as the others. Whatever then doesn't
// read well enough (WCAG AA, as every nature theme is checked) is made darker or lighter.
import { clampChroma, converter, formatHex, type Oklch } from 'culori';
import { contrast } from './contrast';
import { NAMES } from './css';
import { PALETTES, type Palette } from './palettes';
import { AA, colorOf, readingPairs, type Mode } from './reading';

/** The theme it's made like: one with a clear hue in all its colours */
const TEMPLATE = PALETTES.forest;
/** As bright as the pick, up to a little more than the template */
const MAX_CHROMA = 1.4;
const STEP = 0.01;

const oklch = (hex: string): Oklch => converter('oklch')(hex) ?? { mode: 'oklch', l: 0.5, c: 0 };
const hex = (color: Oklch) => formatHex(clampChroma(color, 'oklch'));

/** The template's colour in the picked hue and brightness */
function turned(template: string, picked: Oklch, chroma: number) {
	const { l, c } = oklch(template);
	return hex({ mode: 'oklch', l, c: c * chroma, h: picked.h ?? 0 });
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
	const template = TEMPLATE[mode];
	const chroma = Math.min(picked.c / Math.max(oklch(TEMPLATE.light.accent).c, 0.01), MAX_CHROMA);
	const palette = Object.fromEntries(
		Object.entries(template).map(([key, value]) => [key, turned(value, picked, chroma)])
	) as Palette;
	// The accent is the picked colour itself where it can be: its lightness, not the template's
	palette.accent = hex(picked);
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
