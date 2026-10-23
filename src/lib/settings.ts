// Personal settings (S-3): kept with the person, so they follow them to every device. The
// browser gets them as cookies (the language one is paraglide's), so pages render right away.
import { locales } from '#lib/paraglide/runtime.js';

export const THEMES = ['system', 'light', 'dark'] as const;
export type Theme = (typeof THEMES)[number];

export const isTheme = (value: unknown): value is Theme => THEMES.includes(value as Theme);

export type Locale = (typeof locales)[number];

/** Each language in its own name */
export const LOCALE_NAMES: Record<Locale, string> = { en: 'English', de: 'Deutsch' };

export const isLocale = (value: unknown): value is Locale => locales.includes(value as Locale);

/** Cookie with the chosen theme; the page script in app.html reads it before first paint */
export const THEME_COOKIE = 'kt-theme';
