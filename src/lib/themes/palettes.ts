// Nature themes (#60): the single source of every theme's colors, light and dark. The CSS
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
		light: palette('#f4f1ea #fbf9f5 #ece8df #252822 #676a61 #526a58 #aebeaa #dce4d9 #394c3f'),
		dark: palette('#1d211d #252a25 #303630 #ecede8 #a3a69e #90a88e #4e6150 #2f3a31 #b9cbb6')
	},
	fjord: {
		light: palette('#eef2f3 #f8fafa #e1e8ea #1f2a2e #56656b #2f6273 #a7c4cd #d5e3e7 #24505e'),
		dark: palette('#141c20 #1b252a #253137 #e6eef0 #9aaeb5 #86b6c6 #355661 #1f3640 #b3d3dd')
	},
	mountains: {
		light: palette('#f1f1ef #fafaf8 #e5e5e1 #24262a #5f636a #4f5d6e #b9c1cb #dfe3e7 #3c4757'),
		dark: palette('#1a1c20 #22252a #2c3036 #eceef1 #a2a8b0 #a9b7c8 #4a5563 #2a3039 #c7d1dc')
	},
	heather: {
		light: palette('#f4f0f1 #fbf8f9 #e9e2e5 #2a2329 #695d66 #6e4f73 #c9b3cc #e6dbe7 #553b5a'),
		dark: palette('#1f1a20 #282229 #332b34 #f0eaf0 #ada2ad #c5a6cb #5a465e #372c3a #dcc6e0')
	},
	birch: {
		light: palette('#f5f4f0 #fdfcf9 #eae8e1 #26261f #64645a #5a662b #c9d0a3 #ecebe2 #474f22'),
		dark: palette('#1c1c18 #24241f #2f2f28 #efeee8 #a8a79c #b9c77d #4c5330 #2c2e22 #d5ddb0')
	},
	meadow: {
		light: palette('#f5f3e8 #fcfbf3 #ebe8d8 #262619 #636350 #8a4560 #e0bfcc #e4ebcd #3d5420'),
		dark: palette('#1b1d15 #23261b #2d3123 #eeefe3 #a6a991 #e3a3bd #5e3a49 #2b3420 #cfe0a9')
	},
	coast: {
		light: palette('#f6f2ea #fdfaf4 #ece5d8 #262420 #67615a #2a6874 #a9cfd4 #e9dfcb #5a4a2e'),
		dark: palette('#1a1d1f #222628 #2c3133 #eef0ef #a5abab #7fc0cb #345a61 #2e2b24 #e0d2b4')
	},
	aurora: {
		light: palette('#eff1f5 #f9fafc #e2e6ee #1e2230 #5a6175 #2c6a59 #a8d8c6 #dde7f0 #2c4060'),
		dark: palette('#10141f #171c29 #212736 #e8ecf5 #9ea6bb #7ee0b8 #2a5a4c #1a2440 #a8e8cf')
	},
	autumn: {
		light: palette('#f6f0e8 #fcf8f3 #ece2d5 #2a221c #6a5d50 #8a4a24 #e3bf9c #f0dfcc #7a3f1c'),
		dark: palette('#1f1915 #28201b #332923 #f2ebe4 #b0a396 #e09a6a #5e3a24 #3a281d #f0c7a5')
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
