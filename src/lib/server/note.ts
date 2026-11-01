// The friendly note about what the app's creator can see (#112): shown once per person, and once
// more when what it says changes.
// Read on this device → a cookie; read by the person → their record, so their other devices
// skip it too.
import type { Cookies } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { Db } from './db';
import { people } from './db/schema';
import type { Person } from './people';

const NOTE_COOKIE = 'kt-note';
/** 2: groups are encrypted now (#110); people had read that things are visible to admins */
const NOTE_VERSION = 2;
const COOKIE_OPTIONS = {
	path: '/',
	httpOnly: true,
	sameSite: 'lax',
	maxAge: 400 * 24 * 60 * 60
} as const;

const markPersonNoted = (db: Db, personId: string) =>
	db
		.update(people)
		.set({ notedAt: new Date(), notedVersion: NOTE_VERSION })
		.where(eq(people.id, personId));

/** Whether this visitor still needs to see the note; keeps device and person in step. */
export async function needsNote(db: Db, cookies: Cookies, person: Person | undefined) {
	const notedHere = cookies.get(NOTE_COOKIE) === String(NOTE_VERSION);
	if (person?.notedAt && person.notedVersion >= NOTE_VERSION) {
		if (!notedHere) cookies.set(NOTE_COOKIE, String(NOTE_VERSION), COOKIE_OPTIONS);
		return false;
	}
	// Read here before this device belonged to anyone: remember it for the person now
	if (notedHere && person) await markPersonNoted(db, person.id);
	return !notedHere;
}

export async function acceptNote(db: Db, cookies: Cookies, person: Person | undefined) {
	cookies.set(NOTE_COOKIE, String(NOTE_VERSION), COOKIE_OPTIONS);
	if (person) await markPersonNoted(db, person.id);
}
