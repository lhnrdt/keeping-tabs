// A person's groups' keys on all their devices (#110). A vault key, which only their devices
// have, seals each group's key; the server keeps the sealed copies. A new device gets the vault
// key through a device link's fragment, or from a recovery key that opens a sealed copy of it.
import { newRecoveryKey, normalizeRecoveryKey, OLD_LENGTH } from '#lib/recovery-key-format.ts';
import { allKeys, rememberKey, rememberVault, vaultKey } from './keyring';
import { isKey, keyIdIn, keyIdOf, newKey, openText, sealText, toBase64Url } from './seal';

type Stored = { keys: { keyId: string; sealed: string }[]; recoveryVault: string | null };

const fetchStored = async (): Promise<Stored | null> => {
	const response = await fetch('/device/keys');
	return response.ok ? response.json() : null;
};

const store = (body: unknown) =>
	fetch('/device/keys', {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify(body)
	});

/** This device's vault key, made if it's the first one */
export async function ensureVault() {
	const existing = await vaultKey();
	if (existing) return existing;
	const made = newKey();
	await rememberVault(made);
	return made;
}

/**
 * Takes in the keys other devices stored, and stores the ones only this device has. A device that
 * came back without the vault (a passkey on a browser without its extension) starts a new one;
 * each vault keeps its own copies, so neither takes keys away from the other.
 */
export async function syncKeys() {
	const local = await allKeys();
	const vault = await vaultKey();
	if (!vault && local.length === 0) return;
	const stored = await fetchStored();
	if (!stored) return;
	const key = await ensureVault();
	const vaultId = await keyIdOf(key);
	const known = new Set<string>();
	for (const { keyId, sealed } of stored.keys) {
		if (keyIdIn(sealed) !== vaultId) continue;
		known.add(keyId);
		const opened = await openText(key, sealed).catch(() => null);
		if (isKey(opened)) await rememberKey(opened);
	}
	const here = await Promise.all(
		local.map(async (groupKey) => ({ keyId: await keyIdOf(groupKey), groupKey }))
	);
	const keys = await Promise.all(
		here
			.filter(({ keyId }) => !known.has(keyId))
			.map(async ({ keyId, groupKey }) => ({ keyId, sealed: await sealText(key, groupKey) }))
	);
	if (keys.length) await store({ keys });
}

/** Something only someone holding the recovery key can work out, different for each purpose */
async function fromRecovery(normalized: string, purpose: 'proof' | 'vault') {
	const hash = await crypto.subtle.digest(
		'SHA-256',
		new TextEncoder().encode(`keeping-tabs-recovery-${purpose}:${normalized}`)
	);
	return toBase64Url(new Uint8Array(hash));
}

/**
 * A new recovery key, made here. The server only gets a proof that can't be turned back into it,
 * and the vault sealed with a different key derived from it, so it can open neither.
 */
export async function newRecovery() {
	const key = newRecoveryKey();
	const normalized = normalizeRecoveryKey(key)!;
	return {
		key,
		proof: await fromRecovery(normalized, 'proof'),
		vault: await sealText(await fromRecovery(normalized, 'vault'), await ensureVault())
	};
}

/** What to send to sign in with a recovery key as typed; older keys are sent as they are */
export async function recoveryCredential(typed: string) {
	const normalized = normalizeRecoveryKey(typed);
	if (!normalized) return {};
	return normalized.length === OLD_LENGTH
		? { recoveryKey: normalized }
		: { recoveryProof: await fromRecovery(normalized, 'proof') };
}

/** After signing in with a recovery key: the vault, and with it the keys */
export async function openVaultWithRecovery(typed: string) {
	const normalized = normalizeRecoveryKey(typed);
	if (!normalized || normalized.length === OLD_LENGTH) return;
	const stored = await fetchStored();
	if (!stored?.recoveryVault) return;
	const opened = await openText(
		await fromRecovery(normalized, 'vault'),
		stored.recoveryVault
	).catch(() => null);
	if (!isKey(opened)) return;
	await rememberVault(opened);
	await syncKeys();
}

/** A key from a passkey's secret */
async function keyFromSecret(secret: Uint8Array) {
	const hash = await crypto.subtle.digest('SHA-256', secret as BufferSource);
	return toBase64Url(new Uint8Array(hash));
}

export const sealVaultWithSecret = async (secret: Uint8Array) =>
	sealText(await keyFromSecret(secret), await ensureVault());

/** After signing in with a passkey: the vault, and with it the keys */
export async function openVaultWithSecret(secret: Uint8Array, sealedVault: string) {
	const opened = await openText(await keyFromSecret(secret), sealedVault);
	if (!isKey(opened)) return;
	await rememberVault(opened);
	await syncKeys();
}
