// What of the onboarding someone has been through (#331): kept with the person, so it's once per
// person, on every device of theirs, not once per device. Parts like "welcome", "home", "tip-swipe",
// or "none" for "Not now".
import { eq } from 'drizzle-orm';
import type { Db } from './db';
import { people } from './db/schema';

const PART = /^[a-z][a-z-]{0,23}$/;
const MAX_PARTS = 32;

/** The parts it's known to be, of what was sent: nothing else is kept */
export const partsIn = (value: unknown): string[] =>
	Array.isArray(value)
		? value
				.filter((part): part is string => typeof part === 'string' && PART.test(part))
				.slice(0, MAX_PARTS)
		: [];

/** As kept */
export function onboardingOf(person: { onboarding: string | null } | undefined): string[] {
	if (!person?.onboarding) return [];
	try {
		return partsIn(JSON.parse(person.onboarding));
	} catch {
		return [];
	}
}

/** These seen too */
export async function addOnboarding(
	db: Db,
	person: { id: string; onboarding: string | null },
	parts: string[]
) {
	const seen = [...new Set([...onboardingOf(person), ...parts])].slice(0, MAX_PARTS);
	await db
		.update(people)
		.set({ onboarding: JSON.stringify(seen) })
		.where(eq(people.id, person.id));
}

/** All of it again, from the start */
export async function resetOnboarding(db: Db, personId: string) {
	await db.update(people).set({ onboarding: null }).where(eq(people.id, personId));
}
