// The scenery and colours a browser shows today (#332), from its chosen settings and the day
// it is where it is
import type { Cookies } from '@sveltejs/kit';
import {
	COLORS_COOKIE,
	DEFAULT_COLORS,
	DEFAULT_SCENERY,
	isColors,
	isScenery,
	SCENERY_COOKIE,
	TIME_ZONE_COOKIE
} from '#lib/settings.ts';
import { localDate, lookOn } from '#lib/themes/look.ts';

/** What this browser chose */
export function chosenLook(cookies: Cookies) {
	const scenery = cookies.get(SCENERY_COOKIE);
	const colors = cookies.get(COLORS_COOKIE);
	return {
		scenery: isScenery(scenery) ? scenery : DEFAULT_SCENERY,
		colors: isColors(colors) ? colors : DEFAULT_COLORS
	};
}

/** ...and what that comes to today, there */
export function lookOf(cookies: Cookies, now = new Date()) {
	const { scenery, colors } = chosenLook(cookies);
	return lookOn(scenery, colors, localDate(now, cookies.get(TIME_ZONE_COOKIE)));
}
