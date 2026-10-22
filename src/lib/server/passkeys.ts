import {
	generateAuthenticationOptions,
	generateRegistrationOptions,
	verifyAuthenticationResponse,
	verifyRegistrationResponse,
	type AuthenticationResponseJSON,
	type RegistrationResponseJSON
} from '@simplewebauthn/server';
import { isoBase64URL } from '@simplewebauthn/server/helpers';
import { eq } from 'drizzle-orm';
import type { Db } from './db';
import { passkeys } from './db/schema';
import type { Person } from './people';

// Passkeys (A-18): a person saves one with their device's screen lock; their platform
// (Apple, Google, a password manager) syncs it, and it brings them back on any device.

/** Relying party: passkeys are bound to the site's host name (so staging and production differ). */
export type RelyingParty = { id: string; origin: string };

export const relyingPartyFor = (url: URL): RelyingParty => ({
	id: url.hostname,
	origin: url.origin
});

export async function registrationOptions(db: Db, rp: RelyingParty, person: Person) {
	const existing = await db
		.select({ id: passkeys.id })
		.from(passkeys)
		.where(eq(passkeys.personId, person.id));
	return generateRegistrationOptions({
		rpName: 'Keeping Tabs',
		rpID: rp.id,
		userID: new TextEncoder().encode(person.id),
		userName: person.name ?? 'Keeping Tabs',
		attestationType: 'none',
		excludeCredentials: existing,
		// Discoverable, so it can be used on a device that doesn't know who you are yet
		authenticatorSelection: { residentKey: 'required', userVerification: 'preferred' }
	});
}

/** Verifies a new passkey and stores it for the person. */
export async function savePasskey(
	db: Db,
	rp: RelyingParty,
	personId: string,
	response: RegistrationResponseJSON,
	expectedChallenge: string
): Promise<boolean> {
	const { verified, registrationInfo } = await verifyRegistrationResponse({
		response,
		expectedChallenge,
		expectedOrigin: rp.origin,
		expectedRPID: rp.id
	});
	if (!verified) return false;
	const { credential } = registrationInfo;
	await db.insert(passkeys).values({
		id: credential.id,
		personId,
		publicKey: isoBase64URL.fromBuffer(credential.publicKey),
		counter: credential.counter,
		transports: credential.transports ?? null
	});
	return true;
}

export const authenticationOptions = (rp: RelyingParty) =>
	generateAuthenticationOptions({ rpID: rp.id, userVerification: 'preferred' });

/** Verifies a passkey sign-in; returns the person it belongs to, or null. */
export async function verifyPasskey(
	db: Db,
	rp: RelyingParty,
	response: AuthenticationResponseJSON,
	expectedChallenge: string
): Promise<string | null> {
	const passkey = await db.query.passkeys.findFirst({ where: eq(passkeys.id, response.id) });
	if (!passkey) return null;
	const { verified, authenticationInfo } = await verifyAuthenticationResponse({
		response,
		expectedChallenge,
		expectedOrigin: rp.origin,
		expectedRPID: rp.id,
		credential: {
			id: passkey.id,
			publicKey: isoBase64URL.toBuffer(passkey.publicKey),
			counter: passkey.counter,
			transports: passkey.transports ?? undefined
		}
	});
	if (!verified) return null;
	await db
		.update(passkeys)
		.set({ counter: authenticationInfo.newCounter })
		.where(eq(passkeys.id, passkey.id));
	return passkey.personId;
}

export async function countPasskeys(db: Db, personId: string) {
	const rows = await db
		.select({ id: passkeys.id })
		.from(passkeys)
		.where(eq(passkeys.personId, personId));
	return rows.length;
}
