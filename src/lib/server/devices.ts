// A person's devices (#126): the list, "last used" and removing one.
import type { Cookies } from '@sveltejs/kit';
import { and, asc, eq, ne } from 'drizzle-orm';
import { deviceLabel } from '#lib/device-label.ts';
import type { Db } from './db';
import { devices } from './db/schema';
import { hashSecret } from './secrets';

/** Set when this device's "last used" was written, so it's written at most once a day */
const SEEN_COOKIE = 'kt-seen';
const SEEN_EVERY_SECONDS = 24 * 60 * 60;

/** Notes the device's name and "last used", at most daily (one cheap write) */
export async function noteDeviceSeen(
	db: Db,
	cookies: Cookies,
	deviceKey: string,
	userAgent: string | null
) {
	if (cookies.get(SEEN_COOKIE)) return;
	const result = await db
		.update(devices)
		.set({ label: deviceLabel(userAgent), lastSeenAt: new Date() })
		.where(eq(devices.keyHash, await hashSecret(deviceKey)));
	// Only once it's someone's device: a new one is named as soon as it joins
	if (result.meta.changes > 0) {
		cookies.set(SEEN_COOKIE, '1', {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			maxAge: SEEN_EVERY_SECONDS
		});
	}
}

/** A person's devices, this one marked */
export async function listDevices(db: Db, personId: string, deviceKey: string) {
	const current = await hashSecret(deviceKey);
	const rows = await db
		.select({
			keyHash: devices.keyHash,
			label: devices.label,
			createdAt: devices.createdAt,
			lastSeenAt: devices.lastSeenAt
		})
		.from(devices)
		.where(eq(devices.personId, personId))
		.orderBy(asc(devices.createdAt));
	return rows.map(({ keyHash, ...device }) => ({
		...device,
		// Not the hash itself: enough to remove it, but a different value
		id: keyHash.slice(0, 16),
		current: keyHash === current
	}));
}

/** Removes another of the person's devices: it no longer sees their groups (#126) */
export async function removeDevice(db: Db, personId: string, deviceKey: string, id: string) {
	if (!/^[0-9a-f]{16}$/.test(id)) return false;
	const current = await hashSecret(deviceKey);
	const mine = await db
		.select({ keyHash: devices.keyHash })
		.from(devices)
		.where(and(eq(devices.personId, personId), ne(devices.keyHash, current)));
	const target = mine.find((device) => device.keyHash.startsWith(id));
	if (!target) return false;
	await db.delete(devices).where(eq(devices.keyHash, target.keyHash));
	return true;
}
