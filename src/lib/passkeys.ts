// Browser side of passkeys (A-18), talking to /device/passkey/*.
import { resolve } from '$app/paths';
import {
	browserSupportsWebAuthn,
	startAuthentication,
	startRegistration
} from '@simplewebauthn/browser';

export const passkeysSupported = () => browserSupportsWebAuthn();

async function post<T>(path: string, body?: unknown): Promise<T> {
	const response = await fetch(path, {
		method: 'POST',
		headers: body ? { 'content-type': 'application/json' } : {},
		body: body ? JSON.stringify(body) : undefined
	});
	if (!response.ok) throw new Error(`${path}: ${response.status}`);
	return response.json();
}

/** Saves a passkey for the current person; throws if cancelled or rejected. */
export async function savePasskey() {
	const optionsJSON = await post<Parameters<typeof startRegistration>[0]['optionsJSON']>(
		resolve('/device/passkey/register/options')
	);
	await post(resolve('/device/passkey/register'), await startRegistration({ optionsJSON }));
}

/** Signs in with a passkey, making this device that person; throws if cancelled or unknown. */
export async function continueWithPasskey() {
	const optionsJSON = await post<Parameters<typeof startAuthentication>[0]['optionsJSON']>(
		resolve('/device/passkey/login/options')
	);
	await post(resolve('/device/passkey/login'), await startAuthentication({ optionsJSON }));
}
