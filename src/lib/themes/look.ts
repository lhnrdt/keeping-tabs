// What the app looks like (#60, #332): the scenery (one of the nature themes, or a different
// one every day) and the colours, which are the scenery's own unless another theme's are chosen.
import { DEFAULT_THEME, isThemeId, THEME_IDS, type ThemeId } from './palettes';

/** A different scenery every day */
export const DAILY = 'daily';
export type Scenery = ThemeId | typeof DAILY;
export const SCENERIES: readonly Scenery[] = [...THEME_IDS, DAILY];
export const isScenery = (value: unknown): value is Scenery => value === DAILY || isThemeId(value);

/** The colours of whatever the scenery is */
export const LIKE_SCENERY = 'scenery';
/** A theme of your own, made from one colour (#330), e.g. "#e05aa0" */
export type OwnColor = `#${string}`;
export const isOwnColor = (value: unknown): value is OwnColor =>
	typeof value === 'string' && /^#[0-9a-f]{6}$/.test(value);
export type Colors = ThemeId | typeof LIKE_SCENERY | OwnColor;
/** The ready-made choices; your own colour comes on top */
export const COLORS: readonly (ThemeId | typeof LIKE_SCENERY)[] = [LIKE_SCENERY, ...THEME_IDS];
export const isColors = (value: unknown): value is Colors =>
	value === LIKE_SCENERY || isThemeId(value) || isOwnColor(value);

/** The scenery and colours in use today, with your own main colour if there is one */
export type Look = { scenery: ThemeId; colors: ThemeId; own?: OwnColor };

/** Today's date where someone is, e.g. "2026-11-14": in their time zone, or this device's */
export function localDate(now = new Date(), timeZone?: string): string {
	try {
		return new Intl.DateTimeFormat('en-CA', { timeZone }).format(now);
	} catch {
		// An unknown time zone: the world's date will do
		return now.toISOString().slice(0, 10);
	}
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** The same shuffle for the same seed, everywhere */
function shuffled(seed: number): ThemeId[] {
	const order = [...THEME_IDS];
	let state = seed >>> 0 || 1;
	for (let i = order.length - 1; i > 0; i--) {
		// xorshift: small, and the same in every browser and on the server
		state ^= state << 13;
		state ^= state >>> 17;
		state ^= state << 5;
		const j = (state >>> 0) % (i + 1);
		[order[i], order[j]] = [order[j], order[i]];
	}
	return order;
}

/** Each run of days as long as there are themes shows every one once, never the same two days running */
function run(index: number): ThemeId[] {
	const order = shuffled(index + 1);
	const before = shuffled(index);
	if (order[0] === before[before.length - 1]) [order[0], order[1]] = [order[1], order[0]];
	return order;
}

/** The scenery of a day (a local date like "2026-11-14"), the same all day */
export function dailyTheme(date: string): ThemeId {
	const day = Math.floor(Date.parse(`${date}T00:00:00Z`) / DAY_MS);
	if (!Number.isFinite(day)) return DEFAULT_THEME;
	const length = THEME_IDS.length;
	return run(Math.floor(day / length))[((day % length) + length) % length];
}

/** What the choices come to on a date */
export function lookOn(scenery: Scenery, colors: Colors, date: string): Look {
	const shown = scenery === DAILY ? dailyTheme(date) : scenery;
	if (isOwnColor(colors)) return { scenery: shown, colors: shown, own: colors };
	return { scenery: shown, colors: colors === LIKE_SCENERY ? shown : colors };
}
