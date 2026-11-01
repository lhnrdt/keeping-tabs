// Browser side of passkeys (A-18), talking to /device/passkey/*. Where the browser and passkey can do
// it (the PRF extension), a passkey also brings your groups' keys along (#110): it produces a secret
// that never leaves the device, which seals your vault key.
import { resolve } from '$app/paths';
import {
	browserSupportsWebAuthn,
	startAuthentication,
	startRegistration
} from '@simplewebauthn/browser';
import { openVaultWithSecret, sealVaultWithSecret } from '#lib/crypto/vault.ts';

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

const PRF = { prf: { eval: { first: new TextEncoder().encode('keeping-tabs-vault') } } };

type WithPrf = { prf?: { enabled?: boolean; results?: { first?: BufferSource } } };

const prfSecret = (results: unknown) => {
	const first = (results as WithPrf).prf?.results?.first;
	if (!first) return null;
	return new Uint8Array(first instanceof ArrayBuffer ? first : (first as ArrayBufferView).buffer);
};

/** What's sent to the server: never the secret the passkey produced */
const withoutSecret = <T extends object>(response: T) => ({
	...response,
	clientExtensionResults: {}
});

/** Saves a passkey for the current person; throws if cancelled or rejected. */
export async function savePasskey() {
	const optionsJSON = await post<Parameters<typeof startRegistration>[0]['optionsJSON']>(
		resolve('/device/passkey/register/options')
	);
	const response = await startRegistration({
		optionsJSON: { ...optionsJSON, extensions: PRF as never }
	});
	await post(resolve('/device/passkey/register'), withoutSecret(response));
	await sealVaultForPasskey(response.id, optionsJSON.rp.id, response.clientExtensionResults).catch(
		() => {}
	);
}

/** Many passkeys only produce their secret when used, not when made: then it's used once now */
async function sealVaultForPasskey(id: string, rpId: string | undefined, made: unknown) {
	if (!(made as WithPrf).prf?.enabled && !prfSecret(made)) return;
	let secret = prfSecret(made);
	if (!secret) {
		const used = await startAuthentication({
			optionsJSON: {
				challenge: btoa(crypto.randomUUID()).replace(/=+$/, ''),
				rpId,
				allowCredentials: [{ id, type: 'public-key' }],
				userVerification: 'preferred',
				extensions: PRF as never
			}
		});
		secret = prfSecret(used.clientExtensionResults);
	}
	if (!secret) return;
	await post(resolve('/device/passkey/vault'), {
		id,
		sealedVault: await sealVaultWithSecret(secret)
	});
}

/** Signs in with a passkey, making this device that person; throws if cancelled or unknown. */
export async function continueWithPasskey() {
	const optionsJSON = await post<Parameters<typeof startAuthentication>[0]['optionsJSON']>(
		resolve('/device/passkey/login/options')
	);
	const response = await startAuthentication({
		optionsJSON: { ...optionsJSON, extensions: PRF as never }
	});
	const { sealedVault } = await post<{ sealedVault: string | null }>(
		resolve('/device/passkey/login'),
		withoutSecret(response)
	);
	const secret = prfSecret(response.clientExtensionResults);
	if (secret && sealedVault) await openVaultWithSecret(secret, sealedVault).catch(() => {});
}
