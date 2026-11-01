// A person's groups' keys on all their devices (#110). A vault key, which only their devices
// have, seals each group's key; the server keeps the sealed copies. A new device gets the vault
// key through a device link's fragment, or from a recovery key that opens a sealed copy of it.
import { normalizeRecoveryKey } from '#lib/recovery-key-format.ts';
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

/** Takes in the keys other devices stored, and stores the ones only this device has */
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
	const missing = await Promise.all(
		local.map(async (groupKey) => ({
			keyId: await keyIdOf(groupKey),
			groupKey
		}))
	);
	const keys = await Promise.all(
		missing
			.filter(({ keyId }) => !known.has(keyId))
			.map(async ({ keyId, groupKey }) => ({ keyId, sealed: await sealText(key, groupKey) }))
	);
	if (keys.length) await store({ keys });
}

/** A key only someone holding the recovery key can make */
async function keyFromRecovery(recoveryKey: string) {
	const normalized = normalizeRecoveryKey(recoveryKey);
	if (!normalized) return null;
	const hash = await crypto.subtle.digest(
		'SHA-256',
		new TextEncoder().encode(`keeping-tabs-vault:${normalized}`)
	);
	return toBase64Url(new Uint8Array(hash));
}

/** After making a recovery key: it can bring the vault back on a new device */
export async function sealVaultForRecovery(recoveryKey: string) {
	const key = await keyFromRecovery(recoveryKey);
	if (!key) return;
	await store({ recoveryVault: await sealText(key, await ensureVault()) });
	await syncKeys();
}

/** After restoring with a recovery key: the vault, and with it the keys */
export async function openVaultWithRecovery(recoveryKey: string) {
	const key = await keyFromRecovery(recoveryKey);
	const stored = await fetchStored();
	if (!key || !stored?.recoveryVault) return;
	const opened = await openText(key, stored.recoveryVault).catch(() => null);
	if (!isKey(opened)) return;
	await rememberVault(opened);
	await syncKeys();
}
