// Personal settings (S-3): stored with the person, mirrored into cookies for the browser.
import type { Cookies } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { cookieName, cookieMaxAge } from '#lib/paraglide/runtime.js';
import {
	COLORS_COOKIE,
	DISPLAY_CURRENCY_COOKIE,
	SCENERY_COOKIE,
	LOCALE_COOKIE,
	THEME_COOKIE,
	UNITS_COOKIE,
	type Colors,
	type Locale,
	type Scenery,
	type Theme,
	type Units
} from '#lib/settings.ts';
import type { Db } from './db';
import { people } from './db/schema';
import type { Person } from './people';

const COOKIE_OPTIONS = { path: '/', sameSite: 'lax', maxAge: cookieMaxAge } as const;

export async function saveSettings(
	db: Db,
	personId: string,
	settings: {
		name?: string;
		locale?: Locale;
		theme?: Theme;
		accent?: Scenery;
		colors?: Colors;
		units?: Units;
		displayCurrency?: string | null;
		avatar?: string;
		paymentDetails?: string | null;
		sealedPaymentDetails?: string | null;
	}
) {
	if (Object.keys(settings).length === 0) return;
	await db.update(people).set(settings).where(eq(people.id, personId));
}

/** Makes this browser use a language (paraglide's cookie), remembering that it was chosen */
export function setLocaleCookie(cookies: Cookies, locale: Locale) {
	cookies.set(cookieName, locale, { ...COOKIE_OPTIONS, httpOnly: false });
	cookies.set(LOCALE_COOKIE, locale, { ...COOKIE_OPTIONS, httpOnly: true });
}

/** Makes this browser use a theme; the page script reads it before first paint */
export const setThemeCookie = (cookies: Cookies, theme: Theme) =>
	cookies.set(THEME_COOKIE, theme, { ...COOKIE_OPTIONS, httpOnly: false });

/** Makes this browser show a scenery */
export const setSceneryCookie = (cookies: Cookies, scenery: Scenery) =>
	cookies.set(SCENERY_COOKIE, scenery, { ...COOKIE_OPTIONS, httpOnly: true });

/** Makes this browser use a theme's colours, or the scenery's own */
export const setColorsCookie = (cookies: Cookies, colors: Colors) =>
	cookies.set(COLORS_COOKIE, colors, { ...COOKIE_OPTIONS, httpOnly: true });

export const setUnitsCookie = (cookies: Cookies, units: Units) =>
	cookies.set(UNITS_COOKIE, units, { ...COOKIE_OPTIONS, httpOnly: true });

/** Empty means only the group's currency */
export const setDisplayCurrencyCookie = (cookies: Cookies, currency: string) =>
	cookies.set(DISPLAY_CURRENCY_COOKIE, currency, { ...COOKIE_OPTIONS, httpOnly: true });

/** Set when a device was checked for saved settings, so the check isn't repeated every page */
const CHECKED_COOKIE = 'kt-settings-checked';
const CHECK_EVERY_SECONDS = 24 * 60 * 60;

export const settingsChecked = (cookies: Cookies) => cookies.get(CHECKED_COOKIE) !== undefined;

export const markSettingsChecked = (cookies: Cookies) =>
	cookies.set(CHECKED_COOKIE, '1', {
		...COOKIE_OPTIONS,
		httpOnly: true,
		maxAge: CHECK_EVERY_SECONDS
	});

/** After a device joins a person, so its next page picks up that person's settings */
export const checkSettingsAgain = (cookies: Cookies) =>
	cookies.delete(CHECKED_COOKIE, { path: '/' });

/**
 * A device that doesn't have the person's settings yet (a new or linked one) gets them.
 * Returns the language it now uses, if that changed, so the current request can use it too.
 */
export function applySettings(cookies: Cookies, person: Person | undefined): Locale | null {
	if (!person) return null;
	if (person.theme && !cookies.get(THEME_COOKIE)) setThemeCookie(cookies, person.theme);
	if (person.accent && !cookies.get(SCENERY_COOKIE)) setSceneryCookie(cookies, person.accent);
	if (person.colors && !cookies.get(COLORS_COOKIE)) setColorsCookie(cookies, person.colors);
	if (person.units && !cookies.get(UNITS_COOKIE)) setUnitsCookie(cookies, person.units);
	if (person.displayCurrency && !cookies.get(DISPLAY_CURRENCY_COOKIE)) {
		setDisplayCurrencyCookie(cookies, person.displayCurrency);
	}
	if (person.locale && !cookies.get(LOCALE_COOKIE)) {
		setLocaleCookie(cookies, person.locale);
		return person.locale;
	}
	return null;
}
