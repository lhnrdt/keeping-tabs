// A person's groups' keys on all their devices (#110). A vault key, which only their devices
// have, seals each group's key; the server keeps the sealed copies. A new device gets the vault
// key through a device link's fragment, or from a recovery key that opens a sealed copy of it.
// Someone with more than one vault gets each key into all of them through their boxes (#298).
import { newRecoveryKey, normalizeRecoveryKey, OLD_LENGTH } from '#lib/recovery-key-format.ts';
import { allKeys, rememberKey, rememberVault, vaultKey } from './keyring';
import { isKey, keyIdIn, keyIdOf, newKey, openText, sealText, toBase64Url } from './seal';
import { boxKeyOf, isBoxed, openBox, putInBox } from './vault-box';

type StoredKey = { keyId: string; sealed: string };
type Vault = { vaultId: string; publicKey: string; seenAt: number };
type Stored = { keys: StoredKey[]; recoveryVault: string | null; vaults?: Vault[] };

/** How often a device says again that it still holds its vault */
const SEEN_AGAIN_MS = 24 * 60 * 60 * 1000;
/** Keys sent at once, as many as the server takes */
const KEYS_PER_STORE = 200;

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

/** The ids of the keys stored for a vault */
const storedFor = (stored: Stored, vaultId: string) =>
	new Set(
		stored.keys.filter(({ sealed }) => keyIdIn(sealed) === vaultId).map(({ keyId }) => keyId)
	);

/** This device's keys a vault doesn't have yet, put in its box; none where that can't be done */
async function forOtherVault(
	here: { keyId: string; groupKey: string }[],
	has: Set<string>,
	vault: Vault
) {
	try {
		return await Promise.all(
			here
				.filter(({ keyId }) => !has.has(keyId))
				.map(async ({ keyId, groupKey }) => ({
					keyId,
					sealed: await putInBox(vault.vaultId, vault.publicKey, groupKey)
				}))
		);
	} catch {
		return [];
	}
}

/** This vault's public key, when the server should hear it again */
async function vaultToAnnounce(key: string, vaultId: string, stored: Stored) {
	const publicKey = await boxKeyOf(key);
	const known = stored.vaults?.find((vault) => vault.vaultId === vaultId);
	const fresh = known?.publicKey === publicKey && Date.now() - known.seenAt < SEEN_AGAIN_MS;
	return publicKey && !fresh ? { vaultId, publicKey } : undefined;
}

/**
 * Takes in the keys other devices stored, and stores the ones only this device has. A device that
 * came back without the vault (a passkey on a browser without its extension, Safari after a week
 * away) starts a new one; each vault keeps its own copies, and the person's devices put their keys
 * in each other's vaults' boxes, so whichever device got a key, all of them end up with it.
 */
export async function syncKeys() {
	const vault = await vaultKey();
	const stored = await fetchStored();
	if (!stored) return;
	// A device with nothing yet, like a new home screen app, still gets a vault of its own if the
	// person has keys elsewhere: once it's known, their other devices put the keys in it (#298)
	const elsewhere = stored.keys.length > 0 || (stored.vaults?.length ?? 0) > 0;
	if (!vault && (await allKeys()).length === 0 && !elsewhere) return;
	const key = await ensureVault();
	const vaultId = await keyIdOf(key);
	for (const { sealed } of stored.keys) {
		if (keyIdIn(sealed) !== vaultId) continue;
		const opened = await (isBoxed(sealed) ? openBox(key, sealed) : openText(key, sealed)).catch(
			() => null
		);
		if (isKey(opened)) await rememberKey(opened);
	}
	const here = await Promise.all(
		(await allKeys()).map(async (groupKey) => ({ keyId: await keyIdOf(groupKey), groupKey }))
	);
	const own = storedFor(stored, vaultId);
	const keys: StoredKey[] = await Promise.all(
		here
			.filter(({ keyId }) => !own.has(keyId))
			.map(async ({ keyId, groupKey }) => ({ keyId, sealed: await sealText(key, groupKey) }))
	);
	for (const other of stored.vaults ?? []) {
		if (other.vaultId === vaultId) continue;
		keys.push(...(await forOtherVault(here, storedFor(stored, other.vaultId), other)));
	}
	const announced = await vaultToAnnounce(key, vaultId, stored);
	if (announced) await store({ vault: announced });
	for (let at = 0; at < keys.length; at += KEYS_PER_STORE) {
		await store({ keys: keys.slice(at, at + KEYS_PER_STORE) });
	}
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
