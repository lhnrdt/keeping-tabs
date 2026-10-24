// Nature themes (#60): the single source of every theme's colors, light and dark. Each has
// one clear primary hue (forest green, golden meadow, autumn rust, alpenglow rose, heather
// violet, aurora indigo, fjord blue, coast turquoise, birch black-and-white) that also tints
// its backgrounds and header. The CSS
// (src/lib/styles/themes.css) is generated from this by `pnpm themes`; palettes.spec.ts
// checks WCAG AA contrast for every theme in both modes.

export const THEME_IDS = [
	'forest',
	'fjord',
	'mountains',
	'heather',
	'birch',
	'meadow',
	'coast',
	'aurora',
	'autumn'
] as const;

export type ThemeId = (typeof THEME_IDS)[number];

export const DEFAULT_THEME: ThemeId = 'forest';

export type Palette = {
	/** The page background */
	canvas: string;
	/** Cards and lists */
	surface: string;
	/** Pressed rows, pickers, quiet buttons */
	surfaceMuted: string;
	ink: string;
	/** Secondary text */
	inkMuted: string;
	/** Buttons, links, the active tab */
	accent: string;
	/** Illustrations, quiet highlights */
	accentSoft: string;
	/** The start screen's header */
	heroBg: string;
	heroFg: string;
};

/** Light and dark of every theme, in the order of THEME_IDS */
export const PALETTES: Record<ThemeId, { light: Palette; dark: Palette }> = {
	forest: {
		light: palette('#eaf1ec #f8faf8 #dce5df #1c2620 #556359 #2c6d42 #adccb8 #d7e5dc #264a32'),
		dark: palette('#141a16 #1c241f #27302a #e8edea #a8b3ac #7ebf93 #3a5543 #273a2d #c5decd')
	},
	fjord: {
		light: palette('#e8edf2 #f7f9fa #dae0e7 #1a2128 #525b65 #224e81 #a8bbd2 #d4dde7 #203651'),
		dark: palette('#12171c #1a2025 #252b32 #e8eaee #a6adb4 #88abd3 #35465a #24303d #c0d0e2')
	},
	mountains: {
		light: palette('#f1e9eb #faf7f8 #e6dbdd #271c1d #645457 #88303e #ceabb1 #e6d6d9 #4c242b'),
		dark: palette('#1b1314 #241b1d #312628 #ede8e9 #b3a8a9 #d39ca5 #57383d #3b2629 #dfc3c8')
	},
	heather: {
		light: palette('#f0eaf0 #f9f8f9 #e4dde4 #251d25 #615661 #7b3d7b #c9b0c9 #e3d8e3 #462a46'),
		dark: palette('#1a141a #231d23 #2f282f #ece9ec #b2a9b2 #cfabcf #523c52 #382938 #dbc7db')
	},
	birch: {
		light: palette('#eeeded #f9f9f8 #e1e1e0 #222120 #5d5c5b #413e3a #bfbdbb #dfdedd #3b3936'),
		dark: palette('#171716 #20201f #2c2c2b #ebebea #aeaead #d3d2cf #494845 #32312f #d3d2cf')
	},
	meadow: {
		light: palette('#f3f0e8 #fafaf7 #e8e4d9 #292519 #676250 #796215 #d6caa3 #e9e4d2 #56481b'),
		dark: palette('#1d1a11 #272319 #332f24 #eeede7 #b6b2a5 #d4bb68 #5e5331 #403921 #e6dcbc')
	},
	coast: {
		light: palette('#e8f2f2 #f7fafa #dae7e7 #1a2828 #526566 #19696b #a6d2d3 #d4e7e8 #1e5052'),
		dark: palette('#121c1c #1a2526 #253232 #e7eeee #a6b4b5 #5fc5c9 #335a5b #233d3e #bfe2e4')
	},
	aurora: {
		light: palette('#eceaf0 #f8f8fa #dfdce5 #1f1d26 #595562 #5a4096 #b7aecb #dbd7e4 #312749'),
		dark: palette('#16141a #1e1c24 #2a2730 #eae9ed #aba9b2 #baaed5 #423b54 #2d2839 #ccc5dd')
	},
	autumn: {
		light: palette('#f2ebe8 #faf8f7 #e7deda #281f1a #665852 #84411f #d3b5a6 #e8dad4 #522f1e'),
		dark: palette('#1c1512 #261e1a #322925 #eeeae7 #b5aba6 #d39a7d #5b4133 #3e2c23 #e4cbbf')
	}
};

/** Money and danger keep their meaning in every theme: owed to you, you owe, delete */
export const MEANING = {
	light: { positive: '#48634e', negative: '#8f4b39', destructive: '#a8443b' },
	dark: { positive: '#93b391', negative: '#dc9c86', destructive: '#e88a7f' }
} as const;

export const isThemeId = (value: unknown): value is ThemeId => THEME_IDS.includes(value as ThemeId);

/** Colors in Palette order, written compactly above */
function palette(colors: string): Palette {
	const [canvas, surface, surfaceMuted, ink, inkMuted, accent, accentSoft, heroBg, heroFg] =
		colors.split(' ');
	return { canvas, surface, surfaceMuted, ink, inkMuted, accent, accentSoft, heroBg, heroFg };
}
