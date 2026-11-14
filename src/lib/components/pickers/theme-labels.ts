// Each nature theme's name (#60), for its scenery and its colours alike
import { m } from '#lib/paraglide/messages.js';
import type { ThemeId } from '#lib/themes/palettes.ts';

export const themeLabels: Record<ThemeId, () => string> = {
	forest: m.theme_forest,
	fjord: m.theme_fjord,
	mountains: m.theme_mountains,
	heather: m.theme_heather,
	birch: m.theme_birch,
	meadow: m.theme_meadow,
	coast: m.theme_coast,
	aurora: m.theme_aurora,
	autumn: m.theme_autumn
};
