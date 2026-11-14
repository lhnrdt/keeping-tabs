// Personal settings (S-3): kept with the person, so they follow them to every device. The
// browser gets them as cookies (the language one is paraglide's), so pages render right away.
import { locales } from '#lib/paraglide/runtime.js';
import { LIKE_SCENERY, type Colors, type Scenery } from './themes/look';
import { DEFAULT_THEME } from './themes/palettes';

export const THEMES = ['system', 'light', 'dark'] as const;
export type Theme = (typeof THEMES)[number];

export const isTheme = (value: unknown): value is Theme => THEMES.includes(value as Theme);

/** The scenery (a nature theme, #60, or a new one every day) and the colours, chosen apart (#332) */
export {
	COLORS,
	DAILY,
	isColors,
	isOwnColor,
	isScenery,
	LIKE_SCENERY,
	SCENERIES,
	type Colors,
	type OwnColor,
	type Scenery
} from './themes/look';
export const DEFAULT_SCENERY: Scenery = DEFAULT_THEME;
export const DEFAULT_COLORS: Colors = LIKE_SCENERY;

/** How distances and fuel show and are typed (#238): km and litres, or miles and US gallons */
export const UNITS = ['metric', 'imperial'] as const;
export type Units = (typeof UNITS)[number];
export const DEFAULT_UNITS: Units = 'metric';
export const isUnits = (value: unknown): value is Units => UNITS.includes(value as Units);

export type Locale = (typeof locales)[number];

/** Each language in its own name */
export const LOCALE_NAMES: Record<Locale, string> = { en: 'English', de: 'Deutsch' };

export const isLocale = (value: unknown): value is Locale => locales.includes(value as Locale);

/**
 * Set when a language was chosen (or brought from the person's settings). Paraglide's own cookie
 * can't tell: its browser code writes it on every first visit.
 */
export const LOCALE_COOKIE = 'kt-locale';

/** Cookie with the chosen theme; the page script in app.html reads it before first paint */
export const THEME_COOKIE = 'kt-theme';

/** Cookie with the chosen scenery (named from when it was the whole theme, so devices keep it) */
export const SCENERY_COOKIE = 'kt-accent';

/** Cookie with the chosen colours */
export const COLORS_COOKIE = 'kt-colors';

/** Cookie with the device's time zone, for which day it is there (a new scenery every day) */
export const TIME_ZONE_COOKIE = 'kt-tz';

/** Cookie with the chosen units */
export const UNITS_COOKIE = 'kt-units';

/** Cookie with the currency amounts are also shown in (#238); none = only the group's */
export const DISPLAY_CURRENCY_COOKIE = 'kt-display-currency';
