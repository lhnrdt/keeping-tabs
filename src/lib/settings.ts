// Personal settings (S-3): kept with the person, so they follow them to every device. The
// browser gets them as cookies (the language one is paraglide's), so pages render right away.
import { locales } from '#lib/paraglide/runtime.js';

export const THEMES = ['system', 'light', 'dark'] as const;
export type Theme = (typeof THEMES)[number];

export const isTheme = (value: unknown): value is Theme => THEMES.includes(value as Theme);

/** Color themes (#60): the app's accent color, each with a light and a dark shade */
export const ACCENTS = ['forest', 'fjord', 'heather', 'amber'] as const;
export type Accent = (typeof ACCENTS)[number];
export const DEFAULT_ACCENT: Accent = 'forest';

export const isAccent = (value: unknown): value is Accent => ACCENTS.includes(value as Accent);

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
