// What has to read well in a theme (WCAG 2.1 AA for normal text), light and dark: checked for
// every nature theme (palettes.spec.ts) and made to hold for a theme of your own (#330).
import { MEANING, type Palette } from './palettes';

export const AA = 4.5;

type Meaning = keyof (typeof MEANING)['light'];
export type Mode = 'light' | 'dark';

export type ReadingPair = {
	what: string;
	foreground: keyof Palette | Meaning;
	background: keyof Palette;
	/** Which of the two a theme of your own adjusts when they don't read well together */
	adjust: 'foreground' | 'background';
};

export function readingPairs(mode: Mode): ReadingPair[] {
	// Filled buttons: paper on the accent in light mode, the background in dark mode
	const onAccent = mode === 'light' ? 'surface' : 'canvas';
	const pair = (
		what: string,
		foreground: ReadingPair['foreground'],
		background: ReadingPair['background'],
		adjust: ReadingPair['adjust'] = 'foreground'
	): ReadingPair => ({ what, foreground, background, adjust });
	// Money and danger keep their colours: what's behind them gives way
	const kept = 'background';
	return [
		pair('text on the background', 'ink', 'canvas'),
		pair('text on cards', 'ink', 'surface'),
		pair('secondary text on the background', 'inkMuted', 'canvas'),
		pair('secondary text on cards', 'inkMuted', 'surface'),
		pair('secondary text on quiet surfaces', 'inkMuted', 'surfaceMuted'),
		pair('links on the background', 'accent', 'canvas'),
		pair('links on cards', 'accent', 'surface'),
		pair('text on filled buttons', onAccent, 'accent', 'background'),
		pair("the header's text", 'heroFg', 'heroBg'),
		pair('"owed to you" on cards', 'positive', 'surface', kept),
		pair('"owed to you" in the header', 'positive', 'heroBg', kept),
		pair('"you owe" on cards', 'negative', 'surface', kept),
		pair('"you owe" in the header', 'negative', 'heroBg', kept),
		pair('delete on cards', 'destructive', 'surface', kept)
	];
}

/** The colour a pair's side has in a theme */
export const colorOf = (palette: Palette, mode: Mode, key: ReadingPair['foreground']) =>
	key in MEANING[mode] ? MEANING[mode][key as Meaning] : palette[key as keyof Palette];
