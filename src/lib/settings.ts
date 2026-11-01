// Personal settings (S-3): kept with the person, so they follow them to every device. The
// browser gets them as cookies (the language one is paraglide's), so pages render right away.
import { locales } from '#lib/paraglide/runtime.js';

export const THEMES = ['system', 'light', 'dark'] as const;
export type Theme = (typeof THEMES)[number];

export const isTheme = (value: unknown): value is Theme => THEMES.includes(value as Theme);

/** Nature themes (#60), stored as the "accent" setting; defined in themes/palettes.ts */
export {
	DEFAULT_THEME as DEFAULT_ACCENT,
	THEME_IDS as ACCENTS,
	isThemeId as isAccent,
	type ThemeId as Accent
} from './themes/palettes';

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

/** Cookie with the chosen color theme; the page script in app.html reads it before first paint */
export const ACCENT_COOKIE = 'kt-accent';

/** Cookie with the chosen units */
export const UNITS_COOKIE = 'kt-units';

/** Cookie with the currency amounts are also shown in (#238); none = only the group's */
export const DISPLAY_CURRENCY_COOKIE = 'kt-display-currency';
